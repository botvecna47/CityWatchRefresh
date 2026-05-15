import { useState } from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
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
  const [step, setStep] = useState<"login" | "signup" | "verify">("login");
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");

  // Validation States
  const [emailError, setEmailError] = useState("");
  const [nameError, setNameError] = useState("");
  const [cityError, setCityError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const validateEmail = (val: string) => {
    setEmail(val);
    if (!val) {
      setEmailError("Email is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const validateName = (val: string) => {
    setName(val);
    if (!val) {
      setNameError("Name is required");
    } else if (val.length < 3) {
      setNameError("Name must be at least 3 characters");
    } else if (/[^a-zA-Z\s-]/.test(val)) {
      setNameError("Name can only contain letters, spaces, and hyphens");
    } else {
      setNameError("");
    }
  };

  const isPasswordValid = 
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear dynamic errors
    setCityError("");
    setPasswordError("");
    setConfirmPasswordError("");

    // ── SIGNUP STEP 1: Validate form, then call send-otp ──
    if (step === "signup") {
      let hasEmptyFields = false;
      if (!name) { setNameError("Name is required"); hasEmptyFields = true; }
      if (!city) { setCityError("City is required"); hasEmptyFields = true; }
      if (!email) { setEmailError("Email is required"); hasEmptyFields = true; }
      if (!password) { setPasswordError("Password is required"); hasEmptyFields = true; }
      if (!confirmPassword) { setConfirmPasswordError("Please confirm your password"); hasEmptyFields = true; }

      if (hasEmptyFields) { toast.error("Please fill in all fields."); return; }
      if (emailError || nameError) { toast.error("Please fix the errors before continuing."); return; }
      if (!isPasswordValid) {
        setPasswordError("Password does not meet all criteria.");
        toast.error("Password does not meet all criteria.");
        return;
      }
      if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match.");
        toast.error("Passwords do not match.");
        return;
      }

      // Call the real send-otp endpoint
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to send verification code.");
          return;
        }
        toast.success("Verification code sent! Check your email (or the server console for testing).");
        setStep("verify");
      } catch {
        toast.error("Could not reach the server. Is the backend running?");
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── VERIFY STEP: Call verify-otp, then register ──
    if (step === "verify") {
      if (otp.length < 6) {
        toast.error("Please enter a valid 6-digit code.");
        return;
      }

      setLoading(true);
      try {
        // Step A: Verify the OTP
        const verifyRes = await fetch(`${API_BASE}/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          toast.error(verifyData.error || "Invalid or expired code.");
          return;
        }

        // Step B: Register the account
        const registerRes = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, city, stateCode: "MH", rtoCode: "00" }),
        });
        const data = await registerRes.json();
        if (!registerRes.ok) {
          toast.error(data.error || "Registration failed.");
          return;
        }

        localStorage.setItem("token", data.token);
        setCurrentUser({
          id: String(data.id),
          name: data.name || data.username,
          email: data.email,
          role: data.role.toLowerCase() as "citizen" | "coordinator" | "admin",
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.username || data.email)}`,
          area: data.area || undefined,
          status: (data.status || "ACTIVE").toLowerCase() as "active" | "banned",
          settings: { emailNotifications: true, smsNotifications: false, theme: "system" },
        });
        toast.success("Account created successfully! Welcome to CityWatch.");
        navigate("/");
      } catch {
        toast.error("Something went wrong. Is the backend running?");
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── LOGIN ──
    let hasEmptyFields = false;
    if (!email) { setEmailError("Email is required"); hasEmptyFields = true; }
    if (!password) { setPasswordError("Password is required"); hasEmptyFields = true; }
    if (hasEmptyFields) { toast.error("Please fill in all fields."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Authentication failed.");
        return;
      }

      localStorage.setItem("token", data.token);
      setCurrentUser({
        id: String(data.id),
        name: data.name || data.username,
        email: data.email,
        role: data.role.toLowerCase() as "citizen" | "coordinator" | "admin",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.username || data.email)}`,
        area: data.area || undefined,
        status: (data.status || "ACTIVE").toLowerCase() as "active" | "banned",
        settings: { emailNotifications: true, smsNotifications: false, theme: "system" },
      });
      toast.success(`Welcome back, ${data.name || data.username}!`);
      navigate("/");
    } catch {
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
            
            {step !== "verify" && (
              <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
                <button
                  type="button"
                  onClick={() => {
                    setStep("login");
                    setEmail("");
                    setPassword("");
                    setName("");
                  }}
                  className={cn(
                    "flex-1 py-2 text-sm font-semibold rounded-md transition-all",
                    step === "login" ? "bg-white text-[#1A4331] shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("signup");
                    setEmail("");
                    setPassword("");
                    setName("");
                  }}
                  className={cn(
                    "flex-1 py-2 text-sm font-semibold rounded-md transition-all",
                    step === "signup" ? "bg-white text-[#1A4331] shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Sign Up
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.form 
                key={step}
                initial={{ opacity: 0, x: step === "login" ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: step === "login" ? 20 : -20 }}
                className="space-y-6" 
                onSubmit={handleSubmit}
              >
                {step === "verify" ? (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-[#2E7D32]/10 text-[#2E7D32] rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-[#1A4331] font-serif">Check your email</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        We sent a 6-digit verification code to <br />
                        <span className="font-medium text-[#1A4331]">{email}</span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1A4331] text-center mb-2">
                        Verification Code
                      </label>
                      <Input 
                        type="text"
                        placeholder="000000" 
                        maxLength={6}
                        className="text-center text-3xl tracking-[0.5em] font-mono h-14 uppercase"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-[#1A4331] hover:bg-[#112d21] text-white py-2" 
                      size="lg"
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? "Verifying..." : "Verify & Create Account"}
                    </Button>

                    <div className="text-center mt-4">
                      <button 
                        type="button"
                        onClick={() => {
                          toast.success("A new verification code has been sent!");
                        }} 
                        className="text-sm text-[#2E7D32] hover:underline"
                      >
                        Didn't receive a code? Resend
                      </button>
                    </div>
                    
                    <div className="text-center mt-2">
                      <button 
                        type="button"
                        onClick={() => setStep("signup")} 
                        className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                      >
                        Change email address
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {step === "signup" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-[#1A4331]">
                            Full Name
                          </label>
                          <div className="mt-1">
                            <Input 
                              placeholder="Name" 
                              value={name}
                              onChange={(e) => validateName(e.target.value)}
                              className={nameError ? "border-red-500 focus:ring-red-500" : ""}
                            />
                            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#1A4331]">
                            City
                          </label>
                          <div className="mt-1">
                            <Input 
                              placeholder="City"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              className={cityError ? "border-red-500 focus:ring-red-500" : ""}
                            />
                            {cityError && <p className="text-red-500 text-xs mt-1">{cityError}</p>}
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
                          placeholder="Email address" 
                          value={email}
                          onChange={(e) => validateEmail(e.target.value)}
                          className={emailError ? "border-red-500 focus:ring-red-500" : ""}
                        />
                        {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#1A4331]">
                        Password
                      </label>
                      <div className="mt-1 relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••••••" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={cn("pr-10", passwordError ? "border-red-500 focus:ring-red-500" : "")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      
                      {step === "signup" && (
                        <div className="mt-2 space-y-1 text-xs">
                          <p className="font-medium text-gray-600">Password requirements:</p>
                          <ul className="grid grid-cols-2 gap-1 text-gray-500">
                            <li className={/[A-Z]/.test(password) ? "text-green-600 flex items-center gap-1" : "flex items-center gap-1"}><span className="text-[10px]">{/[A-Z]/.test(password) ? "✓" : "○"}</span> 1 uppercase letter</li>
                            <li className={/[a-z]/.test(password) ? "text-green-600 flex items-center gap-1" : "flex items-center gap-1"}><span className="text-[10px]">{/[a-z]/.test(password) ? "✓" : "○"}</span> 1 lowercase letter</li>
                            <li className={/[0-9]/.test(password) ? "text-green-600 flex items-center gap-1" : "flex items-center gap-1"}><span className="text-[10px]">{/[0-9]/.test(password) ? "✓" : "○"}</span> 1 number</li>
                            <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-600 flex items-center gap-1" : "flex items-center gap-1"}><span className="text-[10px]">{/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "✓" : "○"}</span> 1 special symbol</li>
                            <li className={password.length >= 12 ? "text-green-600 flex items-center gap-1 col-span-2" : "flex items-center gap-1 col-span-2"}><span className="text-[10px]">{password.length >= 12 ? "✓" : "○"}</span> At least 12 characters</li>
                          </ul>
                        </div>
                      )}
                      {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
                    </div>

                    {step === "signup" && (
                      <div>
                        <label className="block text-sm font-medium text-[#1A4331]">
                          Confirm Password
                        </label>
                        <div className="mt-1 relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="••••••••••••" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={cn("pr-10", confirmPasswordError ? "border-red-500 focus:ring-red-500" : "")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {confirmPasswordError && <p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>}
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-[#1A4331] hover:bg-[#112d21] text-white py-2 mt-4" 
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? "Please wait..." : step === "login" ? "Sign in" : "Continue to Verify"}
                    </Button>
                  </>
                )}
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