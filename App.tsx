import React, { useState } from 'react';
import LogoUpload from './components/LogoUpload';
import MockupEditor from './components/MockupEditor';
import { GeneratedImage, ProductType } from './types';
import { generateMockup } from './services/geminiService';

const App = () => {
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<ProductType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);

  const toggleProduct = (type: ProductType) => {
    setSelectedProductTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleGenerate = async () => {
    if (!uploadedLogo || selectedProductTypes.length === 0) return;

    setIsGenerating(true);
    // Use parallel requests for better UX, but handle errors gracefully
    const promises = selectedProductTypes.map(async (type) => {
      try {
        const url = await generateMockup(uploadedLogo, type);
        return {
          id: crypto.randomUUID(),
          url,
          prompt: `Mockup for ${type}`,
          productType: type,
          createdAt: Date.now()
        } as GeneratedImage;
      } catch (e) {
        console.error(`Failed to generate ${type}`, e);
        return null;
      }
    });

    const results = await Promise.all(promises);
    const successful = results.filter((img): img is GeneratedImage => img !== null);
    
    setGeneratedImages(prev => [...successful, ...prev]);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
             <span className="font-bold text-xl tracking-tight text-gray-900">MerchAI Studio</span>
          </div>
          <div>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded">Beta</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero & Upload */}
        <section className="text-center mb-16">
           <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
             Turn your logo into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Real Products</span>
           </h1>
           <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10">
             Upload your brand logo and let Gemini AI place it on t-shirts, mugs, and more in seconds. No photoshoot required.
           </p>

           <LogoUpload 
             currentLogo={uploadedLogo} 
             onUpload={setUploadedLogo} 
           />
        </section>

        {/* Product Selection */}
        {uploadedLogo && (
          <section className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs">1</span>
               Choose Products
             </h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
               {Object.values(ProductType).map((type) => (
                 <button
                   key={type}
                   onClick={() => toggleProduct(type)}
                   className={`
                     p-4 rounded-xl border text-sm font-medium transition-all
                     flex flex-col items-center justify-center gap-2 h-32
                     ${selectedProductTypes.includes(type) 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-600' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                   `}
                 >
                   <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                      {type === ProductType.TShirt && '👕'}
                      {type === ProductType.Hoodie && '🧥'}
                      {type === ProductType.Mug && '☕'}
                      {type === ProductType.ToteBag && '👜'}
                      {type === ProductType.Cap && '🧢'}
                      {type === ProductType.Notebook && '📓'}
                   </div>
                   {type}
                 </button>
               ))}
             </div>
             
             <div className="mt-8 flex justify-center">
               <button
                 onClick={handleGenerate}
                 disabled={selectedProductTypes.length === 0 || isGenerating}
                 className={`
                   px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-95 flex items-center gap-3
                   ${selectedProductTypes.length === 0 || isGenerating 
                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                     : 'bg-gray-900 text-white hover:bg-gray-800'}
                 `}
               >
                 {isGenerating ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     Generating Mockups...
                   </>
                 ) : (
                   <>
                     Generate {selectedProductTypes.length > 0 ? `(${selectedProductTypes.length})` : ''} Mockups
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                     </svg>
                   </>
                 )}
               </button>
             </div>
          </section>
        )}

        {/* Results Gallery */}
        {generatedImages.length > 0 && (
          <section className="animate-in fade-in duration-700">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
               <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-900 text-white text-xs">2</span>
               Your Mockups
             </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {generatedImages.map((image) => (
                <div key={image.id} className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                  <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img src={image.url} alt={image.productType} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <h3 className="font-semibold text-gray-900">{image.productType}</h3>
                          <p className="text-xs text-gray-500 truncate w-40">{new Date(image.createdAt).toLocaleTimeString()}</p>
                       </div>
                       <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">AI Generated</span>
                    </div>
                    <button
                      onClick={() => setEditingImage(image)}
                      className="w-full mt-2 py-2 px-4 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      Edit with AI
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Editor Modal */}
      {editingImage && (
        <MockupEditor
          image={editingImage}
          onClose={() => setEditingImage(null)}
          onSave={(newImage) => {
            setGeneratedImages(prev => [newImage, ...prev]);
            setEditingImage(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
