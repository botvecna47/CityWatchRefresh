import { useState } from "react";
import { useAppContext } from "../store";
import { Card, Button, Input, cn } from "../components/ui";
import { User, Settings as SettingsIcon, Bell } from "lucide-react";
import { toast } from "sonner";

export function SettingsPage() {
  const { currentUser, updateUserSettings } = useAppContext();
  
  const [emailNotif, setEmailNotif] = useState(currentUser?.settings?.emailNotifications ?? true);
  const [smsNotif, setSmsNotif] = useState(currentUser?.settings?.smsNotifications ?? false);
  const [theme, setTheme] = useState(currentUser?.settings?.theme ?? "system");
  const [activeTab, setActiveTab] = useState<"general" | "security" | "danger">("general");

  const handleSave = () => {
    updateUserSettings({
      emailNotifications: emailNotif,
      smsNotifications: smsNotif,
      theme: theme as any,
    });
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 font-serif">
      <div className="flex items-center mb-6 space-x-3">
        <SettingsIcon className="w-8 h-8 text-[#1A4331]" />
        <h1 className="text-3xl font-bold text-[#1A4331]">Settings</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab("general")}
              className={`w-full text-left px-4 py-2 font-medium rounded-md transition-colors ${activeTab === "general" ? "text-[#1A4331] bg-[#FDFDF7] border-l-4 border-[#2E7D32]" : "text-gray-600 hover:bg-gray-50"}`}
            >
              General Settings
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-4 py-2 font-medium rounded-md transition-colors ${activeTab === "security" ? "text-[#1A4331] bg-[#FDFDF7] border-l-4 border-[#2E7D32]" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Security
            </button>
            <button 
              onClick={() => setActiveTab("danger")}
              className={`w-full text-left px-4 py-2 font-medium rounded-md transition-colors ${activeTab === "danger" ? "text-[#1A4331] bg-[#FDFDF7] border-l-4 border-[#2E7D32]" : "text-gray-600 hover:bg-gray-50"}`}
            >
              Danger Zone
            </button>
          </nav>
        </div>

        <div className="md:col-span-2 space-y-6">
          {activeTab === "general" && (
            <>
              <Card className="p-6 shadow-sm border border-gray-100 bg-white">
                <div className="flex items-center space-x-3 mb-6">
                  <User className="w-5 h-5 text-gray-400" />
                  <h2 className="text-xl font-semibold text-[#1A4331]">Profile Information</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <Input value={currentUser.name} disabled className="bg-gray-50" />
                    <p className="text-xs text-gray-500 mt-1">Contact admin to change your primary name.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <Input value={currentUser.email} disabled className="bg-gray-50" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <Input value={currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} disabled className="bg-gray-50" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-sm border border-gray-100 bg-white">
                <div className="flex items-center space-x-3 mb-6">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <h2 className="text-xl font-semibold text-[#1A4331]">Notification Preferences</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive updates about your reports via email.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={emailNotif} 
                      onChange={(e) => setEmailNotif(e.target.checked)} 
                      className="w-5 h-5 accent-[#1A4331] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-500">Get text messages for high-urgency updates.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={smsNotif} 
                      onChange={(e) => setSmsNotif(e.target.checked)} 
                      className="w-5 h-5 accent-[#1A4331] rounded cursor-pointer"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6 shadow-sm border border-gray-100 bg-white">
                <h2 className="text-xl font-semibold text-[#1A4331] mb-6">Appearance</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <select 
                      className="w-full sm:w-1/2 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-[#1A4331] hover:bg-[#112d21] text-white">
                  Save Changes
                </Button>
              </div>
            </>
          )}

          {activeTab === "security" && (
            <Card className="p-6 shadow-sm border border-gray-100 bg-white space-y-6">
              <h2 className="text-xl font-semibold text-[#1A4331]">Security Settings</h2>
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <Button onClick={() => toast.success("Password updated successfully.")} className="bg-[#1A4331] text-white hover:bg-[#112d21] mt-2">
                    Update Password
                  </Button>
                </div>
              </div>
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account.</p>
                <Button variant="outline" onClick={() => toast.success("2FA setup initiated.")}>
                  Enable 2FA
                </Button>
              </div>
            </Card>
          )}

          {activeTab === "danger" && (
            <Card className="p-6 shadow-sm border border-red-200 bg-red-50 space-y-6">
              <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>
              <p className="text-sm text-red-800">Once you delete your account, there is no going back. Please be certain.</p>
              <div className="border-t border-red-200 pt-4">
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    toast("Are you absolutely sure you want to delete your account? This action cannot be undone.", {
                      action: {
                        label: "Delete",
                        onClick: () => toast.error("Account deletion requested. Please contact support to finalize.")
                      },
                      cancel: { label: "Cancel", onClick: () => {} }
                    });
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Account
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}