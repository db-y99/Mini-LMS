/**
 * Loan Version History Component
 * Displays version timeline and allows comparison/restoration
 */

import React, { useState, useEffect } from 'react';
import { versioningModule } from '@modules';
import { LoanVersion } from '../core/services/LoanVersioningService';

interface LoanVersionHistoryProps {
  loanId: string;
  onRestore?: (version: number) => void;
}

export const LoanVersionHistory: React.FC<LoanVersionHistoryProps> = ({
  loanId,
  onRestore
}) => {
  const [versions, setVersions] = useState<LoanVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<LoanVersion | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<[number?, number?]>([]);

  useEffect(() => {
    loadVersions();
  }, [loanId]);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const history = await versioningModule.getVersionHistory(loanId);
      setVersions(history);
    } catch (error) {
      console.error('Failed to load version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewVersion = (version: LoanVersion) => {
    setSelectedVersion(version);
  };

  const handleCompare = async () => {
    if (compareVersions[0] && compareVersions[1]) {
      const changes = await versioningModule.compareVersions(
        loanId,
        compareVersions[0],
        compareVersions[1]
      );
      console.log('Changes:', changes);
      // TODO: Display changes in modal
    }
  };

  const handleRestore = async (version: number) => {
    if (window.confirm(`Restore loan to version ${version}?`)) {
      onRestore?.(version);
    }
  };

  const getVersionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      original: 'bg-blue-100 text-blue-800',
      restructure: 'bg-yellow-100 text-yellow-800',
      amendment: 'bg-purple-100 text-purple-800',
      write_off: 'bg-red-100 text-red-800',
      status_change: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.status_change;
  };

  const getVersionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      original: 'Gốc',
      restructure: 'Tái cấu trúc',
      amendment: 'Sửa đổi',
      write_off: 'Xóa nợ',
      status_change: 'Thay đổi trạng thái'
    };
    return labels[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        Chưa có lịch sử phiên bản
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Lịch sử phiên bản</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            {compareMode ? 'Hủy so sánh' : 'So sánh'}
          </button>
        </div>
      </div>

      {/* Compare Mode */}
      {compareMode && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-4">
            <select
              value={compareVersions[0] || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCompareVersions([Number(e.target.value), compareVersions[1]])}
              className="px-3 py-2 border rounded"
            >
              <option value="">Chọn phiên bản 1</option>
              {versions.map((v: LoanVersion) => (
                <option key={v.id} value={v.version}>
                  Version {v.version} - {getVersionTypeLabel(v.version_type)}
                </option>
              ))}
            </select>
            <span>vs</span>
            <select
              value={compareVersions[1] || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCompareVersions([compareVersions[0], Number(e.target.value)])}
              className="px-3 py-2 border rounded"
            >
              <option value="">Chọn phiên bản 2</option>
              {versions.map((v: LoanVersion) => (
                <option key={v.id} value={v.version}>
                  Version {v.version} - {getVersionTypeLabel(v.version_type)}
                </option>
              ))}
            </select>
            <button
              onClick={handleCompare}
              disabled={!compareVersions[0] || !compareVersions[1]}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              So sánh
            </button>
          </div>
        </div>
      )}

      {/* Version Timeline */}
      <div className="space-y-3">
        {versions.map((version: LoanVersion, index: number) => (
          <div
            key={version.id}
            className={`border rounded-lg p-4 ${
              !version.effective_to ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Version Header */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-semibold text-lg">
                    Version {version.version}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${getVersionTypeColor(version.version_type)}`}>
                    {getVersionTypeLabel(version.version_type)}
                  </span>
                  {!version.effective_to && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      Hiện tại
                    </span>
                  )}
                </div>

                {/* Version Info */}
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    <span className="font-medium">Lý do:</span> {version.reason}
                  </div>
                  <div>
                    <span className="font-medium">Người tạo:</span> {version.created_by_name}
                  </div>
                  <div>
                    <span className="font-medium">Thời gian:</span> {formatDate(version.created_at)}
                  </div>
                  {version.changes && Array.isArray(version.changes) && version.changes.length > 0 && (
                    <div>
                      <span className="font-medium">Thay đổi:</span> {version.changes.length} trường
                    </div>
                  )}
                </div>

                {/* Changes Summary */}
                {version.changes && Array.isArray(version.changes) && version.changes.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <div className="font-medium mb-2">Chi tiết thay đổi:</div>
                    <div className="space-y-1">
                      {version.changes.slice(0, 3).map((change: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-gray-600">{change.field}:</span>
                          <span className="text-red-600 line-through">{String(change.old_value)}</span>
                          <span>→</span>
                          <span className="text-green-600">{String(change.new_value)}</span>
                        </div>
                      ))}
                      {version.changes.length > 3 && (
                        <div className="text-gray-500">
                          ... và {version.changes.length - 3} thay đổi khác
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleViewVersion(version)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Xem chi tiết
                </button>
                {!version.effective_to && index > 0 && (
                  <button
                    onClick={() => handleRestore(version.version - 1)}
                    className="px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded"
                  >
                    Khôi phục trước
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Version Detail Modal */}
      {selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">
                Version {selectedVersion.version} - Chi tiết
              </h3>
              <button
                onClick={() => setSelectedVersion(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                <div>
                  <div className="text-sm text-gray-600">Loại phiên bản</div>
                  <div className="font-medium">{getVersionTypeLabel(selectedVersion.version_type)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Người tạo</div>
                  <div className="font-medium">{selectedVersion.created_by_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Thời gian tạo</div>
                  <div className="font-medium">{formatDate(selectedVersion.created_at)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Hiệu lực</div>
                  <div className="font-medium">
                    {formatDate(selectedVersion.effective_from)}
                    {selectedVersion.effective_to && ` - ${formatDate(selectedVersion.effective_to)}`}
                  </div>
                </div>
              </div>

              {/* Snapshot Preview */}
              <div>
                <div className="font-medium mb-2">Snapshot:</div>
                <pre className="p-4 bg-gray-50 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(selectedVersion.snapshot, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
