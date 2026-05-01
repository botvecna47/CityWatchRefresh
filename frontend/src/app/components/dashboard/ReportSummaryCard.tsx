import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import { MapPin, MessageSquare } from "lucide-react";
import { Report } from "../../store";
import { Card } from "../../components/ui";
import { StatusBadge } from "../feed/FeedItem";

export function ReportSummaryCard({ report }: { report: Report }) {
  return (
    <Card className="p-4 bg-white border border-gray-100 shadow-sm flex flex-col gap-3 hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start gap-2">
        <Link to={`/report/${report.id}`} className="font-bold text-[#1A4331] hover:text-[#2E7D32] transition-colors leading-tight font-serif truncate block">
          {report.title}
        </Link>
        <StatusBadge status={report.status} />
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500 font-medium font-serif flex-wrap">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-red-500" /> {report.area}</span>
        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {report.comments.length} Comments</span>
        <span>{report.createdAt ? formatDistanceToNow(new Date(report.createdAt), { addSuffix: true }) : "Recent"}</span>
      </div>
    </Card>
  );
}
