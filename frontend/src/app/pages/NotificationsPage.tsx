import { useState, useEffect } from "react";
import { useAppContext } from "../store";
import { Card, Button, cn } from "../components/ui";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Info, FileText, AlertTriangle, ChevronDown, ChevronUp, ExternalLink, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

export function NotificationsPage() {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead, setSelectedReportId, refreshNotifications } = useAppContext();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Refresh on mount so notifications are always up-to-date
  useEffect(() => { if (currentUser) refreshNotifications(); }, [currentUser]);

  // Backend only returns THIS user's notifications — no userId field sent back
  const allUserNotifs = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const userNotifications = filter === "all" ? allUserNotifs : allUserNotifs.filter(n => !n.read);
  const hasUnread = allUserNotifs.some(n => !n.read);

  const handleNotificationClick = (id: string, link?: string) => {
    markNotificationRead(id);
    // Toggle expand/collapse
    setExpandedId(prev => prev === id ? null : id);
    // If it has a report link, open the sidebar overlay
    if (link) {
      const reportMatch = link.match(/\/report\/([^/]+)/);
      if (reportMatch) {
        setSelectedReportId(reportMatch[1]);
      }
    }
  };

  const handleGoToReport = (e: React.MouseEvent, link: string) => {
    e.stopPropagation();
    const reportMatch = link.match(/\/report\/([^/]+)/);
    if (reportMatch) {
      setSelectedReportId(reportMatch[1]);
    } else {
      navigate(link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'report': return <FileText className="w-5 h-5" />;
      case 'application': return <Info className="w-5 h-5" />;
      case 'system': return <Shield className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getIconBg = (type: string, read: boolean) => {
    if (read) return "bg-gray-100 text-gray-400";
    switch (type) {
      case 'report': return "bg-blue-50 text-blue-600";
      case 'application': return "bg-purple-50 text-purple-600";
      case 'system': return "bg-[#2E7D32]/10 text-[#2E7D32]";
      default: return "bg-[#2E7D32]/10 text-[#2E7D32]";
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1A4331] font-serif flex items-center gap-3">
            <Bell className="w-8 h-8 text-[#2E7D32]" /> Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {allUserNotifs.length} total · {allUserNotifs.filter(n => !n.read).length} unread
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter("all")}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", filter === "all" ? "bg-white shadow-sm text-[#1A4331]" : "text-gray-500 hover:text-[#1A4331]")}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-colors", filter === "unread" ? "bg-white shadow-sm text-[#1A4331]" : "text-gray-500 hover:text-[#1A4331]")}
            >
              Unread {hasUnread && <span className="ml-1 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">{allUserNotifs.filter(n => !n.read).length}</span>}
            </button>
          </div>
          {hasUnread && (
            <Button variant="outline" onClick={markAllNotificationsRead} size="sm" className="ml-auto sm:ml-0 bg-white text-xs">
              <Check className="w-3.5 h-3.5 mr-1.5" /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
        {userNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-16 text-center text-gray-500 flex flex-col items-center bg-gray-50/50"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-lg font-medium text-[#1A4331] font-serif">All caught up!</p>
            <p className="text-sm mt-1 text-gray-400">You have no {filter === 'unread' ? 'unread ' : ''}notifications.</p>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {userNotifications.map((notification, index) => {
              const isExpanded = expandedId === notification.id;
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={{ delay: index * 0.04 }}
                  className={cn(
                    "relative transition-colors",
                    !notification.read ? "bg-[#FDFDF7]" : "bg-white hover:bg-gray-50"
                  )}
                >
                  {/* Unread indicator bar */}
                  {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2E7D32] rounded-r" />
                  )}

                  {/* Main row — always visible */}
                  <button
                    className="w-full text-left px-5 py-4 flex items-start gap-4 group"
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                  >
                    {/* Icon */}
                    <div className={cn("mt-0.5 p-2.5 rounded-xl flex-shrink-0 transition-colors", getIconBg(notification.type, notification.read))}>
                      {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn("text-sm font-semibold leading-snug", !notification.read ? "text-[#1A4331]" : "text-gray-700")}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] text-gray-400 whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                          {isExpanded
                            ? <ChevronUp className="w-4 h-4 text-gray-400" />
                            : <ChevronDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          }
                        </div>
                      </div>
                      {/* Preview (collapsed) */}
                      {!isExpanded && (
                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 pl-[72px]">
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                              {notification.message}
                            </p>
                            {/* Action button if there's a report link */}
                            {notification.link && (
                              <button
                                onClick={(e) => handleGoToReport(e, notification.link!)}
                                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2E7D32] hover:text-[#1A4331] border border-[#2E7D32]/30 hover:border-[#1A4331]/50 bg-white px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                View Report
                              </button>
                            )}
                            {/* Mark as read button if still unread */}
                            {!notification.read && (
                              <button
                                onClick={(e) => { e.stopPropagation(); markNotificationRead(notification.id); }}
                                className="mt-3 ml-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Mark Read
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </Card>
    </div>
  );
}