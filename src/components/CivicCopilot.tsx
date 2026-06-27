import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, CommunityIssue } from '../types';
import { Send, Sparkles, Trash2, Shield, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CivicCopilotProps {
  currentUser: UserProfile;
  issues: CommunityIssue[];
}

interface Message {
  sender: 'citizen' | 'civicai';
  text: string;
}

export default function CivicCopilot({ currentUser, issues }: CivicCopilotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'civicai',
      text: `Welcome, **${currentUser.name}**! 👋 I am **CivicAI**, your hyperlocal city helper.

I can guide you on:
- How to draft clear, safety-oriented hazard reports.
- How the **Validation threshold** works (issues need 3 validations to alert city teams!).
- The quickest way to earn **Citizen Karma Points** and rank on the neighborhood leaderboard.

What local issue is on your mind today? Let's clean up our district together!`
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const userMsg: Message = { sender: 'citizen', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSending(true);

    try {
      const response = await fetch('/api/gemini/copilot-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            sender: m.sender === 'citizen' ? 'user' : 'assistant',
            text: m.text
          })),
          issues: issues
        })
      });

      if (!response.ok) {
        throw new Error('AI Copilot failed to connect.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { sender: 'civicai', text: data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        sender: 'civicai', 
        text: `I apologize, but I had trouble reaching the municipal central database. 

However, remember that **verified issues** are instantly indexed in our district list! You can earn **15 Karma points** right now by validating other citizen reports on your dashboard.` 
      }]);
    } finally {
      setSending(false);
    }
  };

  const handleSuggest = (topic: string) => {
    handleSendMessage(topic);
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'civicai',
        text: `Reset concluded! I am ready for your next hyperlocal municipal query. How can I help you today?`
      }
    ]);
  };

  return (
    <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col h-[400px]">
      
      {/* Copilot Header */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)] animate-pulse">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="font-extrabold text-xs text-white block font-display">AI Civic Copilot</span>
            <span className="text-[9px] text-indigo-400 font-mono block tracking-wider font-bold">MUNICIPAL KNOWLEDGE CORE • LIVE</span>
          </div>
        </div>

        <button 
          onClick={handleClearChat}
          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
          title="Clear Conversation History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Terminal block */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-950/50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex items-start gap-2.5 max-w-[85%] ${
            m.sender === 'citizen' ? 'ml-auto flex-row-reverse' : ''
          }`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 border uppercase ${
              m.sender === 'citizen' 
                ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 border-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.2)]' 
                : 'bg-gradient-to-tr from-indigo-500 to-purple-500 border-indigo-400 text-white shadow-[0_0_10px_rgba(99,102,241,0.2)]'
            }`}>
              {m.sender === 'citizen' ? 'Me' : 'AI'}
            </div>

            <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-sans ${
              m.sender === 'citizen' 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-slate-200 rounded-tr-none' 
                : 'bg-slate-900/85 border border-slate-800 text-slate-300 rounded-tl-none whitespace-pre-wrap'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Hot topics deck */}
      <div className="px-4 py-2 border-t border-slate-850 bg-slate-950/30 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        <button 
          onClick={() => handleSuggest('How do I earn Karma Points?')}
          className="text-[9px] bg-emerald-500/5 hover:bg-emerald-500/15 hover:text-emerald-300 border border-emerald-500/25 text-slate-300 px-3 py-1 rounded-xl transition font-mono cursor-pointer flex-shrink-0"
        >
          📈 Earn Karma
        </button>
        <button 
          onClick={() => handleSuggest('What is the Validation threshold?')}
          className="text-[9px] bg-indigo-500/5 hover:bg-indigo-500/15 hover:text-indigo-300 border border-indigo-500/25 text-slate-300 px-3 py-1 rounded-xl transition font-mono cursor-pointer flex-shrink-0"
        >
          🔍 Validation Rules
        </button>
        <button 
          onClick={() => handleSuggest('How is municipal safety priority scored?')}
          className="text-[9px] bg-amber-500/5 hover:bg-amber-500/15 hover:text-amber-300 border border-amber-500/25 text-slate-300 px-3 py-1 rounded-xl transition font-mono cursor-pointer flex-shrink-0"
        >
          ⚠️ AI Risk Score
        </button>
      </div>

      {/* Input controls */}
      <div className="p-3 border-t border-slate-850 bg-slate-900/80">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Ask CivicAI about community safety..."
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-700 font-sans"
            disabled={sending}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={sending || !inputText.trim()}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 text-white rounded-xl px-4 flex items-center justify-center transition cursor-pointer active:scale-95 text-xs font-semibold gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
          >
            {sending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
