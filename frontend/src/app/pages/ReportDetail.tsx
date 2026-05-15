import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, ArrowBigUp, MapPin, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { ImageLightbox } from "../components/ImageLightbox";
import { useAppContext, Comment } from "../store";
import { Card, Button, Badge, Skeleton, cn } from "../components/ui";

import { StatusBadge } from "../components/feed/FeedItem";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ReportComments } from "../components/report/ReportComments";
import { SpamReportModal } from "../components/report/SpamReportModal";

export function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports, currentUser, updateReport, addComment, submitSpamReport, setReports, loading, handleVote: voteOnServer, users, assignCoordinatorToReport, fetchComments } = useAppContext();
  
  const isCitizen = currentUser?.role === 'citizen';
  const isCoordinator = currentUser?.role === 'coordinator';
  const isAdmin = currentUser?.role === 'admin';

  const report = reports.find(r => r.id === id);
  const hasUpvoted = !!(isCitizen && currentUser && report?.upvotedCitizenIds?.includes(currentUser.id));
  const coordinators = users.filter(u => u.role === 'coordinator');
  
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState("");
  const [commentText, setCommentText] = useState("");
  const [showSpamModal, setShowSpamModal] = useState(false);
  const [spamReason, setSpamReason] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const allImages = [
    ...(report?.image ? [report.image] : []),
    ...(report?.additionalImages || []),
  ].filter(Boolean);

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  useEffect(() => {
    if (id && (!report?.comments || report.comments.length === 0)) {
      fetchComments(id);
    }
  }, [id]);

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold text-[#1A4331] mb-2 font-serif">Report Not Found</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">We couldn't find the issue you're looking for. It may have been deleted or resolved permanently.</p>
        <Link to="/">
          <Button variant="secondary" className="gap-2"><ArrowLeft className="w-4 h-4" /> Back to Feed</Button>
        </Link>
      </div>
    );
  }

  const handleVote = async (type: 'up' | 'down') => {
    if (!currentUser) { toast.error("Please sign in to upvote."); navigate("/auth"); return; }
    if (!isCitizen) { toast.error("Only citizens can upvote complaints."); return; }
    if (type !== 'up') return;
    await voteOnServer(report.id, currentUser.id);
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
      createdAt: new Date().toISOString()
    };
    addComment(report.id, newComment);
    setCommentText("");
  };

  const handleReportSpam = () => {
    if (!currentUser) return;
    setShowSpamModal(true);
  };

  const confirmReportSpam = () => {
    if (!currentUser || !spamReason.trim()) return;
    submitSpamReport({
      reporterId: currentUser.id,
      reporterName: currentUser.name,
      targetType: "report",
      targetId: report.id,
      reason: spamReason
    });
    setShowSpamModal(false);
    setSpamReason("");
  };

  const handleDelete = () => {
    toast("Are you sure you want to completely remove this report?", {
      action: {
        label: "Delete",
        onClick: () => {
          setReports(prev => prev.filter(r => r.id !== report.id));
          toast.success("Report deleted.");
          navigate("/");
        }
      },
      cancel: { label: "Cancel", onClick: () => {} }
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-[#1A4331] hover:text-[#2E7D32] transition-colors font-medium text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Feed
      </Link>

      {loading ? (
        <Card className="overflow-hidden bg-white shadow-md border-gray-200 flex p-6 animate-pulse">
          <div className="w-16 flex-col gap-4"><Skeleton className="w-8 h-8 rounded" /><Skeleton className="w-8 h-4 rounded mt-4" /></div>
          <div className="flex-1 px-4 space-y-4">
            <div className="flex items-center gap-4"><Skeleton className="w-12 h-12 rounded-full" /><div><Skeleton className="w-32 h-5 rounded mb-2" /><Skeleton className="w-24 h-4 rounded" /></div></div>
            <Skeleton className="w-full h-8 rounded" /><Skeleton className="w-full h-32 rounded" /><Skeleton className="w-full h-64 rounded" />
          </div>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden bg-white shadow-md border-gray-200">
            <div className="flex flex-col md:flex-row">
              <div className="hidden md:flex w-16 bg-gray-50 flex-col items-center py-6 border-r border-gray-100 gap-2">
                {isCitizen ? (
                  <button onClick={() => handleVote('up')} className={cn("p-2 transition-colors rounded hover:bg-gray-200", hasUpvoted ? "text-[#2E7D32]" : "text-gray-400 hover:text-[#2E7D32]")}>
                    <ArrowBigUp className="w-8 h-8" />
                  </button>
                ) : <ArrowBigUp className="w-8 h-8 text-gray-300" />}
                <span className="text-lg font-bold text-[#1A4331]">{report.upvotes}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">votes</span>
              </div>

              <div className="flex-1 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4 flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <img src={report.authorAvatar} alt={report.authorName} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                    <div>
                      <h3 className="font-semibold text-[#1A4331] text-lg leading-tight">{report.authorName}</h3>
                      <span className="text-sm text-gray-500">Reported {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        {report.status !== 'Completed' && report.status !== 'Closed' && (
                          <>
                            <select className="h-8 rounded-sm border border-input bg-background px-2 text-xs font-serif" value={selectedCoordinatorId} onChange={(e) => setSelectedCoordinatorId(e.target.value)}>
                              <option value="" disabled>Assign Coordinator...</option>
                              {coordinators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <Button size="sm" onClick={() => assignCoordinatorToReport(report.id, selectedCoordinatorId)} disabled={!selectedCoordinatorId} className="h-8 bg-[#1A4331] text-white hover:bg-[#112d21]">Assign</Button>
                          </>
                        )}
                        <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 border-red-200 hover:bg-red-50 h-8"><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
                      </div>
                    )}
                    {isCoordinator && report.status !== 'Completed' && (!report.coordinatorId || report.coordinatorId === currentUser?.id) && (
                      <Button size="sm" onClick={() => updateReport(report.id, { status: "In Progress", coordinatorId: currentUser!.id })} className="bg-[#1A4331] text-white hover:bg-[#112d21]">
                        {report.status === 'Reported' ? 'Accept & Start' : 'Mark In Progress'}
                      </Button>
                    )}
                    {isCoordinator && (
                      <Button variant="outline" size="sm" onClick={handleReportSpam} className="text-red-600 border-red-200 hover:bg-red-50"><AlertTriangle className="w-4 h-4 mr-1" /> Flag Spam</Button>
                    )}
                    <StatusBadge status={report.status} />
                    <Badge className="bg-[#1A4331]/10 text-[#1A4331] border border-[#1A4331]/20">{report.area}</Badge>
                  </div>
                </div>

                <h1 className="text-3xl font-bold mb-4 text-[#1A4331] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{report.title}</h1>
                <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed mb-6 font-serif">{report.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                  {report.image && (
                    <div className="rounded-sm overflow-hidden bg-gray-100 border border-gray-200 shadow-inner col-span-2 md:col-span-3 cursor-zoom-in group relative" onClick={() => setLightboxIndex(0)}>
                      <img src={report.image} alt={report.title} className="w-full h-auto object-cover max-h-[400px] group-hover:brightness-90 transition-all duration-300" />
                    </div>
                  )}
                  {report.additionalImages?.map((img, i) => (
                    <div key={i} className="rounded-sm overflow-hidden bg-gray-100 border border-gray-200 shadow-inner cursor-zoom-in group relative" onClick={() => setLightboxIndex(i + (report.image ? 1 : 0))}>
                      <img src={img} alt={`Additional ${i}`} className="w-full h-32 md:h-48 object-cover group-hover:brightness-90 transition-all duration-300" />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 items-center text-sm font-medium text-gray-600 mb-6 p-4 bg-[#FDFDF7] rounded-sm border border-gray-100">
                  <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-red-500" /><span className="text-[#1A4331]">{report.locationText}</span></div>
                  <div className="hidden md:block w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-2"><span className="font-mono text-xs text-gray-500">[{report.lat.toFixed(4)}, {report.lng.toFixed(4)}]</span></div>
                  <div className="hidden md:block w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-2"><AlertTriangle className={`w-5 h-5 ${report.urgency === 'High' ? 'text-red-500' : report.urgency === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`} /><span>{report.urgency} Urgency</span></div>
                </div>

                <div className="mb-8 rounded-sm overflow-hidden border border-gray-200 shadow-inner h-64 z-0 relative">
                  <MapContainer center={[report.lat, report.lng]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[report.lat, report.lng]} />
                  </MapContainer>
                </div>

                {report.proofImage && (
                  <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-sm shadow-sm">
                    <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg font-serif"><CheckCircle2 className="w-6 h-6 text-green-600" /> Resolution Proof</h3>
                    <img src={report.proofImage} alt="Proof" className="w-full h-auto rounded-sm border border-green-300 shadow-sm mb-4" />
                    {report.resolutionLocation && (
                      <p className="text-sm text-green-800 flex items-center gap-2 font-medium"><MapPin className="w-4 h-4" /> Resolved at: {report.resolutionLocation.lat.toFixed(4)}, {report.resolutionLocation.lng.toFixed(4)}</p>
                    )}
                  </div>
                )}

                <div className="flex md:hidden items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                  <button onClick={() => handleVote('up')} className={cn("p-2 rounded-sm border flex items-center gap-2", hasUpvoted ? "text-[#2E7D32] bg-green-50 border-green-200" : "text-gray-400 bg-gray-50 border-gray-200 hover:text-[#2E7D32]")}>
                    <ArrowBigUp className="w-6 h-6" /><span className="text-sm font-semibold">{report.upvotes} upvotes</span>
                  </button>
                </div>

                <ReportComments 
                  report={report} 
                  currentUser={currentUser} 
                  commentText={commentText} 
                  setCommentText={setCommentText} 
                  handleAddComment={handleAddComment} 
                />
              </div>
            </div>
          </Card>

          <AnimatePresence>
            {lightboxIndex !== null && allImages.length > 0 && <ImageLightbox images={allImages} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />}
          </AnimatePresence>

          <AnimatePresence>
            <SpamReportModal 
              showSpamModal={showSpamModal} 
              setShowSpamModal={setShowSpamModal} 
              spamReason={spamReason} 
              setSpamReason={setSpamReason} 
              confirmReportSpam={confirmReportSpam} 
            />
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}