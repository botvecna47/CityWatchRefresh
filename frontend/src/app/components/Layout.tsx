import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Bell, Map, Home as HomeIcon, PlusCircle, LayoutDashboard, Settings, LogOut, Phone, Mail, ShieldAlert, LogIn, Menu, X, MoreHorizontal } from "lucide-react";
import { useAppContext } from "../store";
import { cn, Button, Input, Textarea } from "./ui";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { ReportSidebarOverlay } from "../pages/ReportSidebarOverlay";
import logo from "../../assets/logo.png";

export function AppLayout() {
  const { currentUser, setCurrentUser, users, notifications, submitApplication } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const theme = currentUser?.settings?.theme || localStorage.getItem("settings_theme") || "light";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [currentUser?.settings?.theme]);


  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll to top on every navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  // Coordinator Application Form State
  const [appForm, setAppForm] = useState({
    phone: "",
    address: "",
    experience: "",
    message: ""
  });

  const navLinks = [
    { name: "Home", path: "/", icon: HomeIcon },
    { name: "Map", path: "/map", icon: Map },
    ...(currentUser ? [
      { name: "Report Issue", path: "/submit", icon: PlusCircle },
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Settings", path: "/settings", icon: Settings },
    ] : [])
  ];

  if (currentUser?.role === "admin") {
    navLinks.push({ name: "Admin Panel", path: "/admin", icon: ShieldAlert });
  }

  const unreadCount = currentUser ? notifications.filter(n => !n.read).length : 0;

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please log in to apply");
      navigate("/auth");
      return;
    }
    if (!appForm.phone || !appForm.message || !appForm.address || !appForm.experience) {
      toast.error("Please fill all fields");
      return;
    }
    if (appForm.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    if (appForm.address.length < 10) {
      toast.error("Please provide a more complete address (min 10 characters)");
      return;
    }
    if (!/^[a-zA-Z0-9\s,.-]+$/.test(appForm.address)) {
      toast.error("Address can only contain letters, numbers, spaces, commas, periods, and hyphens");
      return;
    }
    if (appForm.experience.length < 20 || appForm.message.length < 20) {
      toast.error("Please provide at least 20 characters for your experience and motivation");
      return;
    }
    submitApplication({
      userId: currentUser.id,
      userName: currentUser.name,
      email: currentUser.email,
      phone: appForm.phone,
      address: appForm.address,
      experience: appForm.experience,
      message: appForm.message
    });
    setIsJoinModalOpen(false);
    setAppForm({ phone: "", address: "", experience: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-[#FDFDF7] text-[#1A4331] font-serif flex flex-col md:flex-row">
      
      {/* PC Left Navigation Sidebar */}
      <aside className="hidden md:flex flex-col w-72 lg:w-80 xl:w-[350px] h-screen sticky top-0 bg-[#1A4331] text-[#FDFDF7] border-r border-[#112d21] p-6 xl:pl-16 shadow-xl z-50">
        <Link to="/" className="text-2xl lg:text-3xl font-bold tracking-tight hover:opacity-80 transition-opacity flex items-center gap-3 mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>
          <img src={logo} className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm bg-white" alt="CityWatch Logo" />
          CityWatch
        </Link>
        
        <div className="flex flex-col gap-2 flex-1 mt-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "px-4 py-2.5 text-[17px] font-medium rounded-xl flex items-center gap-4 transition-all w-fit pr-6",
                  isActive ? "bg-[#2E7D32]/80 text-white font-bold" : "text-gray-300 hover:bg-white/10 hover:text-white"
                )}
              >
                <link.icon className="w-6 h-6" />
                {link.name}
              </Link>
            );
          })}
          {currentUser && (
            <Link
              to="/notifications"
              className={cn(
                "px-4 py-2.5 text-[17px] font-medium rounded-xl flex items-center gap-4 transition-all w-fit pr-6",
                location.pathname === '/notifications' ? "bg-[#2E7D32]/80 text-white font-bold" : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="relative">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] flex items-center justify-center font-bold bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              Notifications
            </Link>
          )}

          {/* Action Button */}
          <Link to={currentUser ? "/submit" : "/auth"} className="w-full mt-4 pr-6">
            <Button className="w-full bg-white text-[#1A4331] hover:bg-gray-100 text-base py-3 rounded-xl font-bold shadow-none flex gap-2">
              <PlusCircle className="w-5 h-5" />
              {currentUser ? "Report Issue" : "Get Started"}
            </Button>
          </Link>

        </div>

        <div className="mt-auto pt-4 relative">
          {currentUser ? (
            <div 
              className="flex items-center justify-between p-3 rounded-full hover:bg-white/10 transition-colors cursor-pointer w-full pr-4"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <img src={currentUser.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[#2E7D32]" />
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="font-bold text-sm truncate">{currentUser.name}</span>
                  <span className="text-xs text-gray-400 capitalize">@{currentUser.role}</span>
                </div>
              </div>
              <MoreHorizontal className="w-5 h-5 text-gray-400" />
              
              {/* Click Dropdown Menu */}
              <div className={cn(
                "absolute bottom-full left-0 mb-2 w-[calc(100%-1.5rem)] bg-[#1A4331] border border-[#2E7D32] rounded-xl shadow-lg transition-all flex flex-col overflow-hidden z-50",
                isProfileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
              )}>
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentUser(null); }} 
                  className="px-4 py-3 hover:bg-white/10 flex items-center gap-3 font-medium text-sm text-left transition-colors font-bold"
                >
                  <LogOut className="w-5 h-5"/> Log out @{currentUser.name.split(' ')[0]}
                </button>
              </div>
            </div>
          ) : (
            <Link to="/auth" className="w-full block pr-6">
              <Button className="w-full bg-[#2E7D32] border border-white/20 hover:bg-[#1b5e20] text-white text-base py-3 rounded-xl shadow-none">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 bg-[#1A4331]/95 backdrop-blur-md text-[#FDFDF7] z-50 flex justify-between items-center p-4 border-b border-[#112d21] shadow-sm">
        <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
          <img src={logo} className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm bg-white" alt="CityWatch Logo" />
          CityWatch
        </Link>
        <div className="flex items-center gap-4">
          {currentUser && (
            <Link to="/notifications" className="relative text-gray-300 hover:text-white">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 text-[9px] flex items-center justify-center font-bold bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
          {currentUser ? (
             <Link to="/settings"><img src={currentUser.avatar} alt="User Avatar" className="w-7 h-7 rounded-full object-cover border border-[#2E7D32]" /></Link>
          ) : (
            <Link to="/auth" className="text-sm font-bold text-[#2E7D32] bg-white px-3 py-1 rounded-full">Sign In</Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 relative">
        <main className="w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              <Outlet context={{ openJoinModal: () => setIsJoinModalOpen(true) }} />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="bg-[#1A4331] text-[#FDFDF7] py-12 px-6 mt-12 border-t-4 border-[#2E7D32]">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 font-serif flex items-center gap-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                <img src={logo} className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm bg-white" alt="CityWatch Logo" />
                CityWatch
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                A premium civic issue reporting platform empowering citizens to maintain the beauty and functionality of their city.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> 1-800-CITY-WTCH</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> contact@citywatch.org</p>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Join Our Team</h4>
              <p className="text-sm text-gray-300 mb-4">
                Are you passionate about improving the quality of your city for the greater good? Join our Coordinator team today!
              </p>
              {!currentUser ? (
                <Button onClick={() => navigate('/auth')} className="bg-[#FDFDF7] text-[#1A4331] hover:bg-gray-200">
                  Log in to Apply
                </Button>
              ) : currentUser.role === 'citizen' ? (
                <Button onClick={() => setIsJoinModalOpen(true)} className="bg-[#FDFDF7] text-[#1A4331] hover:bg-gray-200">
                  Apply to be a Coordinator
                </Button>
              ) : (
                <p className="text-sm italic opacity-70">You are already part of our staff.</p>
              )}
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-[#2E7D32]/30 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} CityWatch. All rights reserved.
          </div>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-[#1A4331]/95 backdrop-blur-md text-[#FDFDF7] border-t border-[#112d21] z-50 flex justify-around items-center h-16 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">
        {navLinks.slice(0, 4).map((link) => {
          const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link key={link.name} to={link.path} className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors", isActive ? "text-[#2E7D32] bg-white/10" : "text-gray-400 hover:text-gray-200")}>
              <link.icon className={cn("w-6 h-6", isActive && "stroke-2")} />
              <span className="text-[10px] font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Join Coordinator Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-2xl relative text-[#1A4331] max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold mb-2 font-serif">Apply as Coordinator</h3>
            <p className="text-sm text-gray-600 mb-6">
              Help us maintain our beautiful city. We'll review your application and our admin will get back to you shortly.
            </p>
            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <Input 
                  placeholder="10-digit mobile number" 
                  value={appForm.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setAppForm({...appForm, phone: val});
                  }}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Home/Office Address</label>
                <Input 
                  placeholder="123 Main St, City, State" 
                  value={appForm.address}
                  onChange={(e) => setAppForm({...appForm, address: e.target.value})}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Relevant Experience</label>
                <Textarea 
                  placeholder="Briefly describe any community or coordination experience..." 
                  value={appForm.experience}
                  onChange={(e) => setAppForm({...appForm, experience: e.target.value})}
                  className="bg-white resize-none h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Why do you want to join?</label>
                <Textarea 
                  placeholder="Tell us about your background and motivation..." 
                  value={appForm.message}
                  onChange={(e) => setAppForm({...appForm, message: e.target.value})}
                  className="bg-white resize-none h-20"
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsJoinModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#1A4331] text-white hover:bg-[#112d21]">
                  Submit Application
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <ReportSidebarOverlay />
    </div>
  );
}

function Badge({ role }: { role: string }) {
  const colors = {
    citizen: "bg-blue-500 text-white",
    coordinator: "bg-purple-500 text-white",
    admin: "bg-red-500 text-white"
  };
  return (
    <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm", colors[role as keyof typeof colors] || "bg-gray-500 text-white")}>
      {role}
    </span>
  );
}