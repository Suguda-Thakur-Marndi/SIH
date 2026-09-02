import { LanguageCode, LanguageOption, SUPPORTED_LANGUAGES } from './types';
import { en } from './en';
import { hi } from './hi';
import { or } from './or';
import { bn } from './bn';
import { te } from './te';
import { ta } from './ta';
import { mr } from './mr';
import { gu } from './gu';
import { pa } from './pa';
import { kn } from './kn';
import { ml } from './ml';
import { as } from './as';
import { ur } from './ur';
import { ne } from './ne';

export type { LanguageCode, LanguageOption };
export { SUPPORTED_LANGUAGES };

export const UI_DICTIONARY: Record<LanguageCode, Record<string, string>> = {
  en,
  hi,
  or,
  bn,
  te,
  ta,
  mr,
  gu,
  pa,
  kn,
  ml,
  as,
  ur,
  ne,
};
