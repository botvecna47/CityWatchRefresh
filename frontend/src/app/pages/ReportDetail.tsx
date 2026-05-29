import { useParams, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { formatDistanceToNow, format } from "date-fns";
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
import { DeleteReportModal } from "../components/report/DeleteReportModal";
import { ImageWithFallback } from "../components/ImageWithFallback";

export function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports, currentUser, updateReport, addComment, submitSpamReport, setReports, loading, handleVote: voteOnServer, users, assignCoordinatorToReport, fetchComments, softDeleteReport, citizenResolve } = useAppContext();
  
  const isCitizen = currentUser?.role === 'citizen';
  const isCoordinator = currentUser?.role === 'coordinator';
  const isAdmin = currentUser?.role === 'admin';

  const report = reports.find(r => r.id === id);
  const hasUpvoted = !!(isCitizen && currentUser && report?.upvotedCitizenIds?.includes(currentUser.id));
  const coordinators = users.filter(u => u.role === 'coordinator');
  
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState("");
  const [commentText, setCommentText] = useState("");
  const [showSpamModal, setShowSpamModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [spamReason, setSpamReason] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  const [isReopening, setIsReopening] = useState(false);
  const [reopenReason, setReopenReason] = useState("");

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
      content: commentText,
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
    setShowDeleteModal(true);
  };

  const confirmDeleteReport = async (messageForCitizen: string, reason: string) => {
    // @ts-ignore - softDeleteReport is defined in ComplaintContext
    if (softDeleteReport) {
      // @ts-ignore
      await softDeleteReport(report.id, messageForCitizen, reason);
      setShowDeleteModal(false);
      navigate("/");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <Link to="/" className="md:hidden inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-[#1A4331] transition-all font-medium text-sm px-3 py-1.5 rounded shadow-sm w-fit">
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
              <div className="hidden md:flex w-16 bg-gray-50 flex-col items-center py-6 border-r border-gray-100">
                <Link to="/" className="text-gray-400 hover:text-[#1A4331] p-2 hover:bg-gray-200 rounded transition-colors" title="Back to Feed">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex flex-col items-center gap-1 mt-6">
                  {isCitizen ? (
                    <button onClick={() => handleVote('up')} className={cn("p-2 transition-colors rounded hover:bg-gray-200", hasUpvoted ? "text-[#2E7D32]" : "text-gray-400 hover:text-[#2E7D32]")}>
                      <ArrowBigUp className="w-8 h-8" />
                    </button>
                  ) : <ArrowBigUp className="w-8 h-8 text-gray-300" />}
                  <span className="text-lg font-bold text-[#1A4331]">{report.upvotes}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">votes</span>
                </div>
              </div>

              <div className="flex-1 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4 flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <img src={report.authorAvatar} alt={report.authorName} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                    <div>
                      <h3 className="font-semibold text-[#1A4331] text-lg leading-tight">{report.authorName}</h3>
                      <span className="text-sm text-gray-500">Reported {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })} • {format(new Date(report.createdAt), "dd MMM yy, HH:mm")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {isAdmin && (
                      <div className="flex items-center gap-2">
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

                {/* Image Slider */}
                <div className="slider-container flex overflow-x-auto snap-x snap-mandatory gap-3 mb-6 pb-3 -mx-6 px-6 md:mx-0 md:px-0" style={{ scrollbarWidth: 'thin' }}>
                  {/* Custom scrollbar for desktop */}
                  <style>{`
                    .slider-container::-webkit-scrollbar { height: 6px; }
                    .slider-container::-webkit-scrollbar-track { background: transparent; }
                    .slider-container::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
                    .slider-container::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
                  `}</style>
                  
                  {report.image && (
                    <div className="flex-none w-[90%] md:w-[75%] snap-center rounded-sm overflow-hidden bg-gray-100 border border-gray-200 shadow-inner cursor-zoom-in group relative" onClick={() => setLightboxIndex(0)}>
                      <ImageWithFallback 
                        src={report.image} 
                        alt={report.title} 
                        className="w-full h-64 md:h-96 object-cover group-hover:brightness-90 transition-all duration-300" 
                      />
                    </div>
                  )}
                  {report.additionalImages?.map((img, i) => (
                    <div key={i} className="flex-none w-[90%] md:w-[75%] snap-center rounded-sm overflow-hidden bg-gray-100 border border-gray-200 shadow-inner cursor-zoom-in group relative" onClick={() => setLightboxIndex(i + (report.image ? 1 : 0))}>
                      <img src={img} alt={`Additional ${i}`} className="w-full h-64 md:h-96 object-cover group-hover:brightness-90 transition-all duration-300" />
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

                {report.proofImage && report.status === "Completed" && (
                  <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-sm shadow-sm">
                    <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg font-serif"><CheckCircle2 className="w-6 h-6 text-green-600" /> Resolution Proof</h3>
                    {report.proofImage.toLowerCase().endsWith('.pdf') ? (
                      <div className="w-full h-64 md:h-80 flex flex-col items-center justify-center bg-white rounded-sm border border-green-300 shadow-sm mb-4">
                        <img src="https://cdn-icons-png.flaticon.com/512/337/337946.png" className="w-24 h-24 mb-4 opacity-80" alt="PDF Proof" />
                        <a href={report.proofImage} target="_blank" rel="noopener noreferrer" className="text-green-700 font-semibold hover:underline">View PDF Document</a>
                      </div>
                    ) : (
                      <img src={report.proofImage} alt="Proof" className="w-full h-64 md:h-80 object-cover rounded-sm border border-green-300 shadow-sm mb-4" />
                    )}
                    {report.resolutionLocation && (
                      <p className="text-sm text-green-800 flex items-center gap-2 font-medium"><MapPin className="w-4 h-4" /> Resolved at: {report.resolutionLocation.lat.toFixed(4)}, {report.resolutionLocation.lng.toFixed(4)}</p>
                    )}
                    
                    {currentUser?.id === report.authorId && (
                      <div className="mt-6 pt-4 border-t border-green-200 flex flex-col gap-3">
                        <p className="text-sm text-green-900 font-semibold">Are you satisfied with this resolution?</p>
                        
                        {isReopening ? (
                          <div className="flex flex-col gap-3 mt-2 bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                            <label className="text-sm font-medium text-red-900">Why are you reopening this issue?</label>
                            <textarea 
                              className="w-full border border-gray-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 min-h-[80px]"
                              placeholder="Please explain why the issue is not actually resolved..."
                              value={reopenReason}
                              onChange={(e) => setReopenReason(e.target.value)}
                            />
                            <div className="flex gap-2 justify-end mt-2">
                              <Button onClick={() => { setIsReopening(false); setReopenReason(""); }} variant="outline" size="sm" className="text-gray-500">
                                Cancel
                              </Button>
                              <Button 
                                onClick={() => citizenResolve(report.id, false, reopenReason)} 
                                disabled={reopenReason.trim().length < 10}
                                size="sm"
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                Submit Reopen
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2 w-full md:w-auto">
                            <Button onClick={() => setIsReopening(true)} variant="outline" className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50">
                              No, Reopen Issue
                            </Button>
                            <Button onClick={() => citizenResolve(report.id, true)} className="flex-1 md:flex-none bg-green-600 text-white hover:bg-green-700">
                              Yes, Confirm
                            </Button>
                          </div>
                        )}
                      </div>
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
            {showSpamModal && (
              <SpamReportModal 
                showSpamModal={showSpamModal} 
                setShowSpamModal={setShowSpamModal} 
                spamReason={spamReason} 
                setSpamReason={setSpamReason} 
                confirmReportSpam={confirmReportSpam} 
              />
            )}
            {showDeleteModal && (
              <DeleteReportModal 
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteReport}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}