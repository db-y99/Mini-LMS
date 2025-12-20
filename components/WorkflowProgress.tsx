import React from 'react';
import { CheckCircle, Clock, AlertTriangle, ArrowRight, User } from 'lucide-react';
import { LoanApplication, LoanStatus, WorkflowStep, WorkflowTransition, UserRole } from '../types';
import { useWorkflow } from '../contexts/WorkflowContext';

interface WorkflowProgressProps {
  loan: LoanApplication;
  currentUserRole: UserRole;
  onStatusChange?: (newStatus: LoanStatus, notes?: string) => void;
  compact?: boolean;
}

export const WorkflowProgress: React.FC<WorkflowProgressProps> = ({
  loan,
  currentUserRole,
  onStatusChange,
  compact = false
}) => {
  const { workflowSteps, getAllowedTransitions } = useWorkflow();

  const getStatusStep = (status: LoanStatus): WorkflowStep | null => {
    switch (status) {
      case 'draft':
      case 'pending_cskh':
        return workflowSteps.find(step => step.id === 'cskh_create') || null;
      case 'pending_assessment':
        return workflowSteps.find(step => step.id === 'assessment_review') || null;
      case 'pending_security':
        return workflowSteps.find(step => step.id === 'security_check') || null;
      case 'pending_admin':
        return workflowSteps.find(step => step.id === 'admin_approval') || null;
      case 'pending_disbursement':
        return workflowSteps.find(step => step.id === 'accountant_disbursement') || null;
      case 'disbursed':
        return workflowSteps.find(step => step.id === 'accountant_disbursement') || null;
      default:
        return null;
    }
  };

  const getStepStatus = (step: WorkflowStep, currentStatus: LoanStatus): 'completed' | 'current' | 'pending' | 'rejected' => {
    const stepOrder = step.order;
    const currentStep = getStatusStep(currentStatus);

    if (!currentStep) return 'pending';

    if (loan.status === 'rejected') return 'rejected';
    if (loan.status === 'disbursed' && step.id === 'accountant_disbursement') return 'completed';

    if (stepOrder < currentStep.order) return 'completed';
    if (stepOrder === currentStep.order) return 'current';
    return 'pending';
  };

  const getStepIcon = (step: WorkflowStep, status: 'completed' | 'current' | 'pending' | 'rejected') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'current':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'rejected':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStepColor = (status: 'completed' | 'current' | 'pending' | 'rejected') => {
    switch (status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'current':
        return 'border-blue-500 bg-blue-50';
      case 'rejected':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-slate-300 bg-slate-50';
    }
  };

  const allowedTransitions = getAllowedTransitions(loan.status, currentUserRole, loan);

  if (compact) {
    const currentStep = getStatusStep(loan.status);
    return (
      <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-2">
          {getStepIcon(currentStep!, 'current')}
          <span className="text-sm font-medium text-slate-900">
            {currentStep?.name || 'Unknown Step'}
          </span>
        </div>
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep?.order || 0) / workflowSteps.length * 100}%` }}
          />
        </div>
        <span className="text-xs text-slate-500">
          {currentStep?.order || 0}/{workflowSteps.length}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Tiến trình xử lý hồ sơ</h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowSteps.map((step, index) => {
            const stepStatus = getStepStatus(step, loan.status);
            const isLast = index === workflowSteps.length - 1;

            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${getStepColor(stepStatus)}`}>
                  {getStepIcon(step, stepStatus)}
                </div>

                <div className="ml-3 flex-1">
                  <p className={`text-sm font-medium ${
                    stepStatus === 'current' ? 'text-blue-600' :
                    stepStatus === 'completed' ? 'text-green-600' :
                    stepStatus === 'rejected' ? 'text-red-600' : 'text-slate-600'
                  }`}>
                    {step.id === 'security_check' && loan.collateralType === 'phone' 
                      ? 'Khóa điện thoại' 
                      : step.name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {step.role === 'cskh' ? 'CSKH' :
                     step.role === 'assessment' ? 'Thẩm định' :
                     step.role === 'security' ? 'Bảo mật' :
                     step.role === 'admin' ? 'Quản trị' : 'Kế toán'}
                  </p>
                </div>

                {!isLast && (
                  <ArrowRight className={`w-4 h-4 mx-2 ${
                    stepStatus === 'completed' ? 'text-green-500' : 'text-slate-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Step Details */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Bước hiện tại</h4>
              <p className="text-sm text-slate-600 mt-1">
                {(() => {
                  const step = getStatusStep(loan.status);
                  if (step?.id === 'security_check' && loan.collateralType === 'phone') {
                    return 'Khóa điện thoại';
                  }
                  return step?.name || 'Không xác định';
                })()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Thời hạn xử lý</p>
              <p className="font-medium text-slate-900">
                {getStatusStep(loan.status)?.slaHours || 0} giờ
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons for Current User */}
      {allowedTransitions.length > 0 && onStatusChange && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Hành động có thể thực hiện</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allowedTransitions.map((transition, index) => (
              <button
                key={index}
                onClick={() => {
                  if (transition.toStatus === 'rejected') {
                    const notes = prompt('Lý do từ chối:');
                    if (notes) onStatusChange(transition.toStatus, notes);
                  } else {
                    onStatusChange(transition.toStatus);
                  }
                }}
                className={`p-4 rounded-lg border transition-colors ${
                  transition.toStatus === 'rejected'
                    ? 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700'
                    : 'border-green-200 bg-green-50 hover:bg-green-100 text-green-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {transition.toStatus === 'rejected' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  <div className="text-left">
                    <p className="font-medium">
                      {transition.toStatus === 'rejected' ? 'Từ chối hồ sơ' :
                       transition.toStatus === 'pending_assessment' ? 'Chuyển thẩm định' :
                       transition.toStatus === 'pending_security' ? (loan.collateralType === 'phone' ? 'Chuyển khóa điện thoại' : 'Chuyển kiểm tra bảo mật') :
                       transition.toStatus === 'pending_admin' ? 'Chuyển phê duyệt admin' :
                       transition.toStatus === 'pending_disbursement' ? 'Chuyển giải ngân' :
                       transition.toStatus === 'disbursed' ? 'Xác nhận giải ngân' :
                       'Chuyển bước tiếp theo'}
                    </p>
                    <p className="text-xs opacity-75">
                      {transition.requiresApproval ? 'Cần phê duyệt' : 'Tự động'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Assignment Info */}
          {loan.assignedTo && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <User className="w-4 h-4" />
                <span>Được giao cho: {loan.assignedTo}</span>
                {loan.assignedAt && (
                  <span className="text-blue-600">
                    (từ {loan.assignedAt.toLocaleDateString('vi-VN')})
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Workflow Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Lịch sử xử lý</h3>

        <div className="space-y-4">
          {/* Created */}
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Hồ sơ được tạo</p>
              <p className="text-xs text-slate-500">
                Bởi {loan.createdBy} • {loan.createdAt.toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Status changes would be logged here in real app */}
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Trạng thái hiện tại</p>
              <p className="text-xs text-slate-500">
                {loan.status} • {loan.updatedAt.toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
