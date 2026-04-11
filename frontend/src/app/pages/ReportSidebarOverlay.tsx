import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowBigUp, MapPin, MessageSquare, AlertTriangle, CheckCircle2, ExternalLink } from "lucide-react";
import { useAppContext, Comment } from "../store";
import { Button, Textarea, Badge, Skeleton, cn } from "../components/ui";
import { StatusBadge } from "./Home";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "../components/ui/sheet";

export function ReportSidebarOverlay() {
  const navigate = useNavigate();
  const {
    reports, currentUser, updateReport, addComment, submitSpamReport,
    handleVote: voteOnServer, selectedReportId, setSelectedReportId
  } = useAppContext();

  const report = reports.find(r => r.id === selectedReportId);

  const [commentText, setCommentText] = useState("");
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [showSpamModal, setShowSpamModal] = useState(false);
  const [spamReason, setSpamReason] = useState("");

  useEffect(() => {
    // Fix default Leaflet icon URLs
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);

  // Reset state when switching reports
  useEffect(() => {
    setHasUpvoted(false);
    setCommentText("");
  }, [selectedReportId]);

  if (!report) return null;

  const handleVote = async () => {
    if (!currentUser) { toast.error("Please sign in to upvote."); navigate("/auth"); return; }
    if (currentUser.role === "admin") { toast.error("Admins cannot upvote complaints."); return; }
    if (hasUpvoted) { toast.info("You have already upvoted this complaint."); return; }
    await voteOnServer(report.id);
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
      text: commentText,
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

  const canUpvote = !!currentUser && currentUser.role !== "admin";

  return (
    <>
      <Sheet open={!!selectedReportId} onOpenChange={(open) => { if (!open) setSelectedReportId(null); }}>
        {/* SheetContent itself scrolls — no nested flex containers */}
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto border-l border-gray-100 bg-white shadow-xl p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{report.title}</SheetTitle>
            <SheetDescription>{report.description}</SheetDescription>
          </SheetHeader>

          {/* Sticky author header */}
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

          {/* Scrollable content */}
          <div className="px-5 py-4 space-y-4">
            {/* Title + upvote */}
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

            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">{report.description}</p>

            {/* Image */}
            {report.image && (
              <div className="rounded-md overflow-hidden border border-gray-100 bg-gray-50">
                <img src={report.image} alt={report.title} className="w-full object-cover max-h-52" />
              </div>
            )}

            {/* Meta tags */}
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

            {/* Mini Map */}
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

            {/* View full detail button */}
            <button
              onClick={() => { setSelectedReportId(null); navigate(`/report/${report.id}`); }}
              className="w-full flex items-center justify-center gap-2 text-sm text-[#1A4331] border border-[#1A4331]/20 hover:bg-[#1A4331]/5 rounded-sm py-2 transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" /> View Full Detail
            </button>

            {/* Coordinator actions */}
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

            {/* Resolution proof */}
            {report.proofImage && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-sm">
                <p className="font-bold text-green-900 text-sm mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Resolution Proof
                </p>
                <img src={report.proofImage} alt="Proof" className="w-full h-auto rounded-sm border border-green-200 max-h-40 object-cover" />
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-bold text-[#1A4331] mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#2E7D32]" />
                Comments
                <span className="ml-auto text-xs font-normal text-gray-400">{report.comments.length}</span>
              </h3>

              <div className="space-y-3 mb-4">
                {report.comments.map(comment => (
                  <div key={comment.id} className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#1A4331]/10 flex items-center justify-center flex-shrink-0 text-[#1A4331] font-bold text-xs border border-[#1A4331]/10">
                      {comment.authorName.charAt(0)}
                    </div>
                    <div className="flex-1 bg-gray-50 p-2.5 rounded-sm border border-gray-100 text-sm">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-[#1A4331] text-xs">{comment.authorName}</span>
                        <span className="text-[10px] text-gray-400">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
                {report.comments.length === 0 && (
                  <p className="text-gray-400 text-xs text-center py-3 italic bg-gray-50 rounded-sm">No comments yet.</p>
                )}
              </div>

              {currentUser ? (
                <form onSubmit={handleAddComment} className="flex flex-col gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                  />
                  <Button type="submit" size="sm" className="self-end" disabled={!commentText.trim()}>Post Comment</Button>
                </form>
              ) : (
                <div className="p-3 bg-gray-50 border border-gray-100 text-center rounded-sm">
                  <p className="text-gray-500 text-xs mb-2">Sign in to leave a comment.</p>
                  <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
                </div>
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
