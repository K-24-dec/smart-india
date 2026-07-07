import React, { useState } from "react";
import { 
  ShieldAlert, 
  HeartHandshake, 
  TrendingUp, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  Clock, 
  HelpCircle, 
  Compass, 
  ChevronRight,
  Sparkles,
  Flame,
  Activity
} from "lucide-react";
import { UserProfile, DashboardStats, Complaint, GovernmentForm } from "../types";
import { motion } from "motion/react";

interface DashboardProps {
  profile: UserProfile;
  complaints: Complaint[];
  forms: GovernmentForm[];
  onNavigate: (tab: string) => void;
  onSetEmergency: () => void;
}

export default function Dashboard({ profile, complaints, forms, onNavigate, onSetEmergency }: DashboardProps) {
  // Compute Stats
  const activeComplaints = complaints.filter(c => c.status !== "Resolved").length;
  const pendingForms = forms.filter(f => f.status === "Draft").length;
  const submittedForms = forms.filter(f => f.status === "Submitted").length;
  
  // Calculate a Dynamic Civic Health Score
  // Max score: 100. Base score: 40. 
  // Add 15 points per registered/upvoted complaint, 15 points per completed application, 20 points for complete profile.
  const profileCompleteness = Object.values(profile).filter(v => v !== "" && v !== null && v !== undefined).length;
  const profileWeight = Math.min(20, Math.floor((profileCompleteness / 14) * 20));
  const activeParticipationWeight = Math.min(40, complaints.length * 15);
  const applicationWeight = Math.min(40, submittedForms * 20);
  const civicHealthScore = Math.min(100, 30 + profileWeight + activeParticipationWeight + applicationWeight);

  // Fraud alerts
  const fraudAlerts = [
    {
      id: "F-1",
      title: "WhatsApp 'Aadhaar Blocked' e-KYC Scam",
      severity: "high" as const,
      description: "Fraudsters are calling citizens pretending to be UIDAI officials, threatening to block Aadhaar unless an OTP is shared. Remember: UIDAI never asks for OTP over voice calls.",
      date: "Updated 4h ago"
    },
    {
      id: "F-2",
      title: "Fake Electricity Bill Pending SMS",
      severity: "high" as const,
      description: "SMS warnings claiming 'Your power connection will be disconnected by 9:30 PM due to unpaid bills. Call executive at 98xx...' represent phishing. Only pay via official BESCOM/state utility portals.",
      date: "Updated 1d ago"
    },
    {
      id: "F-3",
      title: "PM-Kisan Yojana Subsidy Registration Fraud",
      severity: "medium" as const,
      description: "Non-official websites (e.g., .org/subsidy-pm) are stealing banking login credentials under the guise of direct subsidy registration. Only use the official pmkisan.gov.in portal.",
      date: "Updated 3d ago"
    }
  ];

  // AI Deadline warnings
  const deadlineWarnings = [
    { title: "EWS Certificate Fresh Renewal", date: "Jul 31, 2026", status: "Critical", daysLeft: 25 },
    { title: "Pradhan Mantri Scholarship Application", date: "Aug 15, 2026", status: "Upcoming", daysLeft: 40 },
    { title: "National Pension Scheme Half-Yearly declaration", date: "Sep 30, 2026", status: "Future", daysLeft: 85 }
  ];

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* 1. Futuristic Hero Welcomer */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 p-6 text-white shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Smart Bharat Citizen OS v1.4
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Namaste, <span className="text-emerald-400 font-sans">{profile.name}</span>
            </h1>
            <p className="text-emerald-200 text-sm md:text-base max-w-xl">
              Welcome to your personal AI-powered civic operations center. You reside in <span className="font-semibold text-white">{profile.district}, {profile.state}</span>.
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              id="emergency-btn-dash"
              onClick={onSetEmergency}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-semibold text-sm transition shadow-lg shadow-rose-900/30 border border-rose-500/40"
            >
              <Flame className="w-4 h-4" />
              Emergency Hub
            </button>
            <button 
              id="chat-btn-dash"
              onClick={() => onNavigate("companion")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm transition shadow-lg active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              Talk to AI
            </button>
          </div>
        </div>

        {/* Dynamic Micro AI Suggestion Banner inside Hero */}
        <div className="mt-6 pt-4 border-t border-emerald-800/60 flex items-start gap-3">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs md:text-sm text-emerald-100 leading-relaxed">
            <strong className="text-white">AI Suggestion:</strong> Since your annual income is ₹{profile.income.toLocaleString("en-IN")}, you are highly eligible for <span className="underline decoration-emerald-400 underline-offset-2 cursor-pointer font-medium text-emerald-300" onClick={() => onNavigate("schemes")}>Ayushman Bharat Health Scheme</span>, saving up to ₹5 Lakhs in annual medical expenses. Your EWS renewal deadline is also approaching!
          </div>
        </div>
      </div>

      {/* 2. Bento Grid Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Civic Health Score Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">Participation Index</span>
              <h3 className="text-lg font-bold text-slate-800">AI Civic Health Score</h3>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="my-6 flex items-baseline gap-4">
            <span className="text-5xl font-black tracking-tight text-slate-900">{civicHealthScore}</span>
            <span className="text-slate-400 text-sm">/ 100</span>
            <span className="ml-auto px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
              {civicHealthScore > 75 ? "Excellent" : civicHealthScore > 50 ? "Active" : "Initiated"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                style={{ width: `${civicHealthScore}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Based on profile updates, 1 active complaint submission, and draft form completions.
            </p>
          </div>
        </div>

        {/* Scheme Eligibility Summary Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">Welfare Benefits</span>
              <h3 className="text-lg font-bold text-slate-800">Eligible Scheme Value</h3>
            </div>
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="my-6">
            <div className="text-3xl font-extrabold text-slate-900">₹5,10,000+</div>
            <p className="text-slate-400 text-xs mt-1 font-medium font-mono">Estimated Annual Savings</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Primary Benefits</span>
              <span className="font-semibold text-slate-800">Ayushman + Mudra</span>
            </div>
            <button 
              onClick={() => onNavigate("schemes")}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition border border-amber-200/50"
            >
              View Eligibility Details
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Complaints & Forms Activity Widget */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">Action Items</span>
              <h3 className="text-lg font-bold text-slate-800">In-Flight Operations</h3>
            </div>
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="my-6 grid grid-cols-2 gap-4 divide-x divide-slate-100">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-slate-900">{activeComplaints}</div>
              <span className="text-slate-400 text-xs font-semibold block mt-1">Active Complaints</span>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-slate-900">{pendingForms}</div>
              <span className="text-slate-400 text-xs font-semibold block mt-1">Draft Forms</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onNavigate("complaints")}
              className="flex items-center justify-center py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs transition border border-indigo-200/50"
            >
              Track Issues
            </button>
            <button 
              onClick={() => onNavigate("form-filler")}
              className="flex items-center justify-center py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition border border-slate-200/50"
            >
              Resume Forms
            </button>
          </div>
        </div>

      </div>

      {/* 3. Deep-Dive: AI Fraud Alert Center & Deadline Predictor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fraud Alert Center (Left 2 columns) */}
        <div className="lg:col-span-2 rounded-3xl border border-rose-100 bg-rose-50/20 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">AI Fraud Alert System</h3>
              <p className="text-slate-500 text-xs">Instantly warning citizens about local financial & demographic scams.</p>
            </div>
          </div>

          <div className="space-y-4">
            {fraudAlerts.map((alert) => (
              <div key={alert.id} className="p-4 rounded-2xl bg-white border border-rose-100/60 shadow-xs flex gap-3.5">
                <div className="mt-0.5 text-rose-500 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-950">{alert.title}</span>
                    <span className="px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-800 text-[10px] font-bold uppercase tracking-wider">
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
                  <span className="text-[10px] text-slate-400 font-mono block">{alert.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Deadline Predictor (Right 1 column) */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">AI Deadline Predictor</h3>
                <p className="text-slate-500 text-xs">Preventing late fees & lost benefits.</p>
              </div>
            </div>

            <div className="space-y-3">
              {deadlineWarnings.map((warning, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 block">{warning.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{warning.date}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      warning.daysLeft <= 30 ? "bg-amber-100 text-amber-800" : "bg-slate-200 text-slate-700"
                    }`}>
                      {warning.daysLeft} days left
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <button 
              onClick={() => onNavigate("doc-explainer")}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 hover:underline"
            >
              Upload Document to Scan Deadlines
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 4. Active Civic Complains Tracker Status Preview */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-lg font-extrabold text-slate-900">Active Complaint Feeds</h3>
            <p className="text-slate-500 text-xs">Real-time status tracking for issues in your locality.</p>
          </div>
          <button 
            onClick={() => onNavigate("complaints")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Lodge/Manage Complaints &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complaints.slice(0, 2).map((comp) => (
            <div key={comp.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {comp.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {comp.category}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-950">{comp.title}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  comp.status === "Resolved" ? "bg-emerald-100 text-emerald-800" :
                  comp.status === "In Progress" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                }`}>
                  {comp.status}
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {comp.description}
              </p>

              <div className="flex items-center text-[11px] text-slate-500 gap-4 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {comp.location.split(",")[0]}, {comp.location.split(",")[1] || ""}
                </span>
                <span className="ml-auto font-mono text-[10px]">
                  {comp.predictedResolution}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
