import { useState } from "react";
import { useAppContext } from "../store";
import { Card, Button, cn } from "../components/ui";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Info, FileText, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

export function NotificationsPage() {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead, setSelectedReportId } = useAppContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const allUserNotifs = notifications.filter(n => n.userId === currentUser?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const userNotifications = filter === "all" ? allUserNotifs : allUserNotifs.filter(n => !n.read);
  const hasUnread = allUserNotifs.some(n => !n.read);

  const handleNotificationClick = (id: string, link?: string) => {
    markNotificationRead(id);
    // If the link looks like a report link, extract ID and open sidebar
    if (link) {
      const reportMatch = link.match(/\/report\/([^/]+)/);
      if (reportMatch) {
        setSelectedReportId(reportMatch[1]);
      } else {
        navigate(link);
      }
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'report': return <FileText className="w-5 h-5" />;
      case 'application': return <Info className="w-5 h-5" />;
      case 'system': return <AlertTriangle className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-[#1A4331] font-serif flex items-center gap-3">
          <Bell className="w-8 h-8 text-[#2E7D32]" /> Notifications
        </h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-sm">
            <button 
              onClick={() => setFilter("all")}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-sm transition-colors", filter === "all" ? "bg-white shadow-sm text-[#1A4331]" : "text-gray-500 hover:text-[#1A4331]")}
            >
              All
            </button>
            <button 
              onClick={() => setFilter("unread")}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-sm transition-colors", filter === "unread" ? "bg-white shadow-sm text-[#1A4331]" : "text-gray-500 hover:text-[#1A4331]")}
            >
              Unread
            </button>
          </div>
          {hasUnread && (
            <Button variant="outline" onClick={markAllNotificationsRead} size="sm" className="ml-auto sm:ml-0 bg-white">
              <Check className="w-4 h-4 mr-2" /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden">
        {userNotifications.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-12 text-center text-gray-500 flex flex-col items-center bg-gray-50/50"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-[#1A4331]">All caught up!</p>
            <p className="text-sm mt-1 text-gray-400">You have no {filter === 'unread' ? 'unread ' : ''}notifications.</p>
          </motion.div>
        ) : (
          <ul className="divide-y divide-gray-100">
            <AnimatePresence>
              {userNotifications.map((notification, index) => (
                <motion.li 
                  key={notification.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-start space-x-4 relative overflow-hidden group",
                    !notification.read ? "bg-[#FDFDF7]" : "bg-white"
                  )}
                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                >
                  {!notification.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2E7D32]"></div>}
                  <div className={cn(
                    "mt-1 p-2 rounded-full",
                    !notification.read ? "bg-[#2E7D32]/10 text-[#2E7D32]" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-500 transition-colors"
                  )}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 pr-4">
                    <h4 className={cn("text-base font-semibold font-serif leading-tight", !notification.read ? "text-[#1A4331]" : "text-gray-700")}>
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{notification.message}</p>
                    <span className="text-xs text-gray-400 mt-2 block font-medium uppercase tracking-wider">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </Card>
    </div>
  );
}