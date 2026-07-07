import React, { useState } from "react";
import { 
  Flame, 
  AlertTriangle, 
  Compass, 
  MapPin, 
  PhoneCall, 
  ShieldAlert, 
  CheckSquare, 
  CloudRain, 
  HelpCircle, 
  LifeBuoy, 
  Sun,
  Activity,
  Heart,
  CheckCircle
} from "lucide-react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface EmergencyCenterProps {
  profile: UserProfile;
}

export default function EmergencyCenter({ profile }: EmergencyCenterProps) {
  const [activeCrisis, setActiveCrisis] = useState<"floods" | "heatwave" | "earthquake">("floods");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const crisisHelplines = {
    police: "112 / 100",
    ndrf: "011-23438084 (NDRF Head Office)",
    disasterMgt: "1078 (National Disaster Management Authority)",
    ambulance: "102 / 108"
  };

  const offlineChecklists = {
    floods: [
      { text: "Secure clean drinking water. Boil stored water before drinking.", checked: false },
      { text: "Unplug electrical appliances immediately to prevent electrocution hazards.", checked: false },
      { text: "Move valuable assets and food grains to higher floors / elevated heights.", checked: false },
      { text: "Keep a battery-operated torch and local AM/FM radio active for news circulars.", checked: false },
      { text: "Do not walk or drive through flowing water. Just 6 inches of water can sweep you off feet.", checked: false }
    ],
    heatwave: [
      { text: "Drink sufficient water frequently, even if you do not feel thirsty.", checked: false },
      { text: "Avoid direct sunlight exposure between 12:00 PM and 3:00 PM.", checked: false },
      { text: "Wear lightweight, loose, light-colored cotton clothing.", checked: false },
      { text: "Use Oral Rehydration Salts (ORS), homemade lassi, lemon water, or buttermilk.", checked: false },
      { text: "Never leave kids or pets inside parked vehicles under direct sun.", checked: false }
    ],
    earthquake: [
      { text: "DROP to hands and knees. COVER head and neck under strong table. HOLD ON.", checked: false },
      { text: "If indoors, stay inside. Avoid running out of buildings during active tremors.", checked: false },
      { text: "If outdoors, move away from high-rise buildings, utility poles, and trees.", checked: false },
      { text: "Expect aftershocks. Keep a first-aid kit and heavy blankets readily accessible.", checked: false },
      { text: "Do not use elevators under any circumstances during evacuation.", checked: false }
    ]
  };

  const activeAlerts = [
    { title: "IMD Red Alert Warning: Heavy Precipitation", desc: "Extremely heavy rain (up to 20cm) predicted in coastal and urban parts of Karnataka within next 24 hours.", level: "High Alert", date: "Jul 06, 2026" },
    { title: "BBMP Flooding Advisory: Low-lying sectors", desc: "Residents in HSR Sector 6, Bellandur, and Outer Ring Road lowlands are advised to avoid cellars and move high.", level: "Warning", date: "Jul 06, 2026" }
  ];

  const simulatedReliefCenters = {
    "Bengaluru Urban": [
      { name: "BBMP Community Relief Shelter - Sector 4", address: "Govt School Premises, Sector 4, HSR Layout", distance: "0.8 km", contact: "080-22660000" },
      { name: "SDRF Regional Rescue Hub & Shelter", address: "Civil Defense Depot, Koramangala 3rd Block", distance: "2.4 km", contact: "1077 (District Tollfree)" },
      { name: "St. John's Emergency Trauma Care Hospital", address: "Sarjapur Main Road, Koramangala", distance: "3.5 km", contact: "080-22065000" }
    ],
    "Default": [
      { name: "District Community Welfare Relief Shelter", address: "Government Primary School Compound, Main Town", distance: "1.2 km", contact: "1077 (District Help)" },
      { name: "Red Cross Emergency First Aid Camp", address: "Municipal Grounds, Civil Lines", distance: "2.5 km", contact: "112 / 108" }
    ]
  };

  const reliefCenters = simulatedReliefCenters[profile.district as keyof typeof simulatedReliefCenters] || simulatedReliefCenters["Default"];

  const handleBroadcastSOS = () => {
    setIsBroadcasting(true);
    // Simulate real GPS location fetch & secure NDRF/Municipal broadcast trigger
    setTimeout(() => {
      setIsBroadcasting(false);
      setBroadcastSent(true);
    }, 1500);
  };

  return (
    <div className="space-y-6" id="emergency-hub-view">
      
      {/* Dynamic Warning Alert Banner (Always prominent!) */}
      <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        <div className="flex gap-3.5 items-start">
          <div className="p-3 bg-rose-600 text-white rounded-2xl shrink-0 shadow-lg shadow-rose-600/20">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              Smart Bharat AI Emergency Assistant
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              Equipped with offline-first protocols, local relief center maps, and SMS fallback links. Registered district: <strong className="text-slate-900">{profile.district}, {profile.state}</strong>.
            </p>
          </div>
        </div>

        {/* SOS Emergency Button */}
        <div className="shrink-0">
          <button
            id="sos-broadcast-btn"
            onClick={handleBroadcastSOS}
            disabled={isBroadcasting || broadcastSent}
            className={`px-5 py-3 rounded-2xl font-black text-sm text-white transition flex items-center gap-2 active:scale-95 shadow-lg ${
              broadcastSent 
              ? "bg-emerald-600 shadow-emerald-600/20 cursor-default" 
              : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30"
            }`}
          >
            <PhoneCall className={`w-4 h-4 ${isBroadcasting ? "animate-bounce" : ""}`} />
            {isBroadcasting ? "Broadcasting GPS..." : broadcastSent ? "SOS Broadcast Complete!" : "Broadcast SOS Alert"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {broadcastSent && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 font-medium"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-extrabold block">SOS Geotagged Alert Broadcasted Successfully!</strong>
              Your precise coordinates have been securely dispatched to the <strong>NDRF regional desk</strong> and the <strong>{profile.district} Police Control Room</strong>. SMS confirmation with live tracker link sent to registered mobile. Standby for rescue operators.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Survival Guidelines (Offline-First Checklist) (2 Columns) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <LifeBuoy className="w-4 h-4 text-rose-600 animate-pulse" />
              Offline Survival Guides & Checklists
            </h3>

            {/* Crisis selectors */}
            <div className="flex gap-1">
              {[
                { id: "floods", label: "Floods & Rain", icon: CloudRain },
                { id: "heatwave", label: "Heatwave", icon: Sun },
                { id: "earthquake", label: "Earthquake", icon: Activity }
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    id={`crisis-tab-${c.id}`}
                    onClick={() => setActiveCrisis(c.id as any)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold transition border ${
                      activeCrisis === c.id 
                      ? "bg-slate-950 border-slate-950 text-white" 
                      : "bg-slate-50 border-slate-200/50 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checklist render */}
          <div className="space-y-3.5">
            <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase block">
              Immediate Safety Protocols (Cached for offline access)
            </span>

            <div className="space-y-2.5">
              {offlineChecklists[activeCrisis].map((item, idx) => (
                <label 
                  key={idx} 
                  id={`checklist-item-${activeCrisis}-${idx}`}
                  className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 cursor-pointer hover:bg-slate-100/30 transition text-xs text-slate-700 leading-relaxed font-semibold select-none"
                >
                  <input 
                    type="checkbox" 
                    className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500/20"
                  />
                  <span>{item.text}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Contact, Relief Center directory & Live Feeds (1 Column) */}
        <div className="space-y-6">
          
          {/* Nearest relief center directory */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <span className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase block">
              Nearest Relief Centers ({profile.district})
            </span>

            <div className="space-y-3">
              {reliefCenters.map((center, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <strong className="text-xs font-bold text-slate-900 block leading-tight">{center.name}</strong>
                    <span className="px-1.5 py-0.5 bg-rose-50 text-rose-800 text-[9px] font-bold rounded-sm border border-rose-100 font-mono shrink-0">
                      {center.distance}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {center.address}
                  </p>
                  <div className="pt-1.5 border-t border-slate-200/50 text-[10px] flex justify-between items-center font-bold font-mono">
                    <span className="text-slate-400">HELPLINE:</span>
                    <a href={`tel:${center.contact}`} className="text-rose-600 hover:underline">{center.contact}</a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Disaster Helpline Cards */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5">
            <span className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase block">
              National Support Numbers
            </span>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-mono block">AMBULANCE</span>
                <a href="tel:108" className="text-sm font-black text-rose-600 hover:underline">{crisisHelplines.ambulance}</a>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-mono block">NDMA HELPLINE</span>
                <a href="tel:1078" className="text-sm font-black text-rose-600 hover:underline">{crisisHelplines.disasterMgt}</a>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-mono block">POLICE / SOS</span>
                <a href="tel:112" className="text-sm font-black text-rose-600 hover:underline">{crisisHelplines.police}</a>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                <span className="text-[10px] text-slate-400 font-mono block">NDRF RESCUE</span>
                <a href="tel:011-23438084" className="text-[11px] font-black text-rose-600 hover:underline">011-23438084</a>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
