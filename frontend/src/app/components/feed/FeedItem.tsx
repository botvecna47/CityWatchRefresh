import { useNavigate } from "react-router";
import { ArrowBigUp, MessageSquare, MapPin, Camera } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Card, Badge, cn, Button } from "../ui";

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    "Reported": "bg-blue-100 text-blue-800 border-blue-200",
    "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
    "Completed": "bg-green-100 text-green-800 border-green-200",
    "Reopened": "bg-red-100 text-red-800 border-red-200",
    "Pending Verification": "bg-blue-50 text-blue-700 border-blue-200"
  };

  return (
    <Badge className={cn("font-medium border shadow-sm", colors[status])}>
      {status}
    </Badge>
  );
}

export function FeedItem({ report, currentUser, handleVoteAction, updateReport }: any) {
  const navigate = useNavigate();
  
  return (
    <Card className="flex hover:border-[#2E7D32]/30 transition-colors bg-white overflow-hidden shadow-sm rounded-none border-x-0 sm:rounded-sm sm:border-x">
      {/* Voting Sidebar */}
      <div className="w-14 bg-gray-50 flex flex-col items-center py-4 border-r border-gray-100 gap-1 flex-shrink-0">
        <button 
          onClick={() => handleVoteAction(report.id, 'up')} 
          className={cn(
            "p-1 transition-colors rounded hover:bg-gray-200",
            currentUser && report.upvotedCitizenIds?.includes(currentUser.id) ? "text-[#2E7D32]" : "text-gray-400 hover:text-[#2E7D32]"
          )}
        >
          <ArrowBigUp className="w-6 h-6" />
        </button>
        <span className="text-sm font-bold text-[#1A4331]">{report.upvotes}</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <img src={report.authorAvatar} alt={report.authorName} className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
          <div>
            <span className="font-semibold text-[#1A4331] text-sm">{report.authorName}</span>
            <span className="text-xs text-gray-500 ml-2">
              {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })} • {format(new Date(report.createdAt), "dd MMM yy, HH:mm")}
            </span>
          </div>
          <div className="sm:ml-auto flex gap-2 w-full sm:w-auto items-center">
            {currentUser?.role === 'coordinator' && report.status === 'Reported' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => { e.preventDefault(); updateReport(report.id, { status: "In Progress", coordinatorId: currentUser.id }); }}
                className="h-6 text-xs px-2 border-[#1A4331] text-[#1A4331]"
              >
                Mark In Progress
              </Button>
            )}
            <StatusBadge status={report.status} />
            <Badge variant="outline" className="bg-[#1A4331]/5 text-[#1A4331] border-[#1A4331]/20">{report.area}</Badge>
          </div>
        </div>

        <button onClick={() => navigate(`/report/${report.id}`)} className="block group text-left w-full">
          <h2 className="text-xl font-bold mb-2 group-hover:text-[#2E7D32] transition-colors leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            {report.title}
          </h2>
          <p className="text-gray-600 mb-4 line-clamp-2 text-sm font-serif">
            {report.description}
          </p>
          
          {report.status === 'Reopened' && report.reopenReason && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-xs font-bold text-red-800 uppercase mb-1">Supervisor Rejected</p>
              <p className="text-sm text-red-900 line-clamp-2">Reason: {report.reopenReason}</p>
            </div>
          )}

          {report.image && (!report.proofImage || report.status !== 'Completed') && (
            <div className="w-full h-48 sm:h-64 mb-4 overflow-hidden rounded-sm bg-gray-100 border border-gray-100 relative group">
              <img src={report.image} alt="Issue" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              {report.additionalImages && report.additionalImages.length > 0 && (
                <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                  <Camera className="w-3 h-3" />
                  +{report.additionalImages.length} MORE PHOTOS
                </div>
              )}
            </div>
          )}

          {report.image && report.proofImage && report.status === 'Completed' && (
            <div className="w-full h-48 sm:h-64 mb-4 overflow-hidden rounded-sm bg-gray-100 border border-gray-100 relative flex group">
              <div className="w-1/2 h-full relative border-r border-white">
                <img src={report.image} alt="Before" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 origin-left" />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                  BEFORE
                </div>
              </div>
              <div className="w-1/2 h-full relative">
                <img src={report.proofImage.toLowerCase().endsWith('.pdf') ? 'https://cdn-icons-png.flaticon.com/512/337/337946.png' : report.proofImage} alt="After" className={`w-full h-full ${report.proofImage.toLowerCase().endsWith('.pdf') ? 'object-contain p-4' : 'object-cover group-hover:scale-105'} transition-transform duration-300 origin-right`} />
                <div className="absolute top-2 right-2 bg-green-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                  AFTER (RESOLVED)
                </div>
              </div>
            </div>
          )}
        </button>

        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-auto pt-4 border-t border-gray-100">
          <button onClick={() => navigate(`/report/${report.id}`)} className="flex items-center gap-2 text-gray-500 hover:text-[#1A4331] text-sm font-medium transition-colors">
            <MessageSquare className="w-4 h-4" />
            {report.commentCount !== undefined ? report.commentCount : report.comments.length} Comments
          </button>
          <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[200px]">{report.locationText}</span>
          </div>
          {report.urgency === 'High' && (
            <Badge className="ml-auto bg-red-100 text-red-700 hover:bg-red-100 border-0">High Urgency</Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
