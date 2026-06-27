import React, { useState, useEffect } from 'react';
import { CommunityIssue, UserProfile } from '../types';
import { 
  Zap, 
  Radio, 
  Volume2, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Fingerprint, 
  UserX,
  FileSpreadsheet,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SensorTerminalProps {
  currentUser: UserProfile;
  issues: CommunityIssue[];
  onTriggerIssue: (issue: CommunityIssue) => void;
  onAwardKarma: (points: number, reason: string) => void;
  onDockKarma: (points: number, reason: string) => void;
}

export default function SensorTerminal({ 
  currentUser, 
  issues, 
  onTriggerIssue, 
  onAwardKarma,
  onDockKarma
}: SensorTerminalProps) {
  // Offline Mesh state
  const [isMeshActive, setIsMeshActive] = useState<boolean>(true);
  const [offlineQueue, setOfflineQueue] = useState<number>(0);
  
  // Sensor simulation states
  const [acousticDb, setAcousticDb] = useState<number>(34);
  const [thermalTemp, setThermalTemp] = useState<number>(18);
  const [sensorStatus, setSensorStatus] = useState<'nominal' | 'alert_pending' | 'triggering'>('nominal');
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  // Verification dialog for simulated events
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    id: string;
    title: string;
    category: string;
    source: 'acoustic' | 'thermal' | 'manual_pulse';
    lat: number;
    lng: number;
    verificationType: 'pending' | 'confirmed' | 'tampered';
  } | null>(null);

  // Real-time sound level fluctuate simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (sensorStatus === 'nominal') {
        setAcousticDb(Math.floor(30 + Math.random() * 10));
        setThermalTemp(Math.floor(17 + Math.random() * 3));
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [sensorStatus]);

  // Legal deterrence false alarm penalty execution
  const handleFlagFake = () => {
    if (!pendingConfirmation) return;
    
    setPendingConfirmation(prev => prev ? { ...prev, verificationType: 'tampered' } : null);
    onDockKarma(50, 'Malicious tampering / false reporting penalty triggered');
    
    setTimeout(() => {
      setPendingConfirmation(null);
      setSensorStatus('nominal');
      setActiveSimulation(null);
    }, 4000);
  };

  const handleConfirmSensorEvent = () => {
    if (!pendingConfirmation) return;

    const signature = 'SIG_' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_SHA256';

    const newIssue: CommunityIssue = {
      id: pendingConfirmation.id,
      reporterId: 'autonomous_node_7',
      reporterName: 'AI Sensor Node D7-Beta',
      title: pendingConfirmation.title,
      description: `AUTOMATED SYSTEM TELEMETRY ALERT: Node sensor detected anomalous spikes matching ${pendingConfirmation.source} failure profiles. Neighborhood verification consensus established.`,
      category: pendingConfirmation.category as any,
      locationName: `Grid Zone [${pendingConfirmation.lat.toFixed(3)}°N, ${pendingConfirmation.lng.toFixed(3)}°W]`,
      latitude: pendingConfirmation.lat,
      longitude: pendingConfirmation.lng,
      status: 'verified', // Directly promoted to verified because neighbors confirmed it!
      upvotesCount: 5,
      upvotedBy: ['autonomous_node_7'],
      validatedCount: 1,
      validatedBy: [currentUser.id],
      aiRiskScore: pendingConfirmation.source === 'acoustic' ? 8 : pendingConfirmation.source === 'thermal' ? 9 : 7,
      aiTags: ['sensor-triggered', 'acoustic-telemetry', 'double-confirmed'],
      aiResolutionPlan: pendingConfirmation.source === 'acoustic' 
        ? '### Phase 1: Mainline Shutoff\n- Automated solenoid valve shutoff signal broadcast to pump room.\n\n### Phase 2: Structural Grouting\n- Dispatch urgent repair team to replace cracked steel join.'
        : '### Phase 1: High-Temp Isolation\n- Disconnect power relays feeding affected transformer block.\n\n### Phase 2: Active Cooling & Replace\n- Dispatch high-voltage electric unit with nitrogen cooling purge.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isTelemetryTriggered: true,
      sensorType: pendingConfirmation.source,
      cryptographicSignature: signature
    };

    setPendingConfirmation(prev => prev ? { ...prev, verificationType: 'confirmed' } : null);
    onTriggerIssue(newIssue);
    onAwardKarma(25, 'Confirmed automated sensor threat notification');

    setTimeout(() => {
      setPendingConfirmation(null);
      setSensorStatus('nominal');
      setActiveSimulation(null);
    }, 3000);
  };

  const simulateAcousticBurst = () => {
    if (sensorStatus !== 'nominal') return;
    setSensorStatus('alert_pending');
    setActiveSimulation('Acoustic Burst');
    setAcousticDb(112); // Definite rupture level threshold!

    setTimeout(() => {
      setPendingConfirmation({
        id: 'sens_' + Math.random().toString(36).substring(2, 9),
        title: 'Acoustic Shockwave: Pressurized Pipeline Rupture Detected',
        category: 'Water Leakage',
        source: 'acoustic',
        lat: 37.778,
        lng: -122.415,
        verificationType: 'pending'
      });
    }, 1500);
  };

  const simulateThermalFlare = () => {
    if (sensorStatus !== 'nominal') return;
    setSensorStatus('alert_pending');
    setActiveSimulation('Thermal Flare');
    setThermalTemp(148); // Extreme heat spike!

    setTimeout(() => {
      setPendingConfirmation({
        id: 'sens_' + Math.random().toString(36).substring(2, 9),
        title: 'Infrared Thermal Flash: High-Heat Grid Overload Arc',
        category: 'Damaged Streetlight',
        source: 'thermal',
        lat: 37.755,
        lng: -122.435,
        verificationType: 'pending'
      });
    }, 1500);
  };

  const simulateOfflineMeshPulse = () => {
    if (sensorStatus !== 'nominal') return;
    
    if (!isMeshActive) {
      setOfflineQueue(prev => prev + 1);
      return;
    }

    setSensorStatus('alert_pending');
    setActiveSimulation('Mesh Pulse');

    setTimeout(() => {
      setPendingConfirmation({
        id: 'sens_' + Math.random().toString(36).substring(2, 9),
        title: 'Offline Mesh Pulse: Citizen One-Tap Panic Beacon',
        category: 'Public Infrastructure',
        source: 'manual_pulse',
        lat: 37.768,
        lng: -122.422,
        verificationType: 'pending'
      });
    }, 1500);
  };

  return (
    <div className="bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col h-full">
      
      {/* Header banner */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] animate-pulse">
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <span className="font-extrabold text-xs text-white block font-display">Autonomous Telemetry Grid</span>
            <span className="text-[9px] text-cyan-400 font-mono block tracking-wider font-bold">AUTONOMOUS DISPATCH ENGINE • LIVE</span>
          </div>
        </div>

        {/* Offline Mesh mode switch */}
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">MESH NETWORK</span>
          <button 
            onClick={() => {
              setIsMeshActive(!isMeshActive);
              if (isMeshActive === false && offlineQueue > 0) {
                // Flush offline queue when reconnected!
                setOfflineQueue(0);
              }
            }}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
              isMeshActive ? 'bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-slate-800'
            }`}
          >
            <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-all duration-300 ${
              isMeshActive ? 'left-5.5' : 'left-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Sensor telemetry dials view */}
      <div className="p-5 grid grid-cols-3 gap-4 border-b border-slate-850 bg-slate-950/40">
        
        {/* Acoustic sensor level dial */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center ${
          acousticDb > 90 
            ? 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
            : 'bg-amber-500/5 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.05)]'
        }`}>
          <Volume2 className={`w-5 h-5 mb-1.5 ${acousticDb > 90 ? 'text-rose-400 animate-bounce' : 'text-amber-400'}`} />
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Acoustic Audio</span>
          <div className="text-base font-black font-mono text-slate-100 mt-1">{acousticDb} dB</div>
          <span className="text-[8px] text-slate-600 font-mono mt-0.5">Threshold: 95dB</span>
        </div>

        {/* Thermal sensor level dial */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center ${
          thermalTemp > 100 
            ? 'bg-rose-500/10 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]' 
            : 'bg-rose-500/5 border-rose-500/20 shadow-[0_0_12px_rgba(239,68,68,0.05)]'
        }`}>
          <Thermometer className={`w-5 h-5 mb-1.5 ${thermalTemp > 100 ? 'text-rose-400 animate-bounce' : 'text-rose-400'}`} />
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Infrared Heat</span>
          <div className="text-base font-black font-mono text-slate-100 mt-1">{thermalTemp}°C</div>
          <span className="text-[8px] text-slate-600 font-mono mt-0.5">Threshold: 110°C</span>
        </div>

        {/* Mesh router state indicator */}
        <div className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center ${
          isMeshActive 
            ? 'bg-cyan-500/5 border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.05)]' 
            : 'bg-slate-900 border-slate-800'
        }`}>
          <Radio className={`w-5 h-5 mb-1.5 ${isMeshActive ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider font-bold">Mesh Node</span>
          <div className="text-base font-black font-mono text-slate-100 mt-1">{isMeshActive ? 'ONLINE' : 'OFFLINE'}</div>
          <span className="text-[8px] text-slate-600 font-mono mt-0.5">
            {isMeshActive ? 'LoRa Mesh Active' : `${offlineQueue} Piled in Queue`}
          </span>
        </div>

      </div>

      {/* Main Interactive simulation actions */}
      <div className="p-5 flex-1 space-y-4">
        
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider">Demonstrate Telemetry Triggers</h4>
          <p className="text-[11px] text-slate-400 leading-normal">
            To address friction and connectivity challenges, our model supports passive acoustic signature triggers, infrared anomaly sweeps, and low-bandwidth one-press radio pulses. Test how consensus confirmations handle false reports legally.
          </p>
        </div>

        {/* Control grid buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={simulateAcousticBurst}
            disabled={sensorStatus !== 'nominal'}
            className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 disabled:opacity-40 rounded-xl p-3 text-left transition cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Volume2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-[10px] font-bold text-slate-200 font-mono">1. Acoustic Burst</span>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">Simulates high-pitch metal pipe burst frequency.</p>
          </button>

          <button
            onClick={simulateThermalFlare}
            disabled={sensorStatus !== 'nominal'}
            className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 disabled:opacity-40 rounded-xl p-3 text-left transition cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Thermometer className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="text-[10px] font-bold text-slate-200 font-mono">2. Thermal Overload</span>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">Simulates electric grid transformer flame/flare spike.</p>
          </button>

          <button
            onClick={simulateOfflineMeshPulse}
            disabled={sensorStatus !== 'nominal'}
            className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 disabled:opacity-40 rounded-xl p-3 text-left transition cursor-pointer"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-[10px] font-bold text-slate-200 font-mono">3. One-Tap Panic</span>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed">Instantly broadcasts GPS beacon without cell internet.</p>
          </button>
        </div>

        {/* Live confirmation popups */}
        <AnimatePresence>
          {sensorStatus !== 'nominal' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-950 border border-slate-800/80 rounded-xl p-4.5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  SENSOR GRID THREAT ISOLATION ALERT: {activeSimulation}
                </span>
                <span className="text-[9px] font-mono text-slate-600">STATE: {pendingConfirmation ? 'PENDING_CONSENSUS' : 'ANALYZING'}</span>
              </div>

              {pendingConfirmation ? (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-xs font-bold text-white mb-1.5 flex items-center gap-1">
                      <Fingerprint className="w-4 h-4 text-cyan-400 shrink-0" />
                      {pendingConfirmation.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      This alert has been automatically flagged by District 7 AI. To dispatch physical municipal contractors and bypass form details, at least one nearby citizen must confirm or flag malicious tampering.
                    </p>
                  </div>

                  {pendingConfirmation.verificationType === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleFlagFake}
                        className="flex-1 bg-rose-950/20 hover:bg-rose-950/30 border border-rose-900/30 text-rose-400 text-xs font-mono font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <UserX className="w-3.5 h-3.5 text-rose-400" />
                        <span>Flag Fake (-50 XP Legal Penalty)</span>
                      </button>
                      <button
                        onClick={handleConfirmSensorEvent}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-slate-950 text-xs font-mono font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-slate-950" />
                        <span>Confirm Threat (+25 XP)</span>
                      </button>
                    </div>
                  )}

                  {pendingConfirmation.verificationType === 'confirmed' && (
                    <div className="bg-cyan-500/10 border border-cyan-500/20 p-3 rounded-xl flex items-center gap-2 text-cyan-400 font-mono text-[10px]">
                      <Fingerprint className="w-4.5 h-4.5 text-cyan-400 animate-pulse shrink-0" />
                      <div>
                        <span className="block font-bold">CRYPTOGRAPHIC CONSENSUS SECURED</span>
                        <span className="text-slate-400 block text-[9px] mt-0.5">Contractors dispatched with physical digital ledger signature block.</span>
                      </div>
                    </div>
                  )}

                  {pendingConfirmation.verificationType === 'tampered' && (
                    <div className="bg-rose-500/15 border border-rose-500/30 p-3 rounded-xl flex items-center gap-2 text-rose-400 font-mono text-[10px]">
                      <ShieldAlert className="w-4.5 h-4.5 text-rose-500 animate-bounce shrink-0" />
                      <div>
                        <span className="block font-bold">TAMPER ALERT SENT TO AUTHORITIES</span>
                        <span className="text-slate-400 block text-[9px] mt-0.5">Municipal Code § 148.5 penalty applied to account. Deducted 50 Karma points.</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2.5 py-4 text-xs text-slate-500 font-mono">
                  <div className="w-4 h-4 border-2 border-slate-600 border-t-rose-500 rounded-full animate-spin" />
                  <span>Analyzing wave amplitudes and heat signatures...</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Legal Disclaimer block */}
      <div className="p-4 bg-slate-950 border-t border-slate-850 rounded-b-2xl flex gap-3 items-start">
        <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
        <div>
          <span className="text-[9px] font-mono font-bold text-rose-400 block uppercase">MUNICIPAL LEGAL DISCLOSURE (DISTRICT 7)</span>
          <p className="text-[10px] text-slate-500 leading-normal font-sans mt-0.5">
            To prevent deceptive actions and grid sabotage, citizens submitting or verifying reports are legally bound under **Municipal Code § 148.5**. False alarms or misleading validations trigger cryptographic tracking, citizen rating suspension, and referral to District Law Enforcement.
          </p>
        </div>
      </div>

    </div>
  );
}
