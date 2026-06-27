import React, { useState, useEffect } from 'react';
import { CommunityIssue, CommunityComment, UserProfile } from '../types';
import { dbService } from '../lib/db';
import { 
  Heart, 
  CheckSquare, 
  User, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  AlertOctagon, 
  Clock, 
  Send,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IssueCardProps {
  issue: CommunityIssue;
  currentUser: UserProfile;
  onIssueUpdated: (updated: CommunityIssue) => void;
  onAwardKarma: (points: number, reason: string) => void;
}

export default function IssueCard({ 
  issue, 
  currentUser, 
  onIssueUpdated, 
  onAwardKarma 
}: IssueCardProps) {
  const [showPlan, setShowPlan] = useState<boolean>(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentText, setCommentText] = useState<string>('');
  const [loadingComments, setLoadingComments] = useState<boolean>(false);

  // Load comments
  useEffect(() => {
    async function fetchComments() {
      setLoadingComments(true);
      try {
        const loaded = await dbService.getComments(issue.id);
        setComments(loaded);
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoadingComments(false);
      }
    }
    fetchComments();
  }, [issue.id]);

  const handleUpvote = async () => {
    const hasUpvoted = issue.upvotedBy.includes(currentUser.id);
    let updatedUpvotes = [...issue.upvotedBy];
    let countChange = 0;

    if (hasUpvoted) {
      updatedUpvotes = updatedUpvotes.filter(id => id !== currentUser.id);
      countChange = -1;
    } else {
      updatedUpvotes.push(currentUser.id);
      countChange = 1;
      onAwardKarma(5, 'Upvoted local community report');
    }

    const updatedIssue: CommunityIssue = {
      ...issue,
      upvotesCount: issue.upvotesCount + countChange,
      upvotedBy: updatedUpvotes,
      updatedAt: new Date().toISOString()
    };

    await dbService.saveIssue(updatedIssue);
    onIssueUpdated(updatedIssue);
  };

  const handleVerify = async () => {
    const hasVerified = issue.validatedBy.includes(currentUser.id);
    if (hasVerified) return; // Only allow one verification per citizen to avoid abuse

    const updatedVerified = [...issue.validatedBy, currentUser.id];
    const newCount = issue.validatedCount + 1;

    // Transition status to 'verified' automatically if we hit 3 neighbor verifications!
    let newStatus = issue.status;
    if (newStatus === 'reported' && newCount >= 3) {
      newStatus = 'verified';
    }

    const updatedIssue: CommunityIssue = {
      ...issue,
      validatedCount: newCount,
      validatedBy: updatedVerified,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    await dbService.saveIssue(updatedIssue);
    onIssueUpdated(updatedIssue);
    onAwardKarma(15, 'Verified hyperlocal community event');

    // Trigger level progress
    const updatedUser = {
      ...currentUser,
      validationsDone: currentUser.validationsDone + 1
    };
    await dbService.saveUserProfile(updatedUser);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: CommunityComment = {
      id: 'comment_' + Math.random().toString(36).substring(2, 11),
      issueId: issue.id,
      userId: currentUser.id,
      userName: currentUser.name,
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    await dbService.addComment(newComment);
    setComments(prev => [...prev, newComment]);
    setCommentText('');
    onAwardKarma(10, 'Left constructive feedback on reported issue');
  };

  const getUrgencyBadge = (score: number) => {
    if (score >= 8) return 'bg-gradient-to-r from-rose-500/20 to-pink-500/10 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)] animate-pulse';
    if (score >= 5) return 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/40';
    return 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-emerald-300 border-emerald-500/40';
  };

  // Status step milestones
  const statusSteps = ['reported', 'verified', 'in_progress', 'resolved'];
  const getStatusIndex = (status: string) => statusSteps.indexOf(status);

  return (
    <div className="bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/80 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.08)] flex flex-col h-full relative">
      
      {/* Risk Shield / Headline banner */}
      <div className={`p-4 border-b border-slate-850 flex items-center justify-between gap-3 ${
        issue.aiRiskScore >= 8 
          ? 'bg-gradient-to-r from-rose-950/30 via-slate-900/50 to-rose-950/10' 
          : 'bg-gradient-to-r from-emerald-950/20 via-slate-900/50 to-slate-900/10'
      }`}>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold font-mono tracking-wider uppercase px-2.5 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            {issue.category}
          </span>
          <span className="text-xs font-mono text-slate-400">📍 {issue.locationName}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border ${getUrgencyBadge(issue.aiRiskScore)}`}>
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>AI RISK: {issue.aiRiskScore}/10</span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-5 flex-1 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight leading-snug mb-1.5 hover:text-emerald-400 transition">
            {issue.title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {issue.description}
          </p>
        </div>

        {issue.imageUrl && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-slate-800">
            <img 
              src={issue.imageUrl} 
              alt={issue.title} 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur border border-emerald-500/25 text-[8px] font-mono text-emerald-400 px-1.5 py-0.5 rounded font-extrabold uppercase">
              LIVE SNAPSHOT
            </div>
          </div>
        )}

        {/* Dynamic AI Tags */}
        <div className="flex flex-wrap gap-1.5">
          {issue.aiTags.map(tag => (
            <span key={tag} className="text-[9px] font-mono font-medium text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-900">
              #{tag}
            </span>
          ))}
        </div>

        {/* Sensor Origin and Audit Log */}
        {issue.isTelemetryTriggered && (
          <div className="bg-cyan-950/20 border border-cyan-500/25 p-2.5 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">Telemetry Source: {issue.sensorType} sensor</span>
            </div>
            {issue.cryptographicSignature && (
              <span className="text-[8px] font-mono text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                Audit Hash: {issue.cryptographicSignature.substring(0, 16)}
              </span>
            )}
          </div>
        )}

        {/* Live Status Tracking Step Bar */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-slate-400 font-bold tracking-wider">
            <span>EVENT STATUS TIMELINE</span>
            <span className="text-emerald-400 uppercase">{issue.status}</span>
          </div>
          
          <div className="relative flex justify-between items-center px-2">
            {/* Background Line */}
            <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
            
            {/* Active Progress Line */}
            <div 
              className="absolute top-1/2 left-3 h-0.5 bg-gradient-to-r from-emerald-500 to-emerald-400 -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(getStatusIndex(issue.status) / (statusSteps.length - 1)) * 94}%` }}
            />

            {statusSteps.map((step, idx) => {
              const active = idx <= getStatusIndex(issue.status);
              return (
                <div key={step} className="flex flex-col items-center relative z-10">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    active ? 'bg-emerald-500 text-slate-950 scale-110 shadow-lg' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {active ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-1 capitalize">{step}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predictive AI Alert insight */}
        {issue.aiResolutionPlan && (
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-start gap-2.5">
            <Sparkles className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase tracking-widest block mb-0.5">CIVIC-AI PREDICTIVE WARNING</span>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Water-pooling near crosswalk suggests a 70% chance of roadway sub-base erosion if not sealed. High priority for sewer dispatch.
              </p>
            </div>
          </div>
        )}

        {/* Collapsible Municipal contractor Action Plan */}
        <div>
          <button
            onClick={() => setShowPlan(!showPlan)}
            className="w-full bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono font-semibold flex items-center justify-between text-slate-300 hover:text-white transition cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              AI contractor Resolution Plan
            </span>
            {showPlan ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showPlan && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-slate-950/40 border-x border-b border-slate-850 p-4 rounded-b-xl text-[11px] text-slate-300 leading-relaxed font-sans prose prose-invert max-w-none"
              >
                <div className="space-y-2">
                  <div className="font-bold text-slate-200">Phase 1: Site Containment</div>
                  <div className="text-slate-400">- Erect caution fencing immediately. Close down the nearest pedestrian lane.</div>
                  <div className="font-bold text-slate-200 mt-2">Phase 2: Crew Dispatch</div>
                  <div className="text-slate-400">- Bring high-volume backhoe excavator. Seal baseline pipeline and repave. Turnaround: 4 business days.</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Engagement actions (Upvote, Verify) */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20 flex items-center justify-between gap-4">
        <button
          onClick={handleUpvote}
          className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-xl text-xs font-mono font-bold transition cursor-pointer active:scale-95 ${
            issue.upvotedBy.includes(currentUser.id)
              ? 'border-rose-500 bg-rose-500/10 text-rose-400'
              : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <Heart className={`w-4 h-4 ${issue.upvotedBy.includes(currentUser.id) ? 'fill-rose-500' : ''}`} />
          <span>{issue.upvotesCount} UPVOTES</span>
        </button>

        <button
          onClick={handleVerify}
          disabled={issue.validatedBy.includes(currentUser.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-xl text-xs font-mono font-bold transition cursor-pointer active:scale-95 disabled:opacity-50 ${
            issue.validatedBy.includes(currentUser.id)
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
              : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>
            {issue.validatedBy.includes(currentUser.id) ? 'VERIFIED' : `${issue.validatedCount} VERIFICATIONS`}
          </span>
        </button>
      </div>

      {/* Dynamic Comment Feed Section */}
      <div className="border-t border-slate-850 bg-slate-900/20 p-4 space-y-4">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Neighbor Chatter ({comments.length})</span>
        </div>

        {/* Comment list */}
        <div className="space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <p className="text-[11px] text-slate-600 italic">No neighbors have discussed this report yet. Speak up to help resolve it!</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-900 flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 uppercase font-bold font-mono">
                  {c.userName.substring(0, 1)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-300">{c.userName}</span>
                    <span className="text-[8px] text-slate-600 font-mono">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Leave comment form */}
        <form onSubmit={handleAddComment} className="flex gap-1.5">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add relevant local updates..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-[11px] text-white focus:outline-none focus:border-emerald-500 placeholder-slate-700 font-sans"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-3 flex items-center justify-center transition cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
}
