let translateWithSarvamFn: any = null;
async function getSarvamTranslator() {
  if (translateWithSarvamFn) return translateWithSarvamFn;
  try {
    const sarvam = await import('../../../../lib/sarvam-ai').catch(() => null);
    translateWithSarvamFn = sarvam?.translateWithSarvam;
  } catch {
    // Standalone fallback
  }
  return translateWithSarvamFn;
}

/**
 * Pre-translated curated templates per PRD guidelines
 * English, Hindi (hi), and Odia (or / od)
 */
const TEMPLATE_STORE: Record<string, Record<string, (params: any) => string>> = {
  DISTRESS_CRITICAL: {
    en: ({ score, reasons }) =>
      `SmartCrop Notice: Farm distress index level is ${score} of 100 (High Distress). Factors: ${reasons}. Please check your SmartCrop mobile application for details.`,
    hi: ({ score, reasons }) =>
      `SmartCrop नोटिस: आपके खेत का जोखिम स्तर ${score}/100 है। मुख्य चिंता: ${reasons}। विवरण के लिए SmartCrop ऐप देखें।`,
    od: ({ score, reasons }) =>
      `SmartCrop ସୂଚନା: ଆପଣଙ୍କ ଚାଷ ଜମିର ବିପଦ ସ୍ତର ${score}/100 ଅଟେ। ମୁଖ୍ୟ କାରଣ: ${reasons}। SmartCrop ଆପ୍ ଦେଖନ୍ତୁ।`,
  },
  DISTRESS_HIGH: {
    en: ({ score, reasons }) =>
      `SmartCrop Notice: Farm distress index level is ${score} of 100. Factors: ${reasons}. Check advisory in SmartCrop app.`,
    hi: ({ score, reasons }) =>
      `SmartCrop नोटिस: आपके खेत का जोखिम स्तर ${score}/100 है। मुख्य कारण: ${reasons}। SmartCrop ऐप देखें।`,
    od: ({ score, reasons }) =>
      `SmartCrop ସୂଚନା: ଆପଣଙ୍କ ଚାଷ ଜମି ${score}/100 ରେ ଅଛି। ମୁଖ୍ୟ କାରଣ: ${reasons}। SmartCrop ଆପ୍ ଯାଞ୍ଚ କରନ୍ତୁ।`,
  },
  DISASTER_CYCLONE: {
    en: ({ reasons }) =>
      `SmartCrop Cyclone Alert: Severe cyclone warning in your area (${reasons}). Protect harvested crops, secure livestock and move to safe shelters.`,
    hi: ({ reasons }) =>
      `SmartCrop चक्रवात चेतावनी: आपके क्षेत्र में भारी चक्रवात की चेतावनी (${reasons})। कटी हुई फसलों और पशुओं को सुरक्षित स्थान पर रखें।`,
    od: ({ reasons }) =>
      `SmartCrop ବାତ୍ୟା ସତର୍କତା: ଆପଣଙ୍କ ଅଞ୍ଚଳରେ ପ୍ରବଳ ବାତ୍ୟା ସତର୍କତା (${reasons})। ଅମଳ ହୋଇଥିବା ଫସଲକୁ ସୁରକ୍ଷିତ ସ୍ଥାନରେ ରଖନ୍ତୁ।`,
  },
  DISASTER_FLOOD: {
    en: ({ reasons }) =>
      `SmartCrop Flood Warning: Heavy rainfall and flood alert (${reasons}). Clear field drainage channels and move machinery to higher ground.`,
    hi: ({ reasons }) =>
      `SmartCrop बाढ़ चेतावनी: भारी वर्षा और बाढ़ का अलर्ट (${reasons})। खेतों से पानी निकासी सुनिश्चित करें और मशीनरी सुरक्षित रखें।`,
    od: ({ reasons }) =>
      `SmartCrop ବନ୍ୟା ସତର୍କତା: ପ୍ରବଳ ବର୍ଷା ଓ ବନ୍ୟା ସତର୍କତା (${reasons})। କ୍ଷେତରୁ ପାଣି ନିଷ୍କାସନ ବ୍ୟବସ୍ଥା କରନ୍ତୁ।`,
  },
  DISASTER_HEATWAVE: {
    en: ({ reasons }) =>
      `SmartCrop Heatwave Warning: Extreme temperature alert (${reasons}). Irrigate early morning/evening and apply mulch to conserve soil moisture.`,
    hi: ({ reasons }) =>
      `SmartCrop लू/गर्मी चेतावनी: अत्यधिक तापमान की चेतावनी (${reasons})। सुबह या शाम को सिंचाई करें और नमी बनाए रखें।`,
    od: ({ reasons }) =>
      `SmartCrop ଅଂଶୁଘାତ ସତର୍କତା: ପ୍ରବଳ ଗ୍ରୀଷ୍ମ ପ୍ରବାହ ସତର୍କତା (${reasons})। ସକାଳେ କିମ୍ବା ସନ୍ଧ୍ୟାରେ ଜଳସେଚନ କରନ୍ତୁ।`,
  },
  DISASTER_GENERAL: {
    en: ({ reasons }) =>
      `SmartCrop Disaster Alert: ${reasons} expected in your area. Follow local safety instructions and protect farm assets.`,
    hi: ({ reasons }) =>
      `SmartCrop आपदा चेतावनी: आपके क्षेत्र में ${reasons} की संभावना है। स्थानीय सुरक्षा निर्देशों का पालन करें।`,
    od: ({ reasons }) =>
      `SmartCrop ବିପର୍ଯ୍ୟୟ ସତର୍କତା: ଆପଣଙ୍କ ଅଞ୍ଚଳରେ ${reasons} ଆଶଙ୍କା ରହିଛି। ସ୍ଥାନୀୟ ସୁରକ୍ଷା ନିର୍ଦ୍ଦେଶାବଳୀ ପାଳନ କରନ୍ତୁ।`,
  },
  INSURANCE_UPDATE: {
    en: ({ status, details }) =>
      `SmartCrop Insurance: Your crop insurance claim status is ${status || 'UPDATED'}. ${details || 'Log in to SmartCrop to view settlement details.'}`,
    hi: ({ status, details }) =>
      `SmartCrop बीमा: आपके फसल बीमा दावे की स्थिति ${status || 'अपडेट'} है। ${details || 'विवरण देखने के लिए SmartCrop में लॉग इन करें।'}`
  },
  WEATHER_ALERT: {
    en: ({ reasons }) =>
      `SmartCrop Weather Advisory: ${reasons}. Take necessary precautions for your standing crops.`,
    hi: ({ reasons }) =>
      `SmartCrop मौसम सलाह: ${reasons}। अपनी खड़ी फसलों के लिए आवश्यक सावधानी बरतें।`
  },
  MARKET_ALERT: {
    en: ({ crop, price, mandi }) =>
      `SmartCrop Mandi Alert: ${crop || 'Crop'} price is currently ₹${price || '---'} at ${mandi || 'local mandi'}. Check SmartCrop for optimal selling window.`,
    hi: ({ crop, price, mandi }) =>
      `SmartCrop मंडी अलर्ट: ${mandi || 'स्थानीय मंडी'} में ${crop || 'फसल'} का भाव ₹${price || '---'} है। विवरण के लिए SmartCrop देखें।`
  },
  SCHEME_UPDATE: {
    en: ({ schemeName, status }) =>
      `SmartCrop Scheme Update: Your application for ${schemeName || 'Government Scheme'} is ${status || 'PROCESSED'}. Visit portal for details.`,
    hi: ({ schemeName, status }) =>
      `SmartCrop योजना अपडेट: ${schemeName || 'सरकारी योजना'} के लिए आपका आवेदन ${status || 'प्रक्रियाधीन'} है।`
  }
};

/**
 * Builds localized message text from verified templates.
 * Falls back to Sarvam AI translation if language is not directly pre-compiled.
 */
export async function buildMessageAsync(
  priority: 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW',
  type: string,
  score: number = 0,
  reasons: string[] = [],
  language: string = 'en',
  metadata: Record<string, any> = {}
): Promise<string> {
  const normLang = (language || 'en').toLowerCase().trim();
  const reasonText = reasons.length > 0 ? reasons.join(', ') : 'adverse conditions detected';

  // Determine template key
  let templateKey = 'DISTRESS_HIGH';
  if (type === 'DISASTER') {
    const reasonsLower = reasonText.toLowerCase();
    if (reasonsLower.includes('cyclone') || reasonsLower.includes('storm')) {
      templateKey = 'DISASTER_CYCLONE';
    } else if (reasonsLower.includes('flood') || reasonsLower.includes('heavy rain')) {
      templateKey = 'DISASTER_FLOOD';
    } else if (reasonsLower.includes('heat') || reasonsLower.includes('temperature')) {
      templateKey = 'DISASTER_HEATWAVE';
    } else {
      templateKey = 'DISASTER_GENERAL';
    }
  } else if (type === 'DISTRESS') {
    templateKey = priority === 'CRITICAL' ? 'DISTRESS_CRITICAL' : 'DISTRESS_HIGH';
  } else if (type === 'INSURANCE') {
    templateKey = 'INSURANCE_UPDATE';
  } else if (type === 'WEATHER') {
    templateKey = 'WEATHER_ALERT';
  } else if (type === 'MARKET') {
    templateKey = 'MARKET_ALERT';
  } else if (type === 'SCHEME') {
    templateKey = 'SCHEME_UPDATE';
  }

  const templateGroup = TEMPLATE_STORE[templateKey] || TEMPLATE_STORE.DISTRESS_HIGH;
  const langKey = normLang.startsWith('hi') ? 'hi' : (normLang.startsWith('od') || normLang.startsWith('or')) ? 'od' : 'en';

  const params = {
    score,
    reasons: reasonText,
    status: metadata.status,
    details: metadata.details,
    crop: metadata.crop,
    price: metadata.price,
    mandi: metadata.mandi,
    schemeName: metadata.schemeName,
  };

  // If we have a direct template match in that language
  if (templateGroup[langKey]) {
    return templateGroup[langKey](params);
  }

  // Generate in English as base
  const englishMessage = (templateGroup.en || TEMPLATE_STORE.DISTRESS_HIGH.en)(params);

  // If English requested or default, return immediately
  if (langKey === 'en') {
    return englishMessage;
  }

  // Use Sarvam AI for dynamic translation to other Indic languages
  try {
    const translator = await getSarvamTranslator();
    if (translator) {
      const translationResult = await translator({
        input: englishMessage,
        sourceLanguageCode: 'en-IN',
        targetLanguageCode: langKey === 'od' ? 'od-IN' : `${langKey}-IN`,
      });

      if (translationResult.success && translationResult.translatedText) {
        return translationResult.translatedText;
      }
    }
  } catch (err) {
    console.warn('[Templates] Sarvam translation fallback failed, returning English:', err);
  }

  return englishMessage;
}

/**
 * Synchronous version for backwards compatibility
 */
export function buildMessage(
  priority: 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW',
  type: string,
  score: number = 0,
  reasons: string[] = [],
  language: string = 'en',
  metadata: Record<string, any> = {}
): string {
  const normLang = (language || 'en').toLowerCase().trim();
  const reasonText = reasons.length > 0 ? reasons.join(', ') : 'adverse conditions detected';

  let templateKey = 'DISTRESS_HIGH';
  if (type === 'DISASTER') {
    const reasonsLower = reasonText.toLowerCase();
    if (reasonsLower.includes('cyclone')) templateKey = 'DISASTER_CYCLONE';
    else if (reasonsLower.includes('flood')) templateKey = 'DISASTER_FLOOD';
    else if (reasonsLower.includes('heat')) templateKey = 'DISASTER_HEATWAVE';
    else templateKey = 'DISASTER_GENERAL';
  } else if (type === 'DISTRESS') {
    templateKey = priority === 'CRITICAL' ? 'DISTRESS_CRITICAL' : 'DISTRESS_HIGH';
  } else if (type === 'INSURANCE') {
    templateKey = 'INSURANCE_UPDATE';
  } else if (type === 'WEATHER') {
    templateKey = 'WEATHER_ALERT';
  } else if (type === 'MARKET') {
    templateKey = 'MARKET_ALERT';
  } else if (type === 'SCHEME') {
    templateKey = 'SCHEME_UPDATE';
  }

  const templateGroup = TEMPLATE_STORE[templateKey] || TEMPLATE_STORE.DISTRESS_HIGH;
  const langKey = normLang.startsWith('hi') ? 'hi' : (normLang.startsWith('od') || normLang.startsWith('or')) ? 'od' : 'en';

  const params = {
    score,
    reasons: reasonText,
    status: metadata.status,
    details: metadata.details,
    crop: metadata.crop,
    price: metadata.price,
    mandi: metadata.mandi,
    schemeName: metadata.schemeName,
  };

  const builder = templateGroup[langKey] || templateGroup.en || TEMPLATE_STORE.DISTRESS_HIGH.en;
  return builder(params);
}
