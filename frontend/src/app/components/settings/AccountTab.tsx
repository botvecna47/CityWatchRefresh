import { User, Bell, Smartphone, Globe, Moon, CheckCircle2 } from "lucide-react";
import { Card, Input, Button } from "../ui";
import { SettingRow } from "./SettingRow";
import { Toggle } from "./Toggle";

export function AccountTab({
  currentUser,
  emailNotif, setEmailNotif,
  smsNotif, setSmsNotif,
  pushNotif, setPushNotif,
  activityDigest, setActivityDigest,
  theme, setTheme,
  handleSaveAccount
}: any) {
  return (
    <>
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

      <Card className="p-6 bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-gray-500" />
          <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
        </div>
        <div>
          <SettingRow icon={Bell} label="Email Notifications" description="Receive status updates about your complaints via email.">
            <Toggle id="email-notif" checked={emailNotif} onChange={setEmailNotif} />
          </SettingRow>
          <SettingRow icon={Smartphone} label="SMS Alerts" description="Get text messages for high-priority updates and SLA warnings.">
            <Toggle id="sms-notif" checked={smsNotif} onChange={setSmsNotif} />
          </SettingRow>
          <SettingRow icon={Bell} label="Push Notifications" description="Receive real-time browser notifications while active.">
            <Toggle id="push-notif" checked={pushNotif} onChange={setPushNotif} />
          </SettingRow>
          <SettingRow icon={Globe} label="Weekly Activity Digest" description="A weekly summary of complaint activity in your area.">
            <Toggle id="activity-digest" checked={activityDigest} onChange={setActivityDigest} />
          </SettingRow>
        </div>
      </Card>

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

      <div className="flex justify-end">
        <Button onClick={handleSaveAccount} className="bg-[#1A4331] hover:bg-[#112d21] text-white px-6">
          Save Preferences
        </Button>
      </div>
    </>
  );
}
