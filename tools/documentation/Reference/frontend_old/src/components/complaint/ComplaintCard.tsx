import { type Report } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, MessageCircle, MapPin, Clock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const statusStyles: Record<string, string> = {
  "Reported": "bg-amber/15 text-amber-foreground border border-amber/30",
  "In Progress": "bg-accent/10 text-accent border border-accent/30",
  "Completed": "bg-forest/10 text-forest border border-forest/30",
};

const priorityDot: Record<string, string> = {
  "Low": "bg-muted-foreground",
  "Medium": "bg-amber",
  "High": "bg-destructive/80",
  "Critical": "bg-destructive animate-pulse",
};

const IssueCard = ({ report }: { report: Report }) => {
  const [votes, setVotes] = useState(report.upvotes - report.downvotes);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  const handleVote = (dir: "up" | "down") => {
    if (voted === dir) { setVoted(null); setVotes(report.upvotes - report.downvotes); }
    else { setVoted(dir); setVotes(report.upvotes - report.downvotes + (dir === "up" ? 1 : -1)); }
  };

  return (
    <div className="card-premium overflow-hidden animate-fade-in hover-lift group">
      {/* Author Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center text-xs font-bold text-accent border border-accent/10">
          {report.author.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{report.author.name}</p>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">{report.timestamp}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {report.priority && <div className={`h-2 w-2 rounded-full ${priorityDot[report.priority]}`} title={report.priority} />}
          <Badge className={`text-[10px] px-2.5 py-0.5 font-semibold ${statusStyles[report.status]}`}>
            {report.status}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <Link to={`/reports/${report.id}`} className="block px-4 pb-2 cursor-pointer">
        <h3 className="text-base font-bold text-foreground leading-snug mb-1.5 group-hover:text-accent transition-colors">{report.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{report.description}</p>
      </Link>

      {/* Image */}
      <Link to={`/reports/${report.id}`} className="block mx-4 mb-3 rounded-2xl overflow-hidden border border-border/30">
        <img
          src={report.imageUrl}
          alt={report.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Location & Category */}
      <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-lg px-2 py-1">
          <MapPin className="h-3 w-3 text-accent" />
          <span className="truncate max-w-[140px]">{report.location}</span>
        </div>
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
          {report.area}
        </Badge>
        <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-border/40">
          {report.category}
        </Badge>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center border-t border-border/40 bg-muted/10">
        <div className="flex items-center">
          <button
            onClick={() => handleVote("up")}
            className={`px-3 py-3 transition-colors ${voted === "up" ? "text-accent bg-accent/5" : "text-muted-foreground hover:text-accent hover:bg-accent/5"}`}
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <span className={`text-sm font-bold min-w-[28px] text-center ${votes > 0 ? "text-accent" : votes < 0 ? "text-destructive" : "text-muted-foreground"}`}>
            {votes}
          </span>
          <button
            onClick={() => handleVote("down")}
            className={`px-3 py-3 transition-colors ${voted === "down" ? "text-destructive bg-destructive/5" : "text-muted-foreground hover:text-destructive hover:bg-destructive/5"}`}
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
        <div className="h-5 w-px bg-border/40" />
        <Link to={`/reports/${report.id}`} className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors flex-1">
          <MessageCircle className="h-4 w-4" />
          <span className="font-medium">{report.comments} Comments</span>
        </Link>
        <Link to={`/reports/${report.id}`} className="pr-4 py-3 text-xs font-semibold text-accent hover:text-accent/80 transition-colors flex items-center gap-1">
          View <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export default IssueCard;
