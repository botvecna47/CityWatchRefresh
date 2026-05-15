import { useState } from "react";
import { useAppContext } from "../store";
import { cn } from "../components/ui";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { AccountTab } from "../components/settings/AccountTab";
import { SecurityTab } from "../components/settings/SecurityTab";
import { PrivacyTab } from "../components/settings/PrivacyTab";

type Tab = "account" | "security" | "privacy";

export function SettingsPage() {
  const { currentUser, updateUserSettings } = useAppContext();

  const [emailNotif, setEmailNotif] = useState(currentUser?.settings?.emailNotifications ?? true);
  const [smsNotif, setSmsNotif] = useState(currentUser?.settings?.smsNotifications ?? false);
  const [pushNotif, setPushNotif] = useState(true);
  const [activityDigest, setActivityDigest] = useState(false);
  const [theme, setTheme] = useState(currentUser?.settings?.theme ?? "system");
  const [activeTab, setActiveTab] = useState<Tab>("account");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleSaveAccount = () => {
    updateUserSettings({ emailNotifications: emailNotif, smsNotifications: smsNotif, theme: theme as any });
    toast.success("Preferences saved.");
  };

  const handleChangePassword = () => {
    if (!currentPw || !newPw || !confirmPw) { toast.error("Please fill all password fields."); return; }
    if (newPw !== confirmPw) { toast.error("New passwords do not match."); return; }
    if (newPw.length < 6) { toast.error("Password must be at least 6 characters."); return; }
    toast.success("Password updated successfully.");
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
  };

  if (!currentUser) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "account",  label: "Account" },
    { id: "security", label: "Security" },
    { id: "privacy",  label: "Privacy & Data" },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "Playfair Display, serif" }}>
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <nav className="md:col-span-1 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-between group",
                activeTab === tab.id
                  ? "bg-[#1A4331]/8 text-[#1A4331] border-l-[3px] border-[#2E7D32] pl-[calc(0.75rem-3px)]"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {tab.label}
              <ChevronRight className={cn("w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity", activeTab === tab.id && "opacity-60")} />
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="md:col-span-3 space-y-4 min-h-[60vh]">
          {activeTab === "account" && (
            <AccountTab 
              currentUser={currentUser}
              emailNotif={emailNotif} setEmailNotif={setEmailNotif}
              smsNotif={smsNotif} setSmsNotif={setSmsNotif}
              pushNotif={pushNotif} setPushNotif={setPushNotif}
              activityDigest={activityDigest} setActivityDigest={setActivityDigest}
              theme={theme} setTheme={setTheme}
              handleSaveAccount={handleSaveAccount}
            />
          )}

          {activeTab === "security" && (
            <SecurityTab 
              currentPw={currentPw} setCurrentPw={setCurrentPw}
              newPw={newPw} setNewPw={setNewPw}
              confirmPw={confirmPw} setConfirmPw={setConfirmPw}
              handleChangePassword={handleChangePassword}
            />
          )}

          {activeTab === "privacy" && <PrivacyTab />}
        </div>
      </div>
    </div>
  );
}