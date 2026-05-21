import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Lock } from "lucide-react";
import { useNavigate } from "react-router";
import { User, Report, useAppContext } from "../../store";
import { Button, Textarea, Input, cn } from "../../components/ui";

interface ReportCommentsProps {
  report: Report;
  currentUser: User | null;
  commentText: string;
  setCommentText: (text: string) => void;
  handleAddComment: (e: React.FormEvent) => void;
}

export function ReportComments({ report, currentUser, commentText, setCommentText, handleAddComment }: ReportCommentsProps) {
  const navigate = useNavigate();
  const { fetchMessages, sendMessage } = useAppContext();
  
  const [activeTab, setActiveTab] = useState<'comments' | 'messages'>('comments');
  const [messageText, setMessageText] = useState("");

  const isCitizenAssigned = currentUser?.role === 'citizen' && currentUser.id === report.authorId && report.coordinatorId;
  const isCoordinatorAssigned = currentUser?.role === 'coordinator' && currentUser.id === report.coordinatorId;
  const showMessagesTab = isCitizenAssigned || isCoordinatorAssigned || currentUser?.role === 'admin';

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchMessages(report.id);
    }
  }, [activeTab, report.id]);

  const handleSendDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      await sendMessage(report.id, messageText);
      setMessageText("");
    } catch (e) {}
  };
  
  return (
    <div className="pt-6 border-t border-gray-200">
      <div className="flex items-center gap-6 border-b border-gray-200 mb-6 pb-2">
        <button 
          onClick={() => setActiveTab('comments')}
          className={cn("text-xl font-bold flex items-center gap-2", activeTab === 'comments' ? "text-[#1A4331] border-b-2 border-[#1A4331] pb-2 -mb-[9px]" : "text-gray-400 font-normal")}
          style={{ fontFamily: 'Playfair Display, serif' }}
        >
          <MessageSquare className="w-5 h-5" /> Comments ({report.comments?.length || 0})
        </button>
        {showMessagesTab && (
          <button 
            onClick={() => setActiveTab('messages')}
            className={cn("text-xl font-bold flex items-center gap-2", activeTab === 'messages' ? "text-[#1A4331] border-b-2 border-[#1A4331] pb-2 -mb-[9px]" : "text-gray-400 font-normal")}
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            <Lock className="w-5 h-5" /> Direct Messages
          </button>
        )}
      </div>

      {activeTab === 'comments' ? (
        <>
          <div className="space-y-6 mb-8">
            {(report.comments || []).map(comment => (
              <div key={comment.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1A4331] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="font-bold text-sm">{comment.authorName?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 bg-[#FDFDF7] p-4 rounded-md border border-[#1A4331]/10 shadow-sm relative">
                  <div className="absolute top-4 -left-2 w-4 h-4 bg-[#FDFDF7] border-l border-t border-[#1A4331]/10 rotate-[-45deg]"></div>
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
            {(!report.comments || report.comments.length === 0) && (
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
        </>
      ) : (
        <>
          <div className="space-y-6 mb-8">
            {report.messages?.map(message => (
              <div key={message.id} className={cn("flex flex-col max-w-[80%] rounded-md p-4 shadow-sm", message.senderId === currentUser?.id ? "ml-auto bg-[#1A4331] text-white" : "bg-gray-100 text-[#1A4331]")}>
                <div className="flex justify-between items-end gap-4 mb-2">
                  <span className="font-bold text-sm">{message.senderName} <span className="opacity-70 font-normal">({message.senderRole})</span></span>
                  <span className="text-xs opacity-70">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="text-base font-serif leading-relaxed">{message.content}</p>
              </div>
            ))}
            {(!report.messages || report.messages.length === 0) && (
              <p className="text-gray-500 italic text-center py-4 bg-gray-50 rounded-sm border border-gray-100">No messages yet. Say hello to the assigned coordinator.</p>
            )}
          </div>

          <form onSubmit={handleSendDirectMessage} className="mt-6 flex gap-3">
            <Input 
              placeholder="Type a secure message..." 
              value={messageText} 
              onChange={e => setMessageText(e.target.value)} 
              className="flex-1"
            />
            <Button type="submit" disabled={!messageText.trim()}>Send Message</Button>
          </form>
        </>
      )}
    </div>
  );
}
