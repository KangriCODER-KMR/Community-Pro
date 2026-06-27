import React, { useState, useRef } from 'react';
import { CommunityIssue, UserProfile } from '../types';
import { dbService } from '../lib/db';
import { 
  MapPin, 
  Info, 
  Layers, 
  RefreshCw, 
  Compass, 
  ShieldAlert, 
  Map as MapIcon, 
  Check, 
  Activity, 
  Camera,
  Sparkles,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

interface MapDashboardProps {
  issues: CommunityIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string) => void;
  onMapClickReport: (lat: number, lng: number) => void;
  userLat: number;
  userLng: number;
  onLocateUser: () => void;
  isLocating: boolean;
  profile: UserProfile;
  onIssuesUpdated: (newIssues: CommunityIssue[]) => void;
}

type MapLayerType = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim() !== '';

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

export default function MapDashboard({
  issues,
  selectedIssueId,
  onSelectIssue,
  onMapClickReport,
  userLat,
  userLng,
  onLocateUser,
  isLocating,
  profile,
  onIssuesUpdated
}: MapDashboardProps) {
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('roadmap');
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);
  const [hoveredIssue, setHoveredIssue] = useState<CommunityIssue | null>(null);

  // AI Instant Video/Photo Scanner states
  const [submittingScan, setSubmittingScan] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<string>('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [scanFileBase64, setScanFileBase64] = useState<string>('');
  const [showScanModal, setShowScanModal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define Category colors matching the system telemetry standard
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Pothole': return '#f59e0b'; // Amber
      case 'Water Leakage': return '#3b82f6'; // Blue
      case 'Damaged Streetlight': return '#eab308'; // Yellow
      case 'Waste Management': return '#ec4899'; // Pink
      case 'Public Infrastructure': return '#ef4444'; // Red
      default: return '#10b981'; // Emerald
    }
  };

  // Trigger file upload for instant camera/video scanning
  const handleInstantScanClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubmittingScan(true);
    setScanProgress('Acquiring precision GPS telemetry...');
    setShowScanModal(true);

    let currentLat = userLat || 37.7749;
    let currentLng = userLng || -122.4194;

    // Try to get high-accuracy coordinates on upload
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 });
        });
        currentLat = position.coords.latitude;
        currentLng = position.coords.longitude;
      } catch (err) {
        console.warn('[GPS SCANNER] Geolocation timeout or denied. Utilizing system baseline coordinates.', err);
      }
    }

    setScanProgress('AI ingest: checking & compressing upload under 200KB limit...');

    const reader = new FileReader();
    reader.onloadend = async () => {
      let base64Data = reader.result as string;

      if (file.type.startsWith('image/')) {
        try {
          base64Data = await compressImage(base64Data, 600, 450, 0.6);
          console.log('[COMPRESSOR] Image compressed. Base64 characters:', base64Data.length);
        } catch (err) {
          console.warn('[COMPRESSOR] Compression failed, continuing with original:', err);
        }
      } else if (file.type.startsWith('video/')) {
        if (file.size > 200 * 1024) {
          setScanProgress('⚠️ Video is over 200KB. Proceeding, but we recommend short clips to avoid server timeouts.');
        }
      }

      setScanFileBase64(base64Data);

      try {
        setScanProgress('CivicAI Vision: scanning frames, detecting hazards & evaluating risk severity...');
        
        const response = await fetch('/api/gemini/analyze-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: base64Data,
            userLat: currentLat,
            userLng: currentLng
          })
        });

        if (!response.ok) {
          throw new Error('AI analysis transaction failed.');
        }

        const aiData = await response.json();
        setAiAnalysisResult(aiData);
        setScanProgress('Scan complete! Verification ready.');
      } catch (err: any) {
        console.error(err);
        setScanProgress('❌ AI Analysis transaction aborted. Image format unreadable or server busy.');
      } finally {
        setSubmittingScan(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // Commit the AI-scanned report directly as a live community issue
  const handleConfirmAiReport = async () => {
    if (!aiAnalysisResult) return;

    try {
      const newIssue: CommunityIssue = {
        id: 'issue_' + Math.random().toString(36).substring(2, 11),
        reporterId: profile.id,
        reporterName: profile.name,
        reporterPhone: profile.phone,
        reporterPhoneVerified: profile.isPhoneVerified,
        title: aiAnalysisResult.title || 'Mobile Scan Event',
        description: aiAnalysisResult.description || 'Instant photo/video scanning telemetry.',
        category: aiAnalysisResult.category || 'Other',
        locationName: aiAnalysisResult.locationName || 'Scanned Location Grid',
        latitude: aiAnalysisResult.latitude || (userLat || 37.7749),
        longitude: aiAnalysisResult.longitude || (userLng || -122.4194),
        imageUrl: scanFileBase64,
        status: 'reported',
        upvotesCount: 1,
        upvotedBy: [profile.id],
        validatedCount: 0,
        validatedBy: [],
        aiRiskScore: aiAnalysisResult.aiRiskScore || 5,
        aiTags: aiAnalysisResult.aiTags || ['multimodal-scan', 'instant-report'],
        aiResolutionPlan: aiAnalysisResult.aiResolutionPlan || '### Phase 1: Site Inspection\nVerify issue location with on-duty inspectors.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await dbService.saveIssue(newIssue);
      
      const refreshedIssues = await dbService.getIssues();
      onIssuesUpdated(refreshedIssues);
      onSelectIssue(newIssue.id);

      // Reset modal state
      setShowScanModal(false);
      setAiAnalysisResult(null);
      setScanFileBase64('');

      // Play sound or alert
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch (err) {
      console.error('Failed to commit scanned issue', err);
    }
  };

  // Render Google Maps API Key Splash Screen if hasValidKey is false
  if (!hasValidKey) {
    return (
      <div className="w-full aspect-video md:aspect-[16/10] bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-2 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-extrabold text-slate-100 tracking-wider font-mono uppercase">
            Google Maps API Key Required
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            The platform is configured for actual Google Maps satellite, hybrid, and roadmap grids. Please supply your API key to activate full satellite spatial telemetry.
          </p>
          
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 text-left text-[11px] font-mono space-y-2 text-slate-300">
            <p className="font-bold text-amber-400 uppercase tracking-wide border-b border-slate-800 pb-1.5 mb-1.5">
              Follow these simple steps:
            </p>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold">1.</span>
              <span>
                Obtain a Google Maps API Key from the{' '}
                <a 
                  href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                >
                  Cloud Console
                </a>.
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold">2.</span>
              <span>
                Click the <strong className="text-slate-100">Settings</strong> (⚙️ gear icon) in the top-right corner of the browser.
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold">3.</span>
              <span>
                Go to <strong className="text-slate-100">Secrets</strong>, type <code className="bg-slate-950 px-1 py-0.5 rounded text-emerald-400 border border-slate-800">GOOGLE_MAPS_PLATFORM_KEY</code>, paste your key, and press <strong className="text-slate-100">Enter</strong>.
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            The applet compiles & rebuilds automatically in the background as soon as you save the secret.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video md:aspect-[16/10] bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      
      {/* HUD Top Bar */}
      <div className="absolute top-0 inset-x-0 h-12 bg-slate-900/95 backdrop-blur-md border-b border-slate-900 z-10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-[11px] md:text-xs font-bold text-slate-100 tracking-wider font-mono uppercase">
            Live Google Maps Grid — {activeLayer.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Instant Photo/Video Scanner Action Trigger */}
          <button
            onClick={handleInstantScanClick}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-mono font-extrabold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-slate-950" />
            <span>AI Instant Scan</span>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Layers Button Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowLayersMenu(!showLayersMenu)}
              className="bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-emerald-400 border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono flex items-center gap-1.5 transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Styles</span>
            </button>

            <AnimatePresence>
              {showLayersMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-1.5 w-44 bg-slate-950/95 border border-slate-800 rounded-xl p-1.5 shadow-2xl z-20"
                >
                  <p className="text-[9px] font-bold font-mono text-slate-500 px-2 py-1 uppercase tracking-wider border-b border-slate-900 mb-1">
                    Select Map style
                  </p>
                  
                  {(['roadmap', 'satellite', 'hybrid', 'terrain'] as MapLayerType[]).map((layer) => (
                    <button
                      key={layer}
                      onClick={() => { setActiveLayer(layer); setShowLayersMenu(false); }}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition cursor-pointer ${activeLayer === layer ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-slate-900'}`}
                    >
                      <span className="capitalize">{layer}</span>
                      {activeLayer === layer && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Map Content Holder */}
      <div className="flex-grow relative bg-slate-950/40 min-h-[350px] md:min-h-[420px] z-0">
        
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            center={{ lat: userLat || 37.7749, lng: userLng || -122.4194 }}
            zoom={14}
            mapTypeId={activeLayer}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
            onClick={(e) => {
              if (e.detail.latLng) {
                onMapClickReport(e.detail.latLng.lat, e.detail.latLng.lng);
              }
            }}
          >
            {/* Live User GPS Location Marker */}
            {userLat && userLng && (
              <AdvancedMarker position={{ lat: userLat, lng: userLng }}>
                <div style={{ width: '32px', height: '32px' }} className="relative flex items-center justify-center">
                  <div className="absolute w-6 h-6 rounded-full bg-blue-500 opacity-40 animate-ping" />
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
                </div>
              </AdvancedMarker>
            )}

            {/* Live Incidents/Issues reported */}
            {issues.map((issue) => {
              const color = getCategoryColor(issue.category);
              const isSelected = selectedIssueId === issue.id;

              return (
                <AdvancedMarker
                  key={issue.id}
                  position={{ lat: issue.latitude, lng: issue.longitude }}
                  onClick={() => onSelectIssue(issue.id)}
                  onMouseEnter={() => setHoveredIssue(issue)}
                  onMouseLeave={() => setHoveredIssue(null)}
                >
                  <div 
                    style={{ width: '32px', height: '32px' }} 
                    className="cursor-pointer group flex items-center justify-center relative"
                  >
                    <div 
                      style={{ background: color }} 
                      className={`absolute w-7 h-7 rounded-full opacity-25 transition-transform duration-300 ${isSelected ? 'scale-150 animate-ping' : 'scale-100'}`} 
                    />
                    <div 
                      style={{ 
                        backgroundColor: color, 
                        borderColor: isSelected ? '#ffffff' : '#020617' 
                      }} 
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-115"
                    >
                      <span className="text-[10px] text-white font-black font-mono">
                        {issue.status === 'resolved' ? '✓' : issue.aiRiskScore >= 8 ? '⚠' : '⚡'}
                      </span>
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}
          </Map>
        </APIProvider>

        {/* Floating Hover Issue Tooltip */}
        <AnimatePresence>
          {hoveredIssue && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-14 left-4 z-10 bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl pointer-events-none max-w-xs font-mono text-xs text-slate-200 space-y-1.5"
            >
              <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1.5 mb-1.5">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: getCategoryColor(hoveredIssue.category) }} 
                />
                <span className="font-bold tracking-wider uppercase text-[10px] text-slate-400">
                  {hoveredIssue.category}
                </span>
              </div>
              <h4 className="font-semibold text-slate-100 truncate">{hoveredIssue.title}</h4>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                {hoveredIssue.description}
              </p>
              <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1 border-t border-slate-900">
                <span>Severity Index: {hoveredIssue.aiRiskScore}/10</span>
                <span>Status: <span className={hoveredIssue.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'}>{hoveredIssue.status}</span></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Locate Me Floating Button */}
        <button
          onClick={onLocateUser}
          className="absolute bottom-16 left-3 z-10 bg-slate-900/95 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/30 text-emerald-400 p-2.5 rounded-xl shadow-2xl transition duration-200 flex items-center gap-2 group cursor-pointer"
          title="Locate my position on map"
        >
          {isLocating ? (
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
          ) : (
            <Compass className="w-4 h-4 text-emerald-400 group-hover:rotate-45 transition-transform duration-300" />
          )}
          <span className="text-[10px] font-bold font-mono uppercase tracking-wider">Locate Me</span>
        </button>

        {/* Live Grid coordinates HUD Overlay */}
        <div className="absolute top-14 right-4 z-10 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-lg px-2.5 py-1.5 text-[9px] font-mono text-slate-400 flex flex-col gap-0.5 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-emerald-500" />
            <span className="font-bold text-slate-300">GPS COORDINATES</span>
          </div>
          <span>LAT: {userLat.toFixed(5)}°N</span>
          <span>LNG: {Math.abs(userLng).toFixed(5)}°W</span>
        </div>

        {/* Instruction overlay badge */}
        <div className="absolute bottom-16 right-3 bg-slate-950/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 flex items-center gap-2 pointer-events-none text-[10px] font-mono text-slate-400 max-w-sm z-10">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Click anywhere on Google Map to pin real coordinates & report hazards instantly.</span>
        </div>
      </div>

      {/* Map Footer Legends */}
      <div className="bg-slate-900/40 px-4 py-2 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono text-slate-400 z-10">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-amber-500" /><span>Potholes</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-500" /><span>Water Leaks</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-yellow-500" /><span>Streetlights</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-pink-500" /><span>Waste Disposal</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-red-500" /><span>Infrastructure</span></div>
      </div>

      {/* AI Scanner HUD Modal */}
      <AnimatePresence>
        {showScanModal && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-[2000]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90%]"
            >
              {/* Modal Header */}
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-bold font-mono tracking-widest uppercase">CivicAI Multi-modal Scanner</span>
                </div>
                <button 
                  onClick={() => { setShowScanModal(false); setAiAnalysisResult(null); }}
                  className="text-slate-400 hover:text-slate-100 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4 flex-grow">
                {/* Loader / Scan Progress state */}
                {submittingScan ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="w-16 h-16 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                      <Camera className="w-6 h-6 text-emerald-400 absolute animate-pulse" />
                    </div>
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-bold font-mono text-emerald-400 tracking-wider animate-pulse">SCANNING HAZARD MEDIA...</p>
                      <p className="text-xs font-mono text-slate-400">{scanProgress}</p>
                    </div>

                    {/* Decorative Scan Line Animation */}
                    <div className="w-full h-1 relative overflow-hidden bg-slate-950 rounded-full">
                      <div className="absolute top-0 bottom-0 left-0 bg-emerald-500 w-1/3 animate-infinite-scroll" style={{ animation: 'infinite-scroll 2s linear infinite' }} />
                    </div>
                  </div>
                ) : aiAnalysisResult ? (
                  <div className="space-y-4">
                    
                    {/* Media preview */}
                    {scanFileBase64 && (
                      <div className="relative w-full h-40 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                        {scanFileBase64.startsWith('data:video/') ? (
                          <video 
                            src={scanFileBase64} 
                            controls 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img 
                            src={scanFileBase64} 
                            alt="AI Scanned Media" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-mono text-[9px] font-extrabold px-2 py-0.5 rounded shadow">
                          VISION EXTRACTED
                        </div>
                      </div>
                    )}

                    {/* Analysis Results Display */}
                    <div className="space-y-3 font-mono">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">IDENTIFIED HAZARD</span>
                          <h4 className="text-sm font-bold text-slate-100">{aiAnalysisResult.title}</h4>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">SEVERITY INDEX</span>
                          <span className={`text-sm font-extrabold px-2 py-0.5 rounded ${aiAnalysisResult.aiRiskScore >= 8 ? 'bg-red-500/15 text-red-400 border border-red-500/30' : aiAnalysisResult.aiRiskScore >= 5 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'}`}>
                            {aiAnalysisResult.aiRiskScore}/10 — {aiAnalysisResult.aiRiskScore >= 8 ? 'CRITICAL' : aiAnalysisResult.aiRiskScore >= 5 ? 'MODERATE' : 'LOW'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px] bg-slate-950/60 p-3 rounded-xl border border-slate-850">
                        <div>
                          <span className="text-[9px] text-slate-500 block">CATEGORY</span>
                          <span className="font-bold text-slate-300">{aiAnalysisResult.category}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 block">TRIANGULATED ADDRESS</span>
                          <span className="font-bold text-slate-300 truncate block">{aiAnalysisResult.locationName}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">AI HAZARD SUMMARY</span>
                        <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-850">
                          {aiAnalysisResult.description}
                        </p>
                      </div>

                      {/* Contractor plan */}
                      {aiAnalysisResult.aiResolutionPlan && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">AI CONTRACTOR RESOLUTION TIMELINE</span>
                          <div className="text-xs text-slate-400 leading-normal max-h-32 overflow-y-auto bg-slate-950/30 p-3 rounded-xl border border-slate-850 text-left space-y-2">
                            {aiAnalysisResult.aiResolutionPlan.split('\n').map((line: string, i: number) => {
                              if (line.startsWith('###')) {
                                return <h5 key={i} className="font-bold text-slate-200 mt-2 mb-1 text-[11px] uppercase tracking-wide border-b border-slate-800/60 pb-1">{line.replace('###', '').trim()}</h5>;
                              }
                              if (line.startsWith('-')) {
                                return <li key={i} className="list-disc list-inside text-slate-400 pl-1">{line.replace('-', '').trim()}</li>;
                              }
                              return <p key={i}>{line}</p>;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 font-mono text-xs">
                    Please upload an image or video to begin instant scanning.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {!submittingScan && aiAnalysisResult && (
                <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3 font-mono">
                  <button
                    onClick={() => { setShowScanModal(false); setAiAnalysisResult(null); }}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 rounded-xl text-xs text-slate-300 font-bold transition cursor-pointer"
                  >
                    Abort Dispatch
                  </button>
                  <button
                    onClick={handleConfirmAiReport}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4 text-slate-950" />
                    <span>Dispatch & Pin Live Grid</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
