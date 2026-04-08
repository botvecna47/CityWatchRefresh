import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { mockReports, type Comment } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronUp, ChevronDown, MessageCircle, MapPin, ArrowLeft,
  Share2, Flag, Clock, User, Send, CornerDownRight, Heart,
} from "lucide-react";

const statusStyles: Record<string, string> = {
  Reported: "bg-amber/15 text-amber-foreground border border-amber/30",
  "In Progress": "bg-accent/10 text-accent border border-accent/30",
  Completed: "bg-forest/10 text-forest border border-forest/30",
};

const priorityStyles: Record<string, string> = {
  Low: "bg-muted text-muted-foreground",
  Medium: "bg-amber/10 text-amber-foreground",
  High: "bg-destructive/10 text-destructive",
  Critical: "bg-destructive/20 text-destructive font-bold",
};

const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.upvotes);

  return (
    <div className={`${depth > 0 ? "ml-8 border-l-2 border-border/40 pl-4" : ""}`}>
      <div className="py-4 group">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
            {comment.author.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-foreground">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{comment.text}</p>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => { setLiked(!liked); setLikes(liked ? comment.upvotes : comment.upvotes + 1); }}
                className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-accent font-semibold" : "text-muted-foreground hover:text-accent"}`}
              >
                <Heart className={`h-3.5 w-3.5 ${liked ? "fill-accent" : ""}`} />
                {likes}
              </button>
              <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <CornerDownRight className="h-3.5 w-3.5" />
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );
};

const ReportDetailPage = () => {
  const { id } = useParams();
  const report = mockReports.find((r) => r.id === id);
  const [votes, setVotes] = useState(report ? report.upvotes - report.downvotes : 0);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [commentText, setCommentText] = useState("");

  if (!report) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Report not found</h1>
        <Link to="/reports" className="text-accent hover:underline text-sm">← Back to Reports</Link>
      </div>
    );
  }

  const handleVote = (dir: "up" | "down") => {
    if (voted === dir) { setVoted(null); setVotes(report.upvotes - report.downvotes); }
    else { setVoted(dir); setVotes(report.upvotes - report.downvotes + (dir === "up" ? 1 : -1)); }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <Link to="/reports" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Reports
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Header Card */}
            <div className="card-premium p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-sm font-bold text-accent flex-shrink-0">
                  {report.author.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-foreground">{report.author.name}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {report.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-[10px] ${statusStyles[report.status]}`}>{report.status}</Badge>
                    {report.priority && <Badge className={`text-[10px] ${priorityStyles[report.priority]}`}>{report.priority}</Badge>}
                    <Badge variant="secondary" className="text-[10px]">{report.category}</Badge>
                  </div>
                </div>
              </div>

              <h1 className="text-2xl font-extrabold text-foreground mb-3 leading-tight">{report.title}</h1>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{report.description}</p>

              {/* Image */}
              <div className="rounded-2xl overflow-hidden mb-5 border border-border/40">
                <img src={report.imageUrl} alt={report.title} className="w-full h-64 md:h-80 object-cover" />
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-xl px-4 py-3 border border-border/30">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="font-medium">{report.location}</span>
                <span className="text-xs">·</span>
                <span className="text-xs">{report.area}</span>
              </div>

              {/* Actions Bar */}
              <div className="flex items-center gap-1 mt-5 pt-5 border-t border-border/40">
                <div className="flex items-center bg-muted/40 rounded-xl overflow-hidden border border-border/30">
                  <button
                    onClick={() => handleVote("up")}
                    className={`px-3 py-2 transition-colors ${voted === "up" ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>
                  <span className={`px-2 text-sm font-bold ${votes > 0 ? "text-accent" : "text-muted-foreground"}`}>{votes}</span>
                  <button
                    onClick={() => handleVote("down")}
                    className={`px-3 py-2 transition-colors ${voted === "down" ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2 rounded-xl">
                  <MessageCircle className="h-4 w-4" /> {report.comments}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2 rounded-xl ml-auto">
                  <Share2 className="h-4 w-4" /> Share
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive gap-2 rounded-xl">
                  <Flag className="h-4 w-4" /> Report
                </Button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="card-premium p-6">
              <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-accent" />
                Comments ({report.commentsList?.length || 0})
              </h2>

              {/* Comment Input */}
              <div className="flex gap-3 mb-6 pb-6 border-b border-border/40">
                <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none transition-all placeholder:text-muted-foreground"
                  />
                  <Button
                    size="sm"
                    className="absolute bottom-3 right-3 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 gap-1 h-8 px-3"
                    disabled={!commentText.trim()}
                  >
                    <Send className="h-3.5 w-3.5" /> Post
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="divide-y divide-border/30">
                {report.commentsList?.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>

              {(!report.commentsList || report.commentsList.length === 0) && (
                <div className="text-center py-10">
                  <MessageCircle className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No comments yet</p>
                  <p className="text-xs text-muted-foreground/70">Be the first to share your thoughts</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Report Info */}
            <div className="card-premium p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Report Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <Badge className={`text-[10px] ${statusStyles[report.status]}`}>{report.status}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Priority</span>
                  <Badge className={`text-[10px] ${priorityStyles[report.priority || "Low"]}`}>{report.priority || "Low"}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Category</span>
                  <span className="text-xs font-semibold text-foreground">{report.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Area</span>
                  <span className="text-xs font-semibold text-foreground">{report.area}</span>
                </div>
                {report.assignedTo && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Assigned To</span>
                    <span className="text-xs font-semibold text-accent">{report.assignedTo}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity */}
            <div className="card-premium p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Activity</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Report submitted</p>
                    <p className="text-[10px] text-muted-foreground">{report.timestamp}</p>
                  </div>
                </div>
                {report.status !== "Reported" && (
                  <div className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-amber mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Assigned to coordinator</p>
                      <p className="text-[10px] text-muted-foreground">1 hour later</p>
                    </div>
                  </div>
                )}
                {report.status === "Completed" && (
                  <div className="flex gap-3">
                    <div className="h-2 w-2 rounded-full bg-forest mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-foreground">Marked as resolved</p>
                      <p className="text-[10px] text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related */}
            <div className="card-premium p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">Related Reports</h3>
              <div className="space-y-3">
                {mockReports.filter((r) => r.id !== report.id && r.area === report.area).slice(0, 3).map((r) => (
                  <Link key={r.id} to={`/reports/${r.id}`} className="block group">
                    <p className="text-xs font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{r.area} · {r.timestamp}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
