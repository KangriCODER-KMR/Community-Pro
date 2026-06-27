import React from 'react';
import { CommunityIssue, UserProfile } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Award, Flame, Zap, Shield, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

interface ImpactDashboardProps {
  issues: CommunityIssue[];
  currentUser: UserProfile;
}

// Simulated Top Citizens Leaderboard for that awesome civic competition element
const TOP_CITIZENS = [
  { id: 'leader_1', name: 'Inspector Rajesh Sharma', karmaPoints: 480, level: 4, badge: 'Civic Master' },
  { id: 'leader_2', name: 'Pooja Deshmukh', karmaPoints: 340, level: 3, badge: 'Pothole Patrol' },
  { id: 'leader_3', name: 'Karan Malhotra', karmaPoints: 290, level: 3, badge: 'Green Sentinel' },
  { id: 'leader_4', name: 'Aarav Patel', karmaPoints: 180, level: 2, badge: 'Streetlight Hero' }
];

export default function ImpactDashboard({ issues, currentUser }: ImpactDashboardProps) {
  
  // Calculate category distributions
  const categoryCounts: Record<string, number> = {};
  const statusCounts: Record<string, number> = { reported: 0, verified: 0, in_progress: 0, resolved: 0 };

  issues.forEach(issue => {
    categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
    statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value
  }));

  const statusData = [
    { name: 'Reported', count: statusCounts.reported, fill: '#ef4444' },
    { name: 'Verified', count: statusCounts.verified, fill: '#3b82f6' },
    { name: 'In Progress', count: statusCounts.in_progress, fill: '#f59e0b' },
    { name: 'Resolved', count: statusCounts.resolved, fill: '#10b981' }
  ];

  const PIE_COLORS = ['#3b82f6', '#f59e0b', '#ec4899', '#eab308', '#ef4444', '#10b981'];

  // Combine top citizens with current user for a real live competition leaderboard!
  const allCitizens = [...TOP_CITIZENS];
  if (!allCitizens.find(c => c.id === currentUser.id)) {
    allCitizens.push({
      id: currentUser.id,
      name: `${currentUser.name} (You)`,
      karmaPoints: currentUser.karmaPoints,
      level: currentUser.level,
      badge: currentUser.badges[0] || 'Active Citizen'
    });
  }

  // Sort leaderboard by points
  const sortedLeaderboard = allCitizens.sort((a, b) => b.karmaPoints - a.karmaPoints);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* STATS DECK (4/12 columns) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Total stats card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/55 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              RESOLVED RATIO
            </span>
            <span className="text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              {Math.round((statusCounts.resolved / (issues.length || 1)) * 100)}% SUCCESS RATE
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-emerald-400 font-mono leading-none">
              {statusCounts.resolved}/{issues.length}
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Local events resolved by municipal contractors
            </p>
          </div>

          {/* Quick micro progress bar */}
          <div className="w-full h-2 bg-slate-950 rounded-full mt-5 overflow-hidden border border-slate-850">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] rounded-full transition-all duration-1000"
              style={{ width: `${(statusCounts.resolved / (issues.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Dynamic Alert Banner Broadcaster */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/30 border border-slate-800 p-5 rounded-2xl relative overflow-hidden flex-1 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="absolute right-0 top-0 px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-600 text-slate-950 font-mono text-[9px] font-extrabold rounded-bl-xl flex items-center gap-1 shadow-lg">
            <Flame className="w-3.5 h-3.5 animate-bounce" />
            LIVE ALERTS
          </div>
          
          <h3 className="text-sm font-extrabold text-slate-200 uppercase font-mono tracking-wider mb-4 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
            District Alert Feed
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex gap-3 shadow-[0_0_15px_rgba(239,68,68,0.05)] transition hover:bg-rose-500/15">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-rose-300">Sector 15 Main Road Closed</h4>
                <p className="text-[10px] text-slate-300 leading-normal mt-0.5">Heavy emergency excavation crew dispatched to repair pipeline.</p>
              </div>
            </div>

            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex gap-3 transition hover:bg-indigo-500/15">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 mt-1 flex-shrink-0 animate-pulse" />
              <div>
                <h4 className="text-xs font-bold text-indigo-300">New Water Valve Deployed</h4>
                <p className="text-[10px] text-slate-300 leading-normal mt-0.5">High-speed valve replacement done. Pressure normal.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CHARTS GRAPH BLOCK (4/12 columns) */}
      <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/20 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            EVENT DISTRIBUTION
          </span>
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </div>

        <div className="h-44 w-full flex items-center justify-center">
          {categoryData.length === 0 ? (
            <span className="text-xs text-slate-500 font-mono">NO EVENT DATA</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Legend details */}
        <div className="grid grid-cols-2 gap-2 mt-2 text-[9px] font-mono text-slate-400">
          {categoryData.map((item, index) => (
            <div key={item.name} className="flex items-center gap-1.5 truncate">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
              <span className="truncate">{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* CIVIC KARMA LEADERBOARD (4/12 columns) */}
      <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/20 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-2.5">
          <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-widest flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            Active Citizens Leaderboard
          </span>
          <span className="text-[9px] font-mono font-bold text-slate-500">KARMA POINTS</span>
        </div>

        {/* Citizen rankings list */}
        <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px] pr-1">
          {sortedLeaderboard.map((citizen, idx) => {
            const isMe = citizen.id === currentUser.id;
            
            // Generate vibrant medal styling for Top 3
            let medalStyle = "border-slate-850/80 bg-slate-950/40 text-slate-300 hover:border-slate-800";
            let rankBadge = "text-slate-500";
            
            if (idx === 0) {
              medalStyle = "border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-slate-950/60 to-transparent text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.08)] hover:border-amber-500/60";
              rankBadge = "text-amber-400 font-extrabold";
            } else if (idx === 1) {
              medalStyle = "border-slate-300/30 bg-gradient-to-r from-slate-300/5 via-slate-950/60 to-transparent text-slate-200 hover:border-slate-300/40";
              rankBadge = "text-slate-300 font-extrabold";
            } else if (idx === 2) {
              medalStyle = "border-amber-700/30 bg-gradient-to-r from-amber-700/5 via-slate-950/60 to-transparent text-amber-600 hover:border-amber-700/40";
              rankBadge = "text-amber-700 font-extrabold";
            }

            if (isMe) {
              medalStyle = "border-emerald-400 bg-gradient-to-r from-emerald-500/15 via-slate-950 to-transparent text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.12)]";
              rankBadge = "text-emerald-400 font-black";
            }

            return (
              <div 
                key={citizen.id} 
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${medalStyle}`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className={`text-xs font-mono ${rankBadge}`}>#{idx + 1}</span>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs uppercase font-extrabold font-mono ${
                    idx === 0 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                    idx === 1 ? 'bg-slate-300/20 border-slate-300/30 text-slate-200' :
                    idx === 2 ? 'bg-amber-700/20 border-amber-700/30 text-amber-600' :
                    'bg-slate-800 border-slate-700 text-slate-400'
                  }`}>
                    {citizen.name.substring(0, 1)}
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-extrabold block truncate leading-none mb-1">{citizen.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono block">Level {citizen.level} • {citizen.badge}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 font-mono font-bold text-xs text-white">
                  {citizen.karmaPoints} XP
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
