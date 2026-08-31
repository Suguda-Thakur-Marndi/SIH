export const dynamic = 'force-dynamic';
import OfficerSettings from "@/Agriculture officer dashboard/settings/OfficerSettings";

export const metadata = {
  title: "Officer Settings | Smart Crop",
  description: "Manage official officer profile, notification preferences, language, and security settings.",
};

export default function Page() {
  return <OfficerSettings />;
}
