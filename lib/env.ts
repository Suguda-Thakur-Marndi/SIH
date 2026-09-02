/**
 * SmartCrop — Environment Variables Validator & AI Gateway Config
 * Validates and ensures all necessary credentials for NVIDIA NIM and Sarvam AI.
 */

export interface AIEnvironmentConfig {
  nvidiaBaseUrl: string;
  nvidiaApiKey: string;
  sarvamApiKey: string;
  isNvidiaConfigured: boolean;
  isSarvamConfigured: boolean;
}

export function getAIEnvironment(): AIEnvironmentConfig {
  const nvidiaBaseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  const nvidiaApiKey =
    process.env.NVIDIA_API_KEY ||
    process.env.NEXT_PUBLIC_NVIDIA_API_KEY ||
    '';

  const sarvamApiKey =
    process.env.SARVAM_API_KEY ||
    process.env.NEXT_PUBLIC_SARVAM_API_KEY ||
    '';

  return {
    nvidiaBaseUrl,
    nvidiaApiKey,
    sarvamApiKey,
    isNvidiaConfigured: Boolean(nvidiaApiKey && nvidiaApiKey.trim().length > 0),
    isSarvamConfigured: Boolean(sarvamApiKey && sarvamApiKey.trim().length > 0),
  };
}

export function assertAIConfigured(service: 'nvidia' | 'sarvam' = 'nvidia'): void {
  const env = getAIEnvironment();
  if (service === 'nvidia' && !env.isNvidiaConfigured) {
    console.warn(
      '[SmartCrop AI Gateway] WARNING: NVIDIA_API_KEY is not set. Using deterministic high-fidelity fallback synthesis.'
    );
  }
  if (service === 'sarvam' && !env.isSarvamConfigured) {
    console.warn(
      '[SmartCrop AI Gateway] WARNING: SARVAM_API_KEY is not set. Using client-side TTS/Web Speech fallbacks.'
    );
  }
}
