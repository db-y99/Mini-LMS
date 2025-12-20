import React, { useRef } from 'react';
import { Camera, Upload, X, FileText, CheckCircle2 } from 'lucide-react';
import { FileUploadStatus } from '../types';

interface FileUploadProps {
  label: string;
  status: FileUploadStatus;
  onChange: (file: File) => void;
  onRemove: () => void;
  accept?: string;
  useCamera?: boolean;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  status,
  onChange,
  onRemove,
  accept = "image/*",
  useCamera = false,
  required = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const triggerUpload = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>

      {!status.file ? (
        <div 
          onClick={triggerUpload}
          className={`
            relative border-2 border-dashed border-slate-300 rounded-lg p-4 
            flex flex-col items-center justify-center gap-2 cursor-pointer
            hover:border-blue-500 hover:bg-blue-50 transition-colors h-32
            group
          `}
        >
          <input 
            type="file" 
            ref={inputRef}
            className="hidden" 
            accept={accept}
            capture={useCamera ? "environment" : undefined}
            onChange={handleFileChange}
          />
          <div className="p-2 rounded-full bg-slate-100 group-hover:bg-blue-100 transition-colors">
            {useCamera ? (
              <Camera className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
            ) : (
              <Upload className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
            )}
          </div>
          <span className="text-xs text-slate-500 font-medium text-center">
            {useCamera ? "Chụp ảnh hoặc tải lên" : "Tải tài liệu lên"}
          </span>
        </div>
      ) : (
        <div className="relative border border-slate-200 rounded-lg p-3 flex items-center gap-3 bg-white shadow-sm">
          {/* Preview */}
          <div className="w-12 h-12 rounded bg-slate-100 flex-shrink-0 overflow-hidden flex items-center justify-center border border-slate-200">
            {status.previewUrl ? (
              <img src={status.previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <FileText className="w-6 h-6 text-slate-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {status.file.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
              <span className="text-xs text-green-600 font-medium flex items-center gap-0.5">
                {status.progress === 100 && <CheckCircle2 className="w-3 h-3" />}
                {status.progress}%
              </span>
            </div>
          </div>

          {/* Remove */}
          <button 
            onClick={onRemove}
            className="p-1.5 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
