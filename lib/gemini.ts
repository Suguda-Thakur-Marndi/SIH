/**
 * Backward compatibility alias module.
 * Re-exports everything from lib/nvidia-nim.ts.
 */
export * from './nvidia-nim';

// Backward compatibility legacy aliases
import { callNimText, callNimVision } from './nvidia-nim';
export const callGeminiApi = callNimText;
export const callGeminiVisionApi = callNimVision;
