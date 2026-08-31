import { OfficerAnalytics } from '@/Agriculture officer dashboard/analytics/OfficerAnalytics';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Distress Analytics | Agriculture Officer Dashboard',
  description: 'Analyze distress factors, weather stress, and prioritize farmer interventions.',
};

export default function OfficerAnalyticsPage() {
  return <OfficerAnalytics />;
}
