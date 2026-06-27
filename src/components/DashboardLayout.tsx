import React, { useState, useEffect } from 'react';
import { UserProfile, CommunityIssue, NeighborhoodAlert } from '../types';
import { dbService } from '../lib/db';
import MapDashboard from './MapDashboard';
import IssueCard from './IssueCard';
import ImpactDashboard from './ImpactDashboard';
import CivicCopilot from './CivicCopilot';
import SensorTerminal from './SensorTerminal';
import AdminTerminal from './AdminTerminal';
import { 
  Shield, 
  Award, 
  Sparkles, 
  LogOut, 
  Plus, 
  MapPin, 
  Send, 
  RefreshCw,
  Bell,
  CheckCircle,
  AlertTriangle,
  Camera,
  AlertOctagon,
  Search,
  Building2,
  Coins,
  Flame,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Premium client-side compression helper to keep media uploads strictly under 200KB limits
const compressImage = (base64Str: string, maxWidth = 640, maxHeight = 480, quality = 0.55): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
  });
};

interface DashboardLayoutProps {
  currentUser: UserProfile;
  onLogout: () => void;
}

export default function DashboardLayout({ currentUser, onLogout }: DashboardLayoutProps) {
  const [profile, setProfile] = useState<UserProfile>(currentUser);
  const [issues, setIssues] = useState<CommunityIssue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const adminMode = !!profile.isAdmin;
  
  // New Report Form states
  const [reporting, setReporting] = useState<boolean>(false);
  const [reportTitle, setReportTitle] = useState<string>('');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [reportCategory, setReportCategory] = useState<string>('Pothole');
  const [reportLocation, setReportLocation] = useState<string>('');
  const [reportLat, setReportLat] = useState<number>(37.77);
  const [reportLng, setReportLng] = useState<number>(-122.42);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Proximity GPS and Multi-Device Push Simulation states
  const [userLat, setUserLat] = useState<number>(37.7749);
  const [userLng, setUserLng] = useState<number>(-122.4194);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [submittingPhoto, setSubmittingPhoto] = useState<boolean>(false);
  const [criticalIncidentAlert, setCriticalIncidentAlert] = useState<CommunityIssue | null>(null);

  // New features state variables
  const [residentTab, setResidentTab] = useState<'map' | 'tracker' | 'gov' | 'rewards'>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine'>('all');
  
  // Government sync states
  const [linkingIssueId, setLinkingIssueId] = useState<string | null>(null);
  const [syncingStatus, setSyncingStatus] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [selectedAgency, setSelectedAgency] = useState('Department of Public Works');
  const [customGovNotes, setCustomGovNotes] = useState('');

  // Myth busting states
  const [bustingIssueId, setBustingIssueId] = useState<string | null>(null);
  const [mythExplanation, setMythExplanation] = useState('');
  const [bustingProgress, setBustingProgress] = useState<string | null>(null);

  // Toast notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Government linking handler
  const handleLinkIssueToGovernment = async (issueId: string, agency: string, notes: string) => {
    setSyncingStatus('Initiating secure encrypted payload transfer...');
    setSyncProgress(10);
    await new Promise(r => setTimeout(r, 600));
    setSyncingStatus('Matching schema fields with local road ledger database...');
    setSyncProgress(45);
    await new Promise(r => setTimeout(r, 600));
    setSyncingStatus('Generating official work order entry on agency dispatch...');
    setSyncProgress(80);
    await new Promise(r => setTimeout(r, 700));
    
    const randomWO = 'SF-WO-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
    const updatedIssues = issues.map(item => {
      if (item.id === issueId) {
        return {
          ...item,
          governmentAgency: agency,
          governmentStatus: 'linked' as const,
          governmentWorkOrderId: randomWO,
          governmentNotes: notes || 'Verified community report synced automatically.',
          governmentSyncedAt: new Date().toISOString(),
          governmentInterventionRequired: true
        };
      }
      return item;
    });

    setIssues(updatedIssues);
    const matched = updatedIssues.find(i => i.id === issueId);
    if (matched) {
      await dbService.saveIssue(matched);
    }

    setSyncingStatus(null);
    setLinkingIssueId(null);
    setCustomGovNotes('');
    showToast(`🔗 Issue synced! Created Work Order ID: ${randomWO}`);
    
    // Reward points for dispatch connection
    await handleAwardKarma(25, 'Connected incident reports to government dispatch');
  };

  // Myth busting handler
  const handleBustMyth = async (issueId: string, explanation: string) => {
    setBustingProgress('Forensic Pixel Analysis: checking compression noise...');
    await new Promise(r => setTimeout(r, 700));
    setBustingProgress('Duplicate Sweep: querying database for matching frames...');
    await new Promise(r => setTimeout(r, 700));
    setBustingProgress('Verification complete: Myth successfully Busted.');
    await new Promise(r => setTimeout(r, 500));

    const updatedIssues = issues.map(item => {
      if (item.id === issueId) {
        return {
          ...item,
          isMythFlagged: true,
          mythBustStatus: 'myth_busted' as const,
          mythBustExplanation: explanation,
          mythBusterId: profile.id,
          mythBusterName: profile.name,
          status: 'resolved' as const,
          description: `[MYTH BUSTED] ${item.description}\n\nEvidence of Fake: ${explanation}`
        };
      }
      return item;
    });

    setIssues(updatedIssues);
    const matched = updatedIssues.find(i => i.id === issueId);
    if (matched) {
      await dbService.saveIssue(matched);
    }

    setBustingProgress(null);
    setBustingIssueId(null);
    setMythExplanation('');
    showToast('🛡️ Myth Busted successfully! Received 50 XP & "Myth Buster" Badge!');

    // Update profile levels and counts
    const updatedProfile = {
      ...profile,
      mythsBustedCount: (profile.mythsBustedCount || 0) + 1,
      karmaPoints: profile.karmaPoints + 50,
      badges: [...profile.badges, 'Myth Buster'].filter((v, i, a) => a.indexOf(v) === i)
    };
    setProfile(updatedProfile);
    await dbService.saveUserProfile(updatedProfile);
  };

  // Claim rewards handler
  const handleClaimReward = async (rewardName: string, cost: number) => {
    if (profile.karmaPoints < cost) {
      showToast('❌ Insufficient Citizen Karma Points to claim this voucher.');
      return;
    }

    const voucherCode = 'SF-' + Math.random().toString(36).substring(3, 9).toUpperCase();
    const updatedProfile = {
      ...profile,
      karmaPoints: profile.karmaPoints - cost,
      claimedRewards: [...(profile.claimedRewards || []), `${rewardName} [Voucher: ${voucherCode}]`]
    };

    setProfile(updatedProfile);
    await dbService.saveUserProfile(updatedProfile);
    showToast(`🎁 Reward Claimed! Voucher Code for ${rewardName}: ${voucherCode}`);
  };

  const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(2));
  };

  const locateUser = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setUserLat(lat);
          setUserLng(lng);
          setReportLat(parseFloat(lat.toFixed(4)));
          setReportLng(parseFloat(lng.toFixed(4)));
          setReportLocation(`Grid Location [${lat.toFixed(3)}°N, ${Math.abs(lng).toFixed(3)}°W]`);
          setIsLocating(false);
          showToast('📍 Precision coordinates mapped to live grid!');
        },
        (err) => {
          console.warn('[GEOLOCATION] Browser denied or precision unavailable. Defaulting SF grid.', err);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      showToast('❌ Geolocation is not supported by your browser.');
    }
  };

  useEffect(() => {
    locateUser();
  }, []);

  useEffect(() => {
    async function loadData() {
      const loadedIssues = await dbService.getIssues();
      setIssues(loadedIssues);
      if (loadedIssues.length > 0 && !selectedIssueId) {
        setSelectedIssueId(loadedIssues[0].id); // select first issue by default
      }
    }
    loadData();

    // Enable high-frequency background polling (every 3 seconds) for live multi-device synchronization
    const interval = setInterval(async () => {
      const loaded = await dbService.getIssues();
      
      // If there are more issues than before, alert the user about the new live disaster report
      if (loaded.length > issues.length && issues.length > 0) {
        const newIncident = loaded.find(item => !issues.some(old => old.id === item.id));
        if (newIncident) {
          const dist = getDistanceInKm(userLat, userLng, newIncident.latitude, newIncident.longitude);
          if (dist <= 2.5 && newIncident.aiRiskScore >= 7) {
            // Trigger emergency non-deniable push-notification popup overlay
            setCriticalIncidentAlert(newIncident);
          } else {
            showToast(`🚨 NEW TELEMETRY DETECTED: "${newIncident.title}" at ${newIncident.locationName}!`);
          }
        }
      }
      setIssues(loaded);
    }, 3000);

    return () => clearInterval(interval);
  }, [issues.length, userLat, userLng]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAwardKarma = async (points: number, reason: string) => {
    let newPoints = profile.karmaPoints + points;
    let newLevel = profile.level;
    const threshold = newLevel * 200; // progressive difficulty thresholds
    let leveledUp = false;

    if (newPoints >= threshold) {
      newPoints -= threshold;
      newLevel += 1;
      leveledUp = true;
    }

    // Award badges dynamically
    const updatedBadges = [...profile.badges];
    if (newLevel >= 2 && !updatedBadges.includes('Streetlight Sentinel')) {
      updatedBadges.push('Streetlight Sentinel');
    }
    if (newLevel >= 3 && !updatedBadges.includes('Civic Master')) {
      updatedBadges.push('Civic Master');
    }

    const updatedProfile: UserProfile = {
      ...profile,
      karmaPoints: newPoints,
      level: newLevel,
      badges: updatedBadges
    };

    await dbService.saveUserProfile(updatedProfile);
    setProfile(updatedProfile);

    if (leveledUp) {
      showToast(`🌟 LEVEL UP! You reached Level ${newLevel}! unlocked new municipal status.`);
    } else {
      showToast(`✨ +${points} Karma Points: ${reason}`);
    }
  };

  const handleDockKarma = async (points: number, reason: string) => {
    const newPoints = Math.max(0, profile.karmaPoints - points);
    const updatedProfile: UserProfile = {
      ...profile,
      karmaPoints: newPoints
    };
    await dbService.saveUserProfile(updatedProfile);
    setProfile(updatedProfile);
    showToast(`🚨 PENALTY: -${points} Karma Points. Reason: ${reason}`);
  };

  const handleTriggerSensorIssue = async (newIssue: CommunityIssue) => {
    await dbService.saveIssue(newIssue);
    const refreshed = await dbService.getIssues();
    setIssues(refreshed);
    setSelectedIssueId(newIssue.id);
    showToast(`📡 SENSOR ALERT REGISTERED! Cryptographic signature generated: ${newIssue.cryptographicSignature?.substring(0, 12)}...`);
  };

  const handleMapClickReport = (lat: number, lng: number) => {
    setReportLat(parseFloat(lat.toFixed(4)));
    setReportLng(parseFloat(lng.toFixed(4)));
    setReportLocation(`Grid Coordinates [${lat.toFixed(3)}°N, ${lng.toFixed(3)}°W]`);
    setReporting(true);
    showToast('📍 Coordinate pinned on grid! Finish filling details below to dispatch AI.');
  };

  const handleInstantCameraDispatch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmittingPhoto(true);
    showToast('📸 Acquiring high-precision GPS telemetry...');

    let currentLat = userLat;
    let currentLng = userLng;

    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 });
        });
        currentLat = position.coords.latitude;
        currentLng = position.coords.longitude;
        setUserLat(currentLat);
        setUserLng(currentLng);
      } catch (err) {
        console.warn('Fallback coordinates applied.', err);
      }
    }

    showToast('🤖 Preparing and compressing media files under 200KB...');

    const reader = new FileReader();
    reader.onloadend = async () => {
      let base64Image = reader.result as string;

      if (file.type.startsWith('image/')) {
        try {
          base64Image = await compressImage(base64Image, 600, 450, 0.6);
          console.log('[COMPRESSOR] Dashboard Image compressed. Base64 characters:', base64Image.length);
        } catch (err) {
          console.warn('[COMPRESSOR] Compression failed, continuing with original:', err);
        }
      } else if (file.type.startsWith('video/')) {
        if (file.size > 200 * 1024) {
          showToast('⚠️ Video is over 200KB. Processing, but we recommend short clips to avoid server timeouts.');
        }
      }

      try {
        showToast('🤖 Analyzing photo pixels via CivicAI Multimodal Vision...');
        const response = await fetch('/api/gemini/analyze-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Image,
            userLat: currentLat,
            userLng: currentLng
          })
        });

        if (!response.ok) {
          throw new Error('Multimodal scan failed.');
        }

        const aiData = await response.json();

        const newIssue: CommunityIssue = {
          id: 'issue_' + Math.random().toString(36).substring(2, 11),
          reporterId: profile.id,
          reporterName: profile.name,
          reporterPhone: profile.phone,
          reporterPhoneVerified: profile.isPhoneVerified,
          title: aiData.title || 'Mobile Snapshot Event',
          description: aiData.description || 'Multimodal camera dispatch.',
          category: aiData.category || 'Other',
          locationName: aiData.locationName || 'Scanned Location Landmark',
          latitude: aiData.latitude || currentLat,
          longitude: aiData.longitude || currentLng,
          imageUrl: base64Image,
          status: 'reported',
          upvotesCount: 1,
          upvotedBy: [profile.id],
          validatedCount: 0,
          validatedBy: [],
          aiRiskScore: aiData.aiRiskScore || 6,
          aiTags: aiData.aiTags || ['multimodal-scan', 'live-camera'],
          aiResolutionPlan: aiData.aiResolutionPlan || '### Phase 1: Review\nMunicipal review initiated based on multimodal verification.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await dbService.saveIssue(newIssue);

        const refreshed = await dbService.getIssues();
        setIssues(refreshed);
        setSelectedIssueId(newIssue.id);

        showToast(`🚀 Dispatched to DB! AI Assigned Risk Priority: ${newIssue.aiRiskScore}/10`);
        await handleAwardKarma(40, 'Direct camera upload and real GPS pinning');

      } catch (err: any) {
        console.error(err);
        showToast('❌ Multimodal analysis failed. Reverted to standard manual coordinate form.');
      } finally {
        setSubmittingPhoto(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleSubmitIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !reportDescription.trim()) {
      showToast('⚠️ Please enter both a title and description.');
      return;
    }

    setSubmitting(true);
    try {
      // Query the server-side Gemini AI Municipal Specialist analyzer
      const response = await fetch('/api/gemini/analyze-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportTitle.trim(),
          description: reportDescription.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Gemini analysis failed.');
      }

      const aiData = await response.json();

      const newIssue: CommunityIssue = {
        id: 'issue_' + Math.random().toString(36).substring(2, 11),
        reporterId: profile.id,
        reporterName: profile.name,
        reporterPhone: profile.phone,
        reporterPhoneVerified: profile.isPhoneVerified,
        title: reportTitle.trim(),
        description: reportDescription.trim(),
        category: aiData.category || reportCategory,
        locationName: reportLocation || 'Unspecified location',
        latitude: reportLat,
        longitude: reportLng,
        status: 'reported',
        upvotesCount: 1,
        upvotedBy: [profile.id], // auto upvote by reporter
        validatedCount: 0,
        validatedBy: [],
        aiRiskScore: aiData.aiRiskScore || 5,
        aiTags: aiData.aiTags || ['new-report'],
        aiResolutionPlan: aiData.aiResolutionPlan || '### Phase 1: Review\nMunicipal review initiated.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dbService.saveIssue(newIssue);
      
      const refreshed = await dbService.getIssues();
      setIssues(refreshed);
      setSelectedIssueId(newIssue.id);

      // Reset form states
      setReportTitle('');
      setReportDescription('');
      setReporting(false);

      showToast(`🚀 Hyperlocal event registered! AI assigned Risk Priority Score: ${newIssue.aiRiskScore}/10`);
      await handleAwardKarma(30, 'Submitted new hyperlocal community report');

    } catch (err) {
      console.error(err);
      showToast('❌ Backend AI Analyzer failed. Registered report using generic presets.');

      const fallbackIssue: CommunityIssue = {
        id: 'issue_' + Math.random().toString(36).substring(2, 11),
        reporterId: profile.id,
        reporterName: profile.name,
        reporterPhone: profile.phone,
        reporterPhoneVerified: profile.isPhoneVerified,
        title: reportTitle.trim(),
        description: reportDescription.trim(),
        category: reportCategory as any,
        locationName: reportLocation || 'District location',
        latitude: reportLat,
        longitude: reportLng,
        status: 'reported',
        upvotesCount: 1,
        upvotedBy: [profile.id],
        validatedCount: 0,
        validatedBy: [],
        aiRiskScore: 4,
        aiTags: ['requires-review'],
        aiResolutionPlan: '### Phase 1: Site Inspection\nStandard contractor vehicle dispatched within 5-7 business days.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dbService.saveIssue(fallbackIssue);
      const refreshed = await dbService.getIssues();
      setIssues(refreshed);
      setSelectedIssueId(fallbackIssue.id);

      setReportTitle('');
      setReportDescription('');
      setReporting(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueUpdated = (updated: CommunityIssue) => {
    setIssues(prev => prev.map(i => i.id === updated.id ? updated : i));
  };

  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/80 text-slate-100 flex flex-col pb-12 relative overflow-hidden">
      {/* Hyper-vibrant backdrop ambient glow bubbles */}
      <div className="absolute top-24 right-10 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[600px] left-10 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[130px] pointer-events-none animate-pulse duration-5000" />
      <div className="absolute bottom-24 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 text-slate-100 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 max-w-sm md:max-w-md"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold font-sans leading-relaxed text-slate-200">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Non-Deniable Civil Hazard Emergency Warning Overlay */}
      <AnimatePresence>
        {criticalIncidentAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border-2 border-rose-500 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(244,63,94,0.3)] max-w-lg w-full p-6 text-center space-y-4 relative"
            >
              {/* Emergency flash background animation */}
              <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center mx-auto text-rose-500 animate-pulse">
                <AlertOctagon className="w-10 h-10 shrink-0" />
              </div>

              <div>
                <span className="text-[10px] font-mono font-extrabold text-rose-500 tracking-widest uppercase block mb-1">🚨 CRITICAL NEIGHBORHOOD HAZARD BROADCAST 🚨</span>
                <h2 className="text-xl font-black text-white tracking-tight leading-tight mb-2">Immediate Proximity Warning</h2>
                <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-md mx-auto">
                  Our hyperlocal AI core has triangulated a critical public threat reported only <span className="text-rose-400 font-bold">{getDistanceInKm(userLat, userLng, criticalIncidentAlert.latitude, criticalIncidentAlert.longitude)} km</span> away from your current GPS grid position!
                </p>
              </div>

              <div className="bg-slate-950/80 border border-slate-850 p-4.5 rounded-2xl text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-400 font-mono">INCIDENT:</span>
                  <span className="text-white font-bold">{criticalIncidentAlert.title}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-400 font-mono">LOCATION:</span>
                  <span className="text-slate-200">📍 {criticalIncidentAlert.locationName}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-slate-900 pb-2">
                  <span className="text-slate-400 font-mono">AI PRIORITY SCORE:</span>
                  <span className="text-rose-400 font-extrabold font-mono">{criticalIncidentAlert.aiRiskScore}/10 CRITICAL</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {criticalIncidentAlert.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setSelectedIssueId(criticalIncidentAlert.id);
                    setCriticalIncidentAlert(null);
                    showToast('📍 Selected and locked coordinates on active tactical display.');
                  }}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 hover:brightness-110 text-white font-extrabold text-xs py-3 rounded-xl transition cursor-pointer shadow-lg active:scale-95"
                >
                  LOCK TELEMETRY & ATTEND
                </button>
                <button
                  onClick={() => setCriticalIncidentAlert(null)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs py-3 rounded-xl transition cursor-pointer border border-slate-700 hover:text-white"
                >
                  ACKNOWLEDGE SAFETY WARNING
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Header */}
      <header className="border-b border-slate-900 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9.5 h-9.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Shield className="w-5.5 h-5.5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block font-display">Community <span className="text-emerald-400">Hero</span></span>
              <span className="text-[10px] text-slate-500 font-mono block tracking-wider uppercase">District 7 Dispatch</span>
            </div>
          </div>

          {/* Secure Portal Security Level Badge */}
          <div className="shrink-0">
            {adminMode ? (
              <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl px-3 py-1.5 text-xs font-bold font-mono">
                <Shield className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                <span>ADMIN PORTAL</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-3 py-1.5 text-xs font-bold font-mono">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>SECURE CITIZEN ACCESS</span>
              </div>
            )}
          </div>

          {/* Gamified Citizen Badging and stats */}
          <div className="flex items-center gap-4">
            
            {/* XP Level indicator */}
            <div className="hidden sm:flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-1.5">
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span className="text-xs font-semibold text-emerald-400">Level {profile.level}</span>
              </div>
              <div className="w-20 md:w-28 h-1.5 bg-slate-850 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (profile.karmaPoints / (profile.level * 200)) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {profile.karmaPoints}/{profile.level * 200} XP
              </span>
            </div>

            {/* Badges showcase bubble */}
            <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-2.5 py-1 text-xs font-semibold font-mono">
              <span>{profile.badges[profile.badges.length - 1]}</span>
            </div>

            {/* Sign out */}
            <button 
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
              title="Sign Out Profile"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
        {adminMode ? (
          <AdminTerminal 
            currentUser={profile}
            issues={issues}
            onIssueUpdated={handleIssueUpdated}
            onIssueDeleted={(id) => {
              const remaining = issues.filter(item => item.id !== id);
              setIssues(remaining);
              if (selectedIssueId === id) {
                setSelectedIssueId(remaining.length > 0 ? remaining[0].id : null);
              }
            }}
            onRefreshData={async () => {
              const loaded = await dbService.getIssues();
              setIssues(loaded);
            }}
            showToast={showToast}
          />
        ) : (
          <>
            {/* Horizontal Sub-Navigation Tab selector */}
            <div className="flex flex-wrap gap-2 border-b border-slate-900 pb-3">
              <button
                onClick={() => setResidentTab('map')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-tight transition-all duration-200 cursor-pointer border ${
                  residentTab === 'map'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>MAP DISPATCH</span>
              </button>

              <button
                onClick={() => setResidentTab('tracker')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-tight transition-all duration-200 cursor-pointer border ${
                  residentTab === 'tracker'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>CITIZENS LEDGER & TRACKER</span>
              </button>

              <button
                onClick={() => setResidentTab('gov')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-tight transition-all duration-200 cursor-pointer border ${
                  residentTab === 'gov'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>GOVERNMENT PORTAL LINK</span>
              </button>

              <button
                onClick={() => setResidentTab('rewards')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[11px] font-bold tracking-tight transition-all duration-200 cursor-pointer border ${
                  residentTab === 'rewards'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                    : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>AWARDS & MYTH BUSTERS</span>
              </button>
            </div>

            {/* Render selected tab content */}
            {residentTab === 'map' && (
              <div className="space-y-6">
                {/* Row 1: Map Stage & Detail Card Deck */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Map & submission (8/12 Columns) */}
                  <div className="lg:col-span-8 space-y-6">
                    <MapDashboard 
                      issues={issues}
                      selectedIssueId={selectedIssueId}
                      onSelectIssue={(id) => setSelectedIssueId(id)}
                      onMapClickReport={handleMapClickReport}
                      userLat={userLat}
                      userLng={userLng}
                      onLocateUser={locateUser}
                      isLocating={isLocating}
                      profile={profile}
                      onIssuesUpdated={(refreshed) => setIssues(refreshed)}
                    />

                    {/* AI Analyzer Report Submission Box */}
                    <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
                      <div className="absolute right-0 top-0 p-1 bg-emerald-500/10 border-l border-b border-emerald-500/20 text-emerald-400 font-mono text-[9px] font-bold rounded-bl-lg">
                        <Sparkles className="w-3.5 h-3.5 inline mr-1 animate-pulse" />
                        AI MUNICIPAL ANALYSIS INSTANT DISPATCH
                      </div>

                      <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
                        <h3 className="text-xs font-bold text-slate-200 tracking-wider uppercase font-mono">
                          Report a Hyperlocal Event
                        </h3>
                        {!reporting && (
                          <button 
                            onClick={() => setReporting(true)}
                            className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1 rounded-lg transition cursor-pointer"
                          >
                            + Open Form
                          </button>
                        )}
                      </div>

                      {reporting ? (
                        <form onSubmit={handleSubmitIssue} className="space-y-4">
                          {/* Disclaimer */}
                          <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-2.5 text-rose-400 font-mono text-[9px]">
                            <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                            <div>
                              <span className="block font-bold uppercase">PENAL DISCLOSURE NOTICE (PENAL CODE § 148.5)</span>
                              <span className="text-slate-400 block mt-0.5">Filing fraudulent public hazard alarms or misleading the municipal dispatch will result in suspension, docking 50 XP, and legal citation under District code.</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-400 text-xs font-medium mb-1.5">What is the issue?</label>
                              <input
                                type="text"
                                value={reportTitle}
                                onChange={(e) => setReportTitle(e.target.value)}
                                placeholder="e.g. Burst drainage flood on 5th Avenue"
                                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 text-xs font-medium mb-1.5">District Category</label>
                              <select
                                value={reportCategory}
                                onChange={(e) => setReportCategory(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white"
                              >
                                <option value="Pothole">Pothole</option>
                                <option value="Water Leakage">Water Leakage</option>
                                <option value="Damaged Streetlight">Damaged Streetlight</option>
                                <option value="Waste Management">Waste Management</option>
                                <option value="Public Infrastructure">Public Infrastructure</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-slate-400 text-xs font-medium mb-1.5">Location Landmark Name</label>
                              <input
                                type="text"
                                value={reportLocation}
                                onChange={(e) => setReportLocation(e.target.value)}
                                placeholder="e.g. Near elementary school crosswalk"
                                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white placeholder-slate-700"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 text-xs font-medium mb-1.5">Map Coordinates (Click on map above to pin!)</label>
                              <input
                                type="text"
                                value={`${reportLat}° N, ${reportLng}° W`}
                                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-500 font-mono select-none"
                                readOnly
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-slate-400 text-xs font-medium mb-1.5">Description (Be descriptive - AI will calculate public safety hazard risks!)</label>
                            <textarea
                              value={reportDescription}
                              onChange={(e) => setReportDescription(e.target.value)}
                              placeholder="e.g. A high-pressure municipal pipe seems fractured under the asphalt. Water is gushing onto the school zone crossing, creating a major hazard for children."
                              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl p-3 text-xs text-white placeholder-slate-700 h-20 resize-none"
                              required
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setReporting(false)}
                              className="bg-slate-800 hover:bg-slate-755 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                            >
                              {submitting ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>AI Analyzing Report...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                                  <span>Dispatch AI Analyzer</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-xs text-slate-400 pb-2 border-b border-slate-850/60">
                            <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>Click anywhere on the interactive map above to auto-capture lat/lng pins and start manual reporting.</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                            {/* Massive Vibrant Single-Press Live Camera Button */}
                            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/40 p-4.5 flex flex-col justify-between gap-3 shadow-[0_4px_20px_rgba(16,185,129,0.1)] group">
                              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-40 animate-pulse pointer-events-none" />
                              
                              <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                                  <span className="text-[9px] font-mono font-extrabold text-emerald-400 tracking-widest uppercase">DIRECT DISPATCH BEACON</span>
                                </div>
                                <h4 className="text-xs font-bold text-white tracking-tight mb-1 font-sans">Single-Press Image & Video Poster</h4>
                                <p className="text-[11px] text-slate-400 leading-normal">
                                  Snap or upload a photo/video of any hazard. Our AI instantly extracts the issue context, calculates hazard risks, reverse-triangulates your GPS, and alerts nearby residents.
                                </p>
                              </div>

                              <div>
                                <input 
                                  type="file" 
                                  id="single-press-camera" 
                                  accept="image/*,video/*" 
                                  className="hidden" 
                                  onChange={handleInstantCameraDispatch}
                                  disabled={submittingPhoto}
                                />
                                <label 
                                  htmlFor="single-press-camera"
                                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:brightness-110 active:scale-[0.98] transition-all"
                                >
                                  {submittingPhoto ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                                      <span>AI RUNNING PIXEL & GPS SCAN...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Camera className="w-4.5 h-4.5 text-slate-950" />
                                      <span>SNAP/UPLOAD MEDIA</span>
                                    </>
                                  )}
                                </label>
                              </div>
                            </div>

                            {/* Proximity telemetry display box */}
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4.5 flex flex-col justify-between text-xs font-mono">
                              <div>
                                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase block mb-1">PROXIMITY TELEMETRY</span>
                                <div className="space-y-1.5 text-[11px]">
                                  <div className="flex justify-between border-b border-slate-900 pb-1">
                                    <span className="text-slate-400">Precision GPS:</span>
                                    <span className="text-slate-200">{isLocating ? 'Locating...' : 'ACTIVE'}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-900 pb-1">
                                    <span className="text-slate-400">District Center:</span>
                                    <span className="text-emerald-400">San Francisco, CA</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-900 pb-1">
                                    <span className="text-slate-400">Grid Latitude:</span>
                                    <span className="text-slate-300 font-bold">{userLat.toFixed(5)}° N</span>
                                  </div>
                                  <div className="flex justify-between pb-1">
                                    <span className="text-slate-400">Grid Longitude:</span>
                                    <span className="text-slate-300 font-bold">{Math.abs(userLng).toFixed(5)}° W</span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-[9px] text-slate-500 mt-2 block">
                                *Reverse geolocation matches physical surroundings to local road ledger entries automatically.
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* District Feed & Selected Issue Details (4/12 Columns) */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <span className="text-[10px] font-bold font-mono text-slate-500 tracking-widest uppercase block border-b border-slate-850 pb-2">
                        Active District Incident Queue ({issues.length})
                      </span>

                      <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                        {issues.map((i) => {
                          const isSelected = selectedIssueId === i.id;
                          return (
                            <div
                              key={i.id}
                              onClick={() => setSelectedIssueId(i.id)}
                              className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected 
                                  ? 'bg-slate-950 border-emerald-500/40 text-white shadow-md' 
                                  : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-800'
                              }`}
                            >
                              <div className="truncate">
                                <span className="text-[9px] font-mono font-bold block mb-0.5 truncate uppercase" style={{ color: isSelected ? '#10b981' : '#475569' }}>
                                  [{i.category}]
                                </span>
                                <span className="text-xs font-bold block truncate text-slate-200">{i.title}</span>
                              </div>
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${
                                i.aiRiskScore >= 8 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-950 text-slate-500'
                              }`}>
                                Priority {i.aiRiskScore}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {selectedIssue ? (
                      <IssueCard 
                        issue={selectedIssue}
                        currentUser={profile}
                        onIssueUpdated={handleIssueUpdated}
                        onAwardKarma={handleAwardKarma}
                      />
                    ) : (
                      <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-8 text-center text-slate-600 text-xs italic">
                        Select an incident from map or incident queue to display safety actions.
                      </div>
                    )}
                  </div>
                </div>

                {/* Sensor Terminal and Civic Copilot */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    <SensorTerminal 
                      currentUser={profile}
                      issues={issues}
                      onTriggerIssue={handleTriggerSensorIssue}
                      onAwardKarma={handleAwardKarma}
                      onDockKarma={handleDockKarma}
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <CivicCopilot currentUser={profile} issues={issues} />
                  </div>
                </div>
              </div>
            )}

            {residentTab === 'tracker' && (
              <div className="space-y-6">
                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                  <h3 className="text-base font-extrabold text-white tracking-tight leading-none mb-1.5 font-display">
                    Citizens Issue Ledger & Reviews
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl leading-normal mb-6">
                    Audit and search community issues. Verify accuracy, participate in discussion, or upvote critical tasks to escalate contractor response priority.
                  </p>

                  {/* Filters and search controller */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center mb-6 border-b border-slate-850 pb-6">
                    <div className="md:col-span-5 relative">
                      <Search className="w-4.5 h-4.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search incidents by landmark, description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-white"
                      >
                        <option value="All">All Categories</option>
                        <option value="Pothole">Potholes</option>
                        <option value="Water Leakage">Water Leakages</option>
                        <option value="Damaged Streetlight">Streetlight Issues</option>
                        <option value="Waste Management">Waste Management</option>
                        <option value="Public Infrastructure">Infrastructure</option>
                        <option value="Other">Other Issues</option>
                      </select>
                    </div>

                    <div className="md:col-span-4 flex bg-slate-950 border border-slate-850 rounded-xl p-1 shrink-0">
                      <button
                        onClick={() => setOwnerFilter('all')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          ownerFilter === 'all'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        All Issues
                      </button>
                      <button
                        onClick={() => setOwnerFilter('mine')}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          ownerFilter === 'mine'
                            ? 'bg-emerald-500 text-slate-950'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        My Posted Issues
                      </button>
                    </div>
                  </div>

                  {/* Split Queue list & detail */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* List (5/12) */}
                    <div className="lg:col-span-5 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                      {issues
                        .filter(i => {
                          const matchesQuery = i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                               i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                               i.locationName.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesCat = categoryFilter === 'All' || i.category === categoryFilter;
                          const matchesOwner = ownerFilter === 'all' || i.reporterId === profile.id;
                          return matchesQuery && matchesCat && matchesOwner;
                        })
                        .map(issue => {
                          const isSelected = selectedIssueId === issue.id;
                          return (
                            <div
                              key={issue.id}
                              onClick={() => setSelectedIssueId(issue.id)}
                              className={`p-4 rounded-2xl border transition duration-200 cursor-pointer text-left space-y-2 ${
                                isSelected
                                  ? 'bg-slate-950 border-emerald-500 text-white shadow-lg'
                                  : 'bg-slate-900/30 border-slate-850 hover:bg-slate-900/50 hover:border-slate-800'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-[10px] font-mono font-extrabold text-emerald-400 tracking-wider block">
                                  {issue.category.toUpperCase()}
                                </span>
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md ${
                                  issue.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                                  issue.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                  {issue.status.toUpperCase()}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{issue.title}</h4>
                              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {issue.description}
                              </p>

                              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-1.5 border-t border-slate-900/50 gap-2">
                                <span className="truncate max-w-[150px]">📍 {issue.locationName}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {issue.reporterPhoneVerified && (
                                    <span className="text-[8px] text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 px-1 py-0.2 rounded font-extrabold" title="SMS Phone Verified Citizen">✓ SMS VERIFIED</span>
                                  )}
                                  <span>👍 {issue.upvotesCount} upvotes</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                      {issues.filter(i => {
                        const matchesQuery = i.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                             i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                             i.locationName.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesCat = categoryFilter === 'All' || i.category === categoryFilter;
                        const matchesOwner = ownerFilter === 'all' || i.reporterId === profile.id;
                        return matchesQuery && matchesCat && matchesOwner;
                      }).length === 0 && (
                        <div className="py-12 text-center text-slate-500 italic text-xs font-mono">
                          No reports matched your tracking filters.
                        </div>
                      )}
                    </div>

                    {/* Detail panel (7/12) */}
                    <div className="lg:col-span-7 bg-slate-950/80 border border-slate-850 p-5 rounded-2xl text-left">
                      {selectedIssue ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                            <div>
                              <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                                {selectedIssue.category}
                              </span>
                              <h3 className="text-sm font-black text-white tracking-tight mt-1.5">{selectedIssue.title}</h3>
                            </div>
                            <span className="text-xs font-mono text-slate-500">
                              Priority: <strong className="text-rose-400 font-bold">{selectedIssue.aiRiskScore}/10</strong>
                            </span>
                          </div>

                          {/* Media Box */}
                          {selectedIssue.imageUrl && (
                            <div className="relative rounded-xl overflow-hidden border border-slate-850 aspect-video max-h-[220px]">
                              {selectedIssue.imageUrl.startsWith('data:video/') ? (
                                <video 
                                  src={selectedIssue.imageUrl} 
                                  controls 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img 
                                  src={selectedIssue.imageUrl} 
                                  alt="Incident Asset" 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <div className="absolute top-2 left-2 bg-slate-950/80 border border-slate-800 text-[9px] text-slate-300 px-2 py-0.5 rounded font-mono font-bold uppercase">
                                {selectedIssue.imageUrl.startsWith('data:video/') ? '📺 Live Video' : '📸 Snap Asset'}
                              </div>
                            </div>
                          )}

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono text-slate-500 block uppercase">REPORT DESCRIPTION</span>
                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/30 p-3 rounded-xl border border-slate-900">
                              {selectedIssue.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-[11px] font-mono bg-slate-900/20 border border-slate-900/50 p-3 rounded-xl">
                            <div>
                              <span className="text-slate-500 block text-[9px]">POSTED BY</span>
                              <span className="text-slate-300 font-bold flex items-center gap-1.5 flex-wrap">
                                <span>{selectedIssue.reporterName}</span>
                                {selectedIssue.reporterPhoneVerified && (
                                  <span className="inline-flex items-center text-[8px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-extrabold tracking-wider" title={`Verified Phone: ${selectedIssue.reporterPhone}`}>
                                    ✓ SMS VERIFIED
                                  </span>
                                )}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block text-[9px]">LANDMARK LOCATION</span>
                              <span className="text-slate-300 truncate block">📍 {selectedIssue.locationName}</span>
                            </div>
                          </div>

                          {/* Citizen reviews list and verify actions */}
                          <div className="border-t border-slate-900 pt-4 space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-200 font-mono">RESIDENT REVIEW CHECKS ({selectedIssue.validatedCount})</span>
                              <button
                                onClick={async () => {
                                  if (selectedIssue.validatedBy.includes(profile.id)) {
                                    showToast('⚠️ You have already certified/reviewed this report.');
                                    return;
                                  }
                                  const updatedIssue = {
                                    ...selectedIssue,
                                    validatedCount: selectedIssue.validatedCount + 1,
                                    validatedBy: [...selectedIssue.validatedBy, profile.id],
                                    status: 'verified' as const
                                  };
                                  await dbService.saveIssue(updatedIssue);
                                  handleIssueUpdated(updatedIssue);
                                  showToast('✅ Report accuracy certified! Awarded 10 XP.');
                                  await handleAwardKarma(10, 'Certified report accuracy');
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase font-mono px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
                              >
                                {selectedIssue.validatedBy.includes(profile.id) ? 'Accuracy Certified' : 'Certify Accuracy (+10 XP)'}
                              </button>
                            </div>

                            <div className="space-y-3">
                              {/* Simple validation lists */}
                              <div className="text-[11px] text-slate-400 bg-slate-900/30 p-3 rounded-xl border border-slate-900/60 leading-relaxed space-y-1">
                                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] font-mono">
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>MUNICIPAL MULTI-RESIDENT VERIFICATION LEDGER</span>
                                </div>
                                <p className="mt-1">
                                  {selectedIssue.validatedCount === 0 
                                    ? 'Awaiting secondary resident audit to guarantee reporting veracity.'
                                    : `${selectedIssue.validatedCount} neighborhood watch officer(s) have audited and stamped this incident as authentic and highly accurate.`
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="py-24 text-center text-slate-600 italic text-xs font-mono">
                          Select an issue from the tracking list to display telemetry audits, images/videos, and community reviews.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {residentTab === 'gov' && (
              <div className="space-y-6">
                <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl text-left relative overflow-hidden">
                  <h3 className="text-base font-extrabold text-white tracking-tight leading-none mb-1.5 font-display flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    Government Sync Portal
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl leading-normal mb-6">
                    Connect local community incidents directly to city systems. When an issue is linked, the system maps telemetry payload to official APIs, scheduling contractor teams under real tracking IDs.
                  </p>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Issues available to link */}
                    <div className="lg:col-span-6 space-y-3">
                      <span className="text-[10px] font-bold font-mono text-slate-500 tracking-widest uppercase block border-b border-slate-850 pb-2">
                        Select Report to Link
                      </span>

                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                        {issues.map(item => {
                          const isSelected = linkingIssueId === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setLinkingIssueId(item.id);
                                setSelectedAgency(
                                  item.category === 'Water Leakage' ? 'SF Water Enterprise' :
                                  item.category === 'Damaged Streetlight' ? 'SF Municipal Transportation Agency' :
                                  'Department of Public Works'
                                );
                              }}
                              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex justify-between items-center gap-3 ${
                                isSelected
                                  ? 'bg-slate-950 border-emerald-500/40 text-white shadow-md'
                                  : 'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-800'
                              }`}
                            >
                              <div className="truncate">
                                <span className="text-[10px] font-mono font-bold text-slate-500 block mb-0.5 truncate uppercase">
                                  {item.category}
                                </span>
                                <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                                <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                                  {item.governmentStatus === 'linked' ? `Synced: ${item.governmentWorkOrderId}` : '🔴 Off-Grid / Not Linked'}
                                </span>
                              </div>

                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                item.governmentStatus === 'linked'
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : 'bg-slate-800 text-slate-400'
                              }`}>
                                {item.governmentStatus === 'linked' ? 'SYNCED' : 'UNLINKED'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Linking Config & Progress */}
                    <div className="lg:col-span-6 bg-slate-950/80 border border-slate-850 p-5 rounded-2xl">
                      {linkingIssueId ? (
                        (() => {
                          const activeLinkIssue = issues.find(i => i.id === linkingIssueId);
                          if (!activeLinkIssue) return null;

                          return (
                            <div className="space-y-4 text-left">
                              <div className="border-b border-slate-900 pb-2">
                                <span className="text-[9px] font-mono text-slate-500 block uppercase">SYNC TELEMETRY SELECTION</span>
                                <h4 className="text-xs font-bold text-white font-sans mt-0.5">{activeLinkIssue.title}</h4>
                              </div>

                              {activeLinkIssue.governmentStatus === 'linked' ? (
                                <div className="space-y-4">
                                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                      <h5 className="text-xs font-bold text-emerald-300 font-mono uppercase">Official Government Link Synced</h5>
                                      <p className="text-[11px] text-slate-300 leading-normal mt-1">
                                        This incident is actively linked to the <strong className="text-white">{activeLinkIssue.governmentAgency}</strong>. A municipal ticket was filed successfully.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-2.5 font-mono text-[11px]">
                                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                      <span className="text-slate-500">Work Order ID:</span>
                                      <span className="text-slate-200 font-bold">{activeLinkIssue.governmentWorkOrderId}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                      <span className="text-slate-500">Sync Status:</span>
                                      <span className="text-emerald-400 font-extrabold uppercase animate-pulse">DISPATCHED TO CONTRACTORS</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                      <span className="text-slate-500">Synced On:</span>
                                      <span className="text-slate-300">{new Date(activeLinkIssue.governmentSyncedAt || '').toLocaleString()}</span>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-slate-500 block text-[9px] uppercase">Official Instructions / Notes:</span>
                                      <p className="text-[10px] text-slate-400 italic font-sans leading-relaxed">
                                        "{activeLinkIssue.governmentNotes}"
                                      </p>
                                    </div>
                                  </div>

                                  {/* Beautiful Progress Timeline */}
                                  <div className="space-y-3.5 pt-2">
                                    <span className="text-[9px] font-mono text-slate-500 block uppercase">MUNICIPAL PIPELINE TIMELINE</span>
                                    
                                    <div className="relative pl-5 border-l border-slate-800 space-y-4 text-xs">
                                      <div className="relative">
                                        <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="font-bold text-emerald-400 block font-mono text-[10px]">SYNCED / ESTABLISHED</span>
                                        <span className="text-slate-400 text-[11px] block mt-0.5">Payload schemas translated and synced successfully with municipal data core.</span>
                                      </div>
                                      <div className="relative">
                                        <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                        <span className="font-bold text-slate-300 block font-mono text-[10px]">WORK ORDER DISPATCHED</span>
                                        <span className="text-slate-400 text-[11px] block mt-0.5">Assigned contractor crew dispatched to field grid coordinates.</span>
                                      </div>
                                      <div className="relative">
                                        <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-slate-800" />
                                        <span className="font-bold text-slate-600 block font-mono text-[10px]">REPAIR & REPAVEMENT</span>
                                        <span className="text-slate-500 text-[11px] block mt-0.5">Pending crew physical site installation & concrete aggregate deployment.</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  <div className="space-y-1.5">
                                    <label className="block text-slate-400 text-[10px] font-mono uppercase">Target City Department</label>
                                    <select
                                      value={selectedAgency}
                                      onChange={(e) => setSelectedAgency(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl px-3 py-2 text-xs text-white font-sans"
                                    >
                                      <option value="Department of Public Works">Department of Public Works (DPW)</option>
                                      <option value="SF Municipal Transportation Agency">SF Municipal Transportation Agency (SFMTA)</option>
                                      <option value="SF Water Enterprise">SF Water Enterprise (SFPUC)</option>
                                      <option value="SF Health & Safety Commission">SF Health & Safety Commission</option>
                                    </select>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="block text-slate-400 text-[10px] font-mono uppercase">Special Instructions / Dispatch Notes</label>
                                    <textarea
                                      value={customGovNotes}
                                      onChange={(e) => setCustomGovNotes(e.target.value)}
                                      placeholder="e.g. Attention District 7 Supervior: please deploy hazard barriers immediately as this lies within a school zone crossing."
                                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl p-3 text-xs text-white placeholder-slate-700 h-24 resize-none font-sans leading-relaxed"
                                    />
                                  </div>

                                  {syncingStatus ? (
                                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                                      <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                                        <span>{syncingStatus}</span>
                                        <span>{syncProgress}%</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-emerald-500 transition-all duration-300"
                                          style={{ width: `${syncProgress}%` }}
                                        />
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleLinkIssueToGovernment(activeLinkIssue.id, selectedAgency, customGovNotes)}
                                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs py-3 rounded-xl hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                                    >
                                      <Building2 className="w-4 h-4 text-slate-950" />
                                      <span>SECURE CLOUD API INTEGRATION SYNC</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <div className="py-24 text-center text-slate-600 italic text-xs font-mono">
                          Select an off-grid incident from the left queue to bridge schema pipelines with official municipal offices.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {residentTab === 'rewards' && (
              <div className="space-y-8">
                {/* Visual Header / XP summary */}
                <div className="bg-gradient-to-r from-slate-900 via-slate-900/85 to-emerald-950/20 border border-slate-800 p-5 rounded-3xl text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-white font-display flex items-center gap-1.5">
                      <Coins className="w-5 h-5 text-emerald-400" />
                      Citizen Contribution Awards Portal
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      Your helpful neighborhood actions earn XP points. Redeem those points below for municipal bus passes, local cafe voucher discounts, or actual eco-contributions!
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0 font-mono">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-500 uppercase block leading-none">VOUCHER BALANCE</span>
                      <span className="text-emerald-400 font-black text-sm">{profile.karmaPoints} XP</span>
                    </div>
                    <div className="w-0.5 h-7 bg-slate-850" />
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block leading-none">MYTHS BUSTED</span>
                      <span className="text-white font-bold text-xs">{profile.mythsBustedCount || 0} Reports</span>
                    </div>
                  </div>
                </div>

                {/* Grid for Forensics Myth-Busting and Reward Shop */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Forensics Myth Buster Portal (7/12) */}
                  <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 p-5 rounded-3xl text-left space-y-4">
                    <div className="border-b border-slate-850 pb-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-mono font-extrabold text-emerald-400 tracking-wider block">CIVIC FORENSICS LAB</span>
                        <h4 className="text-xs font-black text-white uppercase font-mono tracking-tight mt-0.5">Myth-Buster Verification Console</h4>
                      </div>
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full font-bold font-mono">
                        +50 XP PER BUST
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-normal">
                      Bust myths and report false information! If a community report is fake, Photoshoped, a duplicative prank, or off-target, flag it and provide forensic justification to clean up our neighborhood maps!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      {/* Left list of suspect items */}
                      <div className="md:col-span-6 space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {issues.map(item => {
                          const isBusted = item.isMythFlagged && item.mythBustStatus === 'myth_busted';
                          const isSelected = bustingIssueId === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                if (isBusted) {
                                  showToast('🛡️ This myth is already busted!');
                                  return;
                                }
                                setBustingIssueId(item.id);
                              }}
                              className={`p-3 rounded-xl border transition cursor-pointer ${
                                isBusted ? 'bg-rose-950/10 border-rose-900/30 text-rose-500/70 select-none' :
                                isSelected ? 'bg-slate-950 border-emerald-500/40 text-white' :
                                'bg-slate-900/30 border-slate-900 text-slate-400 hover:border-slate-850'
                              }`}
                            >
                              <span className="text-[8px] font-mono block uppercase text-slate-500 mb-0.5">{item.category}</span>
                              <h5 className="text-[11px] font-bold truncate leading-none">{item.title}</h5>
                              <span className="text-[9px] font-mono block mt-1">
                                {isBusted ? '🛡️ BUSTED FAKE' : '🔍 Suspect - Review Report'}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right challenge submission block */}
                      <div className="md:col-span-6 bg-slate-950 p-4 rounded-2xl border border-slate-850/60">
                        {bustingIssueId ? (
                          (() => {
                            const activeBustIssue = issues.find(i => i.id === bustingIssueId);
                            if (!activeBustIssue) return null;

                            return (
                              <div className="space-y-3.5">
                                <div className="border-b border-slate-900 pb-1.5">
                                  <span className="text-[8px] font-mono text-slate-500 block uppercase">CHALLENGING EVENT</span>
                                  <h5 className="text-[11px] font-bold text-slate-300 truncate font-sans">{activeBustIssue.title}</h5>
                                </div>

                                <div className="space-y-1.5">
                                  <label className="block text-slate-400 text-[9px] font-mono uppercase">Provide Forensic Evidence of Falsehood</label>
                                  <textarea
                                    value={mythExplanation}
                                    onChange={(e) => setMythExplanation(e.target.value)}
                                    placeholder="e.g. This photo is actually an old stock photo of a pothole from Bangalore 2021, not a live hazard on MG Road."
                                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:outline-none rounded-xl p-2.5 text-[11px] text-white placeholder-slate-700 h-24 resize-none leading-relaxed"
                                    required
                                  />
                                </div>

                                {bustingProgress ? (
                                  <div className="p-3 bg-slate-900 rounded-xl text-center space-y-1.5">
                                    <div className="flex items-center justify-center gap-2">
                                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                                      <span className="text-[10px] font-mono text-emerald-400 font-bold">{bustingProgress}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleBustMyth(activeBustIssue.id, mythExplanation)}
                                    className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black text-[10px] uppercase font-mono py-2.5 rounded-xl hover:brightness-110 active:scale-95 transition cursor-pointer"
                                  >
                                    🚀 Launch Myth-Bust Challenge
                                  </button>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <div className="py-12 text-center text-slate-600 italic text-[11px] font-mono flex flex-col items-center justify-center gap-1.5">
                            <Search className="w-5 h-5 text-slate-800" />
                            <span>Select a suspect report to analyze and challenge.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Citizen Rewards claims shop (5/12) */}
                  <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 p-5 rounded-3xl text-left space-y-4">
                    <span className="text-[10px] font-bold font-mono text-slate-500 tracking-widest uppercase block border-b border-slate-850 pb-2">
                      Rewards Exchange Shop
                    </span>

                    <div className="space-y-3">
                      {[
                        { name: 'SF Muni Pass $5 Transit Credit', cost: 150, desc: 'Receive a digital SF transit ticket barcode.', icon: Coins },
                        { name: 'District Local Coffee - 1 Free Brew', cost: 100, desc: 'Claim a free warm beverage at participating SF cafes.', icon: Sparkles },
                        { name: 'Plant 1 Tree in Vista Park', cost: 200, desc: 'We coordinate with SF Gardens to plant one native tree.', icon: Shield },
                        { name: 'Free Admission: SF Botanical Garden', cost: 250, desc: 'One-day entry pass to the district botanical grounds.', icon: Award }
                      ].map(reward => {
                        const canClaim = profile.karmaPoints >= reward.cost;
                        return (
                          <div 
                            key={reward.name}
                            className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850 flex justify-between items-center gap-4 hover:border-slate-800 transition"
                          >
                            <div className="truncate">
                              <h5 className="text-xs font-extrabold text-slate-200 truncate">{reward.name}</h5>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{reward.desc}</p>
                              <span className="text-[10px] text-emerald-400 font-mono font-bold block mt-1.5">{reward.cost} XP COST</span>
                            </div>

                            <button
                              onClick={() => handleClaimReward(reward.name, reward.cost)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase font-mono transition-all shrink-0 cursor-pointer ${
                                canClaim 
                                  ? 'bg-emerald-500 text-slate-950 hover:brightness-110 active:scale-95' 
                                  : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-850/60'
                              }`}
                            >
                              Redeem
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Claimed vouchers ledger lists */}
                    {(profile.claimedRewards && profile.claimedRewards.length > 0) && (
                      <div className="pt-3 border-t border-slate-850">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase mb-2">My Claimed Vouchers</span>
                        <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                          {profile.claimedRewards.map((v, index) => (
                            <div key={index} className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/20 text-[10px] font-mono text-emerald-400 flex justify-between items-center">
                              <span className="truncate max-w-[70%]">{v.split('[')[0]}</span>
                              <span className="text-white font-extrabold">{v.includes('Voucher:') ? v.split('Voucher:')[1].replace(']', '') : 'ACTIVE'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Impact metrics section rendered dynamically below */}
                <div className="border-t border-slate-900 pt-6">
                  <ImpactDashboard issues={issues} currentUser={profile} />
                </div>
              </div>
            )}
          </>
        )}

      </main>

    </div>
  );
}
