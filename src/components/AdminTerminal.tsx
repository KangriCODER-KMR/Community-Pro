import React, { useState, useEffect } from 'react';
import { CommunityIssue, UserProfile } from '../types';
import { 
  ShieldAlert, 
  Settings, 
  Wrench, 
  Activity, 
  UserX, 
  TrendingUp, 
  FileCheck, 
  MapPin, 
  CheckCircle2, 
  RefreshCw,
  Trash2,
  AlertOctagon,
  Award,
  Search,
  Users,
  History,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
  Info,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from '../lib/db';

interface AdminTerminalProps {
  currentUser: UserProfile;
  issues: CommunityIssue[];
  onIssueUpdated: (issue: CommunityIssue) => void;
  onIssueDeleted?: (issueId: string) => void;
  onRefreshData: () => void;
  showToast: (msg: string) => void;
}

export default function AdminTerminal({ 
  currentUser, 
  issues, 
  onIssueUpdated, 
  onIssueDeleted,
  onRefreshData,
  showToast 
}: AdminTerminalProps) {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [editingRiskId, setEditingRiskId] = useState<string | null>(null);
  const [newRiskScore, setNewRiskScore] = useState<number>(5);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);

  const [adminTab, setAdminTab] = useState<'incidents' | 'citizens' | 'auditing'>('incidents');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [citizenSearch, setCitizenSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await dbService.getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefreshAll = async () => {
    onRefreshData();
    await fetchUsers();
    showToast('🔄 Municipal registries and incident cache updated.');
  };

  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  // Filter issues by status for quick stats
  const pendingCount = issues.filter(i => i.status === 'reported').length;
  const inProgressCount = issues.filter(i => i.status === 'in_progress').length;
  const resolvedCount = issues.filter(i => i.status === 'resolved').length;

  const handleUpdateStatus = async (issue: CommunityIssue, status: 'reported' | 'verified' | 'in_progress' | 'resolved') => {
    const updated: CommunityIssue = {
      ...issue,
      status,
      updatedAt: new Date().toISOString()
    };
    await dbService.saveIssue(updated);
    onIssueUpdated(updated);
    showToast(`💼 Status updated to ${status.toUpperCase()} for "${issue.title}"`);
    await fetchUsers();
  };

  const handleOverrideRisk = async (issue: CommunityIssue) => {
    const updated: CommunityIssue = {
      ...issue,
      aiRiskScore: newRiskScore,
      updatedAt: new Date().toISOString()
    };
    await dbService.saveIssue(updated);
    onIssueUpdated(updated);
    setEditingRiskId(null);
    showToast(`⚡ Risk score updated to ${newRiskScore}/10 for "${issue.title}"`);
  };

  const handleDispatchContractor = async (issue: CommunityIssue) => {
    setDispatchingId(issue.id);
    
    // Simulate contractor assignment delay
    setTimeout(async () => {
      const updated: CommunityIssue = {
        ...issue,
        status: 'in_progress',
        aiResolutionPlan: `### EMERGENCY WORK-ORDER GENERATED\n- **Contractor Unit**: District 7 Rapid Utility Squad\n- **Status**: Dispatched to Site\n- **ETA**: 22 Minutes\n\n${issue.aiResolutionPlan}`,
        updatedAt: new Date().toISOString()
      };
      await dbService.saveIssue(updated);
      onIssueUpdated(updated);
      setDispatchingId(null);
      showToast(`🚒 Emergency Squad Dispatched to: ${issue.locationName}`);
      await fetchUsers();
    }, 1500);
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (confirm('Are you sure you want to purge this record from the decentralized municipal ledger?')) {
      await dbService.deleteIssue(issueId);
      if (onIssueDeleted) {
        onIssueDeleted(issueId);
      }
      setSelectedIssueId(null);
      showToast('🗑️ Record purged from database ledger.');
      await fetchUsers();
    }
  };

  const getUserProfile = (userId: string): UserProfile | undefined => {
    return users.find(u => u.id === userId);
  };

  const filteredAuditIssues = issues.filter(issue => {
    if (!auditSearch) return true;
    const query = auditSearch.toLowerCase();
    
    // Check issue fields
    if (issue.title.toLowerCase().includes(query) || 
        issue.category.toLowerCase().includes(query) ||
        issue.locationName.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query)) return true;
    
    // Check reporter fields
    const rep = getUserProfile(issue.reporterId);
    if (issue.reporterName.toLowerCase().includes(query)) return true;
    if (rep && (rep.email.toLowerCase().includes(query) || (rep.phone && rep.phone.includes(query)))) return true;
    
    // Check verifier fields
    const verifierMatch = (issue.validatedBy || []).some(uid => {
      const u = getUserProfile(uid);
      return u && (u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || (u.phone && u.phone.includes(query)));
    });
    if (verifierMatch) return true;
    
    // Check myth-buster fields
    if (issue.mythBusterName?.toLowerCase().includes(query)) return true;
    if (issue.mythBustExplanation?.toLowerCase().includes(query)) return true;
    const buster = issue.mythBusterId ? getUserProfile(issue.mythBusterId) : null;
    if (buster && (buster.email.toLowerCase().includes(query) || (buster.phone && buster.phone.includes(query)))) return true;
    
    return false;
  });

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-indigo-950/60 border border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col">
      
      {/* Admin Title Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <ShieldAlert className="w-5.5 h-5.5 text-rose-400 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block font-display">District Dispatch Admin Terminal</span>
            <span className="text-[10px] text-rose-400 font-mono block tracking-wider font-bold">MUNICIPAL OVERRIDE CONSOLE • POWER MODE</span>
          </div>
        </div>

        {/* Tab Switchers */}
        <div className="flex bg-slate-950/60 border border-slate-850 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setAdminTab('incidents')}
            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold font-mono tracking-tight transition cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'incidents'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Incidents Queue</span>
          </button>
          <button
            onClick={() => setAdminTab('citizens')}
            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold font-mono tracking-tight transition cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'citizens'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Citizens Directory</span>
          </button>
          <button
            onClick={() => setAdminTab('auditing')}
            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold font-mono tracking-tight transition cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'auditing'
                ? 'bg-rose-500 text-slate-950 shadow-md shadow-rose-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lifecycle Audits</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh everything */}
          <button
            onClick={handleRefreshAll}
            className="p-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition cursor-pointer"
            title="Refresh Ledger Registries"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Admin credential indicator */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-rose-500/15 to-pink-500/5 border border-rose-500/35 text-rose-300 rounded-xl px-3.5 py-1.5 text-xs font-bold font-mono shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <Activity className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            <span>ADMIN: {currentUser.name}</span>
          </div>
        </div>
      </div>

      {/* Grid of high-level stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-800 border-b border-slate-850">
        <div className="bg-slate-950/40 p-4 text-center">
          <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold tracking-wider">Total Incidents</span>
          <span className="text-2xl font-black text-white font-mono mt-0.5 block">{issues.length}</span>
        </div>
        <div className="bg-slate-950/40 p-4 text-center border-l border-slate-800/40">
          <span className="text-[10px] font-mono text-amber-400 block uppercase font-bold tracking-wider">Reported Queue</span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-0.5 block shadow-amber-500/10 text-shadow-sm">{pendingCount}</span>
        </div>
        <div className="bg-slate-950/40 p-4 text-center border-l border-slate-800/40">
          <span className="text-[10px] font-mono text-cyan-400 block uppercase font-bold tracking-wider">Active Work</span>
          <span className="text-2xl font-black text-cyan-400 font-mono mt-0.5 block shadow-cyan-500/10 text-shadow-sm">{inProgressCount}</span>
        </div>
        <div className="bg-slate-950/40 p-4 text-center border-l border-slate-800/40">
          <span className="text-[10px] font-mono text-emerald-400 block uppercase font-bold tracking-wider">Resolved Ledger</span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block shadow-emerald-500/10 text-shadow-sm">{resolvedCount}</span>
        </div>
      </div>

      {/* Dynamic Tab Render Area */}
      {adminTab === 'incidents' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px]">
          
          {/* Left Side: Dynamic Incident Ledger Queue (5/12) */}
          <div className="lg:col-span-5 border-r border-slate-800 p-4 space-y-3 flex flex-col h-[450px] overflow-y-auto">
            <span className="text-[10px] font-bold font-mono text-slate-400 tracking-wider block border-b border-slate-800 pb-2">
              INCIDENT QUEUE MANAGEMENT ({issues.length})
            </span>

            <div className="space-y-2 flex-1 overflow-y-auto pr-1">
              {issues.map(issue => {
                const isSelected = selectedIssueId === issue.id;
                const isTelemetry = issue.isTelemetryTriggered;

                return (
                  <div
                    key={issue.id}
                    onClick={() => setSelectedIssueId(issue.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                      isSelected 
                        ? 'bg-slate-950 border-rose-500/40 text-white shadow-lg' 
                        : 'bg-slate-900/30 border-slate-800/80 text-slate-400 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="truncate">
                        <span className="text-[8px] font-mono font-bold block uppercase" style={{ color: isSelected ? '#f43f5e' : '#64748b' }}>
                          [{issue.category}] {isTelemetry ? '📡 TELEMETRY' : '👤 RESIDENT'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-100 truncate mt-0.5">{issue.title}</h4>
                      </div>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                        issue.aiRiskScore >= 8 
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                          : 'bg-slate-950 text-slate-400'
                      }`}>
                        PRIORITY {issue.aiRiskScore}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-slate-850/60 pt-1.5">
                      <span className="truncate">📍 {issue.locationName}</span>
                      <span className={`px-1.5 py-0.5 rounded ${
                        issue.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                        issue.status === 'in_progress' ? 'bg-cyan-500/10 text-cyan-400' :
                        issue.status === 'verified' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        'bg-slate-850 text-slate-400'
                      }`}>
                        {issue.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Command Center Actions Panel (7/12) */}
          <div className="lg:col-span-7 p-5 bg-slate-950/20 flex flex-col h-[450px] overflow-y-auto">
            {selectedIssue ? (
              <div className="space-y-5 flex-1">
                
                {/* Header and overview */}
                <div className="border-b border-slate-850 pb-4">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full uppercase">
                      ID: {selectedIssue.id}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">
                      REPORTED: {new Date(selectedIssue.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{selectedIssue.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{selectedIssue.description}</p>
                </div>

                {/* Audit Details Inline Block */}
                <div className="bg-slate-900/30 border border-slate-850 rounded-xl p-4 space-y-3">
                  <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-rose-400" />
                    Civic Verification Audit Trail
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Creator Info */}
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 space-y-1.5">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Report Submitter</span>
                      <div className="text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Name:</span>
                          <span className="font-bold text-slate-200">{selectedIssue.reporterName}</span>
                        </div>
                        {(() => {
                          const rProf = getUserProfile(selectedIssue.reporterId);
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Email:</span>
                                <span className="font-mono text-slate-300">{rProf ? rProf.email : 'system@municipal.gov.in'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Phone:</span>
                                <span className="font-mono text-slate-300">{rProf?.phone || selectedIssue.reporterPhone || 'No verified phone'}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Verification / Certification Info */}
                    <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 space-y-1.5">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Certified Verifiers ({selectedIssue.validatedCount})</span>
                      <div className="max-h-[70px] overflow-y-auto space-y-1 text-[11px]">
                        {selectedIssue.validatedCount === 0 ? (
                          <span className="text-slate-500 italic">No secondary verifications stamped.</span>
                        ) : (
                          (selectedIssue.validatedBy || []).map(uid => {
                            const u = getUserProfile(uid);
                            if (!u) return null;
                            return (
                              <div key={u.id} className="flex justify-between items-center text-[10px] bg-slate-900/50 p-1.5 rounded border border-slate-850">
                                <span className="font-bold text-slate-200">{u.name}</span>
                                <span className="text-[8px] font-mono text-slate-500">{u.phone || u.email.split('@')[0]}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Disapproval / Myth Buster Details */}
                  {selectedIssue.isMythFlagged && (
                    <div className="bg-rose-500/5 p-3 rounded-lg border border-rose-500/20 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-mono text-rose-400 uppercase font-bold">⚠️ Myth Busted (Disapproved Query)</span>
                        <span className="text-[9px] font-mono text-slate-400">Buster: {selectedIssue.mythBusterName}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 italic leading-relaxed">
                        &ldquo;{selectedIssue.mythBustExplanation}&rdquo;
                      </p>
                      {(() => {
                        const bProf = selectedIssue.mythBusterId ? getUserProfile(selectedIssue.mythBusterId) : null;
                        if (bProf) {
                          return (
                            <div className="flex gap-4 text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-rose-500/10">
                              <span>Mail: {bProf.email}</span>
                              {bProf.phone && <span>Phone: {bProf.phone}</span>}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>

                {/* Action grid block */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Override status controls */}
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 space-y-3">
                    <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest block">
                      LEDGER OVERRIDE STATE
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleUpdateStatus(selectedIssue, 'reported')}
                        className={`text-[10px] font-mono font-bold py-1.5 px-2 rounded-lg transition border cursor-pointer ${
                          selectedIssue.status === 'reported' 
                            ? 'bg-amber-500/15 border-amber-500 text-amber-400' 
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        REPORTED
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedIssue, 'verified')}
                        className={`text-[10px] font-mono font-bold py-1.5 px-2 rounded-lg transition border cursor-pointer ${
                          selectedIssue.status === 'verified' 
                            ? 'bg-indigo-500/15 border-indigo-500 text-indigo-400' 
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        VERIFIED
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedIssue, 'in_progress')}
                        className={`text-[10px] font-mono font-bold py-1.5 px-2 rounded-lg transition border cursor-pointer ${
                          selectedIssue.status === 'in_progress' 
                            ? 'bg-cyan-500/15 border-cyan-500 text-cyan-400' 
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        IN PROGRESS
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedIssue, 'resolved')}
                        className={`text-[10px] font-mono font-bold py-1.5 px-2 rounded-lg transition border cursor-pointer ${
                          selectedIssue.status === 'resolved' 
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400' 
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        RESOLVED
                      </button>
                    </div>
                  </div>

                  {/* Overwrite Risk priorities */}
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 space-y-3">
                    <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest block">
                      AI RISK EVALUATION OVERRIDE
                    </span>
                    
                    {editingRiskId === selectedIssue.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <input 
                            type="range" 
                            min="1" 
                            max="10" 
                            value={newRiskScore}
                            onChange={(e) => setNewRiskScore(parseInt(e.target.value))}
                            className="w-full accent-rose-500 bg-slate-950 rounded-lg h-2"
                          />
                          <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded shrink-0 ml-3">{newRiskScore}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setEditingRiskId(null)}
                            className="flex-1 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-[10px] font-mono py-1 rounded text-slate-400 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleOverrideRisk(selectedIssue)}
                            className="flex-1 bg-rose-600 hover:bg-rose-700 text-slate-950 text-[10px] font-mono font-bold py-1 rounded transition"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-rose-500" />
                          <span className="text-xs text-slate-200">Current Score: <span className="font-bold text-rose-400 font-mono">{selectedIssue.aiRiskScore}/10</span></span>
                        </div>
                        <button
                          onClick={() => {
                            setEditingRiskId(selectedIssue.id);
                            setNewRiskScore(selectedIssue.aiRiskScore);
                          }}
                          className="text-[10px] font-mono bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-300 px-2.5 py-1 rounded-lg transition"
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* Urgent Contractor Dispatch Box */}
                <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex gap-3 items-start">
                    <Wrench className="w-5.5 h-5.5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">EMERGENCY FIELD CONTRACTOR DISPATCH</span>
                      <p className="text-[11px] text-slate-500 leading-normal font-sans mt-0.5">
                        Directly sign work authorization order blocks. Bypasses standard civic inspection wait queues and dispatches physical contractors instantly.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDispatchContractor(selectedIssue)}
                    disabled={dispatchingId === selectedIssue.id || selectedIssue.status === 'resolved'}
                    className="bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-slate-950 text-xs font-mono font-bold py-2 px-4 rounded-lg transition shrink-0 flex items-center gap-1.5 cursor-pointer"
                  >
                    {dispatchingId === selectedIssue.id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Wrench className="w-3.5 h-3.5 text-slate-950" />
                        <span>Dispatch rapid Squad</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Cryptographic telemetry signature validation & deletion block */}
                <div className="border-t border-slate-850/60 pt-4 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>Ledger validation: {selectedIssue.validatedCount} Consensus votes</span>
                  </div>

                  <button
                    onClick={() => handleDeleteIssue(selectedIssue.id)}
                    className="text-rose-500 hover:text-rose-400 text-xs font-mono font-bold flex items-center gap-1 px-3 py-1.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge From Ledger</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-850 rounded-2xl">
                <AlertOctagon className="w-8 h-8 text-slate-700 mb-2" />
                <span className="text-xs font-bold text-slate-400 block font-mono">NO INCIDENT SELECTION</span>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">Select an item from the live ledger index to override state, override risk prioritization scores, or dispatch rapid response contractors.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 2: Citizens Directory */}
      {adminTab === 'citizens' && (
        <div className="p-6 space-y-6 flex-1 min-h-[450px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white font-display">Registered Citizens Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5">Verified residents, watch captains, and district municipal officers currently active in District 7.</p>
            </div>
            
            {/* Search option */}
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={citizenSearch}
                onChange={(e) => setCitizenSearch(e.target.value)}
                placeholder="Search citizens by name, email, phone..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 font-mono"
              />
            </div>
          </div>

          {loadingUsers ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500 font-mono">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
              <span className="text-xs">Synchronizing citizen registries...</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Citizen Details</th>
                    <th className="py-3 px-4 font-bold">Email Address</th>
                    <th className="py-3 px-4 font-bold">Phone Number</th>
                    <th className="py-3 px-4 font-bold text-center">Karma Level</th>
                    <th className="py-3 px-4 font-bold text-center">Reports</th>
                    <th className="py-3 px-4 font-bold text-center">Validations</th>
                    <th className="py-3 px-4 font-bold">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-xs font-sans text-slate-300">
                  {users.filter(u => {
                    if (!citizenSearch) return true;
                    const q = citizenSearch.toLowerCase();
                    return (
                      u.name.toLowerCase().includes(q) ||
                      u.email.toLowerCase().includes(q) ||
                      (u.phone && u.phone.includes(q))
                    );
                  }).map(u => (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 font-bold text-xs font-mono">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-100 block">{u.name}</span>
                            <span className="text-[9px] text-slate-500 font-mono block">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{u.email}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {u.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {u.phone}
                          </span>
                        ) : (
                          <span className="text-slate-600 italic">No phone added</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="text-rose-400 font-bold block">{u.karmaPoints} XP</span>
                        <span className="text-[9px] text-slate-500 block">Level {u.level}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-100 font-bold">{u.reportsSubmitted}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-100 font-bold">{u.validationsDone}</td>
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {users.filter(u => {
                    if (!citizenSearch) return true;
                    const q = citizenSearch.toLowerCase();
                    return (
                      u.name.toLowerCase().includes(q) ||
                      u.email.toLowerCase().includes(q) ||
                      (u.phone && u.phone.includes(q))
                    );
                  }).length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-mono text-xs italic">
                        No registered citizens found matching the search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Lifecycle Audits */}
      {adminTab === 'auditing' && (
        <div className="p-6 space-y-6 flex-1 min-h-[450px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-white font-display">Query & Incident Audit Tracker</h3>
              <p className="text-xs text-slate-400 mt-0.5">Comprehensive decentralized tracking of civic reports, verification stamps, and forensic disapprovals.</p>
            </div>
            
            {/* Search option */}
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Search by title, category, reporter, verifier..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 focus:outline-none rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 font-mono"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredAuditIssues.map(issue => {
              const rep = getUserProfile(issue.reporterId);
              const verifiersList = (issue.validatedBy || []).map(uid => getUserProfile(uid)).filter(Boolean) as UserProfile[];
              const buster = issue.mythBusterId ? getUserProfile(issue.mythBusterId) : undefined;

              return (
                <div key={issue.id} className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5 space-y-4 hover:border-slate-800 transition">
                  {/* Top line */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded uppercase">
                          {issue.category}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">ID: {issue.id}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100">{issue.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">📍 {issue.locationName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg ${
                        issue.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        issue.status === 'in_progress' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        issue.status === 'verified' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        STATUS: {issue.status.toUpperCase()}
                      </span>
                      {issue.isMythFlagged && (
                        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          MYTH BUSTED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Creator / Reporter Block */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    {/* Reporter Info column */}
                    <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 space-y-2.5">
                      <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase tracking-wider border-b border-slate-850 pb-1.5 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-rose-500" />
                        CREATOR (REPORTER)
                      </span>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Name:</span>
                          <span className="font-bold text-slate-200">{issue.reporterName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email:</span>
                          <span className="font-mono text-slate-300">{rep ? rep.email : 'system@municipal.gov.in'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Phone:</span>
                          <span className="font-mono text-slate-300">{rep && rep.phone ? rep.phone : issue.reporterPhone || 'Not verified'}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 border-t border-slate-900/50">
                          <span className="text-slate-500">XP Profile:</span>
                          <span className="text-[10px] font-mono text-rose-400 font-bold">
                            {rep ? `Lvl ${rep.level} (${rep.karmaPoints} XP)` : 'System Admin'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verifiers Info column */}
                    <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 space-y-2.5">
                      <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase tracking-wider border-b border-slate-850 pb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        VERIFIED BY ({verifiersList.length})
                      </span>
                      <div className="max-h-24 overflow-y-auto space-y-1.5">
                        {verifiersList.length === 0 ? (
                          <span className="text-[10px] text-slate-500 italic block py-2">Awaiting resident certification</span>
                        ) : (
                          verifiersList.map((v, i) => (
                            <div key={v.id || i} className="text-[10px] bg-slate-950/50 p-2 rounded-lg border border-slate-900 flex justify-between gap-2">
                              <div>
                                <span className="font-bold text-slate-200 block">{v.name}</span>
                                <span className="text-slate-500 font-mono block text-[9px]">{v.email}</span>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[9px] font-mono block text-emerald-400">Lvl {v.level}</span>
                                <span className="text-[8px] font-mono block text-slate-500">{v.phone || 'No Phone'}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Disapprovers / Myth Busters column */}
                    <div className="bg-slate-900/40 p-3.5 rounded-xl border border-slate-900 space-y-2.5">
                      <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase tracking-wider border-b border-slate-850 pb-1.5 flex items-center gap-1">
                        <UserX className="w-3.5 h-3.5 text-rose-400" />
                        DISAPPROVED (MYTH BUSTED BY)
                      </span>
                      {issue.isMythFlagged ? (
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Buster Name:</span>
                            <span className="font-bold text-slate-200">{issue.mythBusterName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Email:</span>
                            <span className="font-mono text-slate-300">{buster ? buster.email : 'system_auditor@municipal.gov.in'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Forensic Phone:</span>
                            <span className="font-mono text-slate-300">{buster && buster.phone ? buster.phone : 'Secure Line'}</span>
                          </div>
                          <div className="bg-slate-950/80 p-2 rounded-lg border border-rose-500/10 mt-1">
                            <span className="text-[9px] text-rose-400 font-mono font-bold block uppercase mb-0.5">Bust Justification:</span>
                            <p className="text-[10px] text-slate-400 italic leading-snug">{issue.mythBustExplanation}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4 text-slate-600">
                          <CheckCircle2 className="w-5 h-5 mb-1 text-slate-700" />
                          <span className="text-[10px] italic">No fraud / duplicate flags triggered</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}

            {filteredAuditIssues.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-mono text-xs italic bg-slate-950/20 border border-dashed border-slate-850 rounded-2xl">
                No incidents or queries found matching search criteria.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
