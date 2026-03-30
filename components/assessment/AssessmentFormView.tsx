'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Calculator, FileText, AlertTriangle, Save, X,
  User, Phone, Mail, MapPin, DollarSign, Calendar, Car, Bike,
  Smartphone, Monitor, Home, Package, CheckCircle2, Clock,
  TrendingUp, TrendingDown, FileCheck, CreditCard, Briefcase,
  Shield, Eye, Download, CheckCircle, XCircle, Info, BarChart3,
  PieChart, Activity, FileSearch, MessageSquare, StickyNote,
  ZoomIn, ZoomOut, RotateCw, Maximize2, ChevronLeft, ChevronRight,
  Lock, ShieldCheck
} from 'lucide-react';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useAuth } from '../../contexts/AuthContext';
import { LoanApplication, AssessmentReport, DocumentUpload } from '../../types';

export const AssessmentFormView: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { loans, submitAssessmentReport, updateLoanStatus, getAllowedTransitions } = useWorkflow();
  const { user } = useAuth();
  const [loan, setLoan] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [assessmentForm, setAssessmentForm] = useState<Partial<AssessmentReport>>({
    creditScore: 0,
    incomeVerified: false,
    employmentVerified: false,
    debtToIncomeRatio: 0,
    loanToValueRatio: 0,
    riskLevel: 'medium',
    riskFactors: [],
    recommendations: [],
    collateralValue: 0,
    collateralCondition: '',
    marketValue: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extended assessment data
  const [financialData, setFinancialData] = useState({
    monthlyIncome: 0,
    otherIncome: 0,
    totalMonthlyDebt: 0,
    monthlyExpenses: 0,
    availableCashFlow: 0,
    debtServiceCoverageRatio: 0,
    paymentCapacity: 0
  });

  const [creditHistory, setCreditHistory] = useState({
    hasCreditHistory: false,
    previousLoans: 0,
    defaultHistory: false,
    paymentBehavior: 'good' as 'excellent' | 'good' | 'fair' | 'poor',
    creditBureauScore: 0,
    creditBureauReport: ''
  });

  const [documentVerification, setDocumentVerification] = useState<Record<string, boolean>>({
    idFront: false,
    idBack: false,
    portrait: false,
    utilityBill: false,
    residency: false,
    collateral: false,
    employmentContract: false,
    bankStatement: false,
    incomeProof: false
  });

  const [assessmentNotes, setAssessmentNotes] = useState({
    customerNotes: '',
    financialNotes: '',
    collateralNotes: '',
    riskNotes: '',
    generalNotes: ''
  });

  const [approvalConditions, setApprovalConditions] = useState<string[]>([]);

  // Credit proposal form
  const [creditProposal, setCreditProposal] = useState({
    decision: '' as 'approved' | 'rejected' | 'pending' | '',
    proposedAmount: 0,
    proposedInterestRate: 0,
    proposedDuration: 0,
    conditions: [] as string[],
    proposalNotes: '',
    nextStep: 'admin' as 'admin' | 'security'
  });
  const [newCondition, setNewCondition] = useState('');

  // Image preview states
  const [previewDocs, setPreviewDocs] = useState<DocumentUpload[] | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      const foundLoan = loans.find(l => l.id === id);
      if (foundLoan) {
        setLoan(foundLoan);
        // Initialize form with loan data
        const monthlyIncome = foundLoan.customer.monthlyIncome || 0;
        const monthlyPayment = foundLoan.monthlyPayment;
        const debtToIncome = monthlyIncome > 0 ? (monthlyPayment / monthlyIncome) * 100 : 0;
        const collateralValue = foundLoan.loanAmount * 1.2;
        const loanToValue = collateralValue > 0
          ? (foundLoan.loanAmount / collateralValue) * 100
          : 0;

        setAssessmentForm({
          creditScore: foundLoan.riskScore || 700,
          incomeVerified: false,
          employmentVerified: false,
          debtToIncomeRatio: debtToIncome,
          loanToValueRatio: loanToValue,
          riskLevel: 'medium',
          riskFactors: [],
          recommendations: [],
          collateralValue: collateralValue,
          collateralCondition: 'Tốt',
          marketValue: collateralValue
        });

        // Initialize financial data
        const totalDebt = monthlyPayment; // Current loan payment
        const availableCashFlow = monthlyIncome - totalDebt - (monthlyIncome * 0.3); // Assume 30% expenses
        const dscr = monthlyIncome > 0 ? monthlyIncome / monthlyPayment : 0;

        setFinancialData({
          monthlyIncome: monthlyIncome,
          otherIncome: 0,
          totalMonthlyDebt: totalDebt,
          monthlyExpenses: monthlyIncome * 0.3,
          availableCashFlow: availableCashFlow,
          debtServiceCoverageRatio: dscr,
          paymentCapacity: availableCashFlow
        });

        // Initialize document verification from loan documents
        if (foundLoan.documents && foundLoan.documents.length > 0) {
          const docStatus: Record<string, boolean> = {};
          foundLoan.documents.forEach(doc => {
            docStatus[doc.type] = doc.verified || false;
          });
          setDocumentVerification(prev => ({ ...prev, ...docStatus }));
        }

        // Initialize credit proposal next step based on collateral type
        setCreditProposal(prev => ({
          ...prev,
          nextStep: foundLoan.collateralType === 'phone' ? 'security' : 'admin'
        }));
      }
    }
    setLoading(false);
  }, [id, loans]);

  // Auto-calculate financial ratios
  useEffect(() => {
    if (loan) {
      const monthlyIncome = financialData.monthlyIncome || loan.customer.monthlyIncome || 0;
      const totalIncome = monthlyIncome + financialData.otherIncome;
      const monthlyPayment = loan.monthlyPayment;
      const totalDebt = financialData.totalMonthlyDebt || monthlyPayment;

      // Calculate DTI
      const dti = totalIncome > 0 ? (totalDebt / totalIncome) * 100 : 0;

      // Calculate DSCR
      const dscr = monthlyPayment > 0 ? totalIncome / monthlyPayment : 0;

      // Calculate available cash flow
      const expenses = financialData.monthlyExpenses || (totalIncome * 0.3);
      const availableCashFlow = totalIncome - totalDebt - expenses;

      // Calculate payment capacity (how much more can they afford)
      const paymentCapacity = availableCashFlow;

      setFinancialData(prev => ({
        ...prev,
        debtServiceCoverageRatio: dscr,
        availableCashFlow: availableCashFlow,
        paymentCapacity: paymentCapacity
      }));

      setAssessmentForm(prev => ({
        ...prev,
        debtToIncomeRatio: dti
      }));
    }
  }, [financialData.monthlyIncome, financialData.otherIncome, financialData.totalMonthlyDebt, financialData.monthlyExpenses, loan]);

  // Auto-calculate LTV
  useEffect(() => {
    if (loan && assessmentForm.collateralValue) {
      const ltv = assessmentForm.collateralValue > 0
        ? (loan.loanAmount / assessmentForm.collateralValue) * 100
        : 0;
      setAssessmentForm(prev => ({ ...prev, loanToValueRatio: ltv }));
    }
  }, [assessmentForm.collateralValue, loan]);

  // Image preview handlers
  const isImageFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  const isPdfFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext === 'pdf';
  };

  const openImagePreview = (docs: DocumentUpload[], index: number) => {
    if (!docs.length) return;
    setPreviewDocs(docs);
    setPreviewIndex(index);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setRotationAngle(0);
  };

  const handleDocumentClick = (doc: DocumentUpload, categoryDocs: DocumentUpload[]) => {
    if (isImageFile(doc.fileName)) {
      // Ảnh: mở trong dialog preview
      const docIndex = categoryDocs.findIndex(d => d.id === doc.id || d.fileUrl === doc.fileUrl);
      openImagePreview(categoryDocs, docIndex >= 0 ? docIndex : 0);
    } else {
      // PDF và các file khác: mở tab mới
      window.open(doc.fileUrl, '_blank');
    }
  };

  const closeImagePreview = () => {
    setPreviewDocs(null);
    setPreviewIndex(0);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setRotationAngle(0);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleFitToScreen = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleRotateImage = () => {
    setRotationAngle(prev => (prev + 90) % 360);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!imageContainerRef.current) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoomLevel(prev => {
      const newZoom = Math.max(0.5, Math.min(5, prev + delta));
      return newZoom;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Chỉ cho phép drag với chuột trái
    if (e.button !== 0) return;

    // Cho phép drag ở mọi mức zoom (kể cả dưới 100%)
    if (zoomLevel !== 1) {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX - panPosition.x;
      const startY = e.clientY - panPosition.y;
      dragStartRef.current = { x: startX, y: startY };
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setPanPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(false);
    }
  };

  // Global drag handling
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      setPanPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  // Reset zoom and rotation when changing images
  useEffect(() => {
    if (previewDocs) {
      setZoomLevel(1);
      setPanPosition({ x: 0, y: 0 });
      setRotationAngle(0);
    }
  }, [previewIndex, previewDocs]);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    if (!previewDocs) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setZoomLevel(prev => Math.min(prev + 0.25, 5));
        } else if (e.key === '-') {
          e.preventDefault();
          setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
        } else if (e.key === '0') {
          e.preventDefault();
          setZoomLevel(1);
          setPanPosition({ x: 0, y: 0 });
        }
      } else if (e.key === 'Escape') {
        setPreviewDocs(null);
        setPreviewIndex(0);
        setZoomLevel(1);
        setPanPosition({ x: 0, y: 0 });
        setRotationAngle(0);
      } else if (e.key === 'ArrowLeft' && previewDocs.length > 1) {
        e.preventDefault();
        setPreviewIndex(prev => prev === 0 ? previewDocs.length - 1 : prev - 1);
      } else if (e.key === 'ArrowRight' && previewDocs.length > 1) {
        e.preventDefault();
        setPreviewIndex(prev => prev === previewDocs.length - 1 ? 0 : prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewDocs, previewIndex]);

  const calculateRiskLevel = () => {
    const creditScore = assessmentForm.creditScore || 0;
    const debtToIncome = assessmentForm.debtToIncomeRatio || 0;
    const loanToValue = assessmentForm.loanToValueRatio || 0;

    let riskScore = 0;
    if (creditScore < 500) riskScore += 3;
    else if (creditScore < 700) riskScore += 2;
    else riskScore += 1;

    if (debtToIncome > 50) riskScore += 3;
    else if (debtToIncome > 30) riskScore += 2;
    else riskScore += 1;

    if (loanToValue > 80) riskScore += 3;
    else if (loanToValue > 60) riskScore += 2;
    else riskScore += 1;

    if (riskScore >= 7) return 'high';
    if (riskScore >= 4) return 'medium';
    return 'low';
  };

  useEffect(() => {
    if (loan) {
      const riskLevel = calculateRiskLevel();
      setAssessmentForm(prev => ({ ...prev, riskLevel: riskLevel as 'low' | 'medium' | 'high' }));
    }
  }, [assessmentForm.creditScore, assessmentForm.debtToIncomeRatio, assessmentForm.loanToValueRatio, loan]);

  const handleAssessmentSubmit = async () => {
    if (!loan || !user) return;

    // Validation
    if (!assessmentForm.creditScore || assessmentForm.creditScore <= 0) {
      alert('Vui lòng nhập điểm tín dụng');
      return;
    }
    if (!assessmentForm.collateralValue || assessmentForm.collateralValue <= 0) {
      alert('Vui lòng nhập giá trị tài sản đảm bảo');
      return;
    }
    if (!assessmentForm.collateralCondition) {
      alert('Vui lòng chọn tình trạng tài sản');
      return;
    }

    setIsSubmitting(true);
    try {
      const report: AssessmentReport = {
        id: `ASSESS_${Date.now()}`,
        loanId: loan.id,
        assessorId: user.id,
        assessorName: user.fullName,
        creditScore: assessmentForm.creditScore || 0,
        incomeVerified: assessmentForm.incomeVerified || false,
        employmentVerified: assessmentForm.employmentVerified || false,
        debtToIncomeRatio: assessmentForm.debtToIncomeRatio || 0,
        loanToValueRatio: assessmentForm.loanToValueRatio || 0,
        riskLevel: assessmentForm.riskLevel || 'medium',
        riskFactors: assessmentForm.riskFactors || [],
        recommendations: assessmentForm.recommendations || [],
        collateralValue: assessmentForm.collateralValue || 0,
        collateralCondition: assessmentForm.collateralCondition || '',
        marketValue: assessmentForm.marketValue || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const success = await submitAssessmentReport(loan.id, report);
      if (success) {
        // Auto approve and move to next step
        // For phone assets -> security, for other assets -> admin
        const transitions = getAllowedTransitions(loan.status, user.role, loan);
        const approveTransition = transitions.find(t => t.toStatus !== 'rejected');
        if (approveTransition) {
          const notes = [
            `Điểm tín dụng: ${assessmentForm.creditScore}`,
            `DTI: ${assessmentForm.debtToIncomeRatio?.toFixed(1)}%`,
            `LTV: ${assessmentForm.loanToValueRatio?.toFixed(1)}%`,
            `DSCR: ${financialData.debtServiceCoverageRatio?.toFixed(2)}x`,
            `Mức rủi ro: ${assessmentForm.riskLevel === 'low' ? 'Thấp' : assessmentForm.riskLevel === 'medium' ? 'Trung bình' : 'Cao'}`,
            approvalConditions.length > 0 ? `Điều kiện: ${approvalConditions.join(', ')}` : ''
          ].filter(Boolean).join(' | ');

          await updateLoanStatus(loan.id, approveTransition.toStatus, user.id, notes);
        }

        // Navigate back to pending list
        router.push('/ca/pending');
      }
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      alert('Có lỗi xảy ra khi lưu thẩm định. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'car': return <Car className="w-5 h-5" />;
      case 'bike': return <Bike className="w-5 h-5" />;
      case 'phone': return <Smartphone className="w-5 h-5" />;
      case 'computer': return <Monitor className="w-5 h-5" />;
      case 'house': return <Home className="w-5 h-5" />;
      case 'land': return <Package className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getAssetName = (type: string) => {
    switch (type) {
      case 'car': return 'Ô tô';
      case 'bike': return 'Xe máy';
      case 'phone': return 'Điện thoại';
      case 'computer': return 'Máy tính';
      case 'house': return 'Nhà';
      case 'land': return 'Đất';
      default: return 'Khác';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatValue = (value: any, defaultValue: string = 'Chưa có thông tin'): string => {
    if (value === null || value === undefined || value === '') return defaultValue;
    return String(value);
  };

  const formatCurrencyOrNA = (value: number | undefined): string => {
    if (value === null || value === undefined || value === 0) return 'Chưa có thông tin';
    return formatCurrency(value);
  };

  // Group documents by type
  const groupDocumentsByType = (docs: DocumentUpload[]) => {
    const grouped: Record<string, DocumentUpload[]> = {};
    docs.forEach(doc => {
      const type = doc.type || 'other';
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(doc);
    });
    return grouped;
  };

  // Document types configuration
  const documentTypes = [
    { type: 'id_front', label: 'CMND/CCCD mặt trước', icon: FileText },
    { type: 'id_back', label: 'CMND/CCCD mặt sau', icon: FileText },
    { type: 'portrait', label: 'Ảnh chân dung', icon: User },
    { type: 'utility_bill', label: 'Hóa đơn điện/nước', icon: FileText },
    { type: 'residency', label: 'Xác nhận cư trú', icon: MapPin },
    { type: 'collateral', label: 'Tài sản đảm bảo', icon: Package },
    { type: 'employment_contract', label: 'Hợp đồng lao động', icon: Briefcase },
    { type: 'bank_statement', label: 'Sao kê ngân hàng', icon: CreditCard },
    { type: 'income_proof', label: 'Chứng minh thu nhập', icon: DollarSign },
    { type: 'other', label: 'Tài liệu khác', icon: FileText }
  ];

  // Map document type to verification key
  const getVerificationKey = (docType: string): string => {
    const mapping: Record<string, string> = {
      'id_front': 'idFront',
      'id_back': 'idBack',
      'portrait': 'portrait',
      'utility_bill': 'utilityBill',
      'residency': 'residency',
      'collateral': 'collateral',
      'employment_contract': 'employmentContract',
      'bank_statement': 'bankStatement',
      'income_proof': 'incomeProof',
      'other': 'other'
    };
    return mapping[docType] || 'other';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Không tìm thấy hồ sơ</h3>
        <p className="text-slate-600 mb-4">Hồ sơ vay với ID {id} không tồn tại.</p>
        <button
          onClick={() => router.push('/ca/pending')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/ca/pending')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-blue-600" />
              Thẩm định hồ sơ vay
            </h2>
            <p className="text-slate-500 mt-1 text-sm">Mã hồ sơ: {loan.id}</p>
          </div>
        </div>
      </div>

      {/* Customer Information Display - Clean Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                1
              </span>
              Thông tin khách hàng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Họ và tên</label>
                  <p className="text-sm font-medium text-slate-900">{loan.customer.fullName}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Số điện thoại</label>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {loan.customer.phoneNumber}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Email</label>
                  <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {formatValue(loan.customer.email)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Giới tính</label>
                  <p className="text-sm font-medium text-slate-900">
                    {loan.customer.gender === 'male' ? 'Nam' : loan.customer.gender === 'female' ? 'Nữ' : 'Khác'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Ngày sinh</label>
                  <p className="text-sm font-medium text-slate-900">{formatValue(loan.customer.birthDate)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Tình trạng hôn nhân</label>
                  <p className="text-sm font-medium text-slate-900">
                    {loan.customer.maritalStatus === 'single' ? 'Độc thân' :
                      loan.customer.maritalStatus === 'married' ? 'Đã kết hôn' :
                        loan.customer.maritalStatus === 'divorced' ? 'Ly dị' :
                          loan.customer.maritalStatus === 'widowed' ? 'Góa' : 'Chưa có thông tin'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Số người phụ thuộc</label>
                  <p className="text-sm font-medium text-slate-900">
                    {loan.customer.numberOfDependents !== undefined ? loan.customer.numberOfDependents : 'Chưa có thông tin'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Địa chỉ</label>
                  <p className="text-sm font-medium text-slate-900 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <span>{loan.customer.address}, {loan.customer.district}, {loan.customer.province}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ID Information Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                2
              </span>
              Thông tin giấy tờ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Loại giấy tờ</label>
                <p className="text-sm font-medium text-slate-900">
                  {loan.customer.idType === 'cccd' ? 'Căn cước công dân (CCCD)' :
                    loan.customer.idType === 'cmnd' ? 'Chứng minh nhân dân (CMND)' : 'Hộ chiếu (Passport)'}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Số giấy tờ</label>
                <p className="text-sm font-medium text-slate-900 font-mono">{loan.customer.idNumber}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Ngày cấp</label>
                <p className="text-sm font-medium text-slate-900">{formatValue(loan.customer.issueDate)}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Nơi cấp</label>
                <p className="text-sm font-medium text-slate-900">{formatValue(loan.customer.issuePlace)}</p>
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                3
              </span>
              Thông tin việc làm
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Nghề nghiệp</label>
                  <p className="text-sm font-medium text-slate-900">{formatValue(loan.customer.occupation)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Tên công ty</label>
                  <p className="text-sm font-medium text-slate-900">{formatValue(loan.customer.companyName)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Chức vụ</label>
                  <p className="text-sm font-medium text-slate-900">{formatValue(loan.customer.position)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Địa chỉ công ty</label>
                  <p className="text-sm font-medium text-slate-900">{formatValue(loan.customer.companyAddress)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Loại công việc</label>
                  <p className="text-sm font-medium text-slate-900">
                    {loan.customer.employmentType === 'fulltime' ? 'Toàn thời gian' :
                      loan.customer.employmentType === 'parttime' ? 'Bán thời gian' :
                        loan.customer.employmentType === 'contract' ? 'Hợp đồng' :
                          loan.customer.employmentType === 'selfemployed' ? 'Tự doanh' :
                            loan.customer.employmentType === 'unemployed' ? 'Chưa có việc' : 'Chưa có thông tin'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Kinh nghiệm làm việc</label>
                  <p className="text-sm font-medium text-slate-900">
                    {loan.customer.workExperience !== undefined ? `${loan.customer.workExperience} năm` : 'Chưa có thông tin'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                4
              </span>
              Thông tin tài chính
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Thu nhập hàng tháng</label>
                  <p className="text-lg font-bold text-green-600">{formatCurrencyOrNA(loan.customer.monthlyIncome)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Thu nhập khác</label>
                  <p className="text-sm font-medium text-slate-900">{formatCurrencyOrNA(loan.customer.otherIncome)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Số khoản vay hiện tại</label>
                  <p className="text-sm font-medium text-slate-900">
                    {loan.customer.existingLoans !== undefined ? loan.customer.existingLoans : 'Chưa có thông tin'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Trả nợ hàng tháng</label>
                  <p className="text-sm font-medium text-slate-900">{formatCurrencyOrNA(loan.customer.monthlyLoanPayments)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Dư nợ thẻ tín dụng</label>
                  <p className="text-sm font-medium text-slate-900">{formatCurrencyOrNA(loan.customer.creditCardDebt)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Hạn mức thẻ tín dụng</label>
                  <p className="text-sm font-medium text-slate-900">{formatCurrencyOrNA(loan.customer.creditCardLimit)}</p>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Thông tin ngân hàng</label>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-700"><span className="font-medium">Ngân hàng:</span> {formatValue(loan.customer.bankName)}</p>
                    <p className="text-sm text-slate-700"><span className="font-medium">Số tài khoản:</span> {formatValue(loan.customer.bankAccountNumber)}</p>
                    <p className="text-sm text-slate-700"><span className="font-medium">Chủ tài khoản:</span> {formatValue(loan.customer.bankAccountHolder)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts & References */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                5
              </span>
              Liên hệ khẩn cấp & Người tham chiếu
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Liên hệ khẩn cấp</label>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">{formatValue(loan.customer.emergencyContactName)}</p>
                  <p className="text-sm text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {formatValue(loan.customer.emergencyContactPhone)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Mối quan hệ: {formatValue(loan.customer.emergencyContactRelationship)}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Người tham chiếu 1</label>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">{formatValue(loan.customer.reference1Name)}</p>
                  <p className="text-sm text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {formatValue(loan.customer.reference1Phone)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Mối quan hệ: {formatValue(loan.customer.reference1Relationship)}
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Người tham chiếu 2</label>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">{formatValue(loan.customer.reference2Name)}</p>
                  <p className="text-sm text-slate-700 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {formatValue(loan.customer.reference2Phone)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Mối quan hệ: {formatValue(loan.customer.reference2Relationship)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loan Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                6
              </span>
              Thông tin khoản vay
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Số tiền vay</label>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(loan.loanAmount)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Thời hạn vay</label>
                  <p className="text-lg font-medium text-slate-900">{loan.loanDuration} tháng</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Lãi suất</label>
                  <p className="text-lg font-medium text-slate-900">{loan.interestRate}% / năm</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Thanh toán hàng tháng</label>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(loan.monthlyPayment)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Tổng số tiền phải trả</label>
                  <p className="text-lg font-medium text-slate-900">{formatCurrency(loan.totalPayment)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Mục đích vay</label>
                  <p className="text-sm font-medium text-slate-900 bg-slate-50 p-3 rounded-lg">{formatValue(loan.loanPurpose)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Collateral Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                7
              </span>
              <span>Tài sản đảm bảo</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Loại tài sản</label>
                <p className="text-lg font-medium text-slate-900 flex items-center gap-2">
                  {getAssetIcon(loan.collateralType)}
                  {getAssetName(loan.collateralType)}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Mô tả tài sản</label>
                <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg whitespace-pre-line border border-slate-200">
                  {loan.collateralDescription || 'Chưa có mô tả'}
                </p>
              </div>
              {loan.collateralDetails && Object.keys(loan.collateralDetails).length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Chi tiết tài sản</label>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    {(loan.collateralType === 'car' || loan.collateralType === 'bike') ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="font-medium text-slate-700">Biển số:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.licensePlate)}</span></div>
                        <div><span className="font-medium text-slate-700">Hãng:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.brand)}</span></div>
                        <div><span className="font-medium text-slate-700">Model:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.model)}</span></div>
                        <div><span className="font-medium text-slate-700">Năm SX:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.year)}</span></div>
                        <div><span className="font-medium text-slate-700">Màu:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.color)}</span></div>
                        <div><span className="font-medium text-slate-700">Số khung:</span> <span className="text-slate-600 font-mono text-xs">{formatValue(loan.collateralDetails?.chassisNumber)}</span></div>
                        <div><span className="font-medium text-slate-700">Số máy:</span> <span className="text-slate-600 font-mono text-xs">{formatValue(loan.collateralDetails?.engineNumber)}</span></div>
                        <div><span className="font-medium text-slate-700">Số km:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.mileage)}</span></div>
                      </div>
                    ) : loan.collateralType === 'phone' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="font-medium text-slate-700">Hãng:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.manufacturer)}</span></div>
                        <div><span className="font-medium text-slate-700">Model:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.deviceModel)}</span></div>
                        <div><span className="font-medium text-slate-700">Dung lượng:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.storage)}</span></div>
                        <div><span className="font-medium text-slate-700">Màu:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.color)}</span></div>
                        <div><span className="font-medium text-slate-700">IMEI:</span> <span className="text-slate-600 font-mono text-xs">{formatValue(loan.collateralDetails?.imei)}</span></div>
                        <div><span className="font-medium text-slate-700">Tình trạng:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.condition)}</span></div>
                      </div>
                    ) : loan.collateralType === 'computer' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="font-medium text-slate-700">Hãng:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.manufacturer)}</span></div>
                        <div><span className="font-medium text-slate-700">Model:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.deviceModel)}</span></div>
                        <div><span className="font-medium text-slate-700">CPU:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.cpu)}</span></div>
                        <div><span className="font-medium text-slate-700">RAM:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.ram)}</span></div>
                        <div><span className="font-medium text-slate-700">Ổ cứng:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.hardDrive)}</span></div>
                        <div><span className="font-medium text-slate-700">Số serial:</span> <span className="text-slate-600 font-mono text-xs">{formatValue(loan.collateralDetails?.serialNumber)}</span></div>
                        <div><span className="font-medium text-slate-700">Tình trạng:</span> <span className="text-slate-600">{formatValue(loan.collateralDetails?.condition)}</span></div>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">Không có chi tiết cho loại tài sản này</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Collateral Assessment Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                8
              </span>
              Đánh giá tài sản đảm bảo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                  Giá trị tài sản (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={assessmentForm.collateralValue || 0}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setAssessmentForm(prev => ({ ...prev, collateralValue: value }));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập giá trị tài sản"
                />
                {(assessmentForm.collateralValue ?? 0) > 0 && (
                  <p className="text-xs text-slate-500 mt-1">{formatCurrency(assessmentForm.collateralValue ?? 0)}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                  Giá trị thị trường (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={assessmentForm.marketValue || 0}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setAssessmentForm(prev => ({ ...prev, marketValue: value }));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập giá trị thị trường"
                />
                {(assessmentForm.marketValue ?? 0) > 0 && (
                  <p className="text-xs text-slate-500 mt-1">{formatCurrency(assessmentForm.marketValue ?? 0)}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                  Tình trạng tài sản <span className="text-red-500">*</span>
                </label>
                <select
                  value={assessmentForm.collateralCondition || ''}
                  onChange={(e) => setAssessmentForm(prev => ({ ...prev, collateralCondition: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Chọn tình trạng</option>
                  <option value="Mới">Mới</option>
                  <option value="Tốt">Tốt</option>
                  <option value="Khá">Khá</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Kém">Kém</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                Ghi chú về tài sản
              </label>
              <textarea
                rows={3}
                value={assessmentNotes.collateralNotes}
                onChange={(e) => setAssessmentNotes(prev => ({ ...prev, collateralNotes: e.target.value }))}
                placeholder="Ghi chú về tình trạng, giá trị, rủi ro của tài sản..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* LTV Calculation */}
            {(assessmentForm.collateralValue ?? 0) > 0 && loan && (
              <div className={`mb-6 rounded-lg p-4 border ${assessmentForm.loanToValueRatio && assessmentForm.loanToValueRatio > 80
                ? 'bg-red-50 border-red-200'
                : assessmentForm.loanToValueRatio && assessmentForm.loanToValueRatio > 60
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-green-50 border-green-200'
                }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-700">Tỷ lệ vay/giá trị (LTV)</span>
                  <span className={`text-lg font-bold ${assessmentForm.loanToValueRatio && assessmentForm.loanToValueRatio > 80
                    ? 'text-red-600'
                    : assessmentForm.loanToValueRatio && assessmentForm.loanToValueRatio > 60
                      ? 'text-amber-600'
                      : 'text-green-600'
                    }`}>
                    {assessmentForm.loanToValueRatio?.toFixed(2)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Số tiền vay</p>
                    <p className="text-sm font-medium text-slate-700">{formatCurrency(loan.loanAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Giá trị tài sản</p>
                    <p className="text-sm font-medium text-slate-700">{formatCurrency(assessmentForm.collateralValue)}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 text-sm font-medium ${assessmentForm.loanToValueRatio && assessmentForm.loanToValueRatio > 80
                  ? 'text-red-700'
                  : assessmentForm.loanToValueRatio && assessmentForm.loanToValueRatio > 60
                    ? 'text-amber-700'
                    : 'text-green-700'
                  }`}>
                  {assessmentForm.loanToValueRatio && assessmentForm.loanToValueRatio > 80 ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Rủi ro cao - Cần xem xét kỹ</span>
                    </>
                  ) : assessmentForm.loanToValueRatio && assessmentForm.loanToValueRatio > 60 ? (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Rủi ro trung bình</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>An toàn - Tỷ lệ hợp lý</span>
                    </>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={async () => {
                if (!assessmentForm.collateralValue || assessmentForm.collateralValue <= 0) {
                  alert('Vui lòng nhập giá trị tài sản');
                  return;
                }
                if (!assessmentForm.marketValue || assessmentForm.marketValue <= 0) {
                  alert('Vui lòng nhập giá trị thị trường');
                  return;
                }
                if (!assessmentForm.collateralCondition) {
                  alert('Vui lòng chọn tình trạng tài sản');
                  return;
                }

                setIsSubmitting(true);
                try {
                  const report: AssessmentReport = {
                    id: `ASSESS_${Date.now()}`,
                    loanId: loan!.id,
                    assessorId: user!.id,
                    assessorName: user!.fullName,
                    creditScore: assessmentForm.creditScore || 0,
                    incomeVerified: assessmentForm.incomeVerified || false,
                    employmentVerified: assessmentForm.employmentVerified || false,
                    debtToIncomeRatio: assessmentForm.debtToIncomeRatio || 0,
                    loanToValueRatio: assessmentForm.loanToValueRatio || 0,
                    riskLevel: assessmentForm.riskLevel || 'medium',
                    riskFactors: assessmentForm.riskFactors || [],
                    recommendations: assessmentForm.recommendations || [],
                    collateralValue: assessmentForm.collateralValue || 0,
                    collateralCondition: assessmentForm.collateralCondition || '',
                    marketValue: assessmentForm.marketValue || 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  };

                  const success = await submitAssessmentReport(loan!.id, report);
                  if (success) {
                    alert('Đã lưu đánh giá tài sản thành công!');
                  }
                } catch (error) {
                  console.error('Failed to save assessment:', error);
                  alert('Có lỗi xảy ra khi lưu đánh giá. Vui lòng thử lại.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Lưu đánh giá tài sản
                </>
              )}
            </button>
          </div>

          {/* Credit Proposal Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                9
              </span>
              Đề xuất tín dụng
            </h3>

            <div className="space-y-6">
              {/* Decision */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">
                  Quyết định <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setCreditProposal(prev => ({ ...prev, decision: 'approved' }))}
                    className={`p-3 rounded-lg border transition-all ${creditProposal.decision === 'approved'
                      ? 'border-green-500 bg-green-50'
                      : 'border-slate-300 bg-white hover:border-green-300 hover:bg-green-50/50'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className={`w-5 h-5 ${creditProposal.decision === 'approved' ? 'text-green-600' : 'text-slate-400'
                        }`} />
                      <span className={`text-sm font-medium ${creditProposal.decision === 'approved' ? 'text-green-700' : 'text-slate-600'
                        }`}>Phê duyệt</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditProposal(prev => ({ ...prev, decision: 'rejected' }))}
                    className={`p-3 rounded-lg border transition-all ${creditProposal.decision === 'rejected'
                      ? 'border-red-500 bg-red-50'
                      : 'border-slate-300 bg-white hover:border-red-300 hover:bg-red-50/50'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <XCircle className={`w-5 h-5 ${creditProposal.decision === 'rejected' ? 'text-red-600' : 'text-slate-400'
                        }`} />
                      <span className={`text-sm font-medium ${creditProposal.decision === 'rejected' ? 'text-red-700' : 'text-slate-600'
                        }`}>Từ chối</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreditProposal(prev => ({ ...prev, decision: 'pending' }))}
                    className={`p-3 rounded-lg border transition-all ${creditProposal.decision === 'pending'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-slate-300 bg-white hover:border-amber-300 hover:bg-amber-50/50'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Info className={`w-5 h-5 ${creditProposal.decision === 'pending' ? 'text-amber-600' : 'text-slate-400'
                        }`} />
                      <span className={`text-sm font-medium ${creditProposal.decision === 'pending' ? 'text-amber-700' : 'text-slate-600'
                        }`}>Yêu cầu bổ sung</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Proposed Amount - Only show if approved */}
              {creditProposal.decision === 'approved' && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-700 mb-4">Thông tin đề xuất phê duyệt</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                        Số tiền đề xuất (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={creditProposal.proposedAmount || loan.loanAmount}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setCreditProposal(prev => ({ ...prev, proposedAmount: value }));
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số tiền đề xuất"
                      />
                      {creditProposal.proposedAmount > 0 && (
                        <p className="text-xs text-slate-500 mt-1">{formatCurrency(creditProposal.proposedAmount)}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">Số tiền yêu cầu: {formatCurrency(loan.loanAmount)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                          Lãi suất đề xuất (%/năm) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={creditProposal.proposedInterestRate || loan.interestRate}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setCreditProposal(prev => ({ ...prev, proposedInterestRate: value }));
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập lãi suất"
                        />
                        <p className="text-xs text-slate-400 mt-1">Lãi suất yêu cầu: {loan.interestRate}%</p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                          Thời hạn vay (tháng) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={creditProposal.proposedDuration || loan.loanDuration}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            setCreditProposal(prev => ({ ...prev, proposedDuration: value }));
                          }}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập thời hạn"
                        />
                        <p className="text-xs text-slate-400 mt-1">Thời hạn yêu cầu: {loan.loanDuration} tháng</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">
                        Cấp phê duyệt tiếp theo <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setCreditProposal(prev => ({ ...prev, nextStep: 'admin' }))}
                          className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all ${creditProposal.nextStep === 'admin'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50/30'
                            }`}
                        >
                          <ShieldCheck className={`w-4 h-4 ${creditProposal.nextStep === 'admin' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="text-sm font-medium">Ban Giám đốc (Admin)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCreditProposal(prev => ({ ...prev, nextStep: 'security' }))}
                          className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all ${creditProposal.nextStep === 'security'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50/30'
                            }`}
                        >
                          <Lock className={`w-4 h-4 ${creditProposal.nextStep === 'security' ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span className="text-sm font-medium">Bộ phận Security</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2">
                        * Chọn cấp phê duyệt phù hợp với quy trình kiểm soát rủi ro của hồ sơ.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditions - Only show if approved or pending */}
              {(creditProposal.decision === 'approved' || creditProposal.decision === 'pending') && (
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">
                    Điều kiện {creditProposal.decision === 'approved' ? 'phê duyệt' : 'bổ sung'}
                  </label>
                  <div className="space-y-2 mb-3">
                    {creditProposal.conditions.length === 0 ? (
                      <p className="text-sm text-slate-400 italic text-center py-3">Chưa có điều kiện nào</p>
                    ) : (
                      creditProposal.conditions.map((condition, index) => (
                        <div key={index} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-slate-200">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="flex-1 text-sm text-slate-700">{condition}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCreditProposal(prev => ({
                                ...prev,
                                conditions: prev.conditions.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newCondition.trim()) {
                          setCreditProposal(prev => ({
                            ...prev,
                            conditions: [...prev.conditions, newCondition.trim()]
                          }));
                          setNewCondition('');
                        }
                      }}
                      placeholder="Nhập điều kiện và nhấn Enter"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCondition.trim()) {
                          setCreditProposal(prev => ({
                            ...prev,
                            conditions: [...prev.conditions, newCondition.trim()]
                          }));
                          setNewCondition('');
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              )}

              {/* Proposal Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">
                  Ghi chú đề xuất <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={creditProposal.proposalNotes}
                  onChange={(e) => setCreditProposal(prev => ({ ...prev, proposalNotes: e.target.value }))}
                  placeholder={
                    creditProposal.decision === 'approved'
                      ? 'Ghi chú về lý do phê duyệt, điều kiện, và các yêu cầu khác...'
                      : creditProposal.decision === 'rejected'
                        ? 'Ghi chú về lý do từ chối...'
                        : 'Ghi chú về các yêu cầu bổ sung cần thiết...'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {/* Summary Card */}
              {creditProposal.decision === 'approved' && creditProposal.proposedAmount > 0 && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Tóm tắt đề xuất</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Số tiền đề xuất</p>
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(creditProposal.proposedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Lãi suất</p>
                      <p className="text-sm font-semibold text-slate-900">{creditProposal.proposedInterestRate || loan.interestRate}% / năm</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Thời hạn</p>
                      <p className="text-sm font-semibold text-slate-900">{creditProposal.proposedDuration || loan.loanDuration} tháng</p>
                    </div>
                    {creditProposal.proposedAmount > 0 && creditProposal.proposedInterestRate > 0 && creditProposal.proposedDuration > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Thanh toán/tháng</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(
                            (creditProposal.proposedAmount * (creditProposal.proposedInterestRate || loan.interestRate) / 100 / 12) +
                            (creditProposal.proposedAmount / (creditProposal.proposedDuration || loan.loanDuration))
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={async () => {
                  if (!creditProposal.decision) {
                    alert('Vui lòng chọn quyết định');
                    return;
                  }
                  if (!creditProposal.proposalNotes.trim()) {
                    alert('Vui lòng nhập ghi chú đề xuất');
                    return;
                  }
                  if (creditProposal.decision === 'approved') {
                    if (!creditProposal.proposedAmount || creditProposal.proposedAmount <= 0) {
                      alert('Vui lòng nhập số tiền đề xuất');
                      return;
                    }
                    if (!creditProposal.proposedInterestRate || creditProposal.proposedInterestRate <= 0) {
                      alert('Vui lòng nhập lãi suất đề xuất');
                      return;
                    }
                    if (!creditProposal.proposedDuration || creditProposal.proposedDuration <= 0) {
                      alert('Vui lòng nhập thời hạn vay');
                      return;
                    }
                  }

                  setIsSubmitting(true);
                  try {
                    // Update assessment report with proposal
                    const report: AssessmentReport = {
                      id: `ASSESS_${Date.now()}`,
                      loanId: loan!.id,
                      assessorId: user!.id,
                      assessorName: user!.fullName,
                      creditScore: assessmentForm.creditScore || 0,
                      incomeVerified: assessmentForm.incomeVerified || false,
                      employmentVerified: assessmentForm.employmentVerified || false,
                      debtToIncomeRatio: assessmentForm.debtToIncomeRatio || 0,
                      loanToValueRatio: assessmentForm.loanToValueRatio || 0,
                      riskLevel: assessmentForm.riskLevel || 'medium',
                      riskFactors: assessmentForm.riskFactors || [],
                      recommendations: [
                        ...(assessmentForm.recommendations || []),
                        `Đề xuất: ${creditProposal.decision === 'approved' ? 'Phê duyệt' : creditProposal.decision === 'rejected' ? 'Từ chối' : 'Yêu cầu bổ sung'}`,
                        creditProposal.proposalNotes
                      ],
                      collateralValue: assessmentForm.collateralValue || 0,
                      collateralCondition: assessmentForm.collateralCondition || '',
                      marketValue: assessmentForm.marketValue || 0,
                      createdAt: new Date(),
                      updatedAt: new Date()
                    };

                    const success = await submitAssessmentReport(loan!.id, report);
                    if (success) {
                      // Update loan status based on decision
                      if (creditProposal.decision === 'approved') {
                        const targetStatus = creditProposal.nextStep === 'security' ? 'pending_security' : 'pending_admin';
                        await updateLoanStatus(loan!.id, targetStatus, user!.id, creditProposal.proposalNotes);
                        alert(`Đã gửi đề xuất phê duyệt thành công! Hồ sơ đã chuyển sang ${creditProposal.nextStep === 'security' ? 'Security' : 'Admin'} để phê duyệt.`);
                      } else if (creditProposal.decision === 'rejected') {
                        await updateLoanStatus(loan!.id, 'rejected', user!.id, creditProposal.proposalNotes);
                        alert('Đã gửi đề xuất từ chối thành công!');
                      } else {
                        alert('Đã gửi yêu cầu bổ sung thành công!');
                      }

                      // Navigate back to CA pending list
                      router.push('/ca/pending');
                    }
                  } catch (error) {
                    console.error('Failed to submit proposal:', error);
                    alert('Có lỗi xảy ra khi gửi đề xuất. Vui lòng thử lại.');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                disabled={isSubmitting}
                className={`w-full px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${creditProposal.decision === 'approved'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : creditProposal.decision === 'rejected'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    {creditProposal.decision === 'approved'
                      ? 'Gửi đề xuất phê duyệt'
                      : creditProposal.decision === 'rejected'
                        ? 'Gửi đề xuất từ chối'
                        : 'Gửi yêu cầu bổ sung'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Internal Notes */}
          {loan.internalNotes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-600" />
                Ghi chú nội bộ (CSKH)
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-line bg-white p-4 rounded-lg border border-amber-100">
                {loan.internalNotes}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar - Documents */}
        <div className="space-y-6">
          {/* Documents & Verification */}
          {loan.documents && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              {/* Header with Progress */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                    10
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Tài liệu & Xác minh</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">
                      {loan.documents.length > 0 ? (
                        <>
                          {loan.documents.filter(d => {
                            const key = getVerificationKey(d.type || 'other');
                            return documentVerification[key] || d.verified;
                          }).length} / {loan.documents.length}
                        </>
                      ) : (
                        "0/0"
                      )}
                    </div>
                    <div className="text-xs text-slate-500">đã xác minh</div>
                  </div>
                  <div className="w-24 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${loan.documents.length > 0 ? Math.min(100, (loan.documents.filter(d => {
                          const key = getVerificationKey(d.type || 'other');
                          return documentVerification[key] || d.verified;
                        }).length / loan.documents.length) * 100) : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Documents by Category */}
              <div className="space-y-4">
                {(() => {
                  const groupedDocs = groupDocumentsByType(loan.documents || []);
                  return documentTypes.map((typeInfo) => {
                    const docs = groupedDocs[typeInfo.type] || [];

                    const Icon = typeInfo.icon;
                    const verificationKey = getVerificationKey(typeInfo.type);
                    const isCategoryVerified = docs.length > 0 && (documentVerification[verificationKey] || docs.every(d => d.verified));
                    const verifiedCount = docs.filter(d => {
                      const key = getVerificationKey(d.type || 'other');
                      return documentVerification[key] || d.verified;
                    }).length;

                    return (
                      <div
                        key={typeInfo.type}
                        className={`border rounded-lg p-4 transition-all ${isCategoryVerified
                          ? 'border-green-200 bg-green-50/30'
                          : 'border-slate-200 bg-slate-50/50'
                          }`}
                      >
                        {/* Category Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${isCategoryVerified ? 'text-green-600' : 'text-slate-600'}`} />
                            <h4 className="font-semibold text-slate-900 text-sm">{typeInfo.label}</h4>
                            <span className="text-xs text-slate-500">({docs.length})</span>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isCategoryVerified}
                              onChange={(e) => {
                                setDocumentVerification(prev => ({ ...prev, [verificationKey]: e.target.checked }));
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-white border-slate-300"
                            />
                            <span className={`text-xs font-medium ${isCategoryVerified ? 'text-green-700' : 'text-slate-600'
                              }`}>
                              {isCategoryVerified ? 'Đã xác minh' : 'Xác minh tất cả'}
                            </span>
                          </label>
                        </div>

                        {/* Documents List */}
                        <div className="space-y-2">
                          {docs.length > 0 ? (
                            docs.map((doc, index) => {
                              const isImage = isImageFile(doc.fileName);
                              const docVerificationKey = getVerificationKey(doc.type || 'other');
                              const isDocVerified = documentVerification[docVerificationKey] || doc.verified || false;

                              return (
                                <div
                                  key={`${doc.id || index}`}
                                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${isDocVerified
                                    ? 'border-green-200 bg-white'
                                    : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                                    }`}
                                >
                                  {/* Thumbnail */}
                                  <div
                                    className="flex-shrink-0 w-16 h-16 rounded border border-slate-200 overflow-hidden cursor-pointer bg-slate-50"
                                    onClick={() => {
                                      const categoryDocs = groupedDocs[typeInfo.type] || [];
                                      handleDocumentClick(doc, categoryDocs);
                                    }}
                                  >
                                    {isImage ? (
                                      <img
                                        src={doc.fileUrl}
                                        alt={doc.fileName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-slate-400" />
                                      </div>
                                    )}
                                  </div>

                                  {/* File Info */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate" title={doc.fileName}>
                                      {doc.fileName}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {isImage && (
                                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                                          Ảnh
                                        </span>
                                      )}
                                      {isDocVerified && (
                                        <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded flex items-center gap-1">
                                          <CheckCircle2 className="w-3 h-3" />
                                          Đã xác minh
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Verification Checkbox */}
                                  <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={isDocVerified}
                                      onChange={(e) => {
                                        setDocumentVerification(prev => ({
                                          ...prev,
                                          [docVerificationKey]: e.target.checked
                                        }));
                                      }}
                                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 bg-white border-slate-300"
                                    />
                                  </label>
                                </div>
                              );
                            })
                          ) : (
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-slate-200 bg-white/50">
                              <div className="size-10 rounded bg-slate-50 flex items-center justify-center border border-slate-100">
                                <AlertTriangle className="w-5 h-5 text-slate-300" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-slate-400 italic">Không có thông tin</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Category Summary */}
                        {docs.length > 0 && verifiedCount > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">Tiến độ xác minh:</span>
                              <span className="font-medium text-slate-900">
                                {verifiedCount} / {docs.length} tài liệu
                              </span>
                            </div>
                            <div className="mt-1.5 w-full bg-slate-200 rounded-full h-1.5">
                              <div
                                className="bg-green-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${(verifiedCount / docs.length) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Internal Notes */}
          {loan.internalNotes && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-600" />
                Ghi chú nội bộ (CSKH)
              </h3>
              <p className="text-sm text-slate-700 bg-white p-4 rounded-lg border border-amber-100 whitespace-pre-line">
                {loan.internalNotes}
              </p>
            </div>
          )}

          {/* Status Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Thông tin trạng thái
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngày tạo</label>
                <p className="mt-1 text-sm text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatDate(loan.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cập nhật lần cuối</label>
                <p className="mt-1 text-sm text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatDate(loan.updatedAt)}
                </p>
              </div>
              {loan.assessmentReport && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Đã thẩm định</label>
                  <p className="mt-1 text-sm text-slate-700 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    {formatDate(loan.assessmentReport.createdAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDocs && previewDocs.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 w-screen h-screen" onClick={closeImagePreview} />
          <div className="relative z-50 w-full h-full bg-slate-900/95 overflow-hidden flex flex-col rounded-xl shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/80">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                  Xem ảnh chứng từ
                </span>
                <span className="text-sm text-slate-100 truncate max-w-xs md:max-w-md">
                  {previewDocs[previewIndex]?.fileName}
                </span>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                {/* Zoom Level Indicator */}
                {/\.(jpg|jpeg|png|webp|gif)$/i.test(previewDocs[previewIndex]?.fileName || '') && (
                  <div className="bg-slate-800/90 rounded-lg px-3 py-1.5 border border-slate-700">
                    <span className="text-sm text-slate-200 font-medium">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                  </div>
                )}

                {/* Zoom controls */}
                {/\.(jpg|jpeg|png|webp|gif)$/i.test(previewDocs[previewIndex]?.fileName || '') && (
                  <div className="flex gap-1 bg-slate-800/90 rounded-lg p-1 border border-slate-700">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleZoomIn();
                      }}
                      className="p-2 rounded hover:bg-slate-700 text-slate-200 transition-colors"
                      title="Phóng to (Ctrl +)"
                    >
                      <span className="material-symbols-outlined text-xl">zoom_in</span>
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleZoomOut();
                      }}
                      className="p-2 rounded hover:bg-slate-700 text-slate-200 transition-colors"
                      title="Thu nhỏ (Ctrl -)"
                    >
                      <span className="material-symbols-outlined text-xl">zoom_out</span>
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleFitToScreen();
                      }}
                      className="p-2 rounded hover:bg-slate-700 text-slate-200 transition-colors"
                      title="Vừa màn hình"
                    >
                      <span className="material-symbols-outlined text-xl">fit_screen</span>
                    </button>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleRotateImage();
                      }}
                      className="p-2 rounded hover:bg-slate-700 text-slate-200 transition-colors"
                      title="Xoay ảnh 90°"
                    >
                      <span className="material-symbols-outlined text-xl">rotate_right</span>
                    </button>
                  </div>
                )}

                {/* Download button for PDF */}
                {/\.pdf$/i.test(previewDocs[previewIndex]?.fileName || '') && (
                  <a
                    href={previewDocs[previewIndex]?.fileUrl}
                    download={previewDocs[previewIndex]?.fileName}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    onClick={e => e.stopPropagation()}
                  >
                    <span className="material-symbols-outlined text-lg">download</span>
                    Tải PDF
                  </a>
                )}

                <button
                  type="button"
                  onClick={closeImagePreview}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            </div>

            <div className="relative flex-1 flex items-center justify-center bg-slate-950/95 p-4 md:p-6 overflow-hidden">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setPreviewIndex(prev =>
                    prev === 0 ? previewDocs.length - 1 : prev - 1
                  );
                }}
                className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-100 shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>

              <div
                ref={imageContainerRef}
                className="w-full h-full flex items-center justify-center overflow-hidden"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                style={{
                  cursor: isDragging
                    ? 'grabbing'
                    : zoomLevel !== 1 && /\.(jpg|jpeg|png|webp|gif)$/i.test(previewDocs[previewIndex]?.fileName || '')
                      ? 'grab'
                      : 'default',
                  userSelect: 'none'
                }}
              >
                {/\.(jpg|jpeg|png|webp|gif)$/i.test(
                  previewDocs[previewIndex]?.fileName || ''
                ) ? (
                  <div
                    style={{
                      transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel}) rotate(${rotationAngle}deg)`,
                      transformOrigin: 'center center',
                      transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                    className="select-none"
                  >
                    <img
                      src={previewDocs[previewIndex]?.fileUrl}
                      alt={previewDocs[previewIndex]?.fileName}
                      className="rounded-xl shadow-2xl"
                      style={{
                        maxWidth: zoomLevel === 1 ? '100%' : 'none',
                        maxHeight: zoomLevel === 1 ? 'calc(100vh - 200px)' : 'none',
                        width: zoomLevel === 1 ? 'auto' : 'auto',
                        height: zoomLevel === 1 ? 'auto' : 'auto',
                        objectFit: 'contain'
                      }}
                      draggable={false}
                    />
                  </div>
                ) : /\.pdf$/i.test(previewDocs[previewIndex]?.fileName || '') ? (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <iframe
                      src={previewDocs[previewIndex]?.fileUrl}
                      className="w-full h-full rounded-lg shadow-2xl border border-slate-700"
                      title={previewDocs[previewIndex]?.fileName}
                      style={{ minHeight: '500px' }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-200 gap-4 p-8">
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-slate-800">
                      {/\.(doc|docx)$/i.test(previewDocs[previewIndex]?.fileName || '') ? (
                        <span className="material-symbols-outlined text-5xl text-blue-400">description</span>
                      ) : /\.(xls|xlsx)$/i.test(previewDocs[previewIndex]?.fileName || '') ? (
                        <span className="material-symbols-outlined text-5xl text-green-400">table_chart</span>
                      ) : (
                        <span className="material-symbols-outlined text-5xl text-slate-400">insert_drive_file</span>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-slate-100 mb-2">
                        {previewDocs[previewIndex]?.fileName}
                      </p>
                      <p className="text-sm text-slate-400 mb-4">
                        File này không thể xem trực tiếp trong trình duyệt
                      </p>
                      <a
                        href={previewDocs[previewIndex]?.fileUrl}
                        download={previewDocs[previewIndex]?.fileName}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">download</span>
                        Tải xuống để xem
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setPreviewIndex(prev =>
                    prev === previewDocs.length - 1 ? 0 : prev + 1
                  );
                }}
                className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-10 h-10 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-100 shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            </div>

            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-800 bg-slate-900/90">
              <span className="text-xs text-slate-400">
                Tài liệu {previewIndex + 1} / {previewDocs.length}
              </span>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 py-1">
                {previewDocs.map((doc, idx) => (
                  <button
                    key={doc.id || idx}
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setPreviewIndex(idx);
                    }}
                    className={`relative w-10 h-10 rounded border overflow-hidden flex items-center justify-center flex-shrink-0 ${idx === previewIndex
                      ? 'border-blue-400 ring-2 ring-blue-500/60'
                      : 'border-slate-600 hover:border-slate-400'
                      }`}
                  >
                    {/\.(jpg|jpeg|png|webp|gif)$/i.test(doc.fileName) ? (
                      <img
                        src={doc.fileUrl}
                        alt={doc.fileName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined text-slate-300 text-lg">description</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


