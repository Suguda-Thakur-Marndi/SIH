export const dynamic = 'force-dynamic';
import DistrictDistressMapView from '@/components/officer/DistrictDistressMapView';

export const metadata = {
  title: 'Smart Crop | District Distress Map',
  description: 'Interactive Agricultural District Distress Map & Farmer Telemetry.',
};

export default function OfficerDistressMapRoute() {
  return <DistrictDistressMapView />;
}
