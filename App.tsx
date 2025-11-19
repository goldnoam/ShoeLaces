import React, { useState, useEffect } from 'react';
import { ShoeViewer } from './components/ShoeModel';
import { StoryDisplay } from './components/StoryDisplay';
import { generateShoeStory } from './services/gemini';
import { StoryResponse, AppState, Language } from './types';

// Translation Dictionary
const translations = {
  he: {
    dir: 'rtl',
    appTitle: "👟 גיבורי השרוכים",
    startOver: "התחל מחדש",
    welcome: "שלום! איך קוראים לך?",
    intro: "בוא נלמד לקשור שרוכים עם סיפור מיוחד בשבילך.",
    namePlaceholder: "הכנס את השם שלך כאן...",
    startButton: "בוא נתחיל! ✨",
    loadingTitle: "כותבים לך סיפור קסום...",
    loadingSubtitle: "רק עוד רגע והקסם מתחיל",
    error: "אופס! משהו השתבש ביצירת הסיפור. בוא ננסה שוב.",
    retry: "נסה שוב",
    view3d: "תצוגה בתלת מימד",
    rotate: "סובב אותי",
    videoTitle: "סרטון הדרכה",
    videoDesc: 'צפה בסרטון המדגים את שיטת "אוזני הארנב"',
    tip: "💡 טיפ לאלופים: תרגול הופך למושלם! נסו לקשור את הנעל האמיתית שלכם יחד עם הסיפור.",
    feedback: "שלח משוב",
    prev: "הקודם",
    next: "הבא",
    step: "שלב",
    of: "מתוך",
    nowDoing: "עכשיו עושים:",
    clickHighlight: "לחץ להדגשה בנעל",
    shoeReady: "הנעל מוכנה!",
    lookGlow: "שים לב לחלקים הזוהרים",
    langName: "עברית"
  },
  en: {
    dir: 'ltr',
    appTitle: "👟 ShoeLace Heroes",
    startOver: "Start Over",
    welcome: "Hi! What is your name?",
    intro: "Let's learn to tie shoelaces with a special story just for you.",
    namePlaceholder: "Enter your name here...",
    startButton: "Let's Start! ✨",
    loadingTitle: "Writing a magical story...",
    loadingSubtitle: "Just a moment, magic is happening",
    error: "Oops! Something went wrong. Let's try again.",
    retry: "Try Again",
    view3d: "3D View",
    rotate: "Rotate Me",
    videoTitle: "Tutorial Video",
    videoDesc: 'Watch the "Bunny Ears" method tutorial',
    tip: "💡 Pro Tip: Practice makes perfect! Try with your real shoes.",
    feedback: "Send Feedback",
    prev: "Previous",
    next: "Next",
    step: "Step",
    of: "of",
    nowDoing: "Now doing:",
    clickHighlight: "Click to highlight",
    shoeReady: "Shoe Ready!",
    lookGlow: "Look for glowing parts",
    langName: "English"
  },
  zh: {
    dir: 'ltr',
    appTitle: "👟 鞋带英雄",
    startOver: "重新开始",
    welcome: "嗨！你叫什么名字？",
    intro: "让我们通过一个特别的故事来学习系鞋带。",
    namePlaceholder: "在这里输入你的名字...",
    startButton: "开始吧！✨",
    loadingTitle: "正在为你编写神奇的故事...",
    loadingSubtitle: "稍等片刻，魔法即将开始",
    error: "哎呀！出错了。让我们再试一次。",
    retry: "重试",
    view3d: "3D 视图",
    rotate: "旋转我",
    videoTitle: "教学视频",
    videoDesc: '观看“兔耳朵”系法视频教程',
    tip: "💡 提示：熟能生巧！试着用你真正的鞋子练习。",
    feedback: "发送反馈",
    prev: "上一步",
    next: "下一步",
    step: "步骤",
    of: "/",
    nowDoing: "现在进行：",
    clickHighlight: "点击高亮显示",
    shoeReady: "鞋子准备好了！",
    lookGlow: "寻找发光的部分",
    langName: "中文"
  },
  es: {
    dir: 'ltr',
    appTitle: "👟 Héroes de los Cordones",
    startOver: "Empezar de nuevo",
    welcome: "¡Hola! ¿Cómo te llamas?",
    intro: "Aprendamos a atar los cordones con una historia especial para ti.",
    namePlaceholder: "Escribe tu nombre aquí...",
    startButton: "¡Empecemos! ✨",
    loadingTitle: "Escribiendo una historia mágica...",
    loadingSubtitle: "Solo un momento, la magia está por comenzar",
    error: "¡Vaya! Algo salió mal. Intentémoslo de nuevo.",
    retry: "Intentar de nuevo",
    view3d: "Vista 3D",
    rotate: "Gírame",
    videoTitle: "Video Tutorial",
    videoDesc: 'Mira el tutorial del método "Orejas de Conejo"',
    tip: "💡 Consejo: ¡La práctica hace al maestro! Inténtalo con tus zapatos reales.",
    feedback: "Enviar comentarios",
    prev: "Anterior",
    next: "Siguiente",
    step: "Paso",
    of: "de",
    nowDoing: "Ahora haciendo:",
    clickHighlight: "Haz clic para resaltar",
    shoeReady: "¡Zapato listo!",
    lookGlow: "Busca las partes brillantes",
    langName: "Español"
  },
  fr: {
    dir: 'ltr',
    appTitle: "👟 Héros des Lacets",
    startOver: "Recommencer",
    welcome: "Salut ! Comment t'appelles-tu ?",
    intro: "Apprenons à nouer les lacets avec une histoire spéciale.",
    namePlaceholder: "Entre ton nom ici...",
    startButton: "C'est parti ! ✨",
    loadingTitle: "Écriture d'une histoire magique...",
    loadingSubtitle: "Juste un moment, la magie opère",
    error: "Oups ! Un problème est survenu. Réessayons.",
    retry: "Réessayer",
    view3d: "Vue 3D",
    rotate: "Tourne-moi",
    videoTitle: "Vidéo Tutoriel",
    videoDesc: 'Regarde la méthode des "Oreilles de Lapin"',
    tip: "💡 Astuce : C'est en forgeant qu'on devient forgeron ! Essaie avec tes chaussures.",
    feedback: "Envoyer des commentaires",
    prev: "Précédent",
    next: "Suivant",
    step: "Étape",
    of: "sur",
    nowDoing: "Action :",
    clickHighlight: "Cliquer pour mettre en surbrillance",
    shoeReady: "Chaussure prête !",
    lookGlow: "Regarde les parties brillantes",
    langName: "Français"
  },
  ar: {
    dir: 'rtl',
    appTitle: "👟 أبطال رباط الحذاء",
    startOver: "البدء من جديد",
    welcome: "أهلاً! ما اسمك؟",
    intro: "دعنا نتعلم ربط الحذاء مع قصة خاصة بك.",
    namePlaceholder: "أدخل اسمك هنا...",
    startButton: "لنبدأ! ✨",
    loadingTitle: "جاري كتابة قصة سحرية...",
    loadingSubtitle: "لحظة واحدة وسيبدأ السحر",
    error: "عفواً! حدث خطأ ما. لنحاول مرة أخرى.",
    retry: "حاول مرة أخرى",
    view3d: "عرض ثلاثي الأبعاد",
    rotate: "قم بتدويري",
    videoTitle: "فيديو تعليمي",
    videoDesc: 'شاهد فيديو طريقة "أذني الأرنب"',
    tip: "💡 نصيحة: التدريب يؤدي للإتقان! حاول مع حذائك الحقيقي.",
    feedback: "إرسال ملاحظات",
    prev: "السابق",
    next: "التالي",
    step: "خطوة",
    of: "من",
    nowDoing: "نقوم الآن بـ:",
    clickHighlight: "انقر للتظليل",
    shoeReady: "الحذاء جاهز!",
    lookGlow: "ابحث عن الأجزاء المضيئة",
    langName: "العربية"
  },
  hi: {
    dir: 'ltr',
    appTitle: "👟 फीता हीरोज",
    startOver: "फिर से शुरू करें",
    welcome: "नमस्ते! आपका नाम क्या है?",
    intro: "आइए आपके लिए एक विशेष कहानी के साथ जूते के फीते बांधना सीखें।",
    namePlaceholder: "अपना नाम यहाँ लिखें...",
    startButton: "चलो शुरू करते हैं! ✨",
    loadingTitle: "एक जादुई कहानी लिख रहे हैं...",
    loadingSubtitle: "बस एक पल और जादू शुरू",
    error: "ओह! कुछ गलत हो गया। फिर से कोशिश करें।",
    retry: "पुनः प्रयास करें",
    view3d: "3D दृश्य",
    rotate: "मुझे घुमाओ",
    videoTitle: "ट्यूटोरियल वीडियो",
    videoDesc: '"बनी इयर्स" विधि का वीडियो देखें',
    tip: "💡 प्रो टिप: अभ्यास से ही निपुणता आती है! अपने असली जूतों के साथ कोशिश करें।",
    feedback: "प्रतिक्रिया भेजें",
    prev: "पिछला",
    next: "अगला",
    step: "चरण",
    of: "/",
    nowDoing: "अब कर रहे हैं:",
    clickHighlight: "हाइलाइट करने के लिए क्लिक करें",
    shoeReady: "जूता तैयार!",
    lookGlow: "चमकते हिस्सों को देखें",
    langName: "हिन्दी"
  },
  ru: {
    dir: 'ltr',
    appTitle: "👟 Герои Шнурков",
    startOver: "Начать заново",
    welcome: "Привет! Как тебя зовут?",
    intro: "Давай научимся завязывать шнурки с помощью специальной истории.",
    namePlaceholder: "Введите ваше имя...",
    startButton: "Давайте начнем! ✨",
    loadingTitle: "Пишем волшебную историю...",
    loadingSubtitle: "Всего мгновение, и магия начнется",
    error: "Ой! Что-то пошло не так. Давайте попробуем снова.",
    retry: "Попробовать снова",
    view3d: "3D Вид",
    rotate: "Вращай меня",
    videoTitle: "Обучающее видео",
    videoDesc: 'Посмотрите видео метода "Ушки кролика"',
    tip: "💡 Совет: Практика ведет к совершенству! Попробуйте на своих ботинках.",
    feedback: "Отправить отзыв",
    prev: "Назад",
    next: "Вперед",
    step: "Шаг",
    of: "из",
    nowDoing: "Сейчас делаем:",
    clickHighlight: "Нажмите для подсветки",
    shoeReady: "Ботинок готов!",
    lookGlow: "Ищите светящиеся части",
    langName: "Русский"
  }
};

const App: React.FC = () => {
  const [name, setName] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [story, setStory] = useState<StoryResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [activeStep, setActiveStep] = useState(0);
  const [highlightTrigger, setHighlightTrigger] = useState(0);
  const [language, setLanguage] = useState<Language>('he');

  const t = translations[language];

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = t.dir;
    document.documentElement.lang = language;
  }, [language, t.dir]);

  const handleGenerate = async () => {
    if (!name.trim()) return;
    
    setAppState(AppState.LOADING);
    setError('');
    setActiveStep(0);
    setHighlightTrigger(0);
    
    try {
      // Pass language to the API service
      const data = await generateShoeStory(name, language);
      setStory(data);
      setAppState(AppState.READY);
    } catch (e) {
      setError(t.error);
      setAppState(AppState.ERROR);
    }
  };

  const handleInstructionClick = () => {
    setHighlightTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen flex flex-col pb-12 bg-slate-900 text-slate-100 transition-colors duration-500">
      {/* Header */}
      <header className="bg-slate-800 shadow-md p-4 sticky top-0 z-50 border-b border-slate-700">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
            {t.appTitle}
          </h1>
          
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <select 
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value as Language);
                // Reset state on language change to avoid mismatched text
                if (appState === AppState.READY) {
                  setAppState(AppState.IDLE);
                  setStory(null);
                  setName('');
                }
              }}
              className="bg-slate-900 text-slate-200 text-sm py-1 px-2 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="he">🇮🇱 עברית</option>
              <option value="en">🇺🇸 English</option>
              <option value="fr">🇫🇷 Français</option>
              <option value="es">🇪🇸 Español</option>
              <option value="zh">🇨🇳 中文</option>
              <option value="ar">🇸🇦 العربية</option>
              <option value="hi">🇮🇳 हिन्दी</option>
              <option value="ru">🇷🇺 Русский</option>
            </select>

            {story && (
               <button 
                 onClick={() => { setStory(null); setAppState(AppState.IDLE); setName(''); setActiveStep(0); }}
                 className="text-sm text-slate-400 hover:text-blue-400 underline transition-colors"
               >
                 {t.startOver}
               </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto p-4 space-y-8">
        
        {/* State: IDLE (Input Name) */}
        {appState === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
            <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border-2 border-slate-700">
              <div className="text-6xl mb-4">👋</div>
              <h2 className="text-2xl font-bold text-white mb-2">{t.welcome}</h2>
              <p className="text-slate-400 mb-6">{t.intro}</p>
              
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full p-4 text-center text-xl bg-slate-900 text-white border-2 border-slate-600 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-900 outline-none transition-all mb-4 placeholder-slate-600"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              
              <button 
                onClick={handleGenerate}
                disabled={!name.trim()}
                className="w-full py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transform active:scale-95 transition-all shadow-lg shadow-blue-900/20"
              >
                {t.startButton}
              </button>
            </div>
          </div>
        )}

        {/* State: LOADING */}
        {appState === AppState.LOADING && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin text-5xl mb-4">🧵</div>
            <h3 className="text-xl font-bold text-blue-400">{t.loadingTitle}</h3>
            <p className="text-slate-500 mt-2">{t.loadingSubtitle}</p>
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
              {t.retry}
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
                  <h2 className="font-bold text-slate-200">{t.view3d}</h2>
                  <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-800 px-2 py-1 rounded-full">{t.rotate}</span>
                </div>
                <ShoeViewer 
                  activeStep={activeStep} 
                  highlightTrigger={highlightTrigger} 
                  labels={{ ready: t.shoeReady, look: t.lookGlow }} 
                />
              </div>

              <div className="bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📺</span>
                  <h2 className="font-bold text-slate-200">{t.videoTitle}</h2>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden bg-black relative group cursor-pointer ring-2 ring-slate-700/50">
                   <iframe 
                    width="100%" 
                    height="100%" 
                    src="https://www.youtube.com/embed/M8DNQvyGnf0"
                    title="Shoe Tying Tutorial" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    allowFullScreen
                    className="absolute inset-0"
                  ></iframe>
                </div>
                <p className="text-sm text-slate-400 mt-2 text-center">{t.videoDesc}</p>
              </div>
            </div>

            {/* Right Column: Interactive Story */}
            <div className="flex flex-col h-full">
               <StoryDisplay 
                 story={story} 
                 activeStep={activeStep}
                 onStepChange={setActiveStep}
                 onInstructionClick={handleInstructionClick}
                 uiLabels={{
                   prev: t.prev,
                   next: t.next,
                   step: t.step,
                   of: t.of,
                   nowDoing: t.nowDoing,
                   clickHighlight: t.clickHighlight
                 }}
               />
               
               {/* Fun Extra */}
               <div className="mt-6 bg-purple-900/30 p-4 rounded-xl border border-purple-800/50 text-center">
                 <p className="text-purple-300 font-medium">
                   {t.tip}
                 </p>
               </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-600 text-sm p-8 mt-8 border-t border-slate-800">
        <p className="mb-2">{t.footer}</p>
        <a 
          href="mailto:gold.noam@gmail.com" 
          className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 transition-colors"
        >
          <span>📧</span>
          {t.feedback}
        </a>
      </footer>
    </div>
  );
};

export default App;
