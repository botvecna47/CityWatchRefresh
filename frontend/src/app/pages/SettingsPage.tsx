import { useState } from "react";
import React from "react";
import { useAppContext } from "../store";
import { cn } from "../components/ui";
import { LogOut, User2, Lock, Shield } from "lucide-react";
import { toast } from "sonner";

import { AccountTab } from "../components/settings/AccountTab";
import { SecurityTab } from "../components/settings/SecurityTab";
import { PrivacyTab } from "../components/settings/PrivacyTab";

type Tab = "account" | "security" | "privacy";

export function SettingsPage() {
  const { currentUser, updateUserSettings, setCurrentUser } = useAppContext();

  const [emailNotif, setEmailNotif] = useState(currentUser?.settings?.emailNotifications ?? true);
  const [smsNotif, setSmsNotif] = useState(currentUser?.settings?.smsNotifications ?? false);
  const [pushNotif, setPushNotif] = useState(true);
  const [activityDigest, setActivityDigest] = useState(false);
  const [theme, setTheme] = useState(currentUser?.settings?.theme ?? "system");
  const [activeTab, setActiveTab] = useState<Tab>("account");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleSaveAccount = async () => {
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

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "account",  label: "Account",       icon: User2 },
    { id: "security", label: "Security",       icon: Lock },
    { id: "privacy",  label: "Privacy & Data", icon: Shield },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A4331]" style={{ fontFamily: "Playfair Display, serif" }}>
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Sidebar — nav + logout in one column */}
        <nav className="w-full md:w-56 flex-shrink-0 bg-white border border-gray-100 rounded-2xl shadow-sm p-2 flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-3 group",
                  isActive
                    ? "bg-[#1A4331] text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#1A4331]"
                )}
              >
                <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-white/80" : "text-gray-400 group-hover:text-[#2E7D32]")} />
                {tab.label}
              </button>
            );
          })}

          {/* Divider */}
          <div className="border-t border-gray-100 my-1" />

          {/* Logout */}
          <button
            onClick={() => setCurrentUser(null)}
            className="w-full text-left px-3 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center gap-3 text-red-500 hover:bg-red-50 hover:text-red-600 group"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 text-red-400 group-hover:text-red-500" />
            Log Out
          </button>
        </nav>

        {/* Content */}
        <div className="flex-1 space-y-4 min-h-[60vh]">
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