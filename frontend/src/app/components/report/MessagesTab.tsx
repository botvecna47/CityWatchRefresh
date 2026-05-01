import { formatDistanceToNow } from "date-fns";
import { Button, Input, cn } from "../ui";

export function MessagesTab({ report, currentUser, messageText, setMessageText, handleSendMessage }: any) {
  return (
    <>
      <div className="space-y-3 mb-4">
        {report.messages?.map((message: any) => (
          <div key={message.id} className={cn("flex flex-col max-w-[85%] rounded-sm p-3", message.senderId === currentUser?.id ? "ml-auto bg-[#1A4331] text-white" : "bg-gray-100 text-[#1A4331]")}>
            <div className="flex justify-between items-end gap-4 mb-1">
              <span className="font-bold text-xs">{message.senderName} <span className="opacity-70 font-normal">({message.senderRole})</span></span>
              <span className="text-[10px] opacity-70">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
            </div>
            <p className="text-sm">{message.content}</p>
          </div>
        ))}
        {(!report.messages || report.messages.length === 0) && (
          <p className="text-gray-400 text-xs text-center py-3 italic bg-gray-50 rounded-sm">No messages yet. Say hello to the assigned coordinator.</p>
        )}
      </div>
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input 
          placeholder="Type a message..." 
          value={messageText} 
          onChange={e => setMessageText(e.target.value)} 
        />
        <Button type="submit" disabled={!messageText.trim()}>Send</Button>
      </form>
    </>
  );
}
