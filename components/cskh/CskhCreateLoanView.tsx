import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import {
  LoanFormData,
  LoanApplication,
  Customer,
  DocumentUpload
} from '../../types';
import { DocumentManager } from '../DocumentManager';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useAuth } from '../../contexts/AuthContext';

const initialFormData: LoanFormData = {
  collateralType: 'bike',
  collateralDescription: '',
  collateralDetails: {},
  fullName: '',
  phoneNumber: '',
  email: '',
  gender: 'male',
  birthDate: '',
  idType: 'cccd',
  idNumber: '',
  issueDate: '',
  issuePlace: '',
  country: 'Việt Nam',
  province: '',
  district: '',
  address: '',
  maritalStatus: 'single',
  numberOfDependents: 0,
  occupation: '',
  companyName: '',
  companyAddress: '',
  position: '',
  workExperience: 0,
  employmentType: 'fulltime',
  monthlyIncome: 0,
  otherIncome: 0,
  bankName: '',
  bankAccountNumber: '',
  bankAccountHolder: '',
  existingLoans: 0,
  monthlyLoanPayments: 0,
  creditCardDebt: 0,
  creditCardLimit: 0,
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  reference1Name: '',
  reference1Phone: '',
  reference1Relationship: '',
  reference2Name: '',
  reference2Phone: '',
  reference2Relationship: '',
  loanAmount: 0,
  loanDuration: 12,
  loanPurpose: '',
  referralCode: '',
  internalNotes: '',
  customerSource: '',
  salesChannel: ''
};

type SubmitMode = 'draft' | 'security' | 'send';

export const CskhCreateLoanView: React.FC = () => {
  const navigate = useNavigate();
  const { createLoan } = useWorkflow();
  const { user } = useAuth();
  const [formData, setFormData] = useState<LoanFormData>(initialFormData);
  const [documents, setDocuments] = useState<DocumentUpload[]>([]);
  const [loanAmountInput, setLoanAmountInput] = useState<string>('');
  const [monthlyIncomeInput, setMonthlyIncomeInput] = useState<string>('');
  const [otherIncomeInput, setOtherIncomeInput] = useState<string>('');
  const [monthlyLoanPaymentsInput, setMonthlyLoanPaymentsInput] = useState<string>('');
  const [creditCardDebtInput, setCreditCardDebtInput] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');
  const [genderTouched, setGenderTouched] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [lastActionLabel, setLastActionLabel] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationErrorList, setValidationErrorList] = useState<string[]>([]);
  const [previewDocs, setPreviewDocs] = useState<DocumentUpload[] | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState<string>('collateral');
  const [showLoanPreview, setShowLoanPreview] = useState<boolean>(true);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailListsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const documentTypes: Array<{
    type: DocumentUpload['type'];
    label: string;
    description: string;
    required?: boolean;
  }> = [
    { type: 'id_front', label: 'CCCD/CMND - Mặt trước', description: 'Ảnh chụp rõ ràng, không che khuất', required: true },
    { type: 'id_back', label: 'CCCD/CMND - Mặt sau', description: 'Hiển thị rõ số và ngày cấp', required: true },
    { type: 'portrait', label: 'Ảnh chân dung', description: 'Ảnh chụp chân dung khách hàng', required: true },
    { type: 'utility_bill', label: 'Hóa đơn điện/nước/Internet', description: 'Trong vòng 3 tháng gần nhất', required: false },
    { type: 'residency', label: 'Giấy tờ chứng minh nơi ở', description: 'Sổ hộ khẩu / KT3 / Hợp đồng thuê nhà', required: false },
    { type: 'collateral', label: 'Ảnh tài sản đảm bảo', description: 'Ảnh chụp tài sản cầm cố / thế chấp', required: false },
    { type: 'other', label: 'Bảng lương / Xác nhận thu nhập', description: 'Bảng lương 3 tháng gần nhất hoặc xác nhận lương', required: false },
    { type: 'other', label: 'Sao kê ngân hàng', description: 'Sao kê tài khoản 3 tháng gần nhất', required: false },
    { type: 'other', label: 'Giấy xác nhận công việc', description: 'Giấy xác nhận từ công ty (nếu có)', required: false }
  ];

  const getDocsByType = (type: DocumentUpload['type']) =>
    documents.filter(doc => doc.type === type);

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
    // Chỉ cho phép drag với chuột trái
    if (e.button !== 0) return;
    
    // Cho phép drag ở mọi mức zoom (kể cả dưới 100%)
    if (zoomLevel !== 1) {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX - panPosition.x;
      const startY = e.clientY - panPosition.y;
      dragStartRef.current = { x: startX, y: startY };
      setDragStart({ x: startX, y: startY });
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

  // Sync formatted currency inputs when formData changes externally
  useEffect(() => {
    if (formData.monthlyIncome > 0 && !monthlyIncomeInput) {
      setMonthlyIncomeInput(formData.monthlyIncome.toLocaleString('vi-VN'));
    }
    if (formData.otherIncome > 0 && !otherIncomeInput) {
      setOtherIncomeInput(formData.otherIncome.toLocaleString('vi-VN'));
    }
    if (formData.monthlyLoanPayments > 0 && !monthlyLoanPaymentsInput) {
      setMonthlyLoanPaymentsInput(formData.monthlyLoanPayments.toLocaleString('vi-VN'));
    }
    if (formData.creditCardDebt > 0 && !creditCardDebtInput) {
      setCreditCardDebtInput(formData.creditCardDebt.toLocaleString('vi-VN'));
    }
  }, [formData.monthlyIncome, formData.otherIncome, formData.monthlyLoanPayments, formData.creditCardDebt]);

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
        closeImagePreview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewDocs]);

  const handleUploadFiles = async (type: DocumentUpload['type'], files: FileList) => {
    const now = new Date();
    const newDocs: DocumentUpload[] = Array.from(files).map(file => ({
      id: `DOC${Date.now()}_${file.name}`,
      type,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      uploadedBy: user?.id || 'unknown',
      uploadedAt: now
    }));

    setDocuments(prev => {
      const updated = [...prev, ...newDocs];
      
      // Clear documents validation error if all required documents are now uploaded
      if (validationErrors.documents) {
        const requiredDocTypes = documentTypes.filter(doc => doc.required);
        const allRequiredDocsUploaded = requiredDocTypes.every(docType => {
          return updated.filter(doc => doc.type === docType.type).length > 0;
        });
        
        if (allRequiredDocsUploaded) {
          setTimeout(() => {
            setValidationErrors(prevErrors => {
              const next = { ...prevErrors };
              delete next.documents;
              return next;
            });
          }, 0);
        }
      }
      
      return updated;
    });
  };

  // Helper function to format currency input
  const formatCurrencyInput = (raw: string, field: keyof LoanFormData, setFormattedValue: (value: string) => void) => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) {
      setFormattedValue('');
      handleInputChange(field, 0);
      return;
    }
    const numeric = Number(digits);
    setFormattedValue(numeric.toLocaleString('vi-VN'));
    handleInputChange(field, numeric);
  };

  const handleLoanAmountChange = (raw: string) => {
    formatCurrencyInput(raw, 'loanAmount', setLoanAmountInput);
  };

  const handleMonthlyIncomeChange = (raw: string) => {
    formatCurrencyInput(raw, 'monthlyIncome', setMonthlyIncomeInput);
  };

  const handleOtherIncomeChange = (raw: string) => {
    formatCurrencyInput(raw, 'otherIncome', setOtherIncomeInput);
  };

  const handleMonthlyLoanPaymentsChange = (raw: string) => {
    formatCurrencyInput(raw, 'monthlyLoanPayments', setMonthlyLoanPaymentsInput);
  };

  const handleCreditCardDebtChange = (raw: string) => {
    formatCurrencyInput(raw, 'creditCardDebt', setCreditCardDebtInput);
  };

  const handleInputChange = (field: keyof LoanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCollateralDetailChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      collateralDetails: {
        ...prev.collateralDetails,
        [field]: value
      }
    }));
  };

  // Loan calculation helpers
  const calculateLoanDetails = () => {
    const interestRate = 12; // 12% per year
    const monthlyInterest = interestRate / 100 / 12;
    const months = formData.loanDuration || 12;
    const principal = formData.loanAmount || 0;
    
    if (principal === 0 || months === 0) {
      return {
        monthlyPayment: 0,
        totalPayment: 0,
        totalInterest: 0,
        interestRate: interestRate
      };
    }

    const monthlyPayment =
      (principal * monthlyInterest * Math.pow(1 + monthlyInterest, months)) /
      (Math.pow(1 + monthlyInterest, months) - 1 || 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      interestRate: interestRate
    };
  };

  // Risk assessment helpers
  const calculateRiskIndicators = () => {
    const totalMonthlyIncome = (formData.monthlyIncome || 0) + (formData.otherIncome || 0);
    const totalMonthlyDebt = (formData.monthlyLoanPayments || 0) + 
                             ((formData.creditCardDebt || 0) * 0.05); // Assume 5% minimum payment
    const loanDetails = calculateLoanDetails();
    const newMonthlyPayment = loanDetails.monthlyPayment;

    // Debt-to-Income Ratio (DTI)
    const dti = totalMonthlyIncome > 0 
      ? ((totalMonthlyDebt + newMonthlyPayment) / totalMonthlyIncome) * 100 
      : 0;

    // Loan-to-Value Ratio (LTV) - simplified, assuming collateral value = loan amount * 1.5
    const estimatedCollateralValue = formData.loanAmount * 1.5;
    const ltv = estimatedCollateralValue > 0 
      ? (formData.loanAmount / estimatedCollateralValue) * 100 
      : 0;

    return {
      dti: Math.round(dti * 100) / 100,
      ltv: Math.round(ltv * 100) / 100,
      totalMonthlyIncome,
      totalMonthlyDebt,
      newMonthlyPayment,
      riskLevel: dti > 50 ? 'high' : dti > 35 ? 'medium' : 'low'
    };
  };

  const validateForm = (): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    if (!formData.collateralType) {
      errors.collateralType = 'Vui lòng chọn loại tài sản đảm bảo';
    }

    if (!formData.fullName.trim()) {
      errors.fullName = 'Vui lòng nhập họ và tên';
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    if (!formData.idNumber.trim()) {
      errors.idNumber = 'Vui lòng nhập số giấy tờ';
    }
    if (!formData.loanAmount || formData.loanAmount <= 0) {
      errors.loanAmount = 'Vui lòng nhập số tiền vay hợp lệ';
    }

    // Validate required documents
    const requiredDocTypes = documentTypes.filter(doc => doc.required);
    const missingDocs: string[] = [];
    requiredDocTypes.forEach(docType => {
      if (getDocsByType(docType.type).length === 0) {
        missingDocs.push(docType.label);
      }
    });
    if (missingDocs.length > 0) {
      errors.documents = `Vui lòng tải lên: ${missingDocs.join(', ')}`;
    }

    setValidationErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const buildLoan = (status: LoanApplication['status']): LoanApplication => {
    const loanId = `LOAN${Date.now()}`;

    const customer: Customer = {
      id: `CUST${Date.now()}`,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      gender: formData.gender,
      birthDate: formData.birthDate,
      maritalStatus: formData.maritalStatus,
      numberOfDependents: formData.numberOfDependents,
      idType: formData.idType,
      idNumber: formData.idNumber,
      issueDate: formData.issueDate,
      issuePlace: formData.issuePlace,
      country: formData.country,
      province: formData.province,
      district: formData.district,
      address: formData.address,
      occupation: formData.occupation,
      // Employment details
      companyName: formData.companyName,
      companyAddress: formData.companyAddress,
      position: formData.position,
      workExperience: formData.workExperience,
      employmentType: formData.employmentType,
      // Financial details
      monthlyIncome: formData.monthlyIncome,
      otherIncome: formData.otherIncome,
      bankName: formData.bankName,
      bankAccountNumber: formData.bankAccountNumber,
      bankAccountHolder: formData.bankAccountHolder,
      existingLoans: formData.existingLoans,
      monthlyLoanPayments: formData.monthlyLoanPayments,
      creditCardDebt: formData.creditCardDebt,
      creditCardLimit: formData.creditCardLimit,
      // Emergency contacts & References
      emergencyContactName: formData.emergencyContactName,
      emergencyContactPhone: formData.emergencyContactPhone,
      emergencyContactRelationship: formData.emergencyContactRelationship,
      reference1Name: formData.reference1Name,
      reference1Phone: formData.reference1Phone,
      reference1Relationship: formData.reference1Relationship,
      reference2Name: formData.reference2Name,
      reference2Phone: formData.reference2Phone,
      reference2Relationship: formData.reference2Relationship,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const interestRate = 12;
    const monthlyInterest = interestRate / 100 / 12;
    const months = formData.loanDuration || 12;
    const monthlyPayment =
      (formData.loanAmount * monthlyInterest * Math.pow(1 + monthlyInterest, months)) /
      (Math.pow(1 + monthlyInterest, months) - 1 || 1);
    const totalPayment = monthlyPayment * months;

    const now = new Date();

    // Tạo mô tả chi tiết từ thông tin đã nhập
    let detailedDescription = formData.collateralDescription || '';
    if (formData.collateralDetails) {
      const details = formData.collateralDetails;
      const detailParts: string[] = [];
      
      if (formData.collateralType === 'car' || formData.collateralType === 'bike') {
        if (details.licensePlate) detailParts.push(`Biển số: ${details.licensePlate}`);
        if (details.brand) detailParts.push(`Hãng: ${details.brand}`);
        if (details.model) detailParts.push(`Model: ${details.model}`);
        if (details.year) detailParts.push(`Năm SX: ${details.year}`);
        if (details.color) detailParts.push(`Màu: ${details.color}`);
        if (details.chassisNumber) detailParts.push(`Số khung: ${details.chassisNumber}`);
        if (details.engineNumber) detailParts.push(`Số máy: ${details.engineNumber}`);
        if (details.mileage) detailParts.push(`Số km: ${details.mileage}`);
      } else if (formData.collateralType === 'phone') {
        if (details.manufacturer) detailParts.push(`Hãng: ${details.manufacturer}`);
        if (details.deviceModel) detailParts.push(`Model: ${details.deviceModel}`);
        if (details.storage) detailParts.push(`Dung lượng: ${details.storage}`);
        if (details.color) detailParts.push(`Màu: ${details.color}`);
        if (details.imei) detailParts.push(`IMEI: ${details.imei}`);
        if (details.condition) detailParts.push(`Tình trạng: ${details.condition}`);
      } else if (formData.collateralType === 'laptop') {
        if (details.manufacturer) detailParts.push(`Hãng: ${details.manufacturer}`);
        if (details.deviceModel) detailParts.push(`Model: ${details.deviceModel}`);
        if (details.cpu) detailParts.push(`CPU: ${details.cpu}`);
        if (details.ram) detailParts.push(`RAM: ${details.ram}`);
        if (details.hardDrive) detailParts.push(`Ổ cứng: ${details.hardDrive}`);
        if (details.serialNumber) detailParts.push(`Số serial: ${details.serialNumber}`);
        if (details.condition) detailParts.push(`Tình trạng: ${details.condition}`);
      }
      
      if (detailParts.length > 0) {
        detailedDescription = detailParts.join(' | ');
        if (formData.collateralDescription) {
          detailedDescription = `${formData.collateralDescription}\n${detailedDescription}`;
        }
      }
    }

    return {
      id: loanId,
      customerId: customer.id,
      customer,
      collateralType: formData.collateralType,
      collateralDescription: detailedDescription,
      collateralDetails: formData.collateralDetails,
      loanAmount: formData.loanAmount,
      loanDuration: months,
      interestRate,
      monthlyPayment: Math.round(monthlyPayment || 0),
      totalPayment: Math.round(totalPayment || 0),
      loanPurpose: formData.loanPurpose,
      status,
      currentStep: status === 'pending_assessment' ? 'assessment_review' : status === 'draft' ? 'cskh_create' : 'cskh_create',
      createdBy: user?.id || 'unknown',
      createdByName: user?.fullName || 'Không xác định',
      createdAt: now,
      updatedAt: now,
      documents,
      referralCode: formData.referralCode || undefined,
      internalNotes: formData.internalNotes || ''
    };
  };

  const handleSubmit = async (mode: SubmitMode) => {
    if (!user) {
      setError('Không tìm thấy thông tin người dùng');
      return;
    }

    const shouldValidate = mode !== 'draft';
    if (shouldValidate) {
      const validationResult = validateForm();
      if (!validationResult.isValid) {
        // Collect all validation errors for popup
        const errorMessages: string[] = [];
        const errors = validationResult.errors;
        if (errors.fullName) errorMessages.push(errors.fullName);
        if (errors.phoneNumber) errorMessages.push(errors.phoneNumber);
        if (errors.idNumber) errorMessages.push(errors.idNumber);
        if (errors.loanAmount) errorMessages.push(errors.loanAmount);
        if (errors.collateralType) errorMessages.push(errors.collateralType);
        if (errors.documents) errorMessages.push(errors.documents);
        
        setValidationErrorList(errorMessages);
        setShowValidationDialog(true);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let status: LoanApplication['status'] = 'pending_assessment';
      let message = 'Hồ sơ vay đã được gửi thẩm định thành công!';

      if (mode === 'draft') {
        status = 'draft';
        message = 'Hồ sơ đã được lưu nháp';
      } else if (mode === 'security') {
        status = 'pending_security';
        message = 'Hồ sơ đã chuyển sang Security';
      } else if (mode === 'send') {
        status = 'pending_assessment';
        message = 'Hồ sơ đã được gửi thẩm định';
      }

      const newLoan = buildLoan(status);
      const success = await createLoan(newLoan);

      if (!success) {
        setError('Không thể lưu hồ sơ vay. Vui lòng thử lại.');
        return;
      }

      setLastActionLabel(message);

      await new Promise(resolve => setTimeout(resolve, 800));

      navigate('/cs/loans', {
        state: {
          message,
          loanId: newLoan.id
        }
      });
    } catch (err) {
      console.error('Failed to create loan:', err);
      setError('Có lỗi xảy ra khi tạo hồ sơ vay. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loanDetails = calculateLoanDetails();
  const riskIndicators = calculateRiskIndicators();
  const sections = [
    { id: 'collateral', label: 'Tài sản đảm bảo', icon: 'inventory_2' },
    { id: 'customer', label: 'Thông tin khách hàng', icon: 'person' },
    { id: 'employment', label: 'Việc làm & Tài chính', icon: 'work' },
    { id: 'contacts', label: 'Liên hệ & Tham chiếu', icon: 'contacts' },
    { id: 'loan', label: 'Thông tin khoản vay', icon: 'account_balance' },
    { id: 'documents', label: 'Hồ sơ chứng từ', icon: 'folder' },
    { id: 'notes', label: 'Ghi chú', icon: 'note' }
  ];

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Tạo hồ sơ vay mới
          </h2>
          <button
            type="button"
            onClick={() => setShowLoanPreview(!showLoanPreview)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              {showLoanPreview ? 'visibility_off' : 'visibility'}
            </span>
            {showLoanPreview ? 'Ẩn' : 'Hiện'} tính toán
          </button>
        </div>
        <p className="text-slate-500 text-sm mb-4">
          Nhập thông tin khách hàng và tài sản để khởi tạo khoản vay.
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => {
                setActiveSection(section.id);
                const element = document.getElementById(`section-${section.id}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {section.icon}
              </span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Form */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Error */}
          {(error || validationErrors.documents) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Lỗi</h4>
                  <p className="text-sm text-red-700 mt-1">
                    {error || validationErrors.documents || 'Vui lòng kiểm tra lại thông tin đã nhập'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Collateral type */}
          <section id="section-collateral" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                1
              </span>
              Loại tài sản đảm bảo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {([
                { key: 'car', label: 'Ô tô', icon: 'directions_car' },
                { key: 'bike', label: 'Xe máy', icon: 'two_wheeler' },
                { key: 'phone', label: 'Điện thoại', icon: 'smartphone' },
                { key: 'laptop', label: 'Máy tính', icon: 'laptop_mac' }
              ] as const).map(item => (
                <label key={item.key} className="cursor-pointer group relative">
                  <input
                    type="radio"
                    name="collateral"
                    className="peer sr-only"
                    value={item.key}
                    checked={formData.collateralType === item.key}
                    onChange={() => handleInputChange('collateralType', item.key)}
                  />
                  <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 border-transparent bg-slate-50 hover:bg-slate-100 peer-checked:border-blue-500 peer-checked:bg-blue-50/60 transition-all h-full">
                    <div className="size-12 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 peer-checked:text-blue-600 peer-checked:shadow-md transition-colors">
                      <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                        {item.icon}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-slate-900 peer-checked:text-blue-600">
                      {item.label}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 text-blue-600 opacity-0 peer-checked:opacity-100 transition-opacity">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Section 1.5: Chi tiết tài sản đảm bảo */}
          {formData.collateralType && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                  1.5
                </span>
                Thông tin chi tiết tài sản đảm bảo
              </h3>

              {/* Ô tô và Xe máy */}
              {(formData.collateralType === 'car' || formData.collateralType === 'bike') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Biển số xe
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: 30A-12345"
                        value={formData.collateralDetails?.licensePlate || ''}
                        onChange={e => handleCollateralDetailChange('licensePlate', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Hãng xe
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: Honda, Yamaha, Toyota..."
                        value={formData.collateralDetails?.brand || ''}
                        onChange={e => handleCollateralDetailChange('brand', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Model / Dòng xe
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: SH150i, Vios, Wave..."
                        value={formData.collateralDetails?.model || ''}
                        onChange={e => handleCollateralDetailChange('model', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Năm sản xuất
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: 2020"
                        value={formData.collateralDetails?.year || ''}
                        onChange={e => handleCollateralDetailChange('year', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Màu sắc
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: Đen, Trắng, Xanh..."
                        value={formData.collateralDetails?.color || ''}
                        onChange={e => handleCollateralDetailChange('color', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Số khung
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số khung"
                        value={formData.collateralDetails?.chassisNumber || ''}
                        onChange={e => handleCollateralDetailChange('chassisNumber', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Số máy
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số máy"
                        value={formData.collateralDetails?.engineNumber || ''}
                        onChange={e => handleCollateralDetailChange('engineNumber', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Số km đã đi
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: 50000"
                        value={formData.collateralDetails?.mileage || ''}
                        onChange={e => handleCollateralDetailChange('mileage', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Điện thoại */}
              {formData.collateralType === 'phone' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Hãng sản xuất
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: iPhone, Samsung, Xiaomi..."
                        value={formData.collateralDetails?.manufacturer || ''}
                        onChange={e => handleCollateralDetailChange('manufacturer', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Model
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: iPhone 14 Pro, Galaxy S23..."
                        value={formData.collateralDetails?.deviceModel || ''}
                        onChange={e => handleCollateralDetailChange('deviceModel', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Dung lượng lưu trữ
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: 128GB, 256GB, 512GB..."
                        value={formData.collateralDetails?.storage || ''}
                        onChange={e => handleCollateralDetailChange('storage', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Màu sắc
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: Đen, Trắng, Tím..."
                        value={formData.collateralDetails?.color || ''}
                        onChange={e => handleCollateralDetailChange('color', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Số IMEI
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số IMEI"
                        value={formData.collateralDetails?.imei || ''}
                        onChange={e => handleCollateralDetailChange('imei', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Tình trạng
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.collateralDetails?.condition || ''}
                        onChange={e => handleCollateralDetailChange('condition', e.target.value)}
                      >
                        <option value="">Chọn tình trạng</option>
                        <option value="new">Mới 100%</option>
                        <option value="like_new">Như mới</option>
                        <option value="good">Tốt</option>
                        <option value="fair">Khá</option>
                        <option value="poor">Cũ</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Máy tính / Laptop */}
              {formData.collateralType === 'laptop' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Hãng sản xuất
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: Dell, HP, Lenovo, MacBook..."
                        value={formData.collateralDetails?.manufacturer || ''}
                        onChange={e => handleCollateralDetailChange('manufacturer', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Model
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: XPS 13, ThinkPad X1..."
                        value={formData.collateralDetails?.deviceModel || ''}
                        onChange={e => handleCollateralDetailChange('deviceModel', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        CPU / Bộ xử lý
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: Intel i7, AMD Ryzen 7..."
                        value={formData.collateralDetails?.cpu || ''}
                        onChange={e => handleCollateralDetailChange('cpu', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        RAM
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: 8GB, 16GB, 32GB..."
                        value={formData.collateralDetails?.ram || ''}
                        onChange={e => handleCollateralDetailChange('ram', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Ổ cứng
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: 256GB SSD, 512GB SSD, 1TB HDD..."
                        value={formData.collateralDetails?.hardDrive || ''}
                        onChange={e => handleCollateralDetailChange('hardDrive', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Số serial
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập số serial"
                        value={formData.collateralDetails?.serialNumber || ''}
                        onChange={e => handleCollateralDetailChange('serialNumber', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Tình trạng
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.collateralDetails?.condition || ''}
                        onChange={e => handleCollateralDetailChange('condition', e.target.value)}
                      >
                        <option value="">Chọn tình trạng</option>
                        <option value="new">Mới 100%</option>
                        <option value="like_new">Như mới</option>
                        <option value="good">Tốt</option>
                        <option value="fair">Khá</option>
                        <option value="poor">Cũ</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Section 2: Customer info */}
          <section id="section-customer" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                  2
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Thông tin khách hàng
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Điền đầy đủ thông tin nhận diện và địa chỉ cư trú của khách hàng.
                  </p>
                </div>
              </div>
              <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-500 border border-slate-200">
                <span className="material-symbols-outlined text-xs">info</span>
                Các trường <span className="text-red-500">*</span> là bắt buộc
              </span>
            </div>

            <div className="space-y-6">
              {/* Block 1: Thông tin cơ bản */}
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-sm font-semibold text-slate-800">Thông tin cơ bản</p>
                  <span className="text-[11px] text-slate-500">
                    Dùng để liên hệ và xác nhận với khách hàng
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.fullName ? 'border-red-300' : 'border-slate-300'
                      }`}
                      placeholder="Nhập họ tên đầy đủ theo giấy tờ"
                      value={formData.fullName}
                      onChange={e => handleInputChange('fullName', e.target.value)}
                    />
                    {validationErrors.fullName && (
                      <p className="text-xs text-red-600">{validationErrors.fullName}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      className={`w-full px-3 py-2 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.phoneNumber ? 'border-red-300' : 'border-slate-300'
                      }`}
                      placeholder="Ví dụ: 09xx xxx xxx"
                      value={formData.phoneNumber}
                      onChange={e => handleInputChange('phoneNumber', e.target.value)}
                    />
                    {validationErrors.phoneNumber && (
                      <p className="text-xs text-red-600">{validationErrors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Giới tính</label>
                      <select
                        className={`w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          genderTouched ? 'text-slate-900' : 'text-slate-400'
                        }`}
                        value={formData.gender}
                        onChange={e => {
                          setGenderTouched(true);
                          handleInputChange('gender', e.target.value);
                        }}
                      >
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Ngày sinh</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/yyyy"
                        className={`w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          birthDate ? 'text-slate-900' : 'text-slate-400'
                        }`}
                        value={birthDate}
                        onChange={e => {
                          setBirthDate(e.target.value);
                          handleInputChange('birthDate', e.target.value);
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Tình trạng hôn nhân</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.maritalStatus || 'single'}
                        onChange={e => handleInputChange('maritalStatus', e.target.value)}
                      >
                        <option value="single">Độc thân</option>
                        <option value="married">Đã kết hôn</option>
                        <option value="divorced">Ly dị</option>
                        <option value="widowed">Góa</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Số người phụ thuộc</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        value={formData.numberOfDependents || ''}
                        onChange={e => handleInputChange('numberOfDependents', Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="email@customer.com"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Block 1.2: Nghề nghiệp & Thu nhập */}
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Thông tin nghề nghiệp & thu nhập
                  </p>
                  <span className="text-[11px] text-slate-500">
                    Hỗ trợ đánh giá khả năng trả nợ của khách hàng
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Nghề nghiệp</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: Nhân viên văn phòng, kinh doanh..."
                      value={formData.occupation}
                      onChange={e => handleInputChange('occupation', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">
                      Thu nhập hàng tháng (VNĐ)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-3 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ví dụ: 15.000.000"
                        value={monthlyIncomeInput}
                        onChange={e => handleMonthlyIncomeChange(e.target.value)}
                      />
                      <span className="absolute right-3 top-2.5 text-sm text-slate-500 font-bold">
                        VNĐ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Block 2: Thông tin giấy tờ */}
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-sm font-semibold text-slate-800">Thông tin giấy tờ</p>
                  <span className="text-[11px] text-slate-500">
                    Phục vụ định danh và thẩm định hồ sơ
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">
                      Loại giấy tờ vay / cầm cố
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.idType}
                      onChange={e => handleInputChange('idType', e.target.value)}
                    >
                      <option value="cccd">Căn cước công dân (CCCD)</option>
                      <option value="cmnd">Chứng minh nhân dân (CMND)</option>
                      <option value="passport">Hộ chiếu (Passport)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">
                      Mã số giấy tờ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.idNumber ? 'border-red-300' : 'border-slate-300'
                      }`}
                      placeholder="Nhập số CCCD/CMND/Passport"
                      value={formData.idNumber}
                      onChange={e => handleInputChange('idNumber', e.target.value)}
                    />
                    {validationErrors.idNumber && (
                      <p className="text-xs text-red-600">{validationErrors.idNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Ngày cấp</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="dd/mm/yyyy"
                        className={`w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formData.issueDate ? 'text-slate-900' : 'text-slate-400'
                        }`}
                        value={formData.issueDate}
                        onChange={e => handleInputChange('issueDate', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Nơi cấp</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Cục CSQLHC về TTXH"
                        value={formData.issuePlace}
                        onChange={e => handleInputChange('issuePlace', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Block 3: Địa chỉ & khoản vay */}
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-sm font-semibold text-slate-800">
                    Địa chỉ cư trú & thông tin khoản vay
                  </p>
                  <span className="text-[11px] text-slate-500">
                    Hỗ trợ thẩm định nơi ở và nhu cầu vay
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-900">
                          Tỉnh / Thành phố
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Chọn Tỉnh/TP"
                          value={formData.province}
                          onChange={e => handleInputChange('province', e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-900">
                          Quận / Huyện
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Chọn Quận/Huyện"
                          value={formData.district}
                          onChange={e => handleInputChange('district', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Địa chỉ chi tiết
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Số nhà, tên đường, phường/xã"
                        value={formData.address}
                        onChange={e => handleInputChange('address', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Số tiền vay (VNĐ) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          className={`w-full px-3 py-2 pr-12 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            validationErrors.loanAmount ? 'border-red-300' : 'border-slate-300'
                          }`}
                          placeholder="Ví dụ: 10.000.000"
                          value={loanAmountInput}
                          onChange={e => handleLoanAmountChange(e.target.value)}
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-slate-500 font-bold">
                          VNĐ
                        </span>
                      </div>
                      {validationErrors.loanAmount && (
                        <p className="text-xs text-red-600">{validationErrors.loanAmount}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-900">
                          Thời hạn vay (tháng)
                        </label>
                        <input
                          type="number"
                          min={1}
                        className={`w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formData.loanDuration ? 'text-slate-900' : 'text-slate-400'
                        }`}
                          placeholder="Ví dụ: 12, 24, 36"
                          value={formData.loanDuration || ''}
                          onChange={e =>
                            handleInputChange('loanDuration', Number(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-900">
                          Mã giới thiệu (tuỳ chọn)
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nhập mã nhân viên / ref code"
                          value={formData.referralCode}
                          onChange={e => handleInputChange('referralCode', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">
                        Mục đích vay
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="VD: Kinh doanh, Mua sắm, Y tế..."
                        value={formData.loanPurpose || ''}
                        onChange={e => handleInputChange('loanPurpose', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Documents */}
          <section id="section-documents" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                3
              </span>
              Hồ sơ chứng từ
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Yêu cầu tối thiểu <span className="font-semibold text-slate-700">3 tài liệu</span>:
              CCCD/CMND hai mặt và ảnh chân dung khách hàng.
            </p>

            {validationErrors.documents && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{validationErrors.documents}</p>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/60">
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                {documentTypes.map(doc => {
                  const items = getDocsByType(doc.type);
                  const hasDocs = items.length > 0;
                  return (
                    <div key={doc.type} className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {doc.label}
                          </p>
                          {doc.required && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 uppercase font-semibold">
                              Bắt buộc
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {doc.description}
                        </p>
                        {hasDocs && (
                          <p className="text-xs text-green-600 mt-1 truncate">
                            Đã tải: <span className="font-medium">{items.length} file</span>
                          </p>
                        )}
                        {hasDocs && (
                          <div className="mt-2 relative">
                            <div className="flex items-center gap-1">
                              {items.length > 4 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const el = thumbnailListsRef.current[doc.type];
                                    if (el) {
                                      el.scrollBy({ left: -160, behavior: 'smooth' });
                                    }
                                  }}
                                  className="hidden md:inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 mr-1"
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    chevron_left
                                  </span>
                                </button>
                              )}

                              <div
                                ref={el => {
                                  thumbnailListsRef.current[doc.type] = el;
                                }}
                                className="flex gap-2 overflow-hidden pb-1"
                              >
                                {items.map(docItem => (
                                  <div
                                    key={docItem.id}
                                    className="group relative w-16 h-16 rounded-md border border-slate-200 bg-white overflow-hidden flex items-center justify-center cursor-pointer flex-shrink-0"
                                    onClick={() => {
                                      // Mở tất cả file trong dialog preview
                                      const allItems = getDocsByType(doc.type);
                                      const idx = allItems.findIndex(d => d.id === docItem.id);
                                      openImagePreview(allItems, idx >= 0 ? idx : 0);
                                    }}
                                  >
                                    {/\.(jpg|jpeg|png|webp|gif)$/i.test(docItem.fileName) ? (
                                      <img
                                        src={docItem.fileUrl}
                                        alt={docItem.fileName}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="material-symbols-outlined text-slate-400 text-2xl">
                                        description
                                      </span>
                                    )}
                                    <div className="absolute inset-x-0 bottom-0 bg-black/50 px-1 py-0.5">
                                      <p className="text-[10px] text-white truncate">
                                        {docItem.fileName}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {items.length > 4 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const el = thumbnailListsRef.current[doc.type];
                                    if (el) {
                                      el.scrollBy({ left: 160, behavior: 'smooth' });
                                    }
                                  }}
                                  className="hidden md:inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 ml-1"
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    chevron_right
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            hasDocs
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {hasDocs ? 'Đã tải lên' : 'Chưa có tài liệu'}
                        </span>
                        <label className="relative inline-flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 transition-colors">
                          {hasDocs ? 'Thêm file' : 'Tải lên'}
                          <input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={e => {
                              if (e.target.files && e.target.files.length > 0) {
                                void handleUploadFiles(doc.type, e.target.files);
                                // Reset input để có thể upload cùng file lại
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section 3.5: Employment & Financial Information */}
          <section id="section-employment" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                3.5
              </span>
              Thông tin việc làm & Tài chính
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Thông tin này giúp đánh giá khả năng trả nợ của khách hàng
            </p>

            <div className="space-y-6">
              {/* Employment Block */}
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-sm font-semibold text-slate-800 mb-3">Thông tin công việc</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Tên công ty / Cơ quan</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên công ty"
                      value={formData.companyName || ''}
                      onChange={e => handleInputChange('companyName', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Chức vụ / Vị trí</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: Nhân viên, Trưởng phòng..."
                      value={formData.position || ''}
                      onChange={e => handleInputChange('position', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Địa chỉ công ty</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập địa chỉ công ty"
                      value={formData.companyAddress || ''}
                      onChange={e => handleInputChange('companyAddress', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Loại công việc</label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.employmentType || 'fulltime'}
                        onChange={e => handleInputChange('employmentType', e.target.value)}
                      >
                        <option value="fulltime">Toàn thời gian</option>
                        <option value="parttime">Bán thời gian</option>
                        <option value="contract">Hợp đồng</option>
                        <option value="selfemployed">Tự doanh</option>
                        <option value="unemployed">Chưa có việc</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Kinh nghiệm (năm)</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        value={formData.workExperience || ''}
                        onChange={e => handleInputChange('workExperience', Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Block */}
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-sm font-semibold text-slate-800 mb-3">Thông tin tài chính</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">
                      Thu nhập hàng tháng (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="15.000.000"
                      value={monthlyIncomeInput}
                      onChange={e => handleMonthlyIncomeChange(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Thu nhập khác (VNĐ)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      value={otherIncomeInput}
                      onChange={e => handleOtherIncomeChange(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Tên ngân hàng</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: Vietcombank, Techcombank..."
                      value={formData.bankName || ''}
                      onChange={e => handleInputChange('bankName', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Số tài khoản</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập số tài khoản"
                      value={formData.bankAccountNumber || ''}
                      onChange={e => handleInputChange('bankAccountNumber', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Chủ tài khoản</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tên chủ tài khoản"
                      value={formData.bankAccountHolder || ''}
                      onChange={e => handleInputChange('bankAccountHolder', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Số khoản vay hiện tại</label>
                    <input
                      type="number"
                      min={0}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      value={formData.existingLoans || ''}
                      onChange={e => handleInputChange('existingLoans', Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Trả nợ hàng tháng (VNĐ)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      value={monthlyLoanPaymentsInput}
                      onChange={e => handleMonthlyLoanPaymentsChange(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Dư nợ thẻ tín dụng (VNĐ)</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                      value={creditCardDebtInput}
                      onChange={e => handleCreditCardDebtChange(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3.6: Emergency Contacts & References */}
          <section id="section-contacts" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center size-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">
                3.6
              </span>
              Liên hệ khẩn cấp & Người tham chiếu
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Thông tin liên hệ trong trường hợp khẩn cấp và người tham chiếu
            </p>

            <div className="space-y-6">
              {/* Emergency Contact */}
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-sm font-semibold text-slate-800 mb-3">Liên hệ khẩn cấp</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Họ và tên</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập họ tên"
                      value={formData.emergencyContactName || ''}
                      onChange={e => handleInputChange('emergencyContactName', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Số điện thoại</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="09xx xxx xxx"
                      value={formData.emergencyContactPhone || ''}
                      onChange={e => handleInputChange('emergencyContactPhone', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-900">Mối quan hệ</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: Vợ/Chồng, Bố/Mẹ..."
                      value={formData.emergencyContactRelationship || ''}
                      onChange={e => handleInputChange('emergencyContactRelationship', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* References */}
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-sm font-semibold text-slate-800 mb-3">Người tham chiếu</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Người tham chiếu 1 - Họ tên</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập họ tên"
                        value={formData.reference1Name || ''}
                        onChange={e => handleInputChange('reference1Name', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Số điện thoại</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="09xx xxx xxx"
                        value={formData.reference1Phone || ''}
                        onChange={e => handleInputChange('reference1Phone', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Mối quan hệ</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="VD: Bạn, Đồng nghiệp..."
                        value={formData.reference1Relationship || ''}
                        onChange={e => handleInputChange('reference1Relationship', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Người tham chiếu 2 - Họ tên</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập họ tên"
                        value={formData.reference2Name || ''}
                        onChange={e => handleInputChange('reference2Name', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Số điện thoại</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="09xx xxx xxx"
                        value={formData.reference2Phone || ''}
                        onChange={e => handleInputChange('reference2Phone', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-slate-900">Mối quan hệ</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="VD: Bạn, Đồng nghiệp..."
                        value={formData.reference2Relationship || ''}
                        onChange={e => handleInputChange('reference2Relationship', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Internal notes */}
          <section id="section-notes" className="bg-amber-50 rounded-xl border border-yellow-200 p-6 shadow-sm relative">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg uppercase">
              Internal Only
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-700" style={{ fontSize: 20 }}>
                lock
              </span>
              Ghi chú nội bộ CSKH
            </h3>
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full px-3 py-2 border-yellow-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 h-24 placeholder:text-slate-400"
                placeholder="Nhập ghi chú về khách hàng, thái độ, hoặc các lưu ý đặc biệt cho bộ phận thẩm định..."
                value={formData.internalNotes}
                onChange={e => handleInputChange('internalNotes', e.target.value)}
              />
              <p className="text-xs text-slate-500 italic">
                * Thông tin này sẽ không được hiển thị cho khách hàng.
              </p>
            </div>
          </section>
          <div className="h-8" />
        </div>

        {/* Loan Calculation Preview Sidebar */}
        {showLoanPreview && (
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              {/* Loan Calculation Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">calculate</span>
                  Tính toán khoản vay
                </h3>
                
                {formData.loanAmount > 0 && formData.loanDuration > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Số tiền vay:</span>
                        <span className="font-bold text-slate-900">{formData.loanAmount.toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Thời hạn:</span>
                        <span className="font-bold text-slate-900">{formData.loanDuration} tháng</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Lãi suất:</span>
                        <span className="font-bold text-slate-900">{loanDetails.interestRate}%/năm</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-200 pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Trả hàng tháng:</span>
                        <span className="text-lg font-bold text-blue-600">{loanDetails.monthlyPayment.toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tổng tiền trả:</span>
                        <span className="font-semibold text-slate-900">{loanDetails.totalPayment.toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tổng lãi:</span>
                        <span className="font-semibold text-slate-700">{loanDetails.totalInterest.toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Nhập số tiền và thời hạn vay để xem tính toán
                  </p>
                )}
              </div>

              {/* Risk Assessment Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600">assessment</span>
                  Đánh giá rủi ro
                </h3>
                
                {riskIndicators.totalMonthlyIncome > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Tỷ lệ DTI:</span>
                        <span className={`text-sm font-bold ${
                          riskIndicators.dti > 50 ? 'text-red-600' : 
                          riskIndicators.dti > 35 ? 'text-amber-600' : 
                          'text-green-600'
                        }`}>
                          {riskIndicators.dti}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            riskIndicators.dti > 50 ? 'bg-red-500' : 
                            riskIndicators.dti > 35 ? 'bg-amber-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(riskIndicators.dti, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        {riskIndicators.dti > 50 ? 'Rủi ro cao' : 
                         riskIndicators.dti > 35 ? 'Rủi ro trung bình' : 
                         'Rủi ro thấp'}
                      </p>
                    </div>
                    
                    <div className="border-t border-slate-200 pt-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Thu nhập/tháng:</span>
                        <span className="font-medium text-slate-900">{riskIndicators.totalMonthlyIncome.toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Nợ hiện tại/tháng:</span>
                        <span className="font-medium text-slate-900">{riskIndicators.totalMonthlyDebt.toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Trả nợ mới/tháng:</span>
                        <span className="font-medium text-blue-600">{riskIndicators.newMonthlyPayment.toLocaleString('vi-VN')} VNĐ</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Nhập thông tin thu nhập để đánh giá rủi ro
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-700 mb-2">Thao tác nhanh</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      const element = document.getElementById('section-documents');
                      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-white rounded-lg border border-slate-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base align-middle mr-2">folder</span>
                    Kiểm tra hồ sơ
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const validation = validateForm();
                      if (!validation.isValid) {
                        setShowValidationDialog(true);
                        setValidationErrorList(Object.values(validation.errors));
                      } else {
                        alert('Tất cả thông tin đã hợp lệ!');
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-white rounded-lg border border-slate-200 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base align-middle mr-2">check_circle</span>
                    Kiểm tra tính hợp lệ
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer - nút lưu nháp và gửi thẩm định */}
      <div className="w-full bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-h-[32px]">
            {lastActionLabel && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                {lastActionLabel}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                void handleSubmit('draft');
              }}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-lg">save</span>
              )}
              <span>{isSubmitting ? 'Đang lưu...' : 'Lưu nháp'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmDialog(true)}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-lg">send</span>
              )}
              <span>{isSubmitting ? 'Đang xử lý...' : 'Gửi thẩm định'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Validation error dialog */}
      {showValidationDialog && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40" onClick={() => setShowValidationDialog(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Vui lòng kiểm tra lại thông tin đã nhập
                </h3>
                <p className="text-sm text-slate-600">
                  Có một số thông tin bắt buộc chưa được điền đầy đủ:
                </p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <ul className="space-y-2">
                {validationErrorList.map((error, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowValidationDialog(false)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialog before sending */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Kiểm tra lại hồ sơ trước khi gửi
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Vui lòng đảm bảo bạn đã nhập đầy đủ thông tin khách hàng, số tiền vay và đã tải lên
              các giấy tờ cần thiết (CCCD/CMND, ảnh chân dung, tài liệu bổ sung nếu có).
            </p>
            <p className="text-sm text-slate-600 mb-6">
              Sau khi gửi thẩm định, việc chỉnh sửa hồ sơ có thể bị giới hạn tùy theo quy trình.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Kiểm tra lại
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setShowConfirmDialog(false);
                  void handleSubmit('send');
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-sm">task_alt</span>
                )}
                <span>Xác nhận gửi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image preview lightbox */}
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
                    key={doc.id}
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      setPreviewIndex(idx);
                    }}
                    className={`relative w-10 h-10 rounded border overflow-hidden flex items-center justify-center ${
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
                      <span className="material-symbols-outlined text-slate-300 text-lg">
                        description
                      </span>
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
}
