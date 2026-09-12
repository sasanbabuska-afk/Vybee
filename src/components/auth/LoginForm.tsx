import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import { AnimatedVybeLogo } from '../icons/AnimatedVybeLogo';
import { VybeWordmark } from '../widgets/VybeWordmark';
import { authService } from '../../services/authService';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
  onExploreAsGuest?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToSignup,
  onExploreAsGuest
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States: 'idle' | 'loading' | 'success' | 'error'
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Forgot password popup state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Focused state for inputs
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setStatus('error');
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!email.trim()) {
      triggerError('Please enter your email address.');
      return;
    }
    if (!password) {
      triggerError('Please enter your password.');
      return;
    }

    setStatus('loading');

    try {
      if (authService.isLive()) {
        const { user, error } = await authService.signIn(email.trim(), password);
        if (error) throw error;
      } else {
        // Mock / Local simulation delay
        await new Promise(res => setTimeout(res, 900));
      }

      // Success state
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 900);
    } catch (err: any) {
      triggerError(err.message || 'Incorrect credentials. Please verify and try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      if (authService.isLive()) {
        const { error } = await authService.signInWithGoogle();
        if (error) throw error;
      } else {
        await new Promise(res => setTimeout(res, 800));
        setStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 800);
      }
    } catch (err: any) {
      triggerError(err.message || 'Google sign-in could not be completed.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    try {
      if (authService.isLive()) {
        await authService.resetPassword(forgotEmail.trim());
      }
      setForgotSent(true);
    } catch {
      setForgotSent(true);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-2 rounded-2xl bg-black/40 border border-[#FF5C00]/30 shadow-[0_0_25px_rgba(255,92,0,0.3)] inline-block cursor-pointer"
          >
            <AnimatedVybeLogo size="md" />
          </motion.div>
        </div>

        <div className="flex justify-center">
          <VybeWordmark size="md" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-black text-white font-display tracking-tight">
            Find your people. Do your thing.
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Sign in to discover what's happening around you.
          </p>
        </div>
      </div>

      {/* Login Form */}
      <motion.form
        onSubmit={handleSignIn}
        className="space-y-4"
        animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Email Field */}
        <div className="space-y-1.5 text-left">
          <label 
            htmlFor="signin-email"
            className="block text-xs font-mono font-medium text-slate-300 tracking-wide"
          >
            EMAIL ADDRESS
          </label>
          <div 
            className={`relative rounded-2xl bg-[#090A10] border transition-all duration-300 ${
              focusedField === 'email'
                ? 'border-[#FF5C00] shadow-[0_0_18px_rgba(255,92,0,0.25)]'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Mail 
                className={`w-4 h-4 transition-colors duration-200 ${
                  focusedField === 'email' ? 'text-[#FF5C00]' : 'text-slate-500'
                }`} 
              />
            </div>
            <input
              id="signin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="alex@vybe.network"
              className="w-full pl-10 pr-4 py-3 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-sans"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <label 
              htmlFor="signin-password"
              className="block text-xs font-mono font-medium text-slate-300 tracking-wide"
            >
              PASSWORD
            </label>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-[11px] text-[#FF5C00] hover:text-[#ff7a29] transition font-sans cursor-pointer underline-offset-2 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div 
            className={`relative rounded-2xl bg-[#090A10] border transition-all duration-300 ${
              focusedField === 'password'
                ? 'border-[#FF5C00] shadow-[0_0_18px_rgba(255,92,0,0.25)]'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Lock 
                className={`w-4 h-4 transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-[#FF5C00]' : 'text-slate-500'
                }`} 
              />
            </div>
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-11 py-3 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-sans"
              disabled={status === 'loading' || status === 'success'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition cursor-pointer p-0.5"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-300 text-left"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SIGN IN BUTTON with Animated States */}
        <div className="pt-2">
          <motion.button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            whileHover={status === 'idle' ? { scale: 1.015, y: -1 } : {}}
            whileTap={status === 'idle' ? { scale: 0.985 } : {}}
            className={`relative w-full py-3.5 rounded-2xl font-mono font-bold text-sm uppercase tracking-wider transition-all duration-300 overflow-hidden cursor-pointer shadow-lg ${
              status === 'success'
                ? 'bg-emerald-500 text-black shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                : 'bg-[#FF5C00] hover:bg-[#ff6d19] text-black shadow-[0_0_25px_rgba(255,92,0,0.4)]'
            }`}
          >
            {/* Animated glowing energy tracer across button during loading */}
            {status === 'loading' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }}
              />
            )}

            <div className="relative z-10 flex items-center justify-center gap-2">
              {status === 'loading' && (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-black border-t-transparent rounded-full"
                  />
                  <span>CONNECTING...</span>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ CONNECTED</span>
                </>
              )}

              {status === 'idle' && (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}

              {status === 'error' && (
                <>
                  <span>SIGN IN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </div>
          </motion.button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center py-2">
          <div className="w-full border-t border-white/10" />
          <span className="absolute px-3 bg-[#0D0E16] text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            OR
          </span>
        </div>

        {/* CONTINUE WITH GOOGLE */}
        <motion.button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={status === 'loading' || status === 'success'}
          whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono font-medium flex items-center justify-center gap-2.5 transition cursor-pointer"
        >
          {/* Authentic Google Icon SVG */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>CONTINUE WITH GOOGLE</span>
        </motion.button>
      </motion.form>

      {/* Guest Mode & Switch to Sign Up */}
      <div className="pt-2 space-y-3 text-center">
        {onExploreAsGuest && (
          <button
            type="button"
            onClick={onExploreAsGuest}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-mono tracking-wider cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF5C00]" />
            <span>EXPLORE AS GUEST</span>
          </button>
        )}

        <div className="text-xs text-slate-400 font-sans">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-[#FF5C00] hover:text-[#ff7a29] font-bold transition cursor-pointer underline-offset-2 hover:underline ml-1"
          >
            Create account
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-[#11121C] border border-white/15 p-6 space-y-4 shadow-2xl text-left relative"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FF5C00]/10 text-[#FF5C00]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reset Password</h3>
                  <p className="text-xs text-slate-400">Enter your email to receive recovery instructions.</p>
                </div>
              </div>

              {forgotSent ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                  <p className="font-bold">Recovery link dispatched!</p>
                  <p>Check your inbox for password reset instructions.</p>
                  <button
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSent(false);
                    }}
                    className="mt-2 w-full py-2 rounded-xl bg-emerald-500 text-black font-mono font-bold text-xs cursor-pointer"
                  >
                    RETURN TO LOGIN
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#090A10] border border-white/10 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-[#FF5C00]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono cursor-pointer"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 py-2.5 rounded-xl bg-[#FF5C00] hover:bg-[#ff6d19] text-black font-mono font-bold text-xs cursor-pointer"
                    >
                      {forgotLoading ? 'SENDING...' : 'SEND LINK'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
