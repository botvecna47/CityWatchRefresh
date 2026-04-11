import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAppContext } from "../store";
import { Card, Button, Input, cn } from "../components/ui";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

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
  const [city, setCity] = useState("Springfield");
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
        : { email, password, name, city };

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

  return (
    <div className="min-h-screen bg-[#FDFDF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-serif">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-center text-4xl font-extrabold text-[#1A4331]" style={{ fontFamily: 'Playfair Display, serif' }}>
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
                      <div className="mt-1">
                        <Input 
                          placeholder="Springfield"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
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
                    <span className="px-2 bg-white text-gray-500">Test Accounts</span>
                  </div>
                </div>

                <div className="mt-4 rounded-md bg-gray-50 border border-gray-200 p-4 text-xs text-gray-600 space-y-2">
                  <p className="font-semibold text-gray-700 mb-2">All passwords: <code className="bg-gray-200 px-1.5 py-0.5 rounded text-[#1A4331]">password123</code></p>
                  <div className="grid grid-cols-1 gap-1.5">
                    <div className="flex items-center justify-between">
                      <span>🧑 Citizen:</span>
                      <code className="bg-gray-200 px-1.5 py-0.5 rounded">alice@example.com</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>🔧 Coordinator:</span>
                      <code className="bg-gray-200 px-1.5 py-0.5 rounded">bob@citywatch.com</code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>🛡️ Admin:</span>
                      <code className="bg-gray-200 px-1.5 py-0.5 rounded">admin@citywatch.com</code>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}