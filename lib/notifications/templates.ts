export function buildMessage(
  priority: string,
  type: string,
  score?: number,
  reasons: string[] = [],
  language: string = 'en'
): string {
  const reasonText = reasons.length > 0 ? reasons.slice(0, 2).join(', ') : 'Distress triggers flagged';
  const cleanLang = (language || 'en').toLowerCase().substring(0, 2);

  if (cleanLang === 'or' || cleanLang === 'od') {
    // Odia
    if (priority.toUpperCase() === 'CRITICAL') {
      return `[SmartCrop ଜରୁରୀ ସୂଚନା] ଆପଣଙ୍କ ଫସଲରେ ଗମ୍ଭୀର ସମସ୍ୟା (${score ? `ସ୍କୋର: ${score}/100` : ''}) ଦେଖାଦେଇଛି: ${reasonText}। ତୁରନ୍ତ କୃଷି ଅଧିକାରୀ କିମ୍ବା ଆପ୍ ସହାୟତା ନିଅନ୍ତୁ।`;
    }
    return `[SmartCrop ପରାମର୍ଶ] ଫସଲ ଚେତାବନୀ: ${reasonText}। ବିସ୍ତୃତ ପରାମର୍ଶ ପାଇଁ SmartCrop ଆପ୍ ଦେଖନ୍ତୁ।`;
  }

  if (cleanLang === 'hi') {
    // Hindi
    if (priority.toUpperCase() === 'CRITICAL') {
      return `[SmartCrop आपातकालीन सूचना] आपकी फसल में गंभीर जोखिम (${score ? `स्कोर: ${score}/100` : ''}) पाया गया है: ${reasonText}। तुरंत अपने कृषि अधिकारी या ऐप से संपर्क करें।`;
    }
    return `[SmartCrop कृषि सलाह] फसल अलर्ट: ${reasonText}। विस्तृत विवरण और निवारण के लिए SmartCrop ऐप खोलें।`;
  }

  if (cleanLang === 'bn') {
    // Bengali
    if (priority.toUpperCase() === 'CRITICAL') {
      return `[SmartCrop জরুরি বার্তা] আপনার ফসলে উচ্চ ঝুঁকি (${score ? `স্কোর: ${score}/100` : ''}) সনাক্ত হয়েছে: ${reasonText}। অবিলম্বে কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।`;
    }
    return `[SmartCrop কৃষি পরামর্শ] ফসল সতর্কতা: ${reasonText}। বিস্তারিত নির্দেশনার জন্য SmartCrop অ্যাপ দেখুন।`;
  }

  // English default
  if (priority.toUpperCase() === 'CRITICAL') {
    return `[SmartCrop CRITICAL ALERT] Severe distress (${score ? `Score: ${score}/100` : ''}) detected on your farm: ${reasonText}. Immediate action required. Open SmartCrop app or call field officer.`;
  }

  return `[SmartCrop Advisory] Crop Warning (${type}): ${reasonText}. Check SmartCrop app for recommended agronomic actions.`;
}
