import { useParams, Link, useNavigate } from "react-router";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, ArrowBigUp, ArrowBigDown, MapPin, Share2, MessageSquare, AlertTriangle, CheckCircle2, ImagePlus, X, Trash2 } from "lucide-react";
import { useAppContext, Comment, Report } from "../store";
import { Card, Button, Input, Textarea, Badge } from "../components/ui";
import { StatusBadge } from "./Home";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

export function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports, currentUser, updateReport, handleVote: contextHandleVote, addComment, submitSpamReport, setReports } = useAppContext();
  const report = reports.find(r => r.id === id);

  const [commentText, setCommentText] = useState("");
  const [showUpvoteModal, setShowUpvoteModal] = useState(false);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

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

  const handleVote = (type: 'up' | 'down') => {
    if (!currentUser) {
      toast.error("Please sign in to vote.");
      navigate("/auth");
      return;
    }

    if (type === 'up') {
      setShowUpvoteModal(true);
    } else {
      contextHandleVote(report.id, 'down');
      toast.success("Downvoted successfully.");
    }
  };

  const confirmUpvote = () => {
    const currentAdditional = report.additionalImages || [];
    const baseImageCount = report.image ? 1 : 0;
    const totalCurrentCount = baseImageCount + currentAdditional.length;
    
    if (additionalImages.length > 0 && (totalCurrentCount + additionalImages.length) > 5) {
      toast.error(`This report can only have a maximum of 5 images total. You can add up to ${5 - totalCurrentCount} more.`);
      return;
    }

    const updates: Partial<Report> = {};
    if (additionalImages.length > 0) {
      updates.additionalImages = [...currentAdditional, ...additionalImages];
      updateReport(report.id, updates);
    }
    contextHandleVote(report.id, 'up');
    setShowUpvoteModal(false);
    setAdditionalImages([]);
    toast.success("Upvote recorded!");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please sign in to comment.");
      navigate("/auth");
      return;
    }
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

  const [showSpamModal, setShowSpamModal] = useState(false);
  const [spamReason, setSpamReason] = useState("");

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
    // Instead of window.confirm which blocks iframe thread
    toast("Are you sure you want to completely remove this report?", {
      action: {
        label: "Delete",
        onClick: () => {
          setReports(prev => prev.filter(r => r.id !== report.id));
          toast.success("Report deleted.");
          navigate("/");
        }
      },
      cancel: {
        label: "Cancel",
        onClick: () => {}
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <Link to="/" className="inline-flex items-center gap-2 text-[#1A4331] hover:text-[#2E7D32] transition-colors font-medium text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Feed
      </Link>

      <Card className="overflow-hidden bg-white shadow-md border-gray-200">
        <div className="flex flex-col md:flex-row">
          {/* Voting Sidebar */}
          <div className="hidden md:flex w-16 bg-gray-50 flex-col items-center py-6 border-r border-gray-100 gap-2">
            <button onClick={() => handleVote('up')} className={`p-2 transition-colors rounded hover:bg-gray-200 ${report.userVotes?.[currentUser?.id || ""] === 'up' ? "text-[#2E7D32] bg-green-50" : "text-gray-400 hover:text-[#2E7D32]"}`}>
              <ArrowBigUp className="w-8 h-8" />
            </button>
            <span className="text-lg font-bold text-[#1A4331]">{report.upvotes - report.downvotes}</span>
            <button onClick={() => handleVote('down')} className={`p-2 transition-colors rounded hover:bg-gray-200 ${report.userVotes?.[currentUser?.id || ""] === 'down' ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-500"}`}>
              <ArrowBigDown className="w-8 h-8" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <img src={report.authorAvatar} alt={report.authorName} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                <div>
                  <h3 className="font-semibold text-[#1A4331] text-lg leading-tight">{report.authorName}</h3>
                  <span className="text-sm text-gray-500">
                    Reported {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {currentUser?.role === 'admin' && (
                  <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                )}
                {currentUser?.role === 'coordinator' && report.status === 'Reported' && (
                  <Button 
                    size="sm" 
                    onClick={() => updateReport(report.id, { status: "In Progress", coordinatorId: currentUser.id })}
                    className="bg-[#1A4331] text-white hover:bg-[#112d21]"
                  >
                    Mark In Progress
                  </Button>
                )}
                {currentUser?.role === 'coordinator' && (
                  <Button variant="outline" size="sm" onClick={handleReportSpam} className="text-red-600 border-red-200 hover:bg-red-50">
                    <AlertTriangle className="w-4 h-4 mr-1" /> Flag Spam
                  </Button>
                )}
                <StatusBadge status={report.status} />
                <Badge className="bg-[#1A4331]/10 text-[#1A4331] border border-[#1A4331]/20">{report.area}</Badge>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-[#1A4331] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              {report.title}
            </h1>
            
            <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed mb-6 font-serif">
              {report.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
              {report.image && (
                <div className="rounded-sm overflow-hidden bg-gray-100 border border-gray-200 shadow-inner col-span-2 md:col-span-3">
                  <img src={report.image} alt={report.title} className="w-full h-auto object-cover max-h-[400px]" />
                </div>
              )}
              {report.additionalImages?.map((img, i) => (
                <div key={i} className="rounded-sm overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
                  <img src={img} alt={`Additional ${i}`} className="w-full h-32 md:h-48 object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in" />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 items-center text-sm font-medium text-gray-600 mb-8 p-4 bg-[#FDFDF7] rounded-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <span className="text-[#1A4331]">{report.locationText}</span>
              </div>
              <div className="hidden md:block w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${report.urgency === 'High' ? 'text-red-500' : report.urgency === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`} />
                <span>{report.urgency} Urgency</span>
              </div>
            </div>

            {report.proofImage && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-sm shadow-sm">
                <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg font-serif">
                  <CheckCircle2 className="w-6 h-6 text-green-600" /> 
                  Resolution Proof
                </h3>
                <img src={report.proofImage} alt="Proof" className="w-full h-auto rounded-sm border border-green-300 shadow-sm mb-4" />
                {report.resolutionLocation && (
                  <p className="text-sm text-green-800 flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4" /> Resolved at: {report.resolutionLocation.lat.toFixed(4)}, {report.resolutionLocation.lng.toFixed(4)}
                  </p>
                )}
              </div>
            )}

            {/* Mobile Voting */}
            <div className="flex md:hidden items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <button onClick={() => handleVote('up')} className={`p-2 bg-gray-50 rounded-sm border border-gray-200 transition-colors ${report.userVotes?.[currentUser?.id || ""] === 'up' ? "text-[#2E7D32] bg-green-50" : "text-gray-400 hover:text-[#2E7D32]"}`}>
                <ArrowBigUp className="w-6 h-6" />
              </button>
              <span className="text-lg font-bold text-[#1A4331]">{report.upvotes - report.downvotes}</span>
              <button onClick={() => handleVote('down')} className={`p-2 bg-gray-50 rounded-sm border border-gray-200 transition-colors ${report.userVotes?.[currentUser?.id || ""] === 'down' ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-500"}`}>
                <ArrowBigDown className="w-6 h-6" />
              </button>
            </div>

            {/* Comments Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-[#1A4331] mb-6 flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <MessageSquare className="w-5 h-5 text-[#2E7D32]" />
                Comments ({report.comments.length})
              </h3>

              <div className="space-y-6 mb-8">
                {report.comments.map(comment => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1A4331]/10 flex items-center justify-center flex-shrink-0 border border-[#1A4331]/20">
                      <span className="font-bold text-[#1A4331] text-sm">{comment.authorName.charAt(0)}</span>
                    </div>
                    <div className="flex-1 bg-[#FDFDF7] p-4 rounded-sm border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-[#1A4331]">{comment.authorName}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm font-serif leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
                {report.comments.length === 0 && (
                  <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-sm border border-gray-100">No comments yet. Be the first to discuss this issue.</p>
                )}
              </div>

              {currentUser ? (
                <form onSubmit={handleAddComment} className="mt-6 flex flex-col gap-3">
                  <Textarea 
                    placeholder="Add a comment..." 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="resize-y"
                    rows={3}
                  />
                  <Button type="submit" className="self-end" disabled={!commentText.trim()}>Post Comment</Button>
                </form>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 text-center rounded-sm">
                  <p className="text-gray-600 mb-2">You must be signed in to leave a comment.</p>
                  <Button variant="outline" onClick={() => navigate('/auth')}>Sign In</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Upvote & Image Modal */}
      <AnimatePresence>
        {showUpvoteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl relative text-[#1A4331]"
            >
              <button 
                onClick={() => setShowUpvoteModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-xl font-bold mb-2 font-serif flex items-center gap-2">
                <ArrowBigUp className="text-[#2E7D32]" /> Confirm Upvote
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Upvoting helps prioritize issues for coordinators. Do you have any additional photos of this issue you'd like to attach? (Optional, Max 5 total)
              </p>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {additionalImages.map((img, idx) => (
                  <div key={idx} className="relative rounded-sm overflow-hidden border border-gray-200 h-24 group">
                    <img src={img} alt="Additional" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {((report.image ? 1 : 0) + (report.additionalImages?.length || 0) + additionalImages.length) < 5 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-sm h-24 flex flex-col items-center justify-center relative hover:bg-gray-50 transition-colors cursor-pointer bg-white group">
                    <ImagePlus className="w-6 h-6 text-gray-400 group-hover:text-[#2E7D32] transition-colors mb-1" />
                    <span className="text-xs text-gray-500 font-serif">Add Photo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []) as File[];
                        const currentTotal = (report.image ? 1 : 0) + (report.additionalImages?.length || 0) + additionalImages.length;
                        const remaining = 5 - currentTotal;
                        const toAdd = files.slice(0, remaining).map(f => URL.createObjectURL(f));
                        setAdditionalImages(prev => [...prev, ...toAdd]);
                        if (files.length > remaining) {
                          toast.error(`Maximum 5 total images allowed. Only added ${remaining}.`);
                        }
                      }} 
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUpvoteModal(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmUpvote} className="bg-[#1A4331] text-white hover:bg-[#112d21]">
                  Submit Upvote
                </Button>
              </div>
            </motion.div>
          </div>
        )}
        
        {showSpamModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl relative text-[#1A4331]"
            >
              <h3 className="text-xl font-bold mb-2 font-serif flex items-center gap-2">
                <AlertTriangle className="text-red-500" /> Report Spam
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for flagging this report as spam or abuse.
              </p>
              
              <Textarea 
                placeholder="Reason for reporting..." 
                value={spamReason}
                onChange={(e) => setSpamReason(e.target.value)}
                className="mb-4"
                rows={3}
              />
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowSpamModal(false)}>
                  Cancel
                </Button>
                <Button onClick={confirmReportSpam} disabled={!spamReason.trim()} className="bg-red-600 text-white hover:bg-red-700">
                  Submit Report
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}