import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowBigUp, MapPin, MessageSquare, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { useAppContext, Comment } from "../store";
import { Button, Textarea, Badge, cn } from "../components/ui";
import { StatusBadge } from "../components/feed/FeedItem";
import { toast } from "sonner";
import { apiClient as api } from "../api/apiClient";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";

import { CommentsTab } from "../components/report/CommentsTab";
import { MessagesTab } from "../components/report/MessagesTab";

export function ReportSidebarOverlay() {
  const navigate = useNavigate();
  const {
    reports, currentUser, updateReport, addComment, submitSpamReport,
    handleVote: voteOnServer, selectedReportId, setSelectedReportId, fetchMessages, fetchComments, citizenResolve
  } = useAppContext() as any;

  const report = reports.find(r => r.id === selectedReportId);

  const [commentText, setCommentText] = useState("");
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [showSpamModal, setShowSpamModal] = useState(false);
  const [spamReason, setSpamReason] = useState("");
  const [activeTab, setActiveTab] = useState<'comments' | 'messages'>('comments');
  const [messageText, setMessageText] = useState("");
  const [isReopening, setIsReopening] = useState(false);
  const [reopenReason, setReopenReason] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyRejectReason, setVerifyRejectReason] = useState("");

  const handleSupervisorVerify = async (approved: boolean) => {
    if (!report) return;
    if (!approved && !verifyRejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    setIsVerifying(true);
    try {
      await api.post(`/api/supervisor/complaints/${report.id}/verify?approved=${approved}&reason=${encodeURIComponent(verifyRejectReason)}`);
      toast.success(approved ? "Proof verified and completed!" : "Proof rejected and sent back.");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to verify proof");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  useEffect(() => {
    setHasUpvoted(false);
    setCommentText("");
    setMessageText("");
    setActiveTab('comments');
    if (selectedReportId) {
      if (fetchComments) {
        fetchComments(selectedReportId);
      }
    }
  }, [selectedReportId, fetchComments]);

  if (!report) return null;

  const handleVote = async () => {
    if (!currentUser) { toast.error("Please sign in to upvote."); navigate("/auth"); return; }
    if (currentUser.role === "admin") { toast.error("Admins cannot upvote complaints."); return; }
    if (hasUpvoted) { toast.info("You have already upvoted this complaint."); return; }
    await voteOnServer(report.id, currentUser.id);
    setHasUpvoted(true);
    toast.success("Upvote recorded — thank you!");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { toast.error("Please sign in to comment."); navigate("/auth"); return; }
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      authorId: currentUser.id,
      authorName: currentUser.name,
      content: commentText,
      createdAt: new Date().toISOString(),
    };
    addComment(report.id, newComment);
    setCommentText("");
    toast.success("Comment posted!");
  };

  const confirmReportSpam = () => {
    if (!currentUser || !spamReason.trim()) return;
    submitSpamReport({ reporterId: currentUser.id, reporterName: currentUser.name, targetType: "report", targetId: report.id, reason: spamReason });
    setShowSpamModal(false);
    setSpamReason("");
    toast.success("Spam report submitted.");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      await useAppContext().sendMessage(report.id, messageText);
      setMessageText("");
    } catch (e) {}
  };

  const canUpvote = !!currentUser && currentUser.role !== "admin";
  const isCitizenAssigned = currentUser?.role === 'citizen' && currentUser.id === report.authorId && report.coordinatorId;
  const isCoordinatorAssigned = currentUser?.role === 'coordinator' && currentUser.id === report.coordinatorId;
  const showMessagesTab = isCitizenAssigned || isCoordinatorAssigned || currentUser?.role === 'admin';

  return (
    <>
      <Sheet open={!!selectedReportId} onOpenChange={(open) => { if (!open) setSelectedReportId(null); }}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto border-l border-gray-100 bg-white shadow-xl p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{report.title}</SheetTitle>
            <SheetDescription>{report.description}</SheetDescription>
          </SheetHeader>

          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 pt-5 pb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={report.authorAvatar}
                alt={report.authorName}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-gray-200"
              />
              <div className="min-w-0">
                <p className="font-semibold text-[#1A4331] text-sm leading-tight truncate">{report.authorName}</p>
                <p className="text-xs text-gray-400">{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={report.status} />
              <Badge className="bg-[#1A4331]/10 text-[#1A4331] border border-[#1A4331]/20 text-xs">{report.area}</Badge>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center gap-0.5 flex-shrink-0 mt-0.5">
                <button
                  onClick={handleVote}
                  disabled={!canUpvote}
                  className={cn(
                    "p-1 rounded transition-colors",
                    canUpvote
                      ? hasUpvoted
                        ? "text-[#2E7D32] bg-green-50"
                        : "text-gray-300 hover:text-[#2E7D32] hover:bg-green-50"
                      : "text-gray-200 cursor-not-allowed"
                  )}
                  title={!canUpvote ? "Admins cannot upvote" : hasUpvoted ? "Already upvoted" : "Upvote"}
                >
                  <ArrowBigUp className="w-6 h-6" />
                </button>
                <span className="text-xs font-bold text-[#1A4331] tabular-nums">{report.upvotes}</span>
              </div>
              <h2 className="text-lg font-bold text-[#1A4331] leading-snug" style={{ fontFamily: "Playfair Display, serif" }}>
                {report.title}
              </h2>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed">{report.description}</p>

            {report.image && (
              <div className="rounded-md overflow-hidden border border-gray-100 bg-gray-50">
                <img src={report.image} alt={report.title} className="w-full h-48 sm:h-56 object-cover" />
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1 bg-gray-50 border border-gray-100 px-2 py-1 rounded-sm">
                <MapPin className="w-3 h-3 text-red-400" />{report.locationText}
              </span>
              <span className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-sm border",
                report.urgency === "High" ? "bg-red-50 text-red-600 border-red-100" :
                report.urgency === "Medium" ? "bg-amber-50 text-amber-600 border-amber-100" :
                "bg-blue-50 text-blue-600 border-blue-100"
              )}>
                <AlertTriangle className="w-3 h-3" />{report.urgency} Urgency
              </span>
            </div>

            <div className="rounded-sm overflow-hidden border border-gray-200 h-36 z-0 relative">
              <MapContainer
                center={[report.lat, report.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[report.lat, report.lng]} />
              </MapContainer>
              <div className="absolute bottom-1 right-1 bg-white/80 text-[9px] text-gray-500 px-1 rounded z-[1000] pointer-events-none">&copy; OSM</div>
            </div>

            {(report.status === "Reopened" || report.status === "Completed" || report.status === "Closed") && report.reopenReason && (
              <div className={`p-3 border rounded-sm ${report.status === "Reopened" ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
                <p className={`text-xs font-bold uppercase mb-1 flex items-center gap-1 ${report.status === "Reopened" ? "text-red-800" : "text-green-800"}`}>
                  {report.status === "Reopened" ? <><AlertTriangle className="w-3 h-3"/> Supervisor Rejected</> : <><CheckCircle2 className="w-3 h-3"/> Supervisor Remarks</>}
                </p>
                <p className={`text-sm font-medium ${report.status === "Reopened" ? "text-red-900" : "text-green-900"}`}>
                  {report.status === "Reopened" ? "Reason: " : ""}{report.reopenReason}
                </p>
              </div>
            )}

            <button
              onClick={() => { setSelectedReportId(null); navigate(`/report/${report.id}`); }}
              className="w-full flex items-center justify-center gap-2 text-sm text-[#1A4331] border border-[#1A4331]/20 hover:bg-[#1A4331]/5 rounded-sm py-2 transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" /> View Full Detail
            </button>

            {currentUser?.role === "coordinator" && (
              <div className="flex flex-wrap gap-2 pt-1">
                {report.status === "Reported" && (
                  <Button size="sm" onClick={() => updateReport(report.id, { status: "In Progress", coordinatorId: currentUser.id })} className="bg-[#1A4331] text-white hover:bg-[#112d21] text-xs">
                    Mark In Progress
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setShowSpamModal(true)} className="text-red-600 border-red-200 hover:bg-red-50 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" /> Flag Spam
                </Button>
              </div>
            )}

            {report.proofImage && (report.status === "Completed" || report.status === "Pending Verification") && (
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-sm">
                <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-amber-600" /> Resolution Proof</h4>
                
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <div className="w-full">
                    <h5 className="text-xs font-bold text-amber-700 uppercase mb-2">Visual Proof</h5>
                    <img src={report.proofImage} alt="Proof" className="w-full h-32 sm:h-48 object-cover rounded-sm border border-amber-200" />
                  </div>
                  {report.resolutionPdfUrl && (
                    <div className="w-full">
                      <h5 className="text-xs font-bold text-amber-700 uppercase mb-2">Resolution PDF</h5>
                      <div className="w-full h-32 sm:h-48 bg-white rounded-sm border border-amber-200 overflow-hidden">
                        <iframe src={report.resolutionPdfUrl} className="w-full h-full" title="PDF Proof" />
                      </div>
                    </div>
                  )}
                </div>

                {currentUser?.role === "supervisor" && report.status === "Pending Verification" && (
                  <div className="mt-4 pt-4 border-t border-amber-200 flex flex-col gap-3">
                    <p className="text-sm text-amber-900 font-semibold">Supervisor Verification Required</p>
                    <textarea 
                      className="w-full border border-gray-200 rounded-md p-2 text-xs focus:ring-2 focus:ring-amber-500 min-h-[40px]"
                      placeholder="Rejection reason (if rejecting)..."
                      value={verifyRejectReason}
                      onChange={(e) => setVerifyRejectReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleSupervisorVerify(false)} disabled={isVerifying} variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-xs h-9">
                        Reject
                      </Button>
                      <Button onClick={() => handleSupervisorVerify(true)} disabled={isVerifying} className="flex-1 bg-green-600 text-white hover:bg-green-700 text-xs h-9">
                        Approve
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-4 border-b border-gray-100 mb-4 pb-2">
                <button 
                  onClick={() => setActiveTab('comments')}
                  className={cn("text-sm font-bold flex items-center gap-2", activeTab === 'comments' ? "text-[#1A4331] border-b-2 border-[#1A4331] pb-2 -mb-[9px]" : "text-gray-400")}
                >
                  <MessageSquare className="w-4 h-4" /> Comments
                </button>
                {showMessagesTab && (
                  <button 
                    onClick={() => { setActiveTab('messages'); fetchMessages(report.id); }}
                    className={cn("text-sm font-bold flex items-center gap-2", activeTab === 'messages' ? "text-[#1A4331] border-b-2 border-[#1A4331] pb-2 -mb-[9px]" : "text-gray-400")}
                  >
                    Direct Messages
                  </button>
                )}
              </div>

              {activeTab === 'comments' ? (
                <CommentsTab 
                  report={report} 
                  currentUser={currentUser} 
                  commentText={commentText} 
                  setCommentText={setCommentText} 
                  handleAddComment={handleAddComment} 
                />
              ) : (
                <MessagesTab 
                  report={report} 
                  currentUser={currentUser} 
                  messageText={messageText} 
                  setMessageText={setMessageText} 
                  handleSendMessage={handleSendMessage} 
                />
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Spam Report Sheet */}
      <Sheet open={showSpamModal} onOpenChange={setShowSpamModal}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 font-serif text-[#1A4331]">
              <AlertTriangle className="text-red-500 w-5 h-5" /> Flag as Spam
            </SheetTitle>
          </SheetHeader>
          <div className="py-5">
            <p className="text-sm text-gray-600 mb-3">Describe why this report should be flagged as spam or abuse.</p>
            <Textarea
              placeholder="Reason for reporting..."
              value={spamReason}
              onChange={e => setSpamReason(e.target.value)}
              className="mb-4"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowSpamModal(false)}>Cancel</Button>
              <Button size="sm" onClick={confirmReportSpam} disabled={!spamReason.trim()} className="bg-red-600 text-white hover:bg-red-700">
                Submit Report
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
