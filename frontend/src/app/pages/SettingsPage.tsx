import { useState } from "react";
import { useAppContext } from "../store";
import { Card, Button, Input, cn } from "../components/ui";
import {
  User,
  Bell,
  Shield,
  Moon,
  Lock,
  Smartphone,
  Download,
  LogOut,
  Trash2,
  ChevronRight,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

// ─── Toggle Switch component ─────────────────────────────────────────────────
function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1A4331] focus:ring-offset-2",
        checked ? "bg-[#2E7D32]" : "bg-gray-200"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

// ─── Section Row (label + toggle / chevron) ──────────────────────────────────
function SettingRow({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon?: any;
  label: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gray-600" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {description && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>}
        </div>
      </div>
      {children && <div className="flex-shrink-0">{children}</div>}
    </div>
  );
}

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
    <div className="max-w-4xl mx-auto py-8 px-4">
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
        <div className="md:col-span-3 space-y-4">

          {/* ── ACCOUNT TAB ────────────────────────────────────────────────── */}
          {activeTab === "account" && (
            <>
              {/* Profile */}
              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <User className="w-4 h-4 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Profile Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Full Name</label>
                    <Input value={currentUser.name} disabled className="bg-gray-50 text-gray-600" />
                    <p className="text-xs text-gray-400 mt-1.5">To update your name, contact the system administrator.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Email Address</label>
                    <Input value={currentUser.email} disabled className="bg-gray-50 text-gray-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Account Role</label>
                    <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-gray-50">
                      <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
                      <span className="text-sm text-gray-700 font-medium capitalize">{currentUser.role}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Notifications */}
              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
                </div>
                <div>
                  <SettingRow
                    icon={Bell}
                    label="Email Notifications"
                    description="Receive status updates about your complaints via email."
                  >
                    <Toggle id="email-notif" checked={emailNotif} onChange={setEmailNotif} />
                  </SettingRow>
                  <SettingRow
                    icon={Smartphone}
                    label="SMS Alerts"
                    description="Get text messages for high-priority updates and SLA warnings."
                  >
                    <Toggle id="sms-notif" checked={smsNotif} onChange={setSmsNotif} />
                  </SettingRow>
                  <SettingRow
                    icon={Bell}
                    label="Push Notifications"
                    description="Receive real-time browser notifications while active."
                  >
                    <Toggle id="push-notif" checked={pushNotif} onChange={setPushNotif} />
                  </SettingRow>
                  <SettingRow
                    icon={Globe}
                    label="Weekly Activity Digest"
                    description="A weekly summary of complaint activity in your area."
                  >
                    <Toggle id="activity-digest" checked={activityDigest} onChange={setActivityDigest} />
                  </SettingRow>
                </div>
              </Card>

              {/* Appearance */}
              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Moon className="w-4 h-4 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Appearance</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Theme</label>
                    <select
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A4331] focus-visible:ring-offset-2"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Language</label>
                    <select
                      className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A4331] focus-visible:ring-offset-2"
                      defaultValue="en"
                    >
                      <option value="en">English</option>
                      <option value="mr">Marathi</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSaveAccount} className="bg-[#1A4331] hover:bg-[#112d21] text-white px-6">
                  Save Preferences
                </Button>
              </div>
            </>
          )}

          {/* ── SECURITY TAB ───────────────────────────────────────────────── */}
          {activeTab === "security" && (
            <>
              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Lock className="w-4 h-4 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Current Password</label>
                    <Input type="password" placeholder="Enter current password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">New Password</label>
                    <Input type="password" placeholder="Enter new password (min. 6 chars)" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Confirm New Password</label>
                    <Input type="password" placeholder="Re-enter new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                  </div>
                  <Button onClick={handleChangePassword} className="bg-[#1A4331] text-white hover:bg-[#112d21]">
                    Update Password
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Two-Factor Authentication</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Add an extra layer of security. When enabled, you'll be required to provide a verification code in addition to your password.
                </p>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Authenticator App</p>
                    <p className="text-xs text-gray-500 mt-0.5">Use an app like Google Authenticator or Authy.</p>
                  </div>
                  <Button variant="outline" onClick={() => toast.info("2FA setup will be available soon.")}>
                    Enable
                  </Button>
                </div>
              </Card>

              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Smartphone className="w-4 h-4 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Active Sessions</h2>
                </div>
                <div className="space-y-3">
                  {[
                    { device: "Chrome on Windows", location: "Nanded, MH", current: true, time: "Now" },
                    { device: "Mobile App — Android", location: "Nanded, MH", current: false, time: "2 days ago" },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {session.device}
                          {session.current && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                              Current
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{session.location} · {session.time}</p>
                      </div>
                      {!session.current && (
                        <Button variant="outline" size="sm" onClick={() => toast.success("Session revoked.")} className="text-red-600 border-red-200 hover:bg-red-50">
                          <LogOut className="w-3 h-3 mr-1" /> Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* ── PRIVACY & DATA TAB ─────────────────────────────────────────── */}
          {activeTab === "privacy" && (
            <>
              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Download className="w-4 h-4 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Your Data</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  You can request a copy of all the data associated with your CityWatch account, including your complaints, comments, and profile information.
                </p>
                <Button variant="outline" onClick={() => toast.success("Your data export has been requested. You will receive an email within 24 hours.")}>
                  <Download className="w-4 h-4 mr-2" />
                  Request Data Export
                </Button>
              </Card>

              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Visibility</h2>
                </div>
                <SettingRow
                  label="Show my name on public complaints"
                  description="When enabled, your name is displayed on complaints you file. Disable to show as 'Anonymous Citizen'."
                >
                  <Toggle id="visibility" checked={true} onChange={() => toast.info("Visibility preference saved.")} />
                </SettingRow>
                <SettingRow
                  label="Allow coordinators to view my profile"
                  description="Coordinators assigned to your complaint can view your contact details."
                >
                  <Toggle id="coord-visibility" checked={true} onChange={() => toast.info("Preference saved.")} />
                </SettingRow>
              </Card>

              <Card className="p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Trash2 className="w-4 h-4 text-gray-500" />
                  <h2 className="text-base font-semibold text-gray-900">Delete Account</h2>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Permanently delete your account and all associated data. This action is irreversible. Your complaints will be anonymised and retained for public record.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => {
                    toast("Confirm account deletion?", {
                      description: "This action cannot be undone. All your data will be permanently removed.",
                      action: {
                        label: "Delete Permanently",
                        onClick: () => toast.error("Account deletion requested. Please contact support to finalise."),
                      },
                      cancel: { label: "Cancel", onClick: () => {} },
                    });
                  }}
                  className="bg-white border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </Button>
              </Card>
            </>
          )}

        </div>
      </div>
    </div>
  );
}