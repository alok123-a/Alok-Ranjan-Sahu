import React, { useState, useMemo, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  classifyUserCategory,
  getRegisteredUsers,
  saveStoredUserProfile,
  calculateAgeFromDob,
} from '../services/userCategoryClassifier';
import { edgeAudio } from '../services/audioBuzzer';
import {
  X,
  User,
  Phone,
  Lock,
  Calendar,
  Briefcase,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserPlus,
  LogIn,
  AlertTriangle,
  Zap,
  Volume2,
  LogOut,
  KeyRound,
  RotateCcw,
  Check,
  Send,
  MessageSquare,
  BadgeAlert,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAuthenticated: (profile: UserProfile) => void;
  onSignOut?: () => void;
  currentUser?: UserProfile | null;
  initialTab?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onUserAuthenticated,
  onSignOut,
  currentUser,
  initialTab = 'signup',
}) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(initialTab);
  const [step, setStep] = useState<'credentials' | 'otp_verify' | 'dob_profile'>(
    currentUser ? 'dob_profile' : 'credentials'
  );

  // Form State
  const [name, setName] = useState<string>(currentUser ? currentUser.name : '');
  const [phone, setPhone] = useState<string>(currentUser?.phone || '');
  const [password, setPassword] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>(
    currentUser?.dateOfBirth || '1992-04-12'
  );
  const [occupation, setOccupation] = useState<UserProfile['occupation']>(
    currentUser ? currentUser.occupation : 'construction_worker'
  );
  const [hasCardio, setHasCardio] = useState<boolean>(
    currentUser?.hasCardiovascularCondition || false
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OTP Simulation State
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [otpCountdown, setOtpCountdown] = useState<number>(45);
  const [showSimulatedSmsBanner, setShowSimulatedSmsBanner] = useState<boolean>(false);

  // Synchronize initial data when modal opens or currentUser changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhone(currentUser.phone || '');
      setDateOfBirth(currentUser.dateOfBirth || '1992-04-12');
      setOccupation(currentUser.occupation);
      setHasCardio(currentUser.hasCardiovascularCondition || false);
      setStep('dob_profile');
    } else {
      setActiveTab(initialTab);
      setStep('credentials');
    }
  }, [currentUser, isOpen, initialTab]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isOtpSent && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, otpCountdown]);

  // Computed Age from Date of Birth
  const ageAnalysis = useMemo(() => {
    return calculateAgeFromDob(dateOfBirth);
  }, [dateOfBirth]);

  // Live real-time classification preview based on analyzed age & occupation
  const classification = useMemo(() => {
    return classifyUserCategory(ageAnalysis.years, occupation, hasCardio);
  }, [ageAnalysis.years, occupation, hasCardio]);

  if (!isOpen) return null;

  // Quick 1-Click Demo Profiles for Hackathon Evaluators
  const handleQuickDemoSelect = (demoUser: UserProfile) => {
    saveStoredUserProfile(demoUser);
    onUserAuthenticated(demoUser);
    onClose();
  };

  // EXISTING USER LOGIN (Mobile + Password)
  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    const registered = getRegisteredUsers();
    const existing = registered.find((u) => {
      const uClean = (u.phone || '').replace(/\D/g, '');
      return uClean === cleanPhone;
    });

    if (existing) {
      // Validate password (or accept demo default)
      if (existing.password && existing.password !== password && password !== 'password123') {
        setErrorMessage('Incorrect password. Please try again or use the demo password (password123).');
        return;
      }

      saveStoredUserProfile(existing);
      onUserAuthenticated(existing);

      // If existing user already has DOB, close modal and finish
      if (existing.dateOfBirth) {
        onClose();
      } else {
        // Prompt to fill DOB if missing
        setName(existing.name);
        setPhone(existing.phone);
        setStep('dob_profile');
      }
    } else {
      setErrorMessage(
        'No account found with this mobile number. Please switch to Sign Up to register directly.'
      );
    }
  };

  // DIRECT SIGN UP FOR NEW USER (NO REAL-TIME OTP REQUIRED)
  const handleDirectSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    // Direct progression to Date of Birth & Age Analysis (no real-time OTP wait needed)
    edgeAudio.playRelayClick();
    setStep('dob_profile');
  };

  // OPTIONAL OTP SIMULATION (If user specifically wants to test simulated OTP)
  const handleSendSimulatedOtp = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!name.trim()) {
      setErrorMessage('Please enter your full name first.');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setEnteredOtp(code); // prefilled for instant ease
    setIsOtpSent(true);
    setOtpCountdown(45);
    setShowSimulatedSmsBanner(true);
    setStep('otp_verify');
    edgeAudio.playRelayClick();
  };

  // RESEND OTP
  const handleResendOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setEnteredOtp(code);
    setOtpCountdown(45);
    setShowSimulatedSmsBanner(true);
    edgeAudio.playRelayClick();
  };

  // VERIFY OTP (OR SKIP TO DOB)
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (enteredOtp && enteredOtp.trim() !== generatedOtp.trim()) {
      setErrorMessage('Invalid OTP code. You can also click "Skip OTP" below.');
      return;
    }

    setShowSimulatedSmsBanner(false);
    setStep('dob_profile');
  };

  // SKIP OTP & PROCEED DIRECTLY
  const handleSkipOtp = () => {
    setShowSimulatedSmsBanner(false);
    setStep('dob_profile');
  };

  // AUTOFILL OTP (For testing convenience)
  const handleAutofillOtp = () => {
    setEnteredOtp(generatedOtp);
    setErrorMessage(null);
  };

  // COMPLETE PROFILE & ACTIVATE ALERTS
  const handleCompleteProfileAndActivateAlerts = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const cleanPhone = phone.replace(/\D/g, '');

    const newProfile: UserProfile = {
      id: currentUser ? currentUser.id : `usr-${Date.now()}`,
      name: name.trim() || 'ThermaEdge User',
      phone: cleanPhone,
      dateOfBirth,
      password: password || currentUser?.password || 'password123',
      age: ageAnalysis.years,
      persona: classification.persona,
      categoryLabel: classification.categoryLabel,
      categoryReason: classification.categoryReason,
      occupation,
      hasCardiovascularCondition: hasCardio,
      safeThresholdWbgt: classification.safeThresholdWbgt,
      hydrationGoalMl: classification.hydrationGoalMl,
      registeredAt: timestamp,
    };

    saveStoredUserProfile(newProfile);
    onUserAuthenticated(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#0e1424] border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            {step === 'dob_profile' ? (
              <Calendar className="w-6 h-6" />
            ) : step === 'otp_verify' ? (
              <KeyRound className="w-6 h-6" />
            ) : activeTab === 'signup' ? (
              <UserPlus className="w-6 h-6" />
            ) : (
              <LogIn className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {step === 'dob_profile'
                ? 'Date of Birth & Physiological Heat Analysis'
                : step === 'otp_verify'
                ? 'Optional SMS Code Verification'
                : activeTab === 'signup'
                ? 'New User: Direct Mobile Sign Up'
                : 'Existing User: Mobile & Password Login'}
            </h3>
            <p className="text-xs text-slate-400">
              {step === 'dob_profile'
                ? 'Your exact Date of Birth determines your heat vulnerability category & alert siren limits.'
                : step === 'otp_verify'
                ? `Verification code simulation for +91 ${phone} (or click Skip to proceed immediately)`
                : activeTab === 'signup'
                ? 'Instant registration with mobile number & password — no real-time OTP wait required!'
                : 'Sign in to load your personalized heatwave protection parameters'}
            </p>
          </div>
        </div>

        {/* SIMULATED SMS NOTIFICATION BANNER (When OTP is sent) */}
        {showSimulatedSmsBanner && step === 'otp_verify' && (
          <div className="mb-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-[#0e1424] border border-emerald-500/50 rounded-2xl p-3 shadow-lg shadow-emerald-950/40 animate-fade-in relative">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 mt-0.5">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      SIMULATED SMS GATEWAY
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                      Delivered
                    </span>
                  </div>
                  <p className="text-xs text-white mt-0.5">
                    ThermaEdge OTP: <strong className="font-mono text-emerald-300 text-sm tracking-wider">{generatedOtp}</strong> for mobile +91 {phone}. Valid for 5 minutes.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAutofillOtp}
                className="shrink-0 px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                title="Click to automatically fill the OTP into the form"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Autofill</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Demo Accounts Banner for Hackathon Evaluators (Visible on Credentials step) */}
        {step === 'credentials' && (
          <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800/80 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Quick 1-Click Evaluator Accounts (BPUT Hackathon):
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickDemoSelect({
                    id: 'demo-student',
                    name: 'Pooja (Student)',
                    phone: '9876543233',
                    dateOfBirth: '2014-11-20',
                    password: 'password123',
                    email: 'pooja.student@bput.ac.in',
                    age: 11,
                    persona: 'student',
                    categoryLabel: 'Young Child (Extreme Pediatric Heat Vulnerability)',
                    categoryReason: 'DOB: 2014-11-20 (Age 11): High body-surface-area ratio, rapid dehydration in tin-roof schools.',
                    occupation: 'student',
                    safeThresholdWbgt: 29.0,
                    hydrationGoalMl: 650,
                    registeredAt: '2026-10-09 08:30:00',
                  })
                }
                className="p-2 rounded-xl bg-slate-950/70 border border-amber-500/30 hover:border-amber-400 text-left transition-all"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-white">
                  <span>🎒</span>
                  <span>Child (11 yrs)</span>
                </div>
                <span className="text-[10px] text-amber-300 block">DOB: 2014-11-20</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoSelect({
                    id: 'demo-labourer',
                    name: 'Sunil (Labourer)',
                    phone: '9876543210',
                    dateOfBirth: '1992-04-12',
                    password: 'password123',
                    email: 'sunil.works@nh16odisha.in',
                    age: 34,
                    persona: 'labourer',
                    categoryLabel: 'Outdoor Labourer / Heavy Exertion Worker',
                    categoryReason: 'DOB: 1992-04-12 (Age 34): 450 W/m² metabolic heat generation under unshaded solar flux on highway site.',
                    occupation: 'construction_worker',
                    safeThresholdWbgt: 28.0,
                    hydrationGoalMl: 1000,
                    registeredAt: '2026-10-09 07:45:00',
                  })
                }
                className="p-2 rounded-xl bg-slate-950/70 border border-orange-500/30 hover:border-orange-400 text-left transition-all"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-white">
                  <span>👷</span>
                  <span>Labourer (34 yrs)</span>
                </div>
                <span className="text-[10px] text-orange-300 block">DOB: 1992-04-12</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleQuickDemoSelect({
                    id: 'demo-elderly',
                    name: 'Ramesh (Senior)',
                    phone: '9876543222',
                    dateOfBirth: '1958-08-15',
                    password: 'password123',
                    email: 'ramesh.senior@gmail.com',
                    age: 68,
                    persona: 'elderly',
                    categoryLabel: 'Senior Citizen (High Cardiovascular Vulnerability)',
                    categoryReason: 'DOB: 1958-08-15 (Age 68): Blunted thirst perception and reduced cardiac output. Dry fan warning enabled.',
                    occupation: 'retired',
                    hasCardiovascularCondition: true,
                    safeThresholdWbgt: 29.0,
                    hydrationGoalMl: 850,
                    registeredAt: '2026-10-09 09:15:00',
                  })
                }
                className="p-2 rounded-xl bg-slate-950/70 border border-rose-500/30 hover:border-rose-400 text-left transition-all"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-white">
                  <span>👵</span>
                  <span>Senior (68 yrs)</span>
                </div>
                <span className="text-[10px] text-rose-300 block">DOB: 1958-08-15</span>
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS (MOBILE NUMBER LOGIN vs OTP SIGNUP) */}
        {step === 'credentials' && (
          <div>
            {/* Tabs */}
            <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800 mb-4">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'signup'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New User (Direct Sign Up)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'signin'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Existing User (Login)</span>
              </button>
            </div>

            {/* TAB CONTENT: NEW USER SIGNUP (DIRECT - NO REAL-TIME OTP) */}
            {activeTab === 'signup' ? (
              <form onSubmit={handleDirectSignUp} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Chandra Das"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Mobile Number
                  </label>
                  <div className="relative flex">
                    <div className="bg-slate-950 border border-r-0 border-slate-800 rounded-l-xl px-3 flex items-center text-xs text-slate-400 font-mono">
                      +91
                    </div>
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-slate-900 border border-slate-800 rounded-r-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-1">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span>Direct registration: No real-time OTP wait or SMS delivery delay.</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Create Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a secure password (min 4 characters)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div className="pt-1 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up &amp; Proceed to Date of Birth Analysis</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendSimulatedOtp}
                      className="text-[11px] text-slate-500 hover:text-slate-400 underline"
                    >
                      (Optional: Test simulated SMS OTP verification flow)
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* TAB CONTENT: EXISTING USER LOGIN (MOBILE + PASSWORD) */
              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Mobile Number
                  </label>
                  <div className="relative flex">
                    <div className="bg-slate-950 border border-r-0 border-slate-800 rounded-l-xl px-3 flex items-center text-xs text-slate-400 font-mono">
                      +91
                    </div>
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-slate-900 border border-slate-800 rounded-r-xl pl-9 pr-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[10px]">
                    <span className="text-slate-400">Demo accounts password: <code className="text-amber-400 font-mono">password123</code></span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signup');
                        setErrorMessage(null);
                      }}
                      className="text-amber-400 hover:underline"
                    >
                      Need an account? Direct Sign Up
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Mobile &amp; Password</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 1.5: OTP VERIFICATION (FOR SIGN UP) */}
        {step === 'otp_verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Enter Verification Code
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Sent via SMS to <strong className="text-amber-300 font-mono">+91 {phone}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Edit Number
                </button>
              </div>

              {/* 6-Digit OTP Input */}
              <div className="flex justify-center my-3">
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="bg-slate-950 border-2 border-amber-500/60 rounded-2xl px-4 py-3 text-2xl font-black font-mono text-center tracking-[0.5em] text-amber-400 w-64 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>
                  Didn&apos;t receive code?{' '}
                  {otpCountdown > 0 ? (
                    <span className="font-mono text-slate-400">Resend in {otpCountdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-amber-400 font-bold hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleAutofillOtp}
                  className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Autofill ({generatedOtp})</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="py-3 px-3 rounded-xl text-xs font-semibold bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSkipOtp}
                className="py-3 px-3 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40"
              >
                Skip OTP (Direct)
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify &amp; Proceed to DOB</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: DATE OF BIRTH & AGE VULNERABILITY ANALYSIS */}
        {step === 'dob_profile' && (
          <div className="space-y-4">
            {/* Date of Birth Picker & Live Age Calculation */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Enter Your Date of Birth:</span>
                </label>
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400">Analyzed Age:</span>
                  <span className="text-base font-black font-mono text-amber-400 tabular-nums">
                    {ageAnalysis.years} yrs
                  </span>
                </div>
              </div>

              {/* Native Date Input */}
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-slate-950 border border-amber-500/40 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-amber-400"
              />

              {/* Quick Date of Birth Presets for Testing */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5 tracking-wider">
                  Quick Select by Age Category (Date of Birth Presets):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {[
                    { label: '8 yrs', role: 'Child', icon: '🧒', dob: '2018-05-15', occ: 'student' },
                    { label: '14 yrs', role: 'Student', icon: '🎒', dob: '2012-09-20', occ: 'student' },
                    { label: '34 yrs', role: 'Labourer', icon: '👷', dob: '1992-04-12', occ: 'construction_worker' },
                    { label: '40 yrs', role: 'General', icon: '💼', dob: '1986-10-05', occ: 'desk_job' },
                    { label: '68 yrs', role: 'Senior', icon: '👵', dob: '1958-08-15', occ: 'retired' },
                    { label: '82 yrs', role: 'Geriatric', icon: '👴', dob: '1944-01-20', occ: 'retired' },
                  ].map((preset) => (
                    <button
                      key={preset.dob}
                      type="button"
                      onClick={() => {
                        setDateOfBirth(preset.dob);
                        setOccupation(preset.occ as UserProfile['occupation']);
                      }}
                      className={`p-1.5 rounded-xl border text-center transition-all ${
                        dateOfBirth === preset.dob
                          ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-1 ring-amber-400/50 font-bold'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-sm block">{preset.icon}</span>
                      <span className="text-[11px] font-mono font-bold block">{preset.label}</span>
                      <span className="text-[9px] text-slate-400 block truncate">{preset.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Occupation Selector */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
              <label className="text-xs font-bold text-slate-200 block mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-cyan-400" />
                <span>Primary Occupation / Daily Physical Environment:</span>
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'student', label: '🎒 School / Student', desc: 'Classroom / campus' },
                  { id: 'construction_worker', label: '👷 Construction / Field', desc: 'Heavy outdoor exertion' },
                  { id: 'retired', label: '🛋️ Retired / Home', desc: 'Residential exposure' },
                  { id: 'desk_job', label: '💼 Desk Job / General', desc: 'Moderate indoor/outdoor' },
                ].map((occ) => (
                  <button
                    key={occ.id}
                    type="button"
                    onClick={() => setOccupation(occ.id as UserProfile['occupation'])}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      occupation === occ.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-xs block text-white">{occ.label}</span>
                    <span className="text-[10px] text-slate-400">{occ.desc}</span>
                  </button>
                ))}
              </div>

              {/* Cardiovascular health toggle */}
              <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCardio}
                    onChange={(e) => setHasCardio(e.target.checked)}
                    className="accent-rose-500 rounded"
                  />
                  <span>Cardiovascular or respiratory health indicators present</span>
                </label>
                {hasCardio && (
                  <span className="text-[10px] text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded font-mono">
                    Prioritizes High Alert
                  </span>
                )}
              </div>
            </div>

            {/* LIVE AUTOMATED AGE & VULNERABILITY CLASSIFICATION CARD */}
            <div className="rounded-2xl p-4 border bg-gradient-to-br from-slate-950 via-slate-900 to-[#121929] border-amber-500/40 relative overflow-hidden shadow-xl space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{classification.avatarIcon}</span>
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 block">
                      SYSTEM DETECTED PHYSIOLOGICAL CATEGORY
                    </span>
                    <h4 className="text-sm font-black text-white leading-tight">
                      {classification.categoryLabel}
                    </h4>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                  Safe Limit: {classification.safeThresholdWbgt}°C WBGT
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                {classification.categoryReason}
              </p>

              {/* Prescribed Protection Specs & Audio Siren Test */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 uppercase">Target Hydration:</span>
                  <span className="font-mono font-bold text-cyan-300 text-sm">
                    {classification.hydrationGoalMl} ml/h
                  </span>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 uppercase">Alert Trigger:</span>
                  <span className="font-mono font-bold text-amber-300 text-sm">
                    &gt; {classification.safeThresholdWbgt}°C WBGT
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => edgeAudio.playExtremeHeatWarningAlert()}
                  className="bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 p-2.5 rounded-xl flex items-center justify-center gap-2 text-rose-200 transition-colors"
                  title="Test siren sound that plays when temperature breaches this category's safe threshold"
                >
                  <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />
                  <span className="text-[11px] font-bold">Test Category Siren</span>
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {currentUser ? (
                <>
                  {onSignOut && (
                    <button
                      type="button"
                      onClick={() => {
                        onSignOut();
                        onClose();
                      }}
                      className="py-3 px-3 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/30 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setActiveTab('signin');
                    }}
                    className="py-3 px-3 rounded-xl text-xs font-semibold bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  >
                    Switch User
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="py-3 px-4 rounded-xl text-xs font-semibold bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                >
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={handleCompleteProfileAndActivateAlerts}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {currentUser
                    ? 'Update DOB & Recalibrate Alerts'
                    : 'Save Profile & Activate Protective Alerts'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
