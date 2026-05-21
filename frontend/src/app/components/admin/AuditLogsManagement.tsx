import { useEffect } from "react";
import { useAdmin } from "../../contexts/AdminContext";
import { formatDistanceToNow } from "date-fns";
import { Shield, Trash2, UserCheck, RefreshCw, ClipboardList } from "lucide-react";
import { cn } from "../ui";

const ACTION_META: Record<string, { label: string; icon: JSX.Element; color: string }> = {
  SUSPEND_USER:   { label: "User Suspended",   icon: <Shield className="w-4 h-4" />,    color: "text-red-600 bg-red-50 border-red-200" },
  REINSTATE_USER: { label: "User Reinstated",  icon: <UserCheck className="w-4 h-4" />, color: "text-green-700 bg-green-50 border-green-200" },
  DELETE_REPORT:  { label: "Report Deleted",   icon: <Trash2 className="w-4 h-4" />,    color: "text-amber-700 bg-amber-50 border-amber-200" },
};

export function AuditLogsManagement() {
  const { auditLogs, auditLogsLoading, refreshAuditLogs } = useAdmin();

  useEffect(() => {
    refreshAuditLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1A4331]" style={{ fontFamily: "Playfair Display, serif" }}>
            Audit Logs
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            A record of every moderation action taken by admins.
          </p>
        </div>
        <button
          onClick={refreshAuditLogs}
          disabled={auditLogsLoading}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border border-[#1A4331]/20 text-[#1A4331] hover:bg-[#1A4331] hover:text-white transition-all"
        >
          <RefreshCw className={cn("w-4 h-4", auditLogsLoading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {auditLogsLoading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-[#2E7D32]" />
            <p className="text-sm">Loading audit logs...</p>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-3">
            <ClipboardList className="w-10 h-10 text-gray-300" />
            <p className="text-sm font-medium">No audit logs yet.</p>
            <p className="text-xs text-gray-400">Admin actions like suspensions and report deletions will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 font-semibold text-[#1A4331] text-xs uppercase tracking-wider">Time</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#1A4331] text-xs uppercase tracking-wider">Action</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#1A4331] text-xs uppercase tracking-wider">Entity</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#1A4331] text-xs uppercase tracking-wider">Change</th>
                  <th className="text-left px-5 py-3 font-semibold text-[#1A4331] text-xs uppercase tracking-wider">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {auditLogs.map(log => {
                  const meta = ACTION_META[log.action];
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap text-xs">
                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                          meta?.color ?? "text-gray-600 bg-gray-100 border-gray-200"
                        )}>
                          {meta?.icon}
                          {meta?.label ?? log.action.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-500 font-medium">{log.entityType}</span>
                        <span className="mx-1.5 text-gray-300">·</span>
                        <code className="text-xs text-[#1A4331] font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          {log.entityId}
                        </code>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 text-xs">
                          {log.oldValue && (
                            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded font-medium border border-red-100">
                              {log.oldValue}
                            </span>
                          )}
                          {log.oldValue && log.newValue && (
                            <span className="text-gray-400">→</span>
                          )}
                          {log.newValue && (
                            <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded font-medium border border-green-100">
                              {log.newValue}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs font-medium">
                        {log.user?.username ?? "System"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
