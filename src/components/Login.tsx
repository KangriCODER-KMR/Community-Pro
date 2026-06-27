import React, { useState, useEffect } from 'react';
import { dbService } from '../lib/db';
import { UserProfile } from '../types';
import { Shield, Zap, Sparkles, AlertCircle, Phone, Smartphone, Lock, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [loginMode, setLoginMode] = useState<'citizen' | 'admin'>('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Admin form state
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');

  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and email first.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide a valid mobile phone number.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code.');
      }
      setOtpSent(true);
      setResendCooldown(30);
      setOtpMessage(data.message || null);
      if (data.simulated) {
        setSimulatedCode(data.simulatedCode);
      } else {
        setSimulatedCode(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while sending OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), code: otpCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      // Complete profile registration explicitly as citizen (forceIsAdmin = false)
      await dbService.loginMock(name, email, phone, false);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName.trim() || !adminEmail.trim()) {
      setError('Please provide your Admin Display Name and email.');
      return;
    }

    const cleanEmail = adminEmail.trim().toLowerCase();
    const isAuthorized = cleanEmail === 'anayatgull019@gmail.com';
    
    if (!isAuthorized) {
      setError('Access Denied. Only the designated administrator (anayatgull019@gmail.com) is authorized to log in.');
      return;
    }

    if (adminPasscode.trim() !== 'admin786') {
      setError('Invalid admin passcode.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Complete profile registration explicitly as administrator (forceIsAdmin = true)
      await dbService.loginMock(adminName, adminEmail, undefined, true);
      onLoginSuccess();
    } catch (err: any) {
      setError('Failed to authorize admin session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen bg-gradient-to-tr from-indigo-950 via-slate-950 to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Blurs */}
      <div className="absolute top-10 left-10 w-[450px] h-[450px] bg-gradient-to-tr from-emerald-500/20 to-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-4000" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-gradient-to-tr from-fuchsia-500/20 to-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-3000" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md bg-slate-900/75 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 shadow-[0_0_50px_rgba(99,102,241,0.15)] relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-amber-500" />

        {/* Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 rounded-2xl mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Shield className="w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-display">
            Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 font-display select-none">Hero</span>
          </h1>
          <p className="text-slate-300 text-sm max-w-xs mx-auto leading-relaxed font-sans">
            AI-powered hyperlocal safety prioritization hub. Coordinate municipal actions and civic reports.
          </p>
        </div>

        {/* Toggle between Citizen & Admin */}
        {!otpSent && (
          <div className="flex bg-slate-950/85 p-1 rounded-xl border border-slate-800/80 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode('citizen');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'citizen'
                  ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Citizen Access
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('admin');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'admin'
                  ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Municipal Admin
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {loginMode === 'citizen' ? (
          /* CITIZEN FLOW */
          !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1.5" htmlFor="name-input">
                  Citizen Display Name
                </label>
                <input
                  id="name-input"
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-700 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1.5" htmlFor="email-input">
                  Verified Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  placeholder="e.g. aarav.sharma@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-700 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1.5" htmlFor="phone-input">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="phone-input"
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-700 transition"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Include country code (e.g., +91 for India).
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Send Verification OTP</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* OTP Verification Stage Form */
            <form onSubmit={handleVerifyOtpAndLogin} className="space-y-5 text-left">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-2">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">STEP 2 OF 2</span>
                  <span className="text-xs font-bold text-white">Enter Verification Code</span>
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed">
                We have dispatched a secure, unique verification code to <strong className="text-slate-200">{phone}</strong>. Enter it below to register.
              </p>

              {simulatedCode && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-emerald-400 font-mono text-[10px] space-y-1.5 shadow-[0_0_15px_rgba(16,185,129,0.05)]">
                  <span className="block font-bold">🛠️ LOCAL TESTING DISPATCH EMULATOR</span>
                  <span className="text-slate-300 block leading-normal">
                    {otpMessage || "The secure SMS verification code was captured by our server."}
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-slate-400">Captured OTP Code:</span>
                    <strong className="bg-slate-950 px-2.5 py-1 rounded text-xs text-white border border-slate-800 tracking-widest font-black">
                      {simulatedCode}
                    </strong>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1.5" htmlFor="otp-input">
                  6-Digit Secure Code
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="otp-input"
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-lg pl-10 pr-3 py-2.5 text-sm text-center font-mono tracking-[0.5em] text-white placeholder-slate-700 transition"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Didn't receive the SMS?</span>
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={loading || resendCooldown > 0}
                  className="text-emerald-400 hover:text-emerald-300 font-bold disabled:text-slate-600 transition cursor-pointer"
                >
                  {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2.5 px-4 rounded-lg text-sm transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-slate-950" />
                    <span>Verify & Create Profile</span>
                  </>
                )}
              </button>
            </form>
          )
        ) : (
          /* ADMIN FLOW */
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="bg-purple-950/40 border border-purple-800/30 rounded-xl p-3 text-[11px] text-purple-300 space-y-1">
              <span className="font-extrabold block">🛡️ MUNICIPAL GATEWAY SECURITY ACTIVE</span>
              <p className="leading-relaxed text-slate-400">
                Access is restricted to authorized personnel. Use your registered administrator email address and secure passcode to log in.
              </p>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5" htmlFor="admin-name-input">
                Admin Display Name
              </label>
              <input
                id="admin-name-input"
                type="text"
                placeholder="e.g. Inspector Amit Sharma"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-700 transition"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5" htmlFor="admin-email-input">
                Municipal Email Address
              </label>
              <input
                id="admin-email-input"
                type="email"
                placeholder="e.g. amit.sharma@municipal.gov.in"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-700 transition"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-slate-400 text-xs font-medium" htmlFor="admin-passcode-input">
                  Admin Access Passcode
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-passcode-input"
                  type="password"
                  placeholder="••••••••"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-slate-700 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-950/80 hover:bg-purple-900 text-white font-extrabold py-2.5 px-4 rounded-lg text-sm transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer border border-purple-800/80 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authorizing Admin...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Authorize Admin Portal</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center border-t border-slate-800/50 pt-4">
          <p className="text-[10px] text-slate-500 font-mono">
            SECURE CIVIC LEDGER ACTIVE • LOCAL STORAGE SYNC SECURED
          </p>
        </div>
      </motion.div>
    </div>
  );
}
