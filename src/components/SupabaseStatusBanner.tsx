import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, ShieldCheck, CheckCircle2, ChevronDown, ChevronUp, Copy, Check, ExternalLink, Key, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured, getSupabaseConfig } from '../lib/supabase';

export const SupabaseStatusBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const isLive = isSupabaseConfigured();
  const config = getSupabaseConfig();

  const handleCopyEnv = () => {
    const text = `# Supabase Environment Variables\nVITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=your-anon-key`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#0B0C14] border-b border-white/10 font-mono text-xs select-none">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className={`w-2 h-2 rounded-full shrink-0 ${
            isLive
              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse'
              : 'bg-[#FF5C00] shadow-[0_0_8px_rgba(255,92,0,0.8)]'
          }`} />

          <div className="flex items-center gap-1.5 truncate">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] sm:text-xs">
              {isLive ? 'SUPABASE POSTGRESQL' : 'DATA ENGINE'} //
            </span>
            <span className={`font-black uppercase text-[10px] sm:text-xs ${
              isLive ? 'text-emerald-400' : 'text-[#FF5C00]'
            }`}>
              {isLive ? 'LIVE CLOUD PERSISTENCE ACTIVE' : 'HYBRID STORAGE READY (PHASE 3)'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition cursor-pointer shrink-0"
        >
          <span>{isExpanded ? 'HIDE SPECS' : 'DB SPECS'}</span>
          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Expanded Spec Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10 bg-[#0E0F18] p-4 text-slate-300 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Tables & RLS */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF5C00]">
                  <Database className="w-4 h-4" />
                  <span>POSTGRESQL TABLES & ROW LEVEL SECURITY (8 TABLES)</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-black/40 p-2.5 rounded-xl border border-white/5">
                  <div>✓ <span className="text-white font-bold">profiles</span> (auth.users ref)</div>
                  <div>✓ <span className="text-white font-bold">activities</span> (RLS active)</div>
                  <div>✓ <span className="text-white font-bold">activity_participants</span></div>
                  <div>✓ <span className="text-white font-bold">communities</span></div>
                  <div>✓ <span className="text-white font-bold">community_members</span></div>
                  <div>✓ <span className="text-white font-bold">interests</span></div>
                  <div>✓ <span className="text-white font-bold">reports</span> (private)</div>
                  <div>✓ <span className="text-white font-bold">blocks</span> (isolation)</div>
                </div>
              </div>

              {/* Right Column: Connection Status & Env Setup */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>ENVIRONMENT VARIABLES</span>
                </div>
                <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">VITE_SUPABASE_URL:</span>
                    <span className={isLive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {isLive ? 'Configured' : 'Not detected (using fallback)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">VITE_SUPABASE_ANON_KEY:</span>
                    <span className={isLive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      {isLive ? 'Configured' : 'Not detected'}
                    </span>
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={handleCopyEnv}
                      className="px-2.5 py-1 rounded bg-[#FF5C00]/20 hover:bg-[#FF5C00]/30 text-[#FF5C00] font-bold text-[10px] flex items-center gap-1 transition cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY .ENV CONFIG'}</span>
                    </button>
                    <span className="text-[10px] text-slate-400">Schema defined in /supabase/schema.sql</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
