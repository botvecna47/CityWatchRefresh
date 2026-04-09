import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { Bell, Map, Home as HomeIcon, PlusCircle, LayoutDashboard, Settings, LogOut, Phone, Mail, ShieldAlert, LogIn, Menu, X } from "lucide-react";
import { useAppContext } from "../store";
import { cn, Button, Input, Textarea } from "./ui";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export function AppLayout() {
  const { currentUser, setCurrentUser, notifications, submitApplication } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
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
    ] : [])
  ];

  if (currentUser?.role === "admin") {
    navLinks.push({ name: "Admin Panel", path: "/admin", icon: ShieldAlert });
  }

  const unreadCount = currentUser ? notifications.filter(n => n.userId === currentUser.id && !n.read).length : 0;

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
    <div className="min-h-screen bg-[#FDFDF7] text-[#1A4331] font-serif flex flex-col">
      <nav className="sticky top-0 z-50 h-20 bg-[#1A4331]/95 backdrop-blur-md text-[#FDFDF7] shadow-sm flex items-center justify-between px-4 sm:px-6 border-b border-[#112d21]">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden p-2 -ml-2 text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/" className="text-xl sm:text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity" style={{ fontFamily: 'Playfair Display, serif' }}>
            CityWatch
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-sm flex items-center gap-2 transition-colors",
                  isActive ? "bg-[#2E7D32]/80 text-white" : "text-gray-300 hover:bg-[#1A4331] hover:text-white"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {currentUser ? (
            <>
              <Link to="/notifications" className="p-2 text-gray-300 hover:text-white transition-colors relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] flex items-center justify-center font-bold bg-red-500 text-white rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
              
              <Link to="/settings" className="p-2 text-gray-300 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </Link>

              <div className="flex items-center gap-2 bg-[#2E7D32]/20 px-3 py-1.5 rounded-sm transition-colors text-sm">
                <img src={currentUser.avatar} alt="User Avatar" className="w-6 h-6 rounded-full object-cover border border-[#2E7D32]" />
                <span className="hidden sm:inline font-medium">{currentUser.name}</span>
                <Badge role={currentUser.role} />
              </div>

              <button onClick={() => { localStorage.removeItem("token"); setCurrentUser(null); }} className="p-2 text-gray-300 hover:text-red-400 transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-[#2E7D32] hover:bg-[#1b5e20] text-white gap-2">
                <LogIn className="w-4 h-4" /> Sign In
              </Button>
            </Link>
          )}
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#1A4331] border-b border-[#112d21] overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={cn(
                      "px-4 py-3 text-sm font-medium rounded-sm flex items-center gap-3 transition-colors",
                      isActive ? "bg-[#2E7D32]/80 text-white" : "text-gray-300 hover:bg-[#1A4331] hover:text-white"
                    )}
                  >
                    <link.icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-[1400px] w-full mx-auto px-2 sm:px-4 md:px-8 py-4 md:py-6 flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A4331] text-[#FDFDF7] py-12 px-6 mt-12 border-t-4 border-[#2E7D32]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>CityWatch</h3>
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
                  placeholder="(555) 123-4567" 
                  value={appForm.phone}
                  onChange={(e) => setAppForm({...appForm, phone: e.target.value})}
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