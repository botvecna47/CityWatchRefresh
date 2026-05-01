import { Lock, Shield, Smartphone, LogOut } from "lucide-react";
import { Card, Input, Button } from "../ui";
import { toast } from "sonner";

export function SecurityTab({
  currentPw, setCurrentPw,
  newPw, setNewPw,
  confirmPw, setConfirmPw,
  handleChangePassword
}: any) {
  return (
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
  );
}
