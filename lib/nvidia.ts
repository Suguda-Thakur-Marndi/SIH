/**
 * lib/nvidia.ts — Canonical NVIDIA NIM client alias.
 * Re-exports all functions from lib/nvidia-nim.ts.
 *
 * Import from here (or directly from nvidia-nim.ts) in all app code.
 * lib/gemini.ts has been removed; there are no Gemini dependencies.
 */
export * from './nvidia-nim';
