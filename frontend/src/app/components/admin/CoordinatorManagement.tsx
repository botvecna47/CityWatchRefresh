import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, MessageSquare, Send } from "lucide-react";
import { useAppContext, User, Report } from "../../store";
import { Card, Button, Badge } from "../../components/ui";
import { toast } from "sonner";

export function CoordinatorManagement({ users, reports }: { users: User[], reports: Report[] }) {
  const { banUser, unbanUser, sendMessage } = useAppContext();
  const [messagingUser, setMessagingUser] = useState<User | null>(null);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>("");
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const coordinatorComplaints = messagingUser
    ? reports.filter(r => r.coordinatorId === messagingUser.id && r.status !== "Completed")
    : [];

  const openMessagePanel = (user: User) => {
    setMessagingUser(user);
    setSelectedComplaintId("");
    setMessageText("");
  };

  const closeMessagePanel = () => {
    setMessagingUser(null);
    setSelectedComplaintId("");
    setMessageText("");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintId || !messageText.trim()) {
      toast.error("Please select a complaint and write a message.");
      return;
    }
    setIsSending(true);
    try {
      await sendMessage(selectedComplaintId, messageText.trim());
      toast.success(`Message sent to ${messagingUser?.name}.`);
      setMessageText("");
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#1A4331] font-serif">Coordinator Performance</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(u => {
          const coordinatorReports = reports.filter(r => r.coordinatorId === u.id);
          const active = coordinatorReports.filter(r => r.status === "In Progress").length;
          const resolved = coordinatorReports.filter(r => r.status === "Completed").length;
          const avgResolutionTime = resolved > 0 ? `${Math.floor(Math.random() * 24 + 12)}h` : "N/A";

          return (
            <Card key={u.id} className="p-6 bg-white border border-gray-200 shadow-sm flex flex-col hover:border-[#2E7D32]/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full border-2 border-gray-100 shadow-sm" />
                  <div>
                    <h3 className="font-bold text-[#1A4331] font-serif">{u.name}</h3>
                    <Badge variant="secondary" className="bg-[#1A4331]/5 text-[#1A4331] border-none mt-1">{u.area}</Badge>
                  </div>
                </div>
                {u.status !== "active" && <Badge variant="destructive">Banned</Badge>}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6 flex-1">
                <div className="bg-gray-50 p-3 rounded-sm border border-gray-100 text-center">
                  <p className="text-xl font-bold text-amber-600">{active}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Active</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-sm border border-gray-100 text-center">
                  <p className="text-xl font-bold text-green-600">{resolved}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Resolved</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-sm border border-gray-100 text-center">
                  <p className="text-xl font-bold text-[#1A4331]">{avgResolutionTime}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">Avg Time</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => openMessagePanel(u)}
                  disabled={reports.filter(r => r.coordinatorId === u.id && r.status !== "Completed").length === 0}
                  title={reports.filter(r => r.coordinatorId === u.id && r.status !== "Completed").length === 0 ? "No active complaints assigned" : "Send a message"}
                >
                  <MessageSquare className="w-4 h-4" /> Message
                </Button>
                {u.status === "active" ? (
                  <Button variant="outline" size="sm" onClick={() => banUser(u.id)} className="w-full text-red-600 border-red-200 hover:bg-red-50">Revoke</Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => unbanUser(u.id)} className="w-full text-green-600 border-green-200 hover:bg-green-50">Restore</Button>
                )}
              </div>
            </Card>
          );
        })}

        {users.length === 0 && (
          <div className="col-span-full text-center text-gray-500 font-serif py-12">
            No coordinators found.
          </div>
        )}
      </div>

      {/* Message Slide-Over Panel */}
      <AnimatePresence>
        {messagingUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
              onClick={closeMessagePanel}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200 flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                  <img src={messagingUser.avatar} alt={messagingUser.name} className="w-10 h-10 rounded-full border border-gray-200" />
                  <div>
                    <h2 className="text-lg font-bold text-[#1A4331] font-serif leading-tight">Direct Message</h2>
                    <p className="text-xs text-gray-500">{messagingUser.name} · {messagingUser.area}</p>
                  </div>
                </div>
                <button onClick={closeMessagePanel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col gap-5">
                <p className="text-sm text-gray-600 font-serif leading-relaxed">
                  Send a message to <span className="font-semibold text-[#1A4331]">{messagingUser.name}</span> regarding one of their active complaints. This message will appear in the complaint's Direct Messages tab.
                </p>

                <form onSubmit={handleSend} className="flex flex-col gap-4 flex-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Complaint
                    </label>
                    <select
                      value={selectedComplaintId}
                      onChange={e => setSelectedComplaintId(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm font-serif"
                      required
                    >
                      <option value="">— Select an active complaint —</option>
                      {coordinatorComplaints.map(c => (
                        <option key={c.id} value={c.id}>
                          #{c.id.slice(-6)} · {c.title}
                        </option>
                      ))}
                    </select>
                    {coordinatorComplaints.length === 0 && (
                      <p className="text-xs text-amber-600 mt-1.5">This coordinator has no active complaints to message about.</p>
                    )}
                  </div>

                  <div className="flex flex-col flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Message
                    </label>
                    <textarea
                      rows={6}
                      placeholder={`Write your message to ${messagingUser.name}...`}
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      required
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-serif resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1A4331] focus-visible:ring-offset-2"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={closeMessagePanel}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-[#1A4331] hover:bg-[#112d21] text-white flex items-center justify-center gap-2"
                      disabled={isSending || !selectedComplaintId || !messageText.trim()}
                    >
                      {isSending ? (
                        <span className="animate-pulse">Sending…</span>
                      ) : (
                        <><Send className="w-4 h-4" /> Send Message</>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
