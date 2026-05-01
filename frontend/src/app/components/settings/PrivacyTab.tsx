import { Download, Globe, Trash2 } from "lucide-react";
import { Card, Button } from "../ui";
import { SettingRow } from "./SettingRow";
import { Toggle } from "./Toggle";
import { toast } from "sonner";

export function PrivacyTab() {
  return (
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
  );
}
