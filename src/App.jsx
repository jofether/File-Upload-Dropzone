import React, { useState, useRef } from 'react';

const StatCard = ({ icon, label, value, color }) => (
  <div className={`bg-gradient-to-br ${color} rounded-lg p-4 text-gray-700 shadow-lg transform hover:scale-105 transition-transform`}>
    <div className="flex flex-col items-center justify-between">
      <div>
        <p className="text-sm opacity-90">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <span className="text-4xl opacity-30">{icon}</span>
    </div>
  </div>
);

const FileTypeIcon = ({ type }) => {
  const typeMap = {
    'image/svg+xml': { icon: '🖼️', label: 'SVG', color: 'bg-purple-100 text-purple-600' },
    'image/png': { icon: '🖼️', label: 'PNG', color: 'bg-blue-100 text-blue-600' },
    'image/jpeg': { icon: '📷', label: 'JPG', color: 'bg-green-100 text-green-600' },
    'image/gif': { icon: '🎬', label: 'GIF', color: 'bg-pink-100 text-pink-600' },
    'application/pdf': { icon: '📄', label: 'PDF', color: 'bg-red-100 text-red-600' }
  };
  
  const fileType = typeMap[type] || { icon: '📎', label: 'FILE', color: 'bg-gray-100 text-gray-600' };
  
  return (
    <div className={`w-10 h-10 rounded-lg ${fileType.color} flex items-center justify-center text-lg font-bold`}>
      {fileType.icon}
    </div>
  );
};

function App() {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif', 'application/pdf'];
  const MAX_SIZE = 800 * 400 * 100;

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes, k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFiles = (newFiles) => {
    const validFiles = [];
    Array.from(newFiles).forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        showNotification(`❌ ${file.name} - Invalid file type`, 'error');
        return;
      }
      if (file.size > MAX_SIZE) {
        showNotification(`❌ ${file.name} - File too large`, 'error');
        return;
      }
      validFiles.push(file);
    });
    return validFiles;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const newFiles = validateFiles(e.dataTransfer.files);
    if (newFiles.length > 0) {
      addFiles(newFiles);
      showNotification(`✅ ${newFiles.length} file(s) added`, 'success');
    }
  };

  const handleFileSelect = (e) => {
    const newFiles = validateFiles(e.target.files);
    if (newFiles.length > 0) {
      addFiles(newFiles);
      showNotification(`✅ ${newFiles.length} file(s) added`, 'success');
    }
  };

  const addFiles = (newFiles) => {
    newFiles.forEach(file => {
      const fileId = Math.random().toString(36).substr(2, 9);
      setFiles(prev => [...prev, { id: fileId, file, uploaded: false }]);
      simulateUpload(fileId);
    });
  };

  const simulateUpload = (fileId) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        setFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, uploaded: true } : f)
        );
      } else {
        setUploadProgress(prev => ({ ...prev, [fileId]: Math.floor(progress) }));
      }
    }, 300);
  };

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setUploadProgress(prev => {
      const { [fileId]: _, ...rest } = prev;
      return rest;
    });
    showNotification('File removed', 'info');
  };

  const handleCancel = () => {
    setFiles([]);
    setUploadProgress({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showNotification('Upload cancelled', 'info');
  };

  const handleUploadFiles = () => {
    if (files.length === 0) {
      showNotification('Please select files first', 'error');
      return;
    }
    showNotification(`🚀 Uploading ${files.length} file(s)...`, 'success');
  };

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
  const uploadedCount = files.filter(f => f.uploaded).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4 font-sans">
      {/* Navigation Header */}
      <div className="w-full max-w-6xl mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📁 DataVault</h1>
            <p className="text-slate-400">Secure file upload and management system</p>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-in z-10 ${
          notification.type === 'success' ? 'bg-green-500' :
          notification.type === 'error' ? 'bg-red-500' :
          'bg-blue-500'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Stats Dashboard */}
      {files.length > 0 && (
        <div className="w-full max-w-6xl mb-8 grid grid-cols-2 gap-4 animate-fade-in md:grid-cols-3">
          <StatCard icon="📂" label="Total Files" value={files.length} color="from-blue-500 to-blue-600" />
          <StatCard icon="✅" label="Uploaded" value={uploadedCount} color="from-green-500 to-green-600" />
          <StatCard icon="💾" label="Total Size" value={formatFileSize(totalSize)} color="from-purple-500 to-purple-600" />
        </div>
      )}

      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8">
            <h2 className="text-2xl font-bold text-white">Upload Your Files</h2>
            <p className="text-blue-100 mt-1">Supports SVG, PNG, JPG, GIF, and PDF files</p>
          </div>

          <div className="p-8">
            {/* DROPZONE */}
            <div 
              className={`border-2 border-dashed rounded-xl transition-all cursor-pointer min-h-64 flex flex-col items-center justify-center group relative overflow-hidden ${
                dragActive 
                  ? 'border-blue-600 bg-blue-50 scale-[1.02]' 
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity z-50"></div>
              <div className="relative z-1 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                  </div>
                </div>
                
                <p className="text-lg font-semibold text-slate-50">Click to upload or drag and drop</p>
                <p className="text-sm text-slate-50 mt-2">Maximum file size: 80 MB</p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".svg,.png,.jpg,.jpeg,.gif,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* FILE LIST */}
            {files.length > 0 && (
              <div className="mt-8 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    {files.some(f => !f.uploaded) ? (
                      <><span className="inline-block animate-spin">⏳</span> Uploading Files</>
                    ) : (
                      <><span className="text-green-600">✓</span> Upload Complete</>
                    )}
                  </h3>
                  <button
                    onClick={() => setFiles([])}
                    className="text-xs px-3 py-1 text-slate-600 hover:bg-slate-100 rounded transition"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="space-y-2">
                  {files.map((fileItem, idx) => (
                    <div key={fileItem.id} className="flex flex-col items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
                      <div className="flex-shrink-0">
                        <FileTypeIcon type={fileItem.file.type} />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{fileItem.file.name}</p>
                        <p className="text-xs text-slate-500">{formatFileSize(fileItem.file.size)}</p>
                      </div>

                      {!fileItem.uploaded && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-32 bg-blue-50 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 transition-all"
                              style={{ width: `${uploadProgress[fileItem.id] || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-slate-100 w-8 text-right">{uploadProgress[fileItem.id] || 0}%</span>
                        </div>
                      )}
                      
                      {fileItem.uploaded && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-semibold text-green-600">✓ Done</span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => removeFile(fileItem.id)}
                        className="flex-shrink-0 text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition transition-opacity opacity-0 group-hover:opacity-100"
                        title="Remove file"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {files.length === 0 && (
              <div className="mt-8 text-center">
                <p className="text-slate-500">No files selected yet. Start by uploading your first file above!</p>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="mt-8 flex justify-between items-center gap-3 pt-6 border-t border-slate-200 -mb-8">
              <div className="text-sm text-slate-500">
                {files.length > 0 && `${files.length} file${files.length > 1 ? 's' : ''} ready`}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleCancel}
                  className="px-6 py-2.5 text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  disabled={files.length === 0}
                >
                  Clear
                </button>
                <button 
                  onClick={handleUploadFiles}
                  className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                  disabled={files.length === 0}
                >
                  🚀 Upload Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-white text-sm opacity-60">
          <p>🔒 All files are encrypted and securely processed. Privacy is our priority.</p>
        </div>
      </div>
    </div>
  );
}

export default App;
