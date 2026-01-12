import React, { useState, useRef } from 'react';

function App() {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif', 'application/pdf'];
  const MAX_SIZE = 800 * 400 * 100; // Approximate max based on 800x400px constraint

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return 'IMG';
    if (type === 'application/pdf') return 'PDF';
    return 'FILE';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes, k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFiles = (newFiles) => {
    return Array.from(newFiles).filter(file => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`File type not allowed: ${file.name}`);
        return false;
      }
      if (file.size > MAX_SIZE) {
        alert(`File too large: ${file.name}`);
        return false;
      }
      return true;
    });
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
    addFiles(newFiles);
  };

  const handleFileSelect = (e) => {
    const newFiles = validateFiles(e.target.files);
    addFiles(newFiles);
  };

  const addFiles = (newFiles) => {
    newFiles.forEach(file => {
      const fileId = Math.random().toString(36).substr(2, 9);
      setFiles(prev => [...prev, { id: fileId, file, uploaded: false }]);
      
      // Simulate progress
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
  };

  const handleCancel = () => {
    setFiles([]);
    setUploadProgress({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadFiles = () => {
    if (files.length === 0) {
      alert('Please select files first');
      return;
    }
    alert(`Uploading ${files.length} file(s)...`);
    // Actual upload logic would go here
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">Upload Documents</h2>
          <p className="text-sm text-gray-500">Please upload your ID and Proof of Address.</p>
        </div>

        {/* DROPZONE CONTAINER */}
        {/* FUTURE BUG: Change 'border-dashed' to 'border-solid' or remove it entirely */}
        <div 
          className={`border-2 border-dashed rounded-xl bg-indigo-50 transition-all cursor-pointer h-64 flex flex-col items-center justify-center group ${
            dragActive 
              ? 'border-indigo-600 bg-indigo-100 scale-105' 
              : 'border-indigo-300 hover:bg-indigo-100'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          
          <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          </div>
          
          <p className="text-indigo-900 font-medium">Click to upload or drag and drop</p>
          <p className="text-indigo-500 text-sm mt-1">SVG, PNG, JPG, GIF or PDF (max. 800x400px)</p>

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
          <div className="mt-8 space-y-3">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
              {files.some(f => !f.uploaded) ? 'Uploading...' : 'Uploaded Files'}
            </h3>
            
            {files.map((fileItem) => (
              <div key={fileItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center flex-grow">
                  <span className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 font-bold mr-3">
                    {getFileIcon(fileItem.file.type)}
                  </span>
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-700">{fileItem.file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(fileItem.file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  {!fileItem.uploaded && (
                    <div className="w-24 bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-indigo-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${uploadProgress[fileItem.id] || 0}%` }}
                      ></div>
                    </div>
                  )}
                  {fileItem.uploaded && (
                    <span className="text-green-600 font-bold">✓</span>
                  )}
                  <button
                    onClick={() => removeFile(fileItem.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors font-bold text-lg"
                    title="Remove file"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-end space-x-3">
          <button 
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleUploadFiles}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={files.length === 0}
          >
            Upload Files
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;
