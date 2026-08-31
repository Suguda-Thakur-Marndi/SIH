export const dynamic = 'force-dynamic';
import DistrictDistressMapView from '@/components/officer/DistrictDistressMapView';

export const metadata = {
  title: 'Smart Crop | District Distress Map Command Center',
  description: 'Interactive Agricultural District Distress Map, Spatial Risk Clustering & Field Triage.',
};

export default function AdminDistressMapPage() {
  return <DistrictDistressMapView />;
}
