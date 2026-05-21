import { useState } from "react";
import { User, Bell, Smartphone, Globe, Moon, CheckCircle2, Mail, Save, Check, Loader2 } from "lucide-react";
import { Card, Input, Button } from "../ui";
import { SettingRow } from "./SettingRow";
import { Toggle } from "./Toggle";
import { cn } from "../ui";

export function AccountTab({
  currentUser,
  emailNotif, setEmailNotif,
  smsNotif, setSmsNotif,
  pushNotif, setPushNotif,
  activityDigest, setActivityDigest,
  theme, setTheme,
  handleSaveAccount
}: any) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onSave = async () => {
    setSaving(true);
    setSaved(false);
    await handleSaveAccount();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      {/* Profile Information */}
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

      {/* Email Notifications */}
      <Card className="p-6 bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#2E7D32]" />
            <h2 className="text-base font-semibold text-gray-900">Email Notifications</h2>
          </div>
          <span className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full",
            emailNotif ? "bg-[#2E7D32]/10 text-[#2E7D32]" : "bg-gray-100 text-gray-500"
          )}>
            {emailNotif ? "ON" : "OFF"}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-5 ml-6">
          {emailNotif
            ? `Notifications will be sent to ${currentUser.email}`
            : "You will not receive email notifications."}
        </p>

        <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
          <SettingRow
            icon={Bell}
            label="Email Notifications"
            description="Receive status updates and alerts about your reports via email."
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
            description="Receive real-time browser notifications while active on CityWatch."
          >
            <Toggle id="push-notif" checked={pushNotif} onChange={setPushNotif} />
          </SettingRow>
          <SettingRow
            icon={Globe}
            label="Weekly Activity Digest"
            description="A weekly summary of complaint activity and resolutions in your area."
          >
            <Toggle id="activity-digest" checked={activityDigest} onChange={setActivityDigest} />
          </SettingRow>
        </div>

        {/* What triggers emails — info box */}
        {emailNotif && (
          <div className="mt-4 rounded-xl bg-[#f0f7f1] border border-[#2E7D32]/20 p-4 text-xs text-[#2E7D32] space-y-1.5">
            <p className="font-semibold mb-2">📧 When will you get emails?</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-gray-600">
              {[
                "Your report status changes",
                "Coordinator is assigned to your report",
                "Your report is resolved with proof",
                "Your coordinator application is approved/rejected",
                "An admin removes your report",
                "Your account is suspended or reinstated",
              ].map(item => (
                <div key={item} className="flex items-start gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#2E7D32] mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
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
            <select className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A4331] focus-visible:ring-offset-2" defaultValue="en">
              <option value="en">English</option>
              <option value="mr">Marathi</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end items-center gap-3">
        {saved && (
          <span className="text-sm text-[#2E7D32] flex items-center gap-1.5 font-medium">
            <Check className="w-4 h-4" /> Preferences saved!
          </span>
        )}
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-[#1A4331] hover:bg-[#112d21] text-white px-6 gap-2"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save Preferences</>
          )}
        </Button>
      </div>
    </>
  );
}
