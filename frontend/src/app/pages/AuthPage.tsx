import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAppContext } from "../store";
import { Card, Button, Input, cn } from "../components/ui";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import logo from "../../assets/logo.png";

const API_BASE = "/api/auth";

export function AuthPage() {
  const { setCurrentUser } = useAppContext();
  const navigate = useNavigate();
  const [step, setStep] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("Nanded");
  const [stateCode, setStateCode] = useState("MH");
  const [rtoCode, setRtoCode] = useState("16");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (step === "signup" && !name)) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const url = step === "login" ? `${API_BASE}/login` : `${API_BASE}/register`;
      const body = step === "login"
        ? { email, password }
        : { email, password, name, city, stateCode, rtoCode };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Authentication failed.");
        return;
      }

      // Store the JWT token
      localStorage.setItem("token", data.token);

      // Map backend response to the frontend User shape
      setCurrentUser({
        id: String(data.id),
        name: data.name || data.username,
        email: data.email,
        role: data.role.toLowerCase() as "citizen" | "coordinator" | "admin",
        avatar: "https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGF2YXRhcnxlbnwxfHx8fDE3NzMzMTM0NzV8MA&ixlib=rb-4.1.0&q=80&w=150",
        area: data.area || undefined,
        status: (data.status || "ACTIVE").toLowerCase() as "active" | "banned",
        settings: {
          emailNotifications: true,
          smsNotifications: false,
          theme: "system",
        },
      });

      toast.success(step === "login" ? `Welcome back, ${data.name || data.username}!` : "Account created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Auth error:", error);
      toast.error("Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSignIn = (testEmail: string) => {
    setEmail(testEmail);
    setPassword("Admin@123");
    // We use a small timeout to ensure state is updated before submission if we were calling handleSubmit directly,
    // but better yet, let's just trigger a flag or call a specialized login function.
    // For simplicity, we'll just set the values and let the user click sign in, 
    // OR we can trigger the login automatically.
    setTimeout(() => {
       const form = document.querySelector('form');
       if (form) form.requestSubmit();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#FDFDF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-serif">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <img src={logo} className="w-16 h-16 rounded-full border-4 border-[#1A4331]/20 shadow-lg bg-white" alt="CityWatch Logo" />
        </div>
        <h2 className="text-center text-4xl font-extrabold text-[#1A4331]" style={{ fontFamily: 'Playfair Display, serif' }}>
          CityWatch
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Civic Issue Reporting Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="bg-white py-8 px-4 shadow-xl border border-gray-200 sm:rounded-sm sm:px-10 overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.form 
                key={step}
                initial={{ opacity: 0, x: step === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: step === "login" ? 20 : -20 }}
                className="space-y-6" 
                onSubmit={handleSubmit}
              >
                {step === "signup" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-[#1A4331]">
                        Full Name
                      </label>
                      <div className="mt-1">
                        <Input 
                          placeholder="John Doe" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1A4331]">
                        City
                      </label>
                      <div className="mt-1 flex gap-2">
                        <Input 
                          placeholder="Nanded"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="flex-1"
                        />
                        <Input 
                          placeholder="State"
                          value={stateCode}
                          onChange={(e) => setStateCode(e.target.value)}
                          className="w-16 text-center uppercase"
                          maxLength={2}
                          title="2-letter state code"
                        />
                        <Input 
                          placeholder="RTO"
                          value={rtoCode}
                          onChange={(e) => setRtoCode(e.target.value)}
                          className="w-16 text-center"
                          maxLength={2}
                          title="2-digit RTO district code"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#1A4331]">
                    Email address
                  </label>
                  <div className="mt-1">
                    <Input 
                      type="email"
                      placeholder="you@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A4331]">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#1A4331] hover:bg-[#112d21] text-white py-2" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? "Please wait..." : step === "login" ? "Sign in" : "Sign up"}
                </Button>
              
                <div className="text-center mt-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setStep(step === "login" ? "signup" : "login");
                      setEmail("");
                      setPassword("");
                      setName("");
                    }} 
                    className="text-sm text-[#2E7D32] hover:underline"
                  >
                    {step === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              </motion.form>
            </AnimatePresence>

            {/* Test accounts info */}
            {step === "login" && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Quick Test Access</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => handleQuickSignIn("c1@gmail.com")}
                    className="flex items-center justify-between p-2.5 rounded-sm bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🧑</span>
                      <div>
                        <p className="text-xs font-bold text-blue-900 group-hover:underline">Citizen Portal</p>
                        <p className="text-[10px] text-blue-700 opacity-70">c1@gmail.com</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">One-Click</span>
                  </button>

                  <button 
                    onClick={() => handleQuickSignIn("ravi@citywatch.in")}
                    className="flex items-center justify-between p-2.5 rounded-sm bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔧</span>
                      <div>
                        <p className="text-xs font-bold text-purple-900 group-hover:underline">Coordinator Panel</p>
                        <p className="text-[10px] text-purple-700 opacity-70">ravi@citywatch.in</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-purple-600 text-white px-2 py-0.5 rounded-full">One-Click</span>
                  </button>

                  <button 
                    onClick={() => handleQuickSignIn("admin@citywatch.in")}
                    className="flex items-center justify-between p-2.5 rounded-sm bg-red-50 border border-red-100 hover:bg-red-100 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🛡️</span>
                      <div>
                        <p className="text-xs font-bold text-red-900 group-hover:underline">Command Center (Admin)</p>
                        <p className="text-[10px] text-red-700 opacity-70">admin@citywatch.in</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">One-Click</span>
                  </button>
                </div>
                <p className="text-[10px] text-center text-gray-400 mt-2">Password: <code className="bg-gray-100 px-1 rounded">Admin@123</code></p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}