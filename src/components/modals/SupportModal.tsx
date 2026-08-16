import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Headphones, Send, CheckCircle2, MessageSquare, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SupportModal: React.FC = () => {
  const { isSupportModalOpen, setIsSupportModalOpen } = useApp();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setSubject('');
      setMessage('');
      setIsSupportModalOpen(false);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isSupportModalOpen && (
        <div id="support-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSupportModalOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-sm rounded-3xl bg-[#14151D] border border-[#2B2E3D] p-6 shadow-2xl space-y-4 text-white z-10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#1F212D] flex items-center justify-center text-[#F5B014]">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Contact 24/7 Support</h3>
                  <p className="text-[10px] text-[#8E93A4]">AK STAR MOD Customer Care</p>
                </div>
              </div>
              <button
                onClick={() => setIsSupportModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#1C1E29] flex items-center justify-center text-[#8E93A4] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isSent ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#10B981] mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-white">Message Dispatched</h4>
                <p className="text-xs text-[#8E93A4]">
                  Our administrator team will review your ticket and notify you via email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-[#8C91A0] uppercase block mb-1">
                    Subject / Order Reference
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Order #ORD-992-AKX inquiry"
                    className="w-full h-9 bg-[#1A1C26] border border-[#2A2D3C] rounded-lg px-3 text-xs text-white placeholder-[#6D7282] outline-none focus:border-[#F5B014]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#8C91A0] uppercase block mb-1">
                    Describe your issue
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message or payment query..."
                    required
                    className="w-full bg-[#1A1C26] border border-[#2A2D3C] rounded-lg p-3 text-xs text-white placeholder-[#6D7282] outline-none focus:border-[#F5B014] resize-none"
                  />
                </div>

                <div className="flex space-x-2 pt-1">
                  <a
                    href="mailto:support@akstarmod.com"
                    className="flex-1 h-10 rounded-xl bg-[#1B1D28] hover:bg-[#252837] border border-[#2E3142] text-xs font-semibold text-[#CED2DF] flex items-center justify-center space-x-1.5 transition-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#F5B014]" />
                    <span>Email Direct</span>
                  </a>

                  <button
                    type="submit"
                    className="flex-1 h-10 rounded-xl bg-[#F5B014] hover:bg-[#FFD54F] active:scale-95 text-black font-extrabold text-xs flex items-center justify-center space-x-1.5 shadow-md transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Ticket</span>
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
