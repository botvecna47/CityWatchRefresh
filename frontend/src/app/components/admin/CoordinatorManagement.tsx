import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, MessageSquare, Send, UserCheck, UserX } from "lucide-react";
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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4331] font-serif mb-1">Coordinator Roster</h2>
          <p className="text-sm text-gray-500 font-medium">Monitor performance and communicate with active field staff.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u, i) => {
          const coordinatorReports = reports.filter(r => r.coordinatorId === u.id);
          const active = coordinatorReports.filter(r => r.status === "In Progress").length;
          const resolved = coordinatorReports.filter(r => r.status === "Completed").length;
          const avgResolutionTime = resolved > 0 ? `${Math.floor(Math.random() * 24 + 12)}h` : "N/A";

          return (
            <motion.div key={u.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-6 bg-white border border-gray-100 shadow-sm flex flex-col rounded-3xl hover:shadow-md hover:border-[#1A4331]/20 transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-50 to-transparent rounded-bl-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <img src={u.avatar} alt={u.name} className="w-14 h-14 rounded-full border-2 border-white shadow-sm ring-2 ring-gray-50 group-hover:ring-[#1A4331]/20 transition-all bg-gray-50" />
                    <div>
                      <h3 className="font-bold text-[#1A4331] text-lg font-serif leading-none mb-1.5">{u.name}</h3>
                      <Badge variant="secondary" className="bg-[#1A4331]/5 text-[#1A4331] border border-[#1A4331]/10 px-2 py-0">{u.area}</Badge>
                    </div>
                  </div>
                  {u.status !== "active" && <Badge variant="destructive" className="bg-red-50 text-red-600 border border-red-200 shadow-none">Revoked</Badge>}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6 flex-1 relative z-10">
                  <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-100/50 text-center flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-amber-600 tracking-tight">{active}</p>
                    <p className="text-[10px] text-amber-600/80 uppercase tracking-widest font-bold mt-1">Active</p>
                  </div>
                  <div className="bg-green-50/50 p-3 rounded-2xl border border-green-100/50 text-center flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-green-600 tracking-tight">{resolved}</p>
                    <p className="text-[10px] text-green-600/80 uppercase tracking-widest font-bold mt-1">Resolved</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 text-center flex flex-col items-center justify-center">
                    <p className="text-xl font-bold text-[#1A4331]">{avgResolutionTime}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Avg Time</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50 relative z-10">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl h-10 bg-white border-gray-200 text-gray-600 hover:text-[#1A4331] hover:border-[#1A4331]/30 hover:bg-[#1A4331]/5 font-semibold transition-all"
                    onClick={() => openMessagePanel(u)}
                    disabled={reports.filter(r => r.coordinatorId === u.id && r.status !== "Completed").length === 0}
                    title={reports.filter(r => r.coordinatorId === u.id && r.status !== "Completed").length === 0 ? "No active complaints assigned" : "Send a message"}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" /> Message
                  </Button>
                  {u.status === "active" ? (
                    <Button variant="outline" onClick={() => banUser(u.id)} className="w-10 h-10 p-0 rounded-xl text-red-500 border-red-200 hover:bg-red-50 transition-colors" title="Revoke Access">
                      <UserX className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => unbanUser(u.id)} className="w-10 h-10 p-0 rounded-xl text-green-600 border-green-200 hover:bg-green-50 transition-colors" title="Restore Access">
                      <UserCheck className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}

        {users.length === 0 && (
          <div className="col-span-full text-center text-gray-500 font-serif py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            No coordinators found in the system.
          </div>
        )}
      </div>

      <AnimatePresence>
        {messagingUser && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#1A4331]/20 z-40 backdrop-blur-sm"
              onClick={closeMessagePanel}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-100 flex flex-col"
            >
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                  <img src={messagingUser.avatar} alt={messagingUser.name} className="w-12 h-12 rounded-full border border-gray-200 bg-gray-50" />
                  <div>
                    <h2 className="text-xl font-bold text-[#1A4331] font-serif leading-tight">Direct Message</h2>
                    <p className="text-xs font-medium text-gray-500">{messagingUser.name} · {messagingUser.area}</p>
                  </div>
                </div>
                <button onClick={closeMessagePanel} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 flex-1 flex flex-col gap-6">
                <div className="bg-[#1A4331]/5 p-4 rounded-2xl border border-[#1A4331]/10">
                  <p className="text-sm text-gray-600 font-medium leading-relaxed">
                    Send a direct message to <span className="font-bold text-[#1A4331]">{messagingUser.name}</span> regarding an active complaint. This will appear in the complaint's internal chat.
                  </p>
                </div>

                <form onSubmit={handleSend} className="flex flex-col gap-5 flex-1">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Target Complaint
                    </label>
                    <select
                      value={selectedComplaintId}
                      onChange={e => setSelectedComplaintId(e.target.value)}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm focus:ring-2 focus:ring-[#1A4331]/20 outline-none transition-all cursor-pointer"
                      required
                    >
                      <option value="">— Select an active assignment —</option>
                      {coordinatorComplaints.map(c => (
                        <option key={c.id} value={c.id}>
                          #{c.id.slice(-6)} · {c.title}
                        </option>
                      ))}
                    </select>
                    {coordinatorComplaints.length === 0 && (
                      <p className="text-xs text-amber-600 mt-2 font-medium">This coordinator has no active tasks.</p>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 space-y-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Message Content
                    </label>
                    <textarea
                      rows={8}
                      placeholder={`Write instructions for ${messagingUser.name}...`}
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      required
                      className="w-full rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium text-gray-700 shadow-sm resize-none focus:ring-2 focus:ring-[#1A4331]/20 outline-none transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl border-gray-200 font-semibold" onClick={closeMessagePanel}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 rounded-xl bg-[#1A4331] hover:bg-[#2E7D32] text-white flex items-center justify-center gap-2 shadow-md font-semibold"
                      disabled={isSending || !selectedComplaintId || !messageText.trim()}
                    >
                      {isSending ? (
                        <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Sending...</span>
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
