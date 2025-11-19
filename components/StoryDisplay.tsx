import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { StoryResponse, Step } from '../types';

interface StoryDisplayProps {
  story: StoryResponse;
  activeStep: number;
  onStepChange: (step: number) => void;
  onInstructionClick?: () => void;
  uiLabels: {
    step: string;
    of: string;
    nowDoing: string;
    clickHighlight: string;
    prev: string;
    next: string;
  };
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, activeStep, onStepChange, onInstructionClick, uiLabels }) => {

  const handleNext = () => {
    if (activeStep < story.steps.length - 1) {
      onStepChange(activeStep + 1);
    }
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      onStepChange(activeStep - 1);
    }
  };

  // Trigger confetti when reaching the last step
  useEffect(() => {
    if (activeStep === story.steps.length - 1) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [activeStep, story.steps.length]);

  const currentStepData: Step | undefined = story.steps[activeStep];

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700 transition-all duration-300">
      <h2 className="text-2xl font-bold text-blue-400 mb-2 text-center">{story.title}</h2>
      <p className="text-slate-300 mb-6 text-center text-lg">{story.intro}</p>

      <div className="mb-8 relative min-h-[220px]">
        {currentStepData && (
           <div className="bg-slate-900 border-4 border-yellow-500 rounded-2xl p-6 transition-all duration-500 transform animate-fadeIn shadow-[0_0_35px_rgba(234,179,8,0.3)] scale-[1.02]">
             <div className="flex justify-between items-center mb-4">
               <div className="flex items-center gap-2">
                 <span className="bg-yellow-500 text-slate-900 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl shadow-lg shadow-yellow-500/50 animate-bounce">
                   {currentStepData.stepNumber}
                 </span>
                 <span className="text-yellow-400 font-bold text-sm">{uiLabels.nowDoing}</span>
               </div>
               <span className="text-sm text-slate-500">{uiLabels.step} {activeStep + 1} {uiLabels.of} {story.steps.length}</span>
             </div>
             <h3 
              onClick={onInstructionClick}
              title={uiLabels.clickHighlight}
              className="text-2xl font-bold text-white mb-3 cursor-pointer hover:text-yellow-300 transition-all active:scale-95 transform hover:drop-shadow-[0_0_15px_rgba(253,224,71,0.5)] active:drop-shadow-[0_0_5px_rgba(253,224,71,0.8)]"
             >
               {currentStepData.instruction}
             </h3>
             <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 shadow-inner">
               <p className="text-lg text-blue-300 leading-relaxed font-medium italic">
                 "{currentStepData.storyPart}"
               </p>
             </div>
           </div>
        )}
      </div>

      <div className="flex justify-between items-center gap-4">
        <button 
          onClick={handlePrev}
          disabled={activeStep === 0}
          className={`px-6 py-3 rounded-full font-bold transition-all duration-150 transform active:scale-95 ${
            activeStep === 0 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-slate-700 text-blue-400 hover:bg-slate-600 shadow-md hover:shadow-xl border border-slate-600'
          }`}
        >
          {uiLabels.prev}
        </button>

        <div className="flex gap-2">
          {story.steps.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => onStepChange(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 transform ${
                idx === activeStep 
                  ? 'bg-yellow-400 w-6 shadow-[0_0_10px_rgba(250,204,21,0.6)] scale-110' 
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={handleNext}
          disabled={activeStep === story.steps.length - 1}
          className={`px-6 py-3 rounded-full font-bold transition-all duration-150 transform active:scale-95 ${
            activeStep === story.steps.length - 1 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg hover:shadow-blue-500/50 hover:scale-105 border border-blue-500'
          }`}
        >
          {uiLabels.next}
        </button>
      </div>

      {activeStep === story.steps.length - 1 && (
        <div className="mt-8 p-4 bg-green-900/50 text-green-300 rounded-xl text-center border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-pulse">
          <span className="text-4xl block mb-2">🎉</span>
          <p className="font-bold text-lg">{story.conclusion}</p>
        </div>
      )}
    </div>
  );
};
