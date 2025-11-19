import React, { useState } from 'react';
import { ShoeViewer } from './components/ShoeModel';
import { StoryDisplay } from './components/StoryDisplay';
import { generateShoeStory } from './services/gemini';
import { StoryResponse, AppState } from './types';

const App: React.FC = () => {
  const [name, setName] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [story, setStory] = useState<StoryResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [activeStep, setActiveStep] = useState(0);

  const handleGenerate = async () => {
    if (!name.trim()) return;
    
    setAppState(AppState.LOADING);
    setError('');
    setActiveStep(0);
    
    try {
      const data = await generateShoeStory(name);
      setStory(data);
      setAppState(AppState.READY);
    } catch (e) {
      setError('אופס! משהו השתבש ביצירת הסיפור. בוא ננסה שוב.');
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-12 bg-slate-900 text-slate-100 transition-colors duration-500">
      {/* Header */}
      <header className="bg-slate-800 shadow-md p-4 sticky top-0 z-50 border-b border-slate-700">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
            👟 גיבורי השרוכים
          </h1>
          {story && (
             <button 
               onClick={() => { setStory(null); setAppState(AppState.IDLE); setName(''); setActiveStep(0); }}
               className="text-sm text-slate-400 hover:text-blue-400 underline transition-colors"
             >
               התחל מחדש
             </button>
          )}
        </div>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto p-4 space-y-8">
        
        {/* State: IDLE (Input Name) */}
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
            <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border-2 border-slate-700">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-white mb-2">שלום! איך קוראים לך?</h2>
              <p className="text-slate-400 mb-6">בוא נלמד לקשור שרוכים עם סיפור מיוחד בשבילך.</p>
              
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="הכנס את השם שלך כאן..."
                className="w-full p-4 text-center text-xl bg-slate-900 text-white border-2 border-slate-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-900 outline-none transition-all mb-4 placeholder-slate-600"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              
              <button 
                onClick={handleGenerate}
                disabled={!name.trim()}
                className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transform active:scale-95 transition-all shadow-lg shadow-blue-900/20"
              >
                בוא נתחיל! ✨
              </button>
            </div>
          </div>
        )}

        {/* State: LOADING */}
        {appState === AppState.LOADING && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin text-5xl mb-4">🧵</div>
            <h3 className="text-xl font-bold text-blue-400">כותבים לך סיפור קסום...</h3>
            <p className="text-slate-500 mt-2">רק עוד רגע והקסם מתחיל</p>
          </div>
        )}

        {/* State: ERROR */}
        {appState === AppState.ERROR && (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <button 
              onClick={handleGenerate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
            >
              נסה שוב
            </button>
          </div>
        )}

        {/* State: READY (Content) */}
        {appState === AppState.READY && story && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
            
            {/* Left Column: 3D Viewer & Video */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🔄</span>
                  <h2 className="font-bold text-slate-200">תצוגה בתלת מימד</h2>
                  <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-800 px-2 py-1 rounded-full">סובב אותי</span>
                </div>
                <ShoeViewer activeStep={activeStep} />
              </div>

              <div className="bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📺</span>
                  <h2 className="font-bold text-slate-200">סרטון הדרכה</h2>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden bg-black relative group cursor-pointer ring-2 ring-slate-700/50">
                   <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/UmuQK2c-o6w?rel=0" 
                    title="How to Tie Shoes" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    allowFullScreen
                    className="absolute inset-0"
                  ></iframe>
                </div>
                <p className="text-sm text-slate-400 mt-2 text-center">צפה בסרטון המדגים את שיטת "אוזני הארנב"</p>
              </div>
            </div>

            {/* Right Column: Interactive Story */}
            <div className="flex flex-col h-full">
               <StoryDisplay 
                 story={story} 
                 activeStep={activeStep}
                 onStepChange={setActiveStep}
               />
               
               {/* Fun Extra */}
               <div className="mt-6 bg-purple-900/30 p-4 rounded-xl border border-purple-800/50 text-center">
                 <p className="text-purple-300 font-medium">
                   💡 טיפ לאלופים: תרגול הופך למושלם! נסו לקשור את הנעל האמיתית שלכם יחד עם הסיפור.
                 </p>
               </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-600 text-sm p-8 mt-8 border-t border-slate-800">
        <p className="mb-2">(C) Noam Gold AI 2025</p>
        <a 
          href="mailto:gold.noam@gmail.com" 
          className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
        >
          <span>📧</span>
          Send Feedback
        </a>
      </footer>
    </div>
  );
};

export default App;