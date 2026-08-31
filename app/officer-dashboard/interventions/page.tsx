export const dynamic = 'force-dynamic';
import OfficerInterventionHistory from "@/Agriculture officer dashboard/interventions/OfficerInterventionHistory";

export const metadata = {
  title: "Officer Intervention History | Smart Crop",
  description: "Administrative log of field inspections, advisories, and distress mitigations for Mayurbhanj District.",
};

export default function Page() {
  return <OfficerInterventionHistory />;
}
