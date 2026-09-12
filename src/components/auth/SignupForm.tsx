import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { AnimatedVybeLogo } from '../icons/AnimatedVybeLogo';
import { VybeWordmark } from '../widgets/VybeWordmark';
import { authService } from '../../services/authService';

interface SignupFormProps {
  onSuccess: () => void;
  onSwitchToSignin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onSwitchToSignin
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States: 'idle' | 'loading' | 'success' | 'error'
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | 'confirm' | null>(null);

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setStatus('error');
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!displayName.trim()) {
      triggerError('Please enter your display name.');
      return;
    }
    if (!email.trim()) {
      triggerError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      triggerError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      triggerError('Passwords do not match.');
      return;
    }

    setStatus('loading');

    try {
      if (authService.isLive()) {
        const { user, error } = await authService.signUp(email.trim(), password, displayName.trim());
        if (error) throw error;
      } else {
        // Mock delay
        await new Promise(res => setTimeout(res, 900));
      }

      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 900);
    } catch (err: any) {
      triggerError(err.message || 'Account creation failed. Please try again.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
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
            Join the Frequency
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Connect with squads, events, and people near you.
          </p>
        </div>
      </div>

      {/* Signup Form */}
      <motion.form
        onSubmit={handleSignUp}
        className="space-y-3.5"
        animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Display Name */}
        <div className="space-y-1 text-left">
          <label 
            htmlFor="signup-name"
            className="block text-xs font-mono font-medium text-slate-300 tracking-wide"
          >
            DISPLAY NAME
          </label>
          <div 
            className={`relative rounded-2xl bg-[#090A10] border transition-all duration-300 ${
              focusedField === 'name'
                ? 'border-[#FF5C00] shadow-[0_0_18px_rgba(255,92,0,0.25)]'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <User 
                className={`w-4 h-4 transition-colors duration-200 ${
                  focusedField === 'name' ? 'text-[#FF5C00]' : 'text-slate-500'
                }`} 
              />
            </div>
            <input
              id="signup-name"
              type="text"
              required
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="e.g. Alex Rivera"
              className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-sans"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1 text-left">
          <label 
            htmlFor="signup-email"
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
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="alex@vybe.network"
              className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-sans"
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1 text-left">
          <label 
            htmlFor="signup-password"
            className="block text-xs font-mono font-medium text-slate-300 tracking-wide"
          >
            PASSWORD
          </label>
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
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="At least 6 characters"
              className="w-full pl-10 pr-11 py-2.5 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-sans"
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

        {/* Confirm Password */}
        <div className="space-y-1 text-left">
          <label 
            htmlFor="signup-confirm"
            className="block text-xs font-mono font-medium text-slate-300 tracking-wide"
          >
            CONFIRM PASSWORD
          </label>
          <div 
            className={`relative rounded-2xl bg-[#090A10] border transition-all duration-300 ${
              focusedField === 'confirm'
                ? 'border-[#FF5C00] shadow-[0_0_18px_rgba(255,92,0,0.25)]'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Lock 
                className={`w-4 h-4 transition-colors duration-200 ${
                  focusedField === 'confirm' ? 'text-[#FF5C00]' : 'text-slate-500'
                }`} 
              />
            </div>
            <input
              id="signup-confirm"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField(null)}
              placeholder="Repeat your password"
              className="w-full pl-10 pr-4 py-2.5 bg-transparent text-sm text-white placeholder-slate-600 focus:outline-none font-sans"
              disabled={status === 'loading' || status === 'success'}
            />
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

        {/* Submit Button */}
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
                  <span>CREATING ACCOUNT...</span>
                </>
              )}

              {status === 'success' && (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>✓ ACCOUNT CREATED</span>
                </>
              )}

              {status === 'idle' && (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}

              {status === 'error' && (
                <>
                  <span>CREATE ACCOUNT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </div>
          </motion.button>
        </div>
      </motion.form>

      {/* Switch to Sign In */}
      <div className="pt-2 text-center text-xs text-slate-400 font-sans">
        <span>Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToSignin}
          className="text-[#FF5C00] hover:text-[#ff7a29] font-bold transition cursor-pointer underline-offset-2 hover:underline ml-1"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};
