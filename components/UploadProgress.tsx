import React from 'react';
import {
  Upload,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  FileAudio,
  FileImage,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ipfsService, IPFSUploadResult } from '../services/ipfs';

export interface UploadItem {
  id: string;
  file: File;
  type: 'audio' | 'image' | 'metadata';
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'paused';
  progress: number;
  result?: IPFSUploadResult;
  error?: string;
  startTime: number;
  endTime?: number;
}

interface UploadProgressProps {
  uploads: UploadItem[];
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
  showDetails?: boolean;
  compact?: boolean;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({
  uploads,
  onPause,
  onResume,
  onRetry,
  onRemove,
  showDetails = true,
  compact = false
}) => {
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <FileAudio className="w-5 h-5" />;
      case 'image':
        return <FileImage className="w-5 h-5" />;
      default:
        return <Upload className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: UploadItem['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'uploading':
        return 'text-blue-400';
      case 'paused':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: UploadItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-400" />;
      default:
        return <Upload className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getUploadSpeed = (upload: UploadItem) => {
    if (upload.status !== 'uploading' || upload.progress === 0) return 0;
    const elapsed = Date.now() - upload.startTime;
    const speed = (upload.file.size * upload.progress / 100) / (elapsed / 1000);
    return speed;
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {uploads.map((upload) => (
          <div key={upload.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
            {getFileIcon(upload.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${getStatusColor(upload.status)}`}>
                  {upload.file.name}
                </span>
                {getStatusIcon(upload.status)}
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    upload.status === 'completed' ? 'bg-green-400' :
                    upload.status === 'error' ? 'bg-red-400' :
                    upload.status === 'paused' ? 'bg-yellow-400' :
                    'bg-blue-400'
                  }`}
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">
                  {formatFileSize(upload.file.size)} • {upload.progress}%
                </span>
                {upload.status === 'uploading' && (
                  <span className="text-xs text-gray-400">
                    {formatFileSize(getUploadSpeed(upload))}/s
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {uploads.map((upload) => (
        <motion.div
          key={upload.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-panel p-6 rounded-2xl border border-white/10"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getStatusColor(upload.status)} bg-white/5`}>
                {getFileIcon(upload.type)}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold">{upload.file.name}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                  <span>{upload.type.toUpperCase()}</span>
                  <span>{formatFileSize(upload.file.size)}</span>
                  {upload.startTime && (
                    <span>
                      Started {formatTime(Date.now() - upload.startTime)} ago
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getStatusIcon(upload.status)}
              {onRemove && (
                <button
                  onClick={() => onRemove(upload.id)}
                  className="p-1 hover:bg-white/10 rounded transition"
                  title="Remove upload"
                >
                  <XCircle className="w-4 h-4 text-gray-400 hover:text-red-400" />
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${getStatusColor(upload.status)}`}>
                {upload.status === 'pending' && 'Waiting to upload...'}
                {upload.status === 'uploading' && `Uploading... ${upload.progress}%`}
                {upload.status === 'completed' && 'Upload completed!'}
                {upload.status === 'error' && upload.error || 'Upload failed'}
                {upload.status === 'paused' && 'Upload paused'}
              </span>
              <span className="text-sm text-gray-400">{upload.progress}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  upload.status === 'completed' ? 'bg-green-400' :
                  upload.status === 'error' ? 'bg-red-400' :
                  upload.status === 'paused' ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`}
                style={{ width: `${upload.progress}%` }}
              />
            </div>
            {upload.status === 'uploading' && (
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span>{formatFileSize(getUploadSpeed(upload))}/s</span>
                <span>
                  {formatFileSize(upload.file.size * (upload.progress / 100))} / {formatFileSize(upload.file.size)}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {upload.status === 'uploading' && onPause && (
                <button
                  onClick={() => onPause(upload.id)}
                  className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg hover:bg-yellow-500/30 transition"
                >
                  <Pause className="w-3 h-3 inline mr-1" />
                  Pause
                </button>
              )}
              {upload.status === 'paused' && onResume && (
                <button
                  onClick={() => onResume(upload.id)}
                  className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30 transition"
                >
                  <Play className="w-3 h-3 inline mr-1" />
                  Resume
                </button>
              )}
              {upload.status === 'error' && onRetry && (
                <button
                  onClick={() => onRetry(upload.id)}
                  className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-lg hover:bg-orange-500/30 transition"
                >
                  <Upload className="w-3 h-3 inline mr-1" />
                  Retry
                </button>
              )}
            </div>

            {/* IPFS Link */}
            {upload.result && upload.result.hash && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">IPFS Hash:</span>
                <a
                  href={`https://ipfs.io/ipfs/${upload.result.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  {upload.result.hash.slice(0, 10)}...
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Error Details */}
          {upload.status === 'error' && upload.error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{upload.error}</p>
            </div>
          )}

          {/* Success Details */}
          {upload.status === 'completed' && upload.result && showDetails && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Upload Size:</span>
                <span className="text-white">{formatFileSize(upload.result.size)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Upload Time:</span>
                <span className="text-white">
                  {upload.endTime ? formatTime(upload.endTime - upload.startTime) : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Average Speed:</span>
                <span className="text-white">
                  {upload.endTime
                    ? formatFileSize(upload.result.size / ((upload.endTime - upload.startTime) / 1000)) + '/s'
                    : 'Unknown'
                  }
                </span>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// Upload Summary Component
interface UploadSummaryProps {
  uploads: UploadItem[];
  onClearCompleted?: () => void;
}

export const UploadSummary: React.FC<UploadSummaryProps> = ({
  uploads,
  onClearCompleted
}) => {
  const completed = uploads.filter(u => u.status === 'completed').length;
  const failed = uploads.filter(u => u.status === 'error').length;
  const uploading = uploads.filter(u => u.status === 'uploading').length;
  const pending = uploads.filter(u => u.status === 'pending').length;
  const paused = uploads.filter(u => u.status === 'paused').length;

  const totalSize = uploads.reduce((sum, u) => sum + u.file.size, 0);
  const uploadedSize = uploads
    .filter(u => u.status === 'completed')
    .reduce((sum, u) => sum + (u.result?.size || 0), 0);

  const overallProgress = totalSize > 0 ? (uploadedSize / totalSize) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-6 rounded-2xl border border-white/10"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Upload Summary</h3>
        {completed > 0 && onClearCompleted && (
          <button
            onClick={onClearCompleted}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Clear Completed
          </button>
        )}
      </div>

      {/* Overall Progress */}
      {uploads.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Overall Progress</span>
            <span className="text-sm text-white">{overallProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
            <span>{formatFileSize(uploadedSize)}</span>
            <span>{formatFileSize(totalSize)}</span>
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{uploads.length}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{uploading}</div>
          <div className="text-xs text-gray-400">Uploading</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{completed}</div>
          <div className="text-xs text-gray-400">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400">{failed}</div>
          <div className="text-xs text-gray-400">Failed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{pending + paused}</div>
          <div className="text-xs text-gray-400">Pending</div>
        </div>
      </div>
    </motion.div>
  );
};