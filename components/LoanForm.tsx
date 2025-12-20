import React, { useState } from 'react';
import { Car, Bike, Smartphone, Monitor, ChevronDown, Check, Save, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import { CollateralType, LoanFormData, DocUploads } from '../types';
import { FileUpload } from './FileUpload';

const INITIAL_FORM: LoanFormData = {
  collateralType: 'bike',
  fullName: '',
  phoneNumber: '',
  gender: 'male',
  idType: 'cccd',
  idNumber: '',
  issueDate: '',
  issuePlace: '',
  country: 'VN',
  province: '',
  district: '',
  address: '',
  loanAmount: '',
  loanDuration: '12',
  referralCode: '',
  internalNotes: ''
};

const INITIAL_DOCS: DocUploads = {
  idFront: { file: null, previewUrl: null, progress: 0 },
  idBack: { file: null, previewUrl: null, progress: 0 },
  portrait: { file: null, previewUrl: null, progress: 0 },
  utilityBill: { file: null, previewUrl: null, progress: 0 },
  residency: { file: null, previewUrl: null, progress: 0 },
};

export const LoanForm: React.FC = () => {
  const [formData, setFormData] = useState<LoanFormData>(INITIAL_FORM);
  const [docs, setDocs] = useState<DocUploads>(INITIAL_DOCS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Helper to handle form input changes
  const handleChange = (field: keyof LoanFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper to handle file uploads
  const handleFileChange = (key: keyof DocUploads, file: File) => {
    // Simulate upload progress
    setDocs(prev => ({
      ...prev,
      [key]: { file, previewUrl: URL.createObjectURL(file), progress: 10 }
    }));
    
    // Simulate async upload
    setTimeout(() => {
        setDocs(prev => ({
            ...prev,
            [key]: { ...prev[key], progress: 50 }
        }));
    }, 400);

    setTimeout(() => {
        setDocs(prev => ({
            ...prev,
            [key]: { ...prev[key], progress: 100 }
        }));
    }, 1200);
  };

  const handleRemoveFile = (key: keyof DocUploads) => {
    setDocs(prev => ({
      ...prev,
      [key]: { file: null, previewUrl: null, progress: 0 }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Hồ sơ đã gửi thành công</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Hồ sơ của khách hàng <strong>{formData.fullName}</strong> đã được chuyển sang bộ phận Security để thẩm định.
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={() => {
              setIsSuccess(false);
              setFormData(INITIAL_FORM);
              setDocs(INITIAL_DOCS);
            }}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Tạo hồ sơ mới
          </button>
          <button className="px-6 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors">
            Xem chi tiết
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pb-24">
      
      {/* SECTION 1: Collateral Type */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">1</span>
          Loại tài sản đảm bảo
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'car', label: 'Ô tô', icon: Car },
            { id: 'bike', label: 'Xe máy', icon: Bike },
            { id: 'phone', label: 'Điện thoại', icon: Smartphone },
            { id: 'computer', label: 'Máy tính', icon: Monitor },
          ].map((type) => (
            <div 
              key={type.id}
              onClick={() => handleChange('collateralType', type.id as CollateralType)}
              className={`
                cursor-pointer rounded-lg p-4 border-2 flex flex-col items-center gap-3 transition-all
                ${formData.collateralType === type.id 
                  ? 'border-blue-600 bg-blue-50/50' 
                  : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50'}
              `}
            >
              <type.icon className={`w-8 h-8 ${formData.collateralType === type.id ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className={`font-medium ${formData.collateralType === type.id ? 'text-blue-700' : 'text-slate-600'}`}>
                {type.label}
              </span>
              {formData.collateralType === type.id && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: Personal Info */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
          Thông tin khách hàng
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
          {/* Full Name */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </div>

          {/* Phone */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <input 
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              placeholder="0912 xxx xxx"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            />
          </div>

          {/* Gender */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính</label>
            <div className="relative">
              <select 
                value={formData.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* ID Type */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Loại giấy tờ</label>
            <div className="relative">
              <select 
                value={formData.idType}
                onChange={(e) => handleChange('idType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="cccd">Căn cước công dân (CCCD)</option>
                <option value="cmt">Chứng minh thư (CMT)</option>
                <option value="passport">Hộ chiếu</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* ID Number */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mã số giấy tờ <span className="text-red-500">*</span>
            </label>
            <input 
              type="text"
              required
              value={formData.idNumber}
              onChange={(e) => handleChange('idNumber', e.target.value)}
              placeholder="001234567890"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Issue Date */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Ngày cấp</label>
            <input 
              type="date"
              value={formData.issueDate}
              onChange={(e) => handleChange('issueDate', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Issue Place */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nơi cấp</label>
            <input 
              type="text"
              value={formData.issuePlace}
              onChange={(e) => handleChange('issuePlace', e.target.value)}
              placeholder="Cục CS QLHC về TTXH"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Country */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Quốc gia</label>
            <div className="relative">
              <select 
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="VN">Việt Nam</option>
                <option value="US">Hoa Kỳ</option>
                <option value="JP">Nhật Bản</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Province (Mock) */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Tỉnh / Thành phố</label>
            <input 
              type="text"
              value={formData.province}
              onChange={(e) => handleChange('province', e.target.value)}
              placeholder="Hà Nội"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* District (Mock) */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Quận / Huyện</label>
            <input 
              type="text"
              value={formData.district}
              onChange={(e) => handleChange('district', e.target.value)}
              placeholder="Quận Cầu Giấy"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Detail Address */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ chi tiết</label>
            <input 
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Số 123, Đường ABC..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          
           {/* Divider */}
           <div className="col-span-1 md:col-span-2 my-2 border-t border-slate-100"></div>

          {/* Loan Amount */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Số tiền vay (VNĐ) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input 
                type="number"
                required
                value={formData.loanAmount}
                onChange={(e) => handleChange('loanAmount', e.target.value)}
                placeholder="50,000,000"
                className="w-full pl-3 pr-12 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
              />
              <span className="absolute right-3 top-2 text-slate-500 text-sm">VNĐ</span>
            </div>
          </div>

           {/* Loan Duration */}
           <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Thời hạn vay (tháng)</label>
            <div className="relative">
              <select 
                value={formData.loanDuration}
                onChange={(e) => handleChange('loanDuration', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="6">6 Tháng</option>
                <option value="12">12 Tháng</option>
                <option value="24">24 Tháng</option>
                <option value="36">36 Tháng</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Referral */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Mã giới thiệu (nếu có)</label>
            <input 
              type="text"
              value={formData.referralCode}
              onChange={(e) => handleChange('referralCode', e.target.value)}
              placeholder="REF-123"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: Documents */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">3</span>
          Hồ sơ chứng từ
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileUpload 
            label="Ảnh mặt trước CCCD/CMT"
            required
            useCamera
            status={docs.idFront}
            onChange={(f) => handleFileChange('idFront', f)}
            onRemove={() => handleRemoveFile('idFront')}
          />
          <FileUpload 
            label="Ảnh mặt sau CCCD/CMT"
            required
            useCamera
            status={docs.idBack}
            onChange={(f) => handleFileChange('idBack', f)}
            onRemove={() => handleRemoveFile('idBack')}
          />
          <FileUpload 
            label="Ảnh chân dung"
            required
            useCamera
            status={docs.portrait}
            onChange={(f) => handleFileChange('portrait', f)}
            onRemove={() => handleRemoveFile('portrait')}
          />
          <FileUpload 
            label="Hóa đơn điện / nước"
            status={docs.utilityBill}
            onChange={(f) => handleFileChange('utilityBill', f)}
            onRemove={() => handleRemoveFile('utilityBill')}
          />
          <FileUpload 
            label="Xác nhận cư trú VNeID"
            status={docs.residency}
            onChange={(f) => handleFileChange('residency', f)}
            onRemove={() => handleRemoveFile('residency')}
          />
        </div>
      </section>

      {/* SECTION 4: Internal Notes */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
           <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">4</span>
          Ghi chú nội bộ
        </h3>
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 mb-4 flex items-start gap-2 text-sm text-amber-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>Thông tin này chỉ hiển thị với nhân viên CSKH và bộ phận thẩm định, khách hàng sẽ không nhìn thấy.</p>
        </div>
        <textarea 
          rows={4}
          value={formData.internalNotes}
          onChange={(e) => handleChange('internalNotes', e.target.value)}
          placeholder="Nhập ghi chú về khách hàng, thái độ, hoặc các lưu ý đặc biệt..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        ></textarea>
      </section>

      {/* Sticky Footer Actions */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 p-4 bg-white border-t border-slate-200 shadow-lg z-10 flex items-center justify-between">
         <div className="hidden md:block text-sm text-slate-500">
             Trạng thái: <span className="text-blue-600 font-medium">Đang nhập liệu</span>
         </div>
         <div className="flex gap-3 w-full md:w-auto justify-end">
           <button 
             type="button"
             className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
           >
             <Save className="w-4 h-4" />
             Lưu nháp
           </button>
           <button 
             type="submit"
             disabled={isSubmitting}
             className={`
               flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg 
               hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20
               ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
             `}
           >
             {isSubmitting ? (
               <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang xử lý...
               </>
             ) : (
               <>
                 <Send className="w-4 h-4" />
                 Gửi hồ sơ
               </>
             )}
           </button>
         </div>
      </div>

    </form>
  );
};