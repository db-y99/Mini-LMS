import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, User, Phone, Mail, MapPin, FileText, 
  DollarSign, Clock, CheckCircle2, XCircle, Car, Bike, Smartphone, 
  Monitor, Home, Package, CreditCard, AlertCircle,
  FileCheck, Square, Eye, X, Download, ZoomIn, ZoomOut, RotateCw,
  ChevronLeft, ChevronRight, Maximize2, Shield, UserCheck, 
  ClipboardCheck, Banknote, List
} from 'lucide-react';
import { useWorkflow } from '../contexts/WorkflowContext';
import { useAuth } from '../contexts/AuthContext';
import { LoanApplication, DocumentUpload, PaymentSchedule, PaymentScheduleItem } from '../types';
import { PaymentScheduleView } from './PaymentScheduleView';

export const LoanDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { loans } = useWorkflow();
  const { user } = useAuth();

  const getBackRoute = () => {
    // If coming from a specific route, go back to that
    if (location.state?.from) {
      return location.state.from;
    }
    // Otherwise, use role-based default
    if (user?.role === 'assessment') return '/ca/pending';
    if (user?.role === 'security') return '/sec/pending-checks';
    if (user?.role === 'admin') return '/admin/loans-pending';
    if (user?.role === 'accountant') return '/acc/disbursements-pending';
    return '/cs/loans';
  };
  const [loan, setLoan] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewDocs, setPreviewDocs] = useState<DocumentUpload[] | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [showPaymentSchedule, setShowPaymentSchedule] = useState(false);
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentSchedule | null>(null);

  // Load loan data
  useEffect(() => {
    if (id) {
      const foundLoan = loans.find(l => l.id === id);
      setLoan(foundLoan || null);
    }
    setLoading(false);
  }, [id, loans]);

  // Xử lý drag toàn cục để đảm bảo hoạt động mượt khi di chuyển chuột ra ngoài
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
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Không tìm thấy hồ sơ</h3>
        <p className="text-slate-600 mb-4">Hồ sơ vay với ID {id} không tồn tại.</p>
        <button
          onClick={() => navigate(getBackRoute())}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case 'car': return <Car className="w-5 h-5" />;
      case 'bike': return <Bike className="w-5 h-5" />;
      case 'phone': return <Smartphone className="w-5 h-5" />;
      case 'computer': return <Monitor className="w-5 h-5" />;
      case 'house': return <Home className="w-5 h-5" />;
      case 'land': return <Square className="w-5 h-5" />;
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disbursed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-600 border border-green-100">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Đã giải ngân
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-50 text-red-600 border border-red-100">
            <XCircle className="w-4 h-4 mr-1" /> Từ chối
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-50 text-gray-600 border border-gray-100">
            <XCircle className="w-4 h-4 mr-1" /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-4 h-4 mr-1" /> Chờ xử lý
          </span>
        );
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  // Workflow steps definition
  const workflowSteps = [
    {
      id: 'cskh_create',
      name: 'Tạo hồ sơ',
      matchingStatuses: ['draft', 'pending_cskh'],
      icon: FileText,
      order: 1
    },
    {
      id: 'assessment_review',
      name: 'Thẩm định tài chính',
      matchingStatuses: ['pending_assessment'],
      icon: ClipboardCheck,
      order: 2
    },
    {
      id: 'security_check',
      name: 'Kiểm tra bảo mật',
      matchingStatuses: ['pending_security'],
      icon: Shield,
      order: 3
    },
    {
      id: 'admin_approval',
      name: 'Phê duyệt cuối',
      matchingStatuses: ['pending_admin'],
      icon: UserCheck,
      order: 4
    },
    {
      id: 'accountant_disbursement',
      name: 'Giải ngân',
      matchingStatuses: ['pending_disbursement', 'disbursed'],
      icon: Banknote,
      order: 5
    }
  ];

  // Get step status based on loan status
  const getStepStatus = (step: typeof workflowSteps[0], currentLoanStatus: string) => {
    // If loan is rejected or cancelled
    if (currentLoanStatus === 'rejected' || currentLoanStatus === 'cancelled') {
      // Check if this step was completed before rejection
      // We'll check if loan has assessment report, security check, etc.
      if (step.order === 1) {
        // First step is always completed if loan exists
        return 'completed';
      }
      if (step.order === 2 && loan?.assessmentReport) {
        return 'completed';
      }
      if (step.order === 3 && loan?.securityCheckStatus) {
        return 'completed';
      }
      if (step.order === 4 && loan?.approvedAt) {
        return 'completed';
      }
      // If rejected at this step, show rejected
      if (loan?.currentStep === step.id && currentLoanStatus === 'rejected') {
        return 'rejected';
      }
      return 'pending';
    }

    // If disbursed, all steps are completed
    if (currentLoanStatus === 'disbursed') {
      return 'completed';
    }

    // Check if current status matches this step
    const isCurrentStep = step.matchingStatuses.includes(currentLoanStatus);
    
    // Get order of current status
    const statusOrder = workflowSteps.find(s => 
      s.matchingStatuses.includes(currentLoanStatus)
    )?.order || 0;

    if (step.order < statusOrder) {
      return 'completed';
    } else if (isCurrentStep) {
      return 'current';
    } else {
      return 'pending';
    }
  };

  // Document type definitions
  const documentTypes = [
    { type: 'id_front', label: 'Ảnh mặt trước CCCD/CMT', icon: FileText },
    { type: 'id_back', label: 'Ảnh mặt sau CCCD/CMT', icon: FileText },
    { type: 'portrait', label: 'Ảnh chân dung', icon: User },
    { type: 'utility_bill', label: 'Hóa đơn điện / nước', icon: FileText },
    { type: 'residency', label: 'Xác nhận cư trú VNeID', icon: FileCheck },
    { type: 'collateral', label: 'Tài sản đảm bảo', icon: Package },
    { type: 'other', label: 'Tài liệu khác', icon: FileText },
  ];

  // Group documents by type
  const groupDocumentsByType = (documents: DocumentUpload[]) => {
    const groups: Record<string, DocumentUpload[]> = {};
    documents.forEach(doc => {
      if (!groups[doc.type]) {
        groups[doc.type] = [];
      }
      groups[doc.type].push(doc);
    });
    return groups;
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'id_front': return 'Ảnh mặt trước CCCD/CMT';
      case 'id_back': return 'Ảnh mặt sau CCCD/CMT';
      case 'portrait': return 'Ảnh chân dung';
      case 'utility_bill': return 'Hóa đơn điện / nước';
      case 'residency': return 'Xác nhận cư trú VNeID';
      case 'collateral': return 'Tài sản đảm bảo';
      default: return 'Tài liệu khác';
    }
  };

  const isImageFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
  };

  const openImagePreview = (docs: DocumentUpload[], index: number) => {
    if (!docs.length) return;
    setPreviewDocs(docs);
    setPreviewIndex(index);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setRotationAngle(0);
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
    if (e.button !== 0) return;
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

  // Tạo payment schedule từ loan data
  const generatePaymentSchedule = (loan: LoanApplication): PaymentSchedule => {
    const items: PaymentScheduleItem[] = [];
    const monthlyPayment = loan.monthlyPayment;
    const loanDuration = loan.loanDuration;
    const startDate = loan.disbursedAt ? new Date(loan.disbursedAt) : new Date();
    startDate.setMonth(startDate.getMonth() + 1); // Bắt đầu trả nợ từ tháng sau khi giải ngân

    let remainingBalance = loan.loanAmount;
    const monthlyInterestRate = loan.interestRate / 100 / 12;

    for (let i = 1; i <= loanDuration; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i - 1);

      // Tính toán gốc và lãi
      const interestAmount = remainingBalance * monthlyInterestRate;
      const principalAmount = monthlyPayment - interestAmount;
      const totalAmount = monthlyPayment;

      // Cập nhật số dư còn lại
      remainingBalance = Math.max(0, remainingBalance - principalAmount);

      // Xác định trạng thái
      let status: 'pending' | 'paid' | 'overdue' | 'partial' = 'pending';
      let overdueDays: number | undefined;

      if (dueDate < new Date()) {
        // Quá hạn
        const daysDiff = Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 0) {
          status = 'overdue';
          overdueDays = daysDiff;
        }
      }

      items.push({
        id: `ITEM_${loan.id}_${i}`,
        loanId: loan.id,
        installmentNumber: i,
        dueDate,
        principalAmount: Math.round(principalAmount),
        interestAmount: Math.round(interestAmount),
        totalAmount: Math.round(totalAmount),
        status,
        overdueDays
      });
    }

    return {
      id: `SCHEDULE_${loan.id}`,
      loanId: loan.id,
      customerId: loan.customerId,
      customerName: loan.customer.fullName,
      loanAmount: loan.loanAmount,
      totalPayment: loan.totalPayment,
      monthlyPayment: loan.monthlyPayment,
      loanDuration: loan.loanDuration,
      interestRate: loan.interestRate,
      startDate,
      items,
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt
    };
  };

  const handleViewPaymentSchedule = () => {
    if (loan) {
      const schedule = generatePaymentSchedule(loan);
      setPaymentSchedule(schedule);
      setShowPaymentSchedule(true);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(getBackRoute())}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Chi tiết hồ sơ vay</h2>
            <p className="text-slate-500 mt-1 text-sm">Mã hồ sơ: {loan.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(loan.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thông tin khách hàng */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Thông tin khách hàng
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Họ và tên</label>
                <p className="mt-1 text-sm font-medium text-slate-900">{loan.customer.fullName}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Số điện thoại</label>
                <p className="mt-1 text-sm font-medium text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {loan.customer.phoneNumber}
                </p>
              </div>
              {loan.customer.email && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</label>
                  <p className="mt-1 text-sm font-medium text-slate-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {loan.customer.email}
                  </p>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Giới tính</label>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {loan.customer.gender === 'male' ? 'Nam' : loan.customer.gender === 'female' ? 'Nữ' : 'Khác'}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Loại giấy tờ</label>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {loan.customer.idType === 'cccd' ? 'CCCD' : loan.customer.idType === 'cmnd' ? 'CMND' : 'Hộ chiếu'}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Số CMND/CCCD</label>
                <p className="mt-1 text-sm font-medium text-slate-900">{loan.customer.idNumber}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngày cấp</label>
                <p className="mt-1 text-sm font-medium text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {loan.customer.issueDate}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nơi cấp</label>
                <p className="mt-1 text-sm font-medium text-slate-900">{loan.customer.issuePlace}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Địa chỉ</label>
                <p className="mt-1 text-sm font-medium text-slate-900 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  {loan.customer.address}, {loan.customer.district}, {loan.customer.province}
                </p>
              </div>
              {loan.customer.occupation && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nghề nghiệp</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">{loan.customer.occupation}</p>
                </div>
              )}
              {loan.customer.monthlyIncome && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thu nhập hàng tháng</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">{formatCurrency(loan.customer.monthlyIncome)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Thông tin khoản vay */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Thông tin khoản vay
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Số tiền vay</label>
                <p className="mt-1 text-lg font-bold text-blue-600">{formatCurrency(loan.loanAmount)}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thời hạn vay</label>
                <p className="mt-1 text-sm font-medium text-slate-900">{loan.loanDuration} tháng</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lãi suất</label>
                <p className="mt-1 text-sm font-medium text-slate-900">{loan.interestRate}% / năm</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Thanh toán hàng tháng</label>
                <p className="mt-1 text-sm font-medium text-slate-900">{formatCurrency(loan.monthlyPayment)}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng số tiền phải trả</label>
                <p className="mt-1 text-sm font-medium text-slate-900">{formatCurrency(loan.totalPayment)}</p>
              </div>
              {loan.referralCode && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mã giới thiệu</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">{loan.referralCode}</p>
                </div>
              )}
            </div>
            {loan.status === 'disbursed' && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={handleViewPaymentSchedule}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <List className="w-4 h-4" />
                  Xem lịch trả nợ
                </button>
              </div>
            )}
          </div>

          {/* Thông tin tài sản đảm bảo */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                {getAssetIcon(loan.collateralType)}
                <span>Tài sản đảm bảo</span>
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Loại tài sản</label>
                <p className="mt-1 text-sm font-medium text-slate-900 flex items-center gap-2">
                  {getAssetIcon(loan.collateralType)}
                  {getAssetName(loan.collateralType)}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mô tả tài sản</label>
                <p className="mt-1 text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{loan.collateralDescription}</p>
              </div>
            </div>
          </div>

          {/* Tài liệu đính kèm */}
          {loan.documents && loan.documents.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Tài liệu đính kèm
                </h3>
              </div>
              
              <div className="space-y-6">
                {(() => {
                  const groupedDocs = groupDocumentsByType(loan.documents || []);
                  return documentTypes.map((typeInfo) => {
                    const docs = groupedDocs[typeInfo.type] || [];
                    if (docs.length === 0) return null;
                  
                  return (
                    <div key={typeInfo.type} className="border-b border-slate-100 last:border-b-0 pb-6 last:pb-0">
                      <div className="flex items-center gap-2 mb-4">
                        <typeInfo.icon className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-slate-900">{typeInfo.label}</h4>
                        <span className="text-sm text-slate-500">({docs.length})</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {docs.map((doc, index) => {
                          const isImage = isImageFile(doc.fileName);
                          return (
                            <div 
                              key={`${doc.id || index}`}
                              className="relative group border border-slate-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                            >
                              {isImage ? (
                                <div 
                                  className="aspect-video bg-slate-100 cursor-pointer relative overflow-hidden"
                                  onClick={() => {
                                    const groupedDocs = groupDocumentsByType(loan.documents || []);
                                    const categoryDocs = groupedDocs[typeInfo.type] || [];
                                    const docIndex = categoryDocs.findIndex(d => d.id === doc.id || d.fileUrl === doc.fileUrl);
                                    openImagePreview(categoryDocs, docIndex >= 0 ? docIndex : 0);
                                  }}
                                >
                                  <img 
                                    src={doc.fileUrl} 
                                    alt={doc.fileName}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  {doc.verified && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                      <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="aspect-video bg-slate-50 flex items-center justify-center">
                                  <FileText className="w-12 h-12 text-slate-400" />
                                  {doc.verified && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                                      <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              <div className="p-3">
                                <p className="text-xs font-medium text-slate-900 truncate" title={doc.fileName}>
                                  {doc.fileName}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <button
                                    onClick={() => {
                                      const groupedDocs = groupDocumentsByType(loan.documents || []);
                                      const categoryDocs = groupedDocs[typeInfo.type] || [];
                                      const docIndex = categoryDocs.findIndex(d => d.id === doc.id || d.fileUrl === doc.fileUrl);
                                      openImagePreview(categoryDocs, docIndex >= 0 ? docIndex : 0);
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Xem
                                  </button>
                                  <button
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = doc.fileUrl;
                                      link.download = doc.fileName;
                                      link.click();
                                    }}
                                    className="text-xs text-slate-600 hover:text-slate-700 flex items-center gap-1"
                                  >
                                    <Download className="w-3 h-3" />
                                    Tải
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Ghi chú nội bộ */}
          {loan.internalNotes && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Ghi chú nội bộ
                </h3>
              </div>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">{loan.internalNotes}</p>
            </div>
          )}

          {/* Lý do từ chối */}
          {loan.rejectionReason && (
            <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Lý do từ chối
                </h3>
              </div>
              <p className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">{loan.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Thông tin trạng thái */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Trạng thái & Thời gian
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Tiến trình xử lý</label>
                <div className="relative pl-2">
                  {/* Steps */}
                  <div className="space-y-6">
                    {workflowSteps.map((step, index) => {
                      const stepStatus = getStepStatus(step, loan.status);
                      const StepIcon = step.icon;
                      const isLast = index === workflowSteps.length - 1;
                      const nextStep = !isLast ? workflowSteps[index + 1] : null;
                      const nextStepStatus = nextStep ? getStepStatus(nextStep, loan.status) : null;
                      
                      // Determine line color
                      const lineColor = 
                        (stepStatus === 'completed' || stepStatus === 'current') && 
                        (nextStepStatus === 'completed' || nextStepStatus === 'current')
                          ? 'bg-blue-600'
                          : stepStatus === 'completed'
                          ? 'bg-blue-600'
                          : 'bg-slate-200';
                      
                      return (
                        <div key={step.id} className="relative">
                          <div className="flex items-start gap-4">
                            {/* Icon circle */}
                            <div className={`
                              relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                              transition-all duration-300
                              ${
                                stepStatus === 'completed'
                                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                  : stepStatus === 'current'
                                  ? 'bg-blue-100 border-2 border-blue-600 text-blue-600 ring-4 ring-blue-100'
                                  : stepStatus === 'rejected'
                                  ? 'bg-red-100 border-2 border-red-600 text-red-600'
                                  : 'bg-slate-100 border-2 border-slate-300 text-slate-400'
                              }
                            `}>
                              {stepStatus === 'completed' ? (
                                <CheckCircle2 className="w-6 h-6" />
                              ) : stepStatus === 'rejected' ? (
                                <XCircle className="w-6 h-6" />
                              ) : (
                                <StepIcon className="w-5 h-5" />
                              )}
                            </div>

                            {/* Step content */}
                            <div className="flex-1 pt-1">
                              <div className={`
                                font-semibold text-sm mb-1
                                ${
                                  stepStatus === 'completed'
                                    ? 'text-blue-600'
                                    : stepStatus === 'current'
                                    ? 'text-blue-700'
                                    : stepStatus === 'rejected'
                                    ? 'text-red-600'
                                    : 'text-slate-500'
                                }
                              `}>
                                {step.name}
                                {stepStatus === 'current' && (
                                  <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                    Đang xử lý
                                  </span>
                                )}
                                {stepStatus === 'rejected' && (
                                  <span className="ml-2 text-xs font-normal text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                    Từ chối
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500">
                                {stepStatus === 'completed' && (loan?.status === 'disbursed' && step.order === 5 ? 'Đã giải ngân' : 'Đã hoàn thành')}
                                {stepStatus === 'current' && 'Đang chờ xử lý'}
                                {stepStatus === 'pending' && 'Chưa đến'}
                                {stepStatus === 'rejected' && 'Đã từ chối tại bước này'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Connecting line */}
                          {!isLast && (
                            <div className={`absolute left-6 top-12 w-0.5 h-6 ${lineColor} transition-colors`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trạng thái hiện tại</label>
                <div className="mt-2">{getStatusBadge(loan.status)}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngày tạo</label>
                <p className="mt-1 text-sm text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatDate(loan.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Người tạo đơn</label>
                <p className="mt-1 text-sm text-slate-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  {loan.createdByName || 'Không xác định'}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cập nhật lần cuối</label>
                <p className="mt-1 text-sm text-slate-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {formatDate(loan.updatedAt)}
                </p>
              </div>
              {loan.approvedAt && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngày phê duyệt</label>
                  <p className="mt-1 text-sm text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(loan.approvedAt)}
                  </p>
                </div>
              )}
              {loan.disbursedAt && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngày giải ngân</label>
                  <p className="mt-1 text-sm text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(loan.disbursedAt)}
                  </p>
                </div>
              )}
              {loan.rejectedAt && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngày từ chối</label>
                  <p className="mt-1 text-sm text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(loan.rejectedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Báo cáo thẩm định */}
          {loan.assessmentReport && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                Báo cáo thẩm định
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Điểm tín dụng</label>
                  <p className="mt-1 text-sm font-bold text-slate-900">{loan.assessmentReport.creditScore}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mức độ rủi ro</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {loan.assessmentReport.riskLevel === 'low' ? 'Thấp' :
                     loan.assessmentReport.riskLevel === 'medium' ? 'Trung bình' : 'Cao'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Giá trị tài sản</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">{formatCurrency(loan.assessmentReport.collateralValue)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Thông tin hoa hồng */}
          {loan.commissionAmount && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Hoa hồng
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Số tiền hoa hồng</label>
                  <p className="mt-1 text-sm font-bold text-green-600">{formatCurrency(loan.commissionAmount)}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Trạng thái thanh toán</label>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {loan.commissionPaid ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Đã thanh toán
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                        <Clock className="w-3 h-3 mr-1" /> Chờ thanh toán
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document preview dialog */}
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
                {/* Zoom Level Indicator - chỉ hiển thị cho ảnh */}
                {/\.(jpg|jpeg|png|webp|gif)$/i.test(previewDocs[previewIndex]?.fileName || '') && (
                  <div className="bg-slate-800/90 rounded-lg px-3 py-1.5 border border-slate-700">
                    <span className="text-sm text-slate-200 font-medium">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                  </div>
                )}
                
                {/* Zoom controls - chỉ hiển thị cho ảnh */}
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
                      <ZoomIn className="w-5 h-5" />
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
                      <ZoomOut className="w-5 h-5" />
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
                      <Maximize2 className="w-5 h-5" />
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
                      <RotateCw className="w-5 h-5" />
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
                    <Download className="w-4 h-4" />
                    Tải PDF
                  </a>
                )}
                
                <button
                  type="button"
                  onClick={closeImagePreview}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
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
                <ChevronLeft className="w-5 h-5" />
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
                        <FileText className="w-12 h-12 text-blue-400" />
                      ) : /\.(xls|xlsx)$/i.test(previewDocs[previewIndex]?.fileName || '') ? (
                        <FileText className="w-12 h-12 text-green-400" />
                      ) : (
                        <FileText className="w-12 h-12 text-slate-400" />
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
                        <Download className="w-4 h-4" />
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
                <ChevronRight className="w-5 h-5" />
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
                    className={`relative w-10 h-10 rounded border overflow-hidden flex items-center justify-center flex-shrink-0 ${
                      idx === previewIndex
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
                      <FileText className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Schedule Modal */}
      {showPaymentSchedule && paymentSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-6xl w-full mx-4 my-8 max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Lịch trả nợ chi tiết</h3>
                <button
                  onClick={() => {
                    setShowPaymentSchedule(false);
                    setPaymentSchedule(null);
                  }}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <PaymentScheduleView
                schedule={paymentSchedule}
                onClose={() => {
                  setShowPaymentSchedule(false);
                  setPaymentSchedule(null);
                }}
                showHeader={false}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

