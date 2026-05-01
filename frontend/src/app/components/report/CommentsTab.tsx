import { formatDistanceToNow } from "date-fns";
import { Button, Textarea } from "../ui";
import { useNavigate } from "react-router";

export function CommentsTab({ report, currentUser, commentText, setCommentText, handleAddComment }: any) {
  const navigate = useNavigate();
  return (
    <>
      <div className="space-y-3 mb-4">
        {report.comments.map((comment: any) => (
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
    </>
  );
}
