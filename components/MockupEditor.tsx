import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { editMockup } from '../services/geminiService';

interface MockupEditorProps {
  image: GeneratedImage;
  onClose: () => void;
  onSave: (newImage: GeneratedImage) => void;
}

const MockupEditor: React.FC<MockupEditorProps> = ({ image, onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentImageSrc, setCurrentImageSrc] = useState(image.url);

  const handleEdit = async () => {
    if (!prompt.trim()) return;

    setIsEditing(true);
    try {
      const newImageBase64 = await editMockup(currentImageSrc, prompt);
      setCurrentImageSrc(newImageBase64);
      // We don't save immediately to the list until user confirms? 
      // Actually, let's just update the current view and allow them to "Save Copy" or just see it.
      // For simplicity in this flow, we update the local view.
    } catch (err) {
      alert("Failed to edit image. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleSaveCopy = () => {
    const newImage: GeneratedImage = {
      ...image,
      id: crypto.randomUUID(),
      url: currentImageSrc,
      prompt: `Edited: ${prompt}`,
      createdAt: Date.now(),
    };
    onSave(newImage);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImageSrc;
    link.download = `mockup-${image.productType}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex overflow-hidden shadow-2xl">
        
        {/* Left: Image Canvas */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 relative">
           <img 
             src={currentImageSrc} 
             alt="Editing Preview" 
             className="max-w-full max-h-full object-contain shadow-lg rounded-md"
           />
           {isEditing && (
             <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
               <div className="flex flex-col items-center">
                 <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                 <span className="font-semibold text-indigo-900 bg-white/80 px-4 py-1 rounded-full">AI is editing...</span>
               </div>
             </div>
           )}
        </div>

        {/* Right: Controls */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Edit Mockup</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Product
              </label>
              <div className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                {image.productType}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Magic Edit <span className="text-xs text-indigo-500 font-normal ml-1">(Powered by Gemini 2.5)</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Add a vintage film filter', 'Place it on a wooden table', 'Add neon lighting'"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[120px] text-sm resize-none"
              />
              <button
                onClick={handleEdit}
                disabled={isEditing || !prompt.trim()}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
              >
                {isEditing ? 'Editing...' : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                       <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM6.375 18H5.25a.75.75 0 01-.75-.75V16.125a.75.75 0 01.75-.75h1.125a.75.75 0 01.75.75v1.125a.75.75 0 01-.75.75zM8.625 21H7.5a.75.75 0 01-.75-.75v-1.125a.75.75 0 01.75-.75h1.125a.75.75 0 01.75.75v1.125a.75.75 0 01-.75.75z" clipRule="evenodd" />
                    </svg>
                    Apply Edit
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100 text-sm text-yellow-800">
               <p className="font-semibold mb-1">Tip:</p>
               Try asking to change the background context or the lighting style.
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button 
              onClick={handleSaveCopy}
              className="flex-1 bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium"
            >
              Save Copy
            </button>
            <button 
              onClick={handleDownload}
              className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg hover:bg-gray-800 font-medium flex justify-center items-center gap-2"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockupEditor;
