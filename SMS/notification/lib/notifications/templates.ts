export function buildMessage(
  priority: 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW',
  type: string,
  score: number = 0,
  reasons: string[] = [],
  language: string = 'en'
): string {
  const reasonText = reasons.length > 0 ? reasons.join(', ') : 'multiple risk factors';

  if (type === 'DISASTER') {
    return buildDisasterMessage(language, reasons);
  }

  if (language === 'hi') {
    return `SmartCrop चेतावनी: आपके खेत का जोखिम स्तर ${priority} (${score}/100) है। मुख्य कारण: ${reasonText}। आज की सलाह के लिए SmartCrop देखें या अपने कृषि अधिकारी से संपर्क करें।`;
  }
  
  // Odia / other languages could be translated dynamically via sarvam-ai.ts or cached here.
  // For MVP, falling back to English if not Hindi.
  
  return `SmartCrop Alert: Your farm is at ${priority} RISK (${score}/100). Main concerns: ${reasonText}. Check today's advisory in SmartCrop or contact your agriculture officer.`;
}

function buildDisasterMessage(language: string, reasons: string[]): string {
  const reasonText = reasons.length > 0 ? reasons.join(', ') : 'severe conditions';
  
  if (language === 'hi') {
    return `SmartCrop आपदा चेतावनी: आपके क्षेत्र में ${reasonText} की संभावना है। स्थानीय सुरक्षा निर्देशों का पालन करें।`;
  }
  
  return `SmartCrop Disaster Alert: ${reasonText} expected in your area. Follow local safety instructions and protect farm equipment where possible.`;
}
