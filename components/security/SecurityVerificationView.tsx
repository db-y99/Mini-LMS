'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Shield, CheckCircle, XCircle, Clock, Smartphone, Lock, Unlock,
  ShieldCheck, FileText, User, ArrowLeft, RefreshCw, CheckCircle2,
  Fingerprint, Camera, Info, AlertTriangle, Ban, History, Search
} from 'lucide-react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoanApplication } from '@/types';

export const SecurityVerificationView: React.FC = () => {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { loans, updateLoanStatus } = useWorkflow();
  const { user } = useAuth();

  const [loan, setLoan] = useState<LoanApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneLocked, setPhoneLocked] = useState(false);
  const [notes, setNotes] = useState('');

  const [verificationItems, setVerificationItems] = useState([
    { id: 'id_match', label: 'Hình ảnh CCCD khớp với chân dung', status: 'pending' },
    { id: 'imei_valid', label: 'Số IMEI/Serial hợp lệ', status: 'pending' },
    { id: 'not_lost', label: 'Thiết bị không báo mất', status: 'pending' },
    { id: 'owner_match', label: 'Chủ sở hữu khớp với hồ sơ', status: 'pending' },
    { id: 'no_blacklist', label: 'Không trong danh sách đen', status: 'pending' },
  ]);

  useEffect(() => {
    if (id) {
      const foundLoan = loans.find(l => l.id === id);
      if (foundLoan) {
        setLoan(foundLoan);
        if (foundLoan.securityCheckStatus === 'passed') {
          setPhoneLocked(true);
        }
      }
    }
    setLoading(false);
  }, [id, loans]);

  const handleVerificationToggle = (itemId: string) => {
    setVerificationItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, status: item.status === 'passed' ? 'pending' : 'passed' }
        : item
    ));
  };

  const handleLockICloud = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setPhoneLocked(true);
      setIsSubmitting(false);
    }, 2000);
  };

  const handleFinalDecision = async (decision: 'passed' | 'failed') => {
    if (!loan || !user) return;

    setIsSubmitting(true);
    try {
      const statusToUpdate = decision === 'passed' ? 'pending_admin' : 'rejected';
      const statusNotes = `${decision === 'passed' ? 'Kiểm tra bảo mật: ĐẠT' : 'Kiểm tra bảo mật: KHÔNG ĐẠT'}. ${notes}`;

      await updateLoanStatus(loan.id, statusToUpdate, user.id, statusNotes);
      router.push('/sec/pending-checks');
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!loan) {
    return <div className="p-8 text-center">Không tìm thấy hồ sơ</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              Kiểm tra bảo mật
            </h1>
            <p className="text-xs text-slate-500">Mã hồ sơ: {loan.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={isSubmitting}
            onClick={() => handleFinalDecision('failed')}
            className="px-6 py-2.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all flex items-center gap-2"
          >
            <XCircle className="w-5 h-5" />
            Từ chối
          </button>
          <button
            disabled={isSubmitting || !phoneLocked}
            onClick={() => handleFinalDecision('passed')}
            className={`px-8 py-2.5 font-bold rounded-xl transition-all flex items-center gap-2 ${
              phoneLocked
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Xác nhận & Chuyển Admin
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* iCloud Lock Status */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-blue-600" />
              Trạng thái khóa iCloud
            </h3>
            
            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm text-slate-600 mb-1">Thiết bị</p>
                <p className="font-bold text-slate-900">{loan.collateralDetails?.deviceModel || 'iPhone'}</p>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  {loan.collateralDetails?.imei || loan.collateralDetails?.serialNumber || 'N/A'}
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className={`p-6 rounded-full border-4 ${
                  phoneLocked
                    ? 'bg-green-50 border-green-500'
                    : 'bg-red-50 border-red-500'
                }`}>
                  {phoneLocked ? (
                    <Lock className="w-8 h-8 text-green-600" />
                  ) : (
                    <Unlock className="w-8 h-8 text-red-600" />
                  )}
                </div>
                
                <p className={`text-sm font-bold ${phoneLocked ? 'text-green-600' : 'text-red-600'}`}>
                  {phoneLocked ? 'ĐÃ KHÓA' : 'CHƯA KHÓA'}
                </p>
                
                {!phoneLocked && (
                  <button
                    onClick={handleLockICloud}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Khóa ngay
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-blue-600" />
              Xác thực danh tính
            </h3>

            <div className="space-y-3">
              {verificationItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleVerificationToggle(item.id)}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                    item.status === 'passed'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.status === 'passed' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-400" />
                    )}
                    <span className="text-sm font-medium text-slate-900">{item.label}</span>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${
                    item.status === 'passed' ? 'bg-green-500' : 'bg-slate-300'
                  }`}>
                    <div className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${
                      item.status === 'passed' ? 'left-5' : 'left-1'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              Hình ảnh hồ sơ
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {loan.documents
                .filter(d => ['id_front', 'id_back', 'portrait', 'collateral'].includes(d.type))
                .map((doc) => (
                  <div key={doc.id} className="relative h-24 rounded-lg overflow-hidden border border-slate-200">
                    <img src={doc.fileUrl} className="w-full h-full object-cover" alt={doc.type} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                      <p className="text-[10px] font-bold text-white uppercase">
                        {doc.type === 'id_front' ? 'CCCD trước' :
                          doc.type === 'id_back' ? 'CCCD sau' :
                            doc.type === 'portrait' ? 'Chân dung' : 'Thiết bị'}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Ghi chú
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập kết quả kiểm tra IMEI, Serial, tình trạng báo mất..."
              className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <User size={32} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900">{loan.customer.fullName}</h4>
                <p className="text-sm text-slate-500">{loan.customer.phoneNumber}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">CCCD</span>
                <span className="text-slate-900 font-mono font-medium">{loan.customer.idNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Địa chỉ</span>
                <span className="text-slate-900 font-medium text-right">{loan.customer.province}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Nghề nghiệp</span>
                <span className="text-slate-900 font-medium">{loan.customer.occupation || 'N/A'}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Số tiền</p>
                <p className="text-lg font-bold text-slate-900">
                  {(loan.loanAmount / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="text-center p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 mb-1">Thời hạn</p>
                <p className="text-lg font-bold text-slate-900">{loan.loanDuration} tháng</p>
              </div>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase">Công cụ</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center p-3 bg-slate-50 rounded-lg hover:bg-blue-50 transition-all">
                <Search className="w-5 h-5 text-slate-600 mb-1" />
                <span className="text-xs font-medium text-slate-600">Check CIC</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-slate-50 rounded-lg hover:bg-blue-50 transition-all">
                <Smartphone className="w-5 h-5 text-slate-600 mb-1" />
                <span className="text-xs font-medium text-slate-600">Apple ID</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-slate-50 rounded-lg hover:bg-red-50 transition-all">
                <Ban className="w-5 h-5 text-slate-600 mb-1" />
                <span className="text-xs font-medium text-slate-600">Blacklist</span>
              </button>
              <button className="flex flex-col items-center p-3 bg-slate-50 rounded-lg hover:bg-amber-50 transition-all">
                <History className="w-5 h-5 text-slate-600 mb-1" />
                <span className="text-xs font-medium text-slate-600">Lịch sử</span>
              </button>
            </div>
          </div>

          {/* Warning */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-900 mb-1">Lưu ý</p>
                <p className="text-xs text-amber-700">
                  Xác thực số Serial/IMEI thực tế trước khi khóa iCloud.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
