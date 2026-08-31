export const dynamic = 'force-dynamic';
import InsurancePage from '@/insurance/insurance';

export const metadata = {
  title: 'Smart Crop | PMFBY Crop Insurance Portal',
  description:
    'Pradhan Mantri Fasal Bima Yojana (PMFBY), Claim Assistant, and Localized Loss Cover.',
};

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-100">
      <InsurancePage />
    </main>
  );
}
