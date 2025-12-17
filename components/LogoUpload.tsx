import React, { useState, useRef } from 'react';
import { blobToBase64 } from '../services/geminiService';

interface LogoUploadProps {
  onUpload: (base64: string) => void;
  currentLogo: string | null;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ onUpload, currentLogo }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const base64 = await blobToBase64(file);
      onUpload(base64);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handleClick}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          flex flex-col items-center justify-center h-64
          ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-white hover:border-gray-400'}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        
        {currentLogo ? (
          <div className="relative w-full h-full p-4 flex items-center justify-center">
             <img 
               src={currentLogo} 
               alt="Uploaded Logo" 
               className="max-w-full max-h-full object-contain drop-shadow-md" 
             />
             <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                  Click or Drop to Replace
                </span>
             </div>
          </div>
        ) : (
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Upload your logo</h3>
            <p className="text-sm text-gray-500 mt-1">Drag & drop or click to browse (PNG, JPG)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogoUpload;
