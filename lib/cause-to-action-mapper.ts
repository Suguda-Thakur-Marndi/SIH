/**
 * SmartCrop — Cause-to-Action Mapping & Remediation Engine (PS-02 Compliant)
 *
 * Diagnoses whether distress risk is driven by a single dominant driver
 * (> 15-point gap over the next highest signal) or compound hazard,
 * and prescribes tailored, actionable remedies and government scheme referrals:
 *
 *  1. Rainfall Deficit:
 *     - Protective irrigation / foliar osmotic spray (2% Potassium Nitrate)
 *     - PMFBY drought claim verification & relief checklist
 *  2. Mandi Price Crash:
 *     - Nearest higher-price APMC mandi comparison / e-NAM routing
 *     - PACS MSP procurement token booking
 *  3. Loan Repayment Due:
 *     - State interest subvention scheme referral
 *     - KCC loan restructuring & debt rescheduling relief
 *  4. Compound Hazard:
 *     - Multi-signal triage with priority extension officer assignment
 */

import { type ComputedDistressScore } from './distress-scorer';

export interface RemediationAction {
  primaryDriver: string;
  isDominant: boolean; // True if >15 pt gap over secondary driver
  gapToSecondary: number;
  summary: string;
  immediateAction: string;
  agronomicGuidance: string[];
  recommendedSchemes: Array<{
    name: string;
    code: string;
    description: string;
    benefit: string;
    actionUrl?: string;
  }>;
  officerTriageAction: string;
  priority: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
}

/**
 * Maps computed distress score signals into deterministic, actionable remediation steps.
 */
export function mapCauseToAction(score: ComputedDistressScore): RemediationAction {
  const { rainfall_risk, market_risk, loan_risk } = score.signals;
  const overall = score.score;

  // Rank signals by risk score
  const ranked = [
    { name: 'Rainfall Deficit', score: rainfall_risk },
    { name: 'Market Price Crash', score: market_risk },
    { name: 'Loan Repayment Due', score: loan_risk },
  ].sort((a, b) => b.score - a.score);

  const primary = ranked[0];
  const secondary = ranked[1];
  const gap = primary.score - secondary.score;
  const isDominant = gap >= 15 && primary.score >= 50;

  const priority =
    overall >= 86
      ? 'CRITICAL'
      : overall >= 71
      ? 'HIGH'
      : overall >= 40
      ? 'MODERATE'
      : 'LOW';

  // 1. Rainfall Deficit Dominant
  if (isDominant && primary.name === 'Rainfall Deficit') {
    return {
      primaryDriver: 'Rainfall Deficit',
      isDominant: true,
      gapToSecondary: gap,
      summary: 'Severe moisture stress detected. Apply protective irrigation immediately.',
      immediateAction:
        'Apply emergency protective irrigation and 2% Potassium Nitrate foliar spray to prevent osmotic wilt.',
      agronomicGuidance: [
        'Apply light supplementary irrigation in alternate furrows to conserve water.',
        'Spray 2% KNO3 (Potassium Nitrate) or 1% urea foliar solution during early morning to reduce evapotranspiration.',
        'Mulch crop rows with paddy straw or bio-residue to preserve residual soil moisture.',
      ],
      recommendedSchemes: [
        {
          name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
          code: 'PMFBY-DROUGHT-CLAIM',
          description: 'Crop insurance claim under Mid-Season Adversity / Prevented Sowing clause.',
          benefit: 'Up to 25% immediate on-account payout for localized rainfall deficit.',
          actionUrl: '/schemes',
        },
        {
          name: 'PM Krishi Sinchayee Yojana (PMKSY)',
          code: 'PMKSY-MICRO-IRR',
          description: 'Subsidized drip/sprinkler micro-irrigation installation.',
          benefit: '55% subsidy for small and marginal farmers.',
          actionUrl: '/schemes',
        },
      ],
      officerTriageAction:
        'Verify block-level rain gauge deficit and initiate localized PMFBY crop-cutting survey.',
      priority,
    };
  }

  // 2. Mandi Price Crash Dominant
  if (isDominant && primary.name === 'Market Price Crash') {
    return {
      primaryDriver: 'Market Price Crash',
      isDominant: true,
      gapToSecondary: gap,
      summary: 'Local mandi prices fell below MSP. Hold produce or route to nearest PACS.',
      immediateAction:
        'Hold harvest if farmgate price is >15% below MSP. Book an official procurement token at nearest PACS / e-NAM mandi.',
      agronomicGuidance: [
        'Dry harvested grain to <14% moisture content to qualify for official FCI/PACS procurement fair-average quality (FAQ) standards.',
        'Utilize Gramin Bhandaran Yojana accredited warehouse to avoid distress selling at spot prices.',
        'Check real-time APMC price differences in neighboring mandis via the SmartCrop Market comparator.',
      ],
      recommendedSchemes: [
        {
          name: 'PACS / Primary Agricultural Credit Society Procurement',
          code: 'PACS-MSP-PROCURE',
          description: 'Direct Government MSP procurement token system.',
          benefit: 'Guaranteed purchase at official Government MSP benchmark.',
          actionUrl: '/market',
        },
        {
          name: 'PM AASHA (Pradhan Mantri Annadata Aay Sanraksan Abhiyan)',
          code: 'PM-AASHA-PDPS',
          description: 'Price Deficiency Payment Scheme compensating the gap between MSP and selling price.',
          benefit: 'Direct bank transfer of price difference up to 25% of MSP.',
          actionUrl: '/schemes',
        },
      ],
      officerTriageAction:
        'Notify district marketing officer (APMC) and issue mandi token booking assistance for farmer.',
      priority,
    };
  }

  // 3. Loan Repayment Due Dominant
  if (isDominant && primary.name === 'Loan Repayment Due') {
    return {
      primaryDriver: 'Loan Repayment Due',
      isDominant: true,
      gapToSecondary: gap,
      summary: 'KCC loan repayment is imminent. Explore interest subvention or restructuring.',
      immediateAction:
        'Contact your Kisan Credit Card lender to verify Prompt Repayment Incentive (3% subvention) or request loan restructuring.',
      agronomicGuidance: [
        'Review Kisan Credit Card credit limit and outstanding interest balance.',
        'Submit self-declared distress certificate to the lending branch if affected by weather or market crashes.',
        'Do not borrow from informal moneylenders; consult Agriculture Officer for lead bank grievance liaison.',
      ],
      recommendedSchemes: [
        {
          name: 'Modified Interest Subvention Scheme (MISS)',
          code: 'RBI-MISS-3PCT',
          description: '3% prompt repayment incentive on short-term crop loans up to ₹3 Lakh.',
          benefit: 'Reduces effective annual borrowing interest rate to 4%.',
          actionUrl: '/schemes',
        },
        {
          name: 'KCC Natural Calamity Debt Rescheduling',
          code: 'KCC-RESTRUCTURE',
          description: 'Conversion of short-term crop loans into term loans payable over 3–5 years.',
          benefit: 'Prevents account classification as NPA during severe distress periods.',
          actionUrl: '/schemes',
        },
      ],
      officerTriageAction:
        'Flag farmer profile to Lead District Manager (LDM) agri-credit desk for restructuring review.',
      priority,
    };
  }

  // 4. Multi-Signal Compound Hazard (Compound Risk)
  return {
    primaryDriver: 'Multi-Signal Compound',
    isDominant: false,
    gapToSecondary: gap,
    summary: 'Compound agronomic, market, and credit distress detected. Extension officer visit required.',
    immediateAction:
      'Prioritize crop protection measures, hold distress sales, and request an officer field visit.',
    agronomicGuidance: [
      'Prioritize life-saving irrigation to preserve remaining crop stand.',
      'Group produce with local Farmer Producer Organization (FPO) to negotiate better freight and prices.',
      'Prepare crop loss documentation with geolocation photos for insurance claims.',
    ],
    recommendedSchemes: [
      {
        name: 'PMFBY Integrated Crop Insurance',
        code: 'PMFBY-COMPOUND',
        description: 'Comprehensive risk insurance covering yield losses and post-harvest damages.',
        benefit: 'Full insurance coverage against multi-hazard crop failure.',
        actionUrl: '/schemes',
      },
      {
        name: 'National Disaster Response Fund (NDRF / SDRF Input Subsidy)',
        code: 'SDRF-INPUT-SUBSIDY',
        description: 'Direct agricultural input subsidy for areas with >33% crop loss.',
        benefit: '₹8,500/hectare for rainfed areas and ₹17,000/hectare for irrigated areas.',
        actionUrl: '/schemes',
      },
    ],
    officerTriageAction:
      'Schedule on-site farm inspection within 48 hours and coordinate relief package enrollment.',
    priority,
  };
}
