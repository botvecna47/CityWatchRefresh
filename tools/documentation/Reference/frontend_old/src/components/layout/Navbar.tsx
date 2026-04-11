import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Menu, X, Shield, ChevronDown, Settings, User, LogOut, Check, Clock, AlertTriangle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Reports", path: "/reports" },
  { label: "Report Map", path: "/map" },
  { label: "Dashboard", path: "/dashboard" },
  { label: "Admin", path: "/admin" },
];

const notifications = [
  { id: 1, type: "resolved", title: "Pothole on Main St resolved", desc: "Coordinator Alex Thompson marked this as completed", time: "5 min ago", read: false },
  { id: 2, type: "comment", title: "New comment on your report", desc: "Michael Chen replied: 'This needs urgent attention'", time: "1 hour ago", read: false },
  { id: 3, type: "update", title: "Status changed to In Progress", desc: "Broken streetlight on Elm Blvd is being worked on", time: "3 hours ago", read: false },
  { id: 4, type: "alert", title: "New report in your area", desc: "Water main leak reported on Cedar Lane, Block 7", time: "6 hours ago", read: true },
  { id: 5, type: "resolved", title: "Graffiti cleanup completed", desc: "Maple Community Center wall has been cleaned", time: "1 day ago", read: true },
];

const notifIcon: Record<string, React.ReactNode> = {
  resolved: <Check className="h-4 w-4" />,
  comment: <MessageCircle className="h-4 w-4" />,
  update: <Clock className="h-4 w-4" />,
  alert: <AlertTriangle className="h-4 w-4" />,
};

const notifColor: Record<string, string> = {
  resolved: "bg-accent/15 text-accent",
  comment: "bg-primary/10 text-primary",
  update: "bg-amber/15 text-amber",
  alert: "bg-destructive/15 text-destructive",
};

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-primary border-b border-primary/80 shadow-lg shadow-primary/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-accent flex items-center justify-center shadow-md shadow-accent/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Shield className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-primary-foreground leading-none">
              City<span className="text-accent">Watch</span>
            </span>
            <span className="text-[9px] font-medium text-primary-foreground/50 uppercase tracking-[0.2em] leading-none mt-0.5">Civic Platform</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-0.5 bg-primary-foreground/5 rounded-2xl px-1.5 py-1 border border-primary-foreground/10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-accent text-accent-foreground shadow-md shadow-accent/25"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary-foreground/10 text-primary-foreground/80 hover:text-primary-foreground"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-accent rounded-full text-[9px] font-bold text-accent-foreground flex items-center justify-center ring-2 ring-primary">
                  {unreadCount}
                </span>
              )}
            </Button>

            {notifOpen && (
              <div className="absolute right-0 top-12 w-96 bg-card rounded-2xl border border-border shadow-2xl shadow-primary/20 animate-scale-in overflow-hidden z-50">
                <div className="flex items-center justify-between p-4 border-b border-border/60">
                  <h3 className="text-sm font-bold text-foreground">Notifications</h3>
                  <span className="text-[10px] font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3.5 border-b border-border/30 hover:bg-muted/50 transition-colors cursor-pointer ${
                        !n.read ? "bg-accent/[0.03]" : ""
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${notifColor[n.type]}`}>
                        {notifIcon[n.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm leading-snug ${!n.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                            {n.title}
                          </p>
                          {!n.read && <span className="h-2 w-2 bg-accent rounded-full flex-shrink-0 mt-1.5" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.desc}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-border/60">
                  <button className="w-full text-center text-xs font-semibold text-accent hover:text-accent/80 transition-colors py-1">
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="hidden md:flex items-center gap-2 ml-1">
            <div className="h-8 w-8 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center">
              <User className="h-4 w-4 text-accent" />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-primary-foreground/10 text-primary-foreground/80"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-primary border-t border-primary-foreground/10 animate-fade-in">
          <div className="flex flex-col p-3 gap-0.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
