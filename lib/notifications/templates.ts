export function buildMessage(
  priority: string,
  type: string,
  score?: number,
  reasons: string[] = [],
  language: string = 'en'
): string {
  const reasonText = reasons.length > 0 ? reasons.slice(0, 2).join(', ') : 'Distress triggers flagged';
  const cleanLang = (language || 'en').toLowerCase().substring(0, 2);
  const isCritical = priority.toUpperCase() === 'CRITICAL';
  const scoreStr = score ? ` (${score}/100)` : '';

  switch (cleanLang) {
    case 'or':
    case 'od':
      return isCritical
        ? `[SmartCrop ଜରୁରୀ ସୂଚନା] ଆପଣଙ୍କ ଫସଲରେ ଗମ୍ଭୀର ସମସ୍ୟା${scoreStr} ଦେଖାଦେଇଛି: ${reasonText}। ତୁରନ୍ତ କୃଷି ଅଧିକାରୀ କିମ୍ବା ଆପ୍ ସହାୟତା ନିଅନ୍ତୁ।`
        : `[SmartCrop ପରାମର୍ଶ] ଫସଲ ଚେତାବନୀ: ${reasonText}। ବିସ୍ତୃତ ପରାମର୍ଶ ପାଇଁ SmartCrop ଆପ୍ ଦେଖନ୍ତୁ।`;

    case 'hi':
      return isCritical
        ? `[SmartCrop आपातकालीन सूचना] आपकी फसल में गंभीर जोखिम${scoreStr} पाया गया है: ${reasonText}। तुरंत अपने कृषि अधिकारी या ऐप से संपर्क करें।`
        : `[SmartCrop कृषि सलाह] फसल अलर्ट: ${reasonText}। विस्तृत विवरण और निवारण के लिए SmartCrop ऐप खोलें।`;

    case 'bn':
      return isCritical
        ? `[SmartCrop জরুরি বার্তা] আপনার ফসলে উচ্চ ঝুঁকি${scoreStr} সনাক্ত হয়েছে: ${reasonText}। অবিলম্বে কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।`
        : `[SmartCrop কৃষি পরামর্শ] ফসল সতর্কতা: ${reasonText}। বিস্তারিত নির্দেশনার জন্য SmartCrop অ্যাপ দেখুন।`;

    case 'te':
      return isCritical
        ? `[SmartCrop అత్యవసర హెచ్చరిక] మీ పంటలో తీవ్రమైన ప్రమాదం${scoreStr} గుర్తించబడింది: ${reasonText}. వెంటనే మీ వ్యవసాయ అధికారిని సంప్రదించండి.`
        : `[SmartCrop వ్యవసాయ సలహా] పంట హెచ్చరిక: ${reasonText}. పూర్తి వివరాల కోసం SmartCrop యాప్ తెరవండి.`;

    case 'ta':
      return isCritical
        ? `[SmartCrop அவசர எச்சரிக்கை] உங்கள் பயிரில் அதிக இடர்${scoreStr} கண்டறியப்பட்டுள்ளது: ${reasonText}. உடனடியாக வேளாண் அதிகாரியை தொடர்பு கொள்ளவும்.`
        : `[SmartCrop வேளாண் ஆலோசனை] பயிர் எச்சரிக்கை: ${reasonText}. கூடுதல் விவரங்களுக்கு SmartCrop செயலியை பார்க்கவும்.`;

    case 'mr':
      return isCritical
        ? `[SmartCrop आणीबाणी इशारा] तुमच्या पिकात गंभीर जोखीम${scoreStr} आढळली आहे: ${reasonText}. त्वरित कृषी अधिकाऱ्यांशी संपर्क साधा.`
        : `[SmartCrop कृषी सल्ला] पीक इशारा: ${reasonText}. सविस्तर माहितीसाठी SmartCrop ॲप पहा.`;

    case 'gu':
      return isCritical
        ? `[SmartCrop કટોકટી ચેતવણી] તમારા પાકમાં ગંભીર જોખમ${scoreStr} જણાયું છે: ${reasonText}. તાત્કાલિક કૃષિ અધિકારીનો સંપર્ક કરો.`
        : `[SmartCrop કૃષિ સલાહ] પાક ચેતવણી: ${reasonText}. વધુ વિગતો માટે SmartCrop એપ જુઓ.`;

    case 'pa':
      return isCritical
        ? `[SmartCrop ਐਮਰਜੈਂਸੀ ਅਲਰਟ] ਤੁਹਾਡੀ ਫ਼ਸਲ ਵਿੱਚ ਗੰਭੀਰ ਜੋਖਮ${scoreStr} ਪਾਇਆ ਗਿਆ ਹੈ: ${reasonText}। ਤੁਰੰਤ ਖੇਤੀਬਾੜੀ ਅਧਿਕਾਰੀ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।`
        : `[SmartCrop ਖੇਤੀ ਸਲਾਹ] ਫ਼ਸਲ ਚੇਤਾਵਨੀ: ${reasonText}। ਵਿਸਤ੍ਰਿਤ ਜਾਣਕਾਰੀ ਲਈ SmartCrop ਐਪ ਦੇਖੋ।`;

    case 'kn':
      return isCritical
        ? `[SmartCrop ತುರ್ತು ಎಚ್ಚರಿಕೆ] ನಿಮ್ಮ ಬೆಳೆಯಲ್ಲಿ ಗಂಭೀರ ಅಪಾಯ${scoreStr} ಕಂಡುಬಂದಿದೆ: ${reasonText}. ತಕ್ಷಣ ಕೃಷಿ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.`
        : `[SmartCrop ಕೃಷಿ ಸಲಹೆ] ಬೆಳೆ ಎಚ್ಚರಿಕೆ: ${reasonText}. ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ SmartCrop ಆ್ಯಪ್ ನೋಡಿ.`;

    case 'ml':
      return isCritical
        ? `[SmartCrop അടിയന്തര മുന്നറിയിപ്പ്] നിങ്ങളുടെ വിളയിൽ ഗുരുതരമായ അപകടസാധ്യത${scoreStr} കണ്ടെത്തി: ${reasonText}. ഉടൻ കൃഷി ഓഫീസറെ ബന്ധപ്പെടുക.`
        : `[SmartCrop കാർഷിക നിർദ്ദേശം] വിള മുന്നറിയിപ്പ്: ${reasonText}. കൂടുതൽ വിവരങ്ങൾക്ക് SmartCrop ആപ്പ് കാണുക.`;

    case 'as':
      return isCritical
        ? `[SmartCrop জৰুৰী সতৰ্কবাৰ্তা] আপোনাৰ শস্যত গুৰুতৰ বিপদ${scoreStr} ধৰা পৰিছে: ${reasonText}। তৎকালীনভাৱে কৃষি বিষয়াৰ সৈতে যোগাযোগ কৰক।`
        : `[SmartCrop কৃষি পৰামৰ্শ] শস্য সতৰ্কবাৰ্তা: ${reasonText}। বিশদ নিৰ্দেশনাৰ বাবে SmartCrop এপ চাওক।`;

    case 'ur':
      return isCritical
        ? `[SmartCrop ہنگامی الرٹ] آپ کی فصل میں شدید خطرہ${scoreStr} پایا گیا ہے: ${reasonText}۔ فوری طور پر زرعی افسر سے رابطہ کریں۔`
        : `[SmartCrop زرعی مشورہ] فصل الرٹ: ${reasonText}۔ تفصیلی معلومات کے لیے SmartCrop ایپ دیکھیں۔`;

    case 'ne':
      return isCritical
        ? `[SmartCrop आपतकालीन चेतावनी] तपाईंको बालीमा गम्भीर जोखिम${scoreStr} फेला परेको छ: ${reasonText}। तुरुन्त कृषि अधिकृतसँग सम्पर्क गर्नुहोस्।`
        : `[SmartCrop कृषि सल्लाह] बाली चेतावनी: ${reasonText}। विस्तृत विवरणको लागि SmartCrop एप हेर्नुहोस्।`;

    default:
      return isCritical
        ? `[SmartCrop CRITICAL ALERT] Severe distress${scoreStr} detected on your farm: ${reasonText}. Immediate action required. Open SmartCrop app or call field officer.`
        : `[SmartCrop Advisory] Crop Warning (${type}): ${reasonText}. Check SmartCrop app for recommended agronomic actions.`;
  }
}
