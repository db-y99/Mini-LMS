import React, { useState, useRef } from 'react';
import { Upload, FileText, Image, X, Download, Eye, Trash2, Cloud, CheckCircle } from 'lucide-react';

interface DocumentFile {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'document';
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  status: 'uploading' | 'uploaded' | 'error';
  category: 'id_card' | 'collateral' | 'income_proof' | 'address_proof' | 'other';
}

interface DocumentManagerProps {
  loanId?: string;
  documents: DocumentFile[];
  onDocumentUpload: (file: File, category: string) => Promise<void>;
  onDocumentDelete: (documentId: string) => Promise<void>;
  readonly?: boolean;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  loanId,
  documents,
  onDocumentUpload,
  onDocumentDelete,
  readonly = false
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('other');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentCategories = [
    { value: 'id_card', label: 'Giấy tờ tùy thân', icon: FileText },
    { value: 'collateral', label: 'Tài sản thế chấp', icon: Image },
    { value: 'income_proof', label: 'Chứng minh thu nhập', icon: FileText },
    { value: 'address_proof', label: 'Chứng minh địa chỉ', icon: FileText },
    { value: 'other', label: 'Khác', icon: FileText }
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'image': return <Image className="w-5 h-5 text-blue-500" />;
      default: return <FileText className="w-5 h-5 text-slate-500" />;
    }
  };

  const getFileType = (fileName: string): 'pdf' | 'image' | 'document' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) return 'image';
    return 'document';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadingFiles(files);

    for (const file of files) {
      try {
        await onDocumentUpload(file, selectedCategory);
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }

    setUploadingFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
      try {
        await onDocumentDelete(documentId);
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, DocumentFile[]>);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      {!readonly && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Tải lên tài liệu</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Loại tài liệu
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {documentCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="document-upload"
              />
              <label
                htmlFor="document-upload"
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload className="w-5 h-5 mr-2" />
                Chọn file
              </label>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-2">
              {uploadingFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-slate-700">{file.name}</span>
                  <span className="text-xs text-slate-500 ml-auto">Đang tải lên...</span>
                </div>
              ))}
            </div>
          )}

          <div className="text-sm text-slate-500 mt-2">
            Chấp nhận: PDF, hình ảnh (JPG, PNG), tài liệu Word. Kích thước tối đa: 10MB
          </div>
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Tài liệu đã tải lên</h3>
          <span className="text-sm text-slate-500">{documents.length} tài liệu</span>
        </div>

        {Object.keys(groupedDocuments).length === 0 ? (
          <div className="text-center py-12">
            <Cloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Chưa có tài liệu</h3>
            <p className="text-slate-600">Tải lên tài liệu đầu tiên để bắt đầu</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedDocuments).map(([category, docs]) => {
              const categoryInfo = documentCategories.find(cat => cat.value === category);
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    {categoryInfo && <categoryInfo.icon className="w-5 h-5 text-slate-600" />}
                    <h4 className="font-medium text-slate-900">
                      {categoryInfo?.label || category}
                    </h4>
                    <span className="text-sm text-slate-500">({docs.length})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {docs.map((doc) => (
                      <div key={doc.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getFileIcon(doc.type)}
                            <div>
                              <p className="text-sm font-medium text-slate-900 truncate max-w-32" title={doc.name}>
                                {doc.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>

                          {doc.status === 'uploaded' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => window.open(doc.url, '_blank')}
                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Xem tài liệu"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {/* Download logic */}}
                                className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                title="Tải xuống"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {!readonly && (
                                <button
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                  title="Xóa tài liệu"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            Bởi: {doc.uploadedBy}
                          </span>
                          {doc.status === 'uploaded' && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              Đã tải lên
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Storage Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Thông tin lưu trữ</h3>
            <p className="text-sm text-slate-600 mt-1">
              Tổng dung lượng đã sử dụng: {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">{documents.length}</p>
            <p className="text-sm text-slate-600">tài liệu</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((documents.reduce((sum, doc) => sum + doc.size, 0) / (100 * 1024 * 1024)) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Giới hạn: 100MB</p>
        </div>
      </div>
    </div>
  );
};
