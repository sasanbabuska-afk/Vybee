import React, { useState } from 'react';
import { X, Flag, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

interface SafetyReportModalProps {
  activityId?: string;
  reportedUserId?: string;
  onClose: () => void;
  onSubmitReport: (data: {
    activityId?: string;
    reportedUserId?: string;
    reason: 'Spam' | 'Harassment' | 'Fake profile' | 'Inappropriate behavior' | 'Dangerous activity' | 'Other';
    description: string;
  }) => void;
}

export const SafetyReportModal: React.FC<SafetyReportModalProps> = ({
  activityId,
  reportedUserId,
  onClose,
  onSubmitReport
}) => {
  const [reason, setReason] = useState<
    'Spam' | 'Harassment' | 'Fake profile' | 'Inappropriate behavior' | 'Dangerous activity' | 'Other'
  >('Inappropriate behavior');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport({
      activityId,
      reportedUserId,
      reason,
      description: description.trim()
    });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  const REASONS = [
    'Inappropriate behavior',
    'Spam',
    'Harassment',
    'Fake profile',
    'Dangerous activity',
    'Other'
  ] as const;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-md my-auto rounded-3xl bg-[#16161D] border border-white/10 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white font-display">
                Report Safety Concern
              </h3>
              <p className="text-xs text-slate-400">
                Help keep NOVA a safe and respectful community.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FF5C00]/20 text-[#FF5C00] flex items-center justify-center mx-auto border border-[#FF5C00]/30">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Report Submitted</h4>
            <p className="text-xs text-slate-400">
              Thank you for keeping our community safe. Our moderation team will review this report.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Reason for reporting
              </label>
              <div className="grid grid-cols-2 gap-2">
                {REASONS.map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setReason(r)}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition cursor-pointer ${
                      reason === r
                        ? 'bg-red-500/15 border-red-500 text-red-300'
                        : 'bg-[#111116] border-white/5 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Additional Details (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Please describe what happened..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111116] border border-white/10 text-slate-100 text-xs focus:outline-none focus:border-[#FF5C00]/50 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#1A1A1F] hover:bg-[#25252B] text-slate-300 text-xs font-bold border border-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-wider transition active:scale-95 shadow-md shadow-red-500/20 cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
