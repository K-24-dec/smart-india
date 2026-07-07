import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Sparkles, 
  FileText, 
  AlertTriangle, 
  PhoneCall, 
  Settings, 
  HelpCircle, 
  TrendingUp, 
  MessageSquareCode, 
  User, 
  Building, 
  ShieldAlert, 
  Flame, 
  Globe,
  Loader2,
  CheckCircle,
  Clock
} from "lucide-react";
import { UserProfile, Complaint, GovernmentForm } from "./types";

// Import subcomponents
import Dashboard from "./components/Dashboard";
import CivicCompanion from "./components/CivicCompanion";
import Schemes from "./components/Schemes";
import DocumentExplainer from "./components/DocumentExplainer";
import FormFiller from "./components/FormFiller";
import Complaints from "./components/Complaints";
import PolicyExplainer from "./components/PolicyExplainer";
import EmergencyCenter from "./components/EmergencyCenter";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [language, setLanguage] = useState<string>("English");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [forms, setForms] = useState<GovernmentForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Boot-up Loads (Avoid infinite re-renders with empty array!)
  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, complaintsRes, formsRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/complaints"),
          fetch("/api/forms")
        ]);

        if (profileRes.ok && complaintsRes.ok && formsRes.ok) {
          const profileData = await profileRes.json();
          const complaintsData = await complaintsRes.json();
          const formsData = await formsRes.json();

          setProfile(profileData);
          setComplaints(complaintsData);
          setForms(formsData);
        }
      } catch (err) {
        console.error("Data fetch failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Update Profile on Server
  const handleUpdateProfile = async (newProfile: UserProfile) => {
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProfile)
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Add / Lodge a Complaint on Server
  const handleAddComplaint = async (newComplaint: Partial<Complaint>) => {
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComplaint)
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(prev => [data.complaint, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Upvote complaint
  const handleUpvoteComplaint = async (id: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}/upvote`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, upvotes: data.upvotes } : c));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Form draft
  const handleSaveFormDraft = async (formId: string, updatedFields: any[]) => {
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: updatedFields, status: "Draft" })
      });
      if (res.ok) {
        const data = await res.json();
        setForms(prev => prev.map(f => f.id === formId ? data.form : f));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Form application
  const handleSubmitForm = async (formId: string) => {
    try {
      const res = await fetch(`/api/forms/${formId}/submit`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setForms(prev => prev.map(f => f.id === formId ? data.form : f));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-4" id="app-loading">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
        <div className="text-center space-y-1">
          <span className="text-lg font-black text-slate-900 block font-sans">Booting Smart Bharat OS</span>
          <p className="text-slate-500 text-sm">Synchronizing welfare charts, municipal databases, and AI translation matrix...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans" id="app-viewport">
      
      {/* LEFT SIDEBAR: Navigation Portal */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800/40" id="sidebar-panel">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/60 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-lg shadow-emerald-500/10">
              भ
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight leading-none">Smart Bharat</h1>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider font-bold">AI CIVIC COMPANION</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SECURE CLOUD OPERATIONAL
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard Hub", icon: Compass },
            { id: "companion", label: "Civic AI Companion", icon: MessageSquareCode },
            { id: "schemes", label: "Scheme Eligibility", icon: TrendingUp },
            { id: "doc-explainer", label: "Document Explainer", icon: FileText },
            { id: "form-filler", label: "AI Form Filler", icon: Building },
            { id: "complaints", label: "Report Complaints", icon: AlertTriangle },
            { id: "policy-hub", label: "Policy Simplifier", icon: Sparkles },
            { id: "emergency", label: "Emergency Hub", icon: Flame }
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  window.speechSynthesis.cancel(); // cancel any active reading when switching tabs
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all relative ${
                  isSelected 
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10" 
                  : "hover:bg-slate-800 hover:text-white text-slate-400"
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? "text-slate-950" : "text-slate-400 group-hover:text-white"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer info: Registered user profile info */}
        <div className="p-4 border-t border-slate-800/60 flex items-center gap-3 bg-slate-950/20">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-bold text-white block truncate">{profile.name}</span>
            <span className="text-[10px] text-slate-500 font-mono block truncate">Citizen UID: 5423-****</span>
          </div>
        </div>

      </aside>

      {/* RIGHT SIDE: Main Work Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50" id="main-portal">
        
        {/* Global Action Header */}
        <header className="h-16 bg-white border-b border-slate-150 px-6 flex justify-between items-center shrink-0" id="header-bar">
          <div className="flex items-center gap-2.5 text-slate-500 text-xs font-medium">
            <Globe className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="hidden sm:inline text-slate-500">Active Dialect:</span>
            <select
              id="header-language-select"
              value={language}
              onChange={(e) => {
                window.speechSynthesis.cancel();
                setLanguage(e.target.value);
              }}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
            >
              <option value="English">English</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Marathi">मరాఠీ (Marathi)</option>
              <option value="Bengali">বাংলা (Bengali)</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
              <option value="Telugu">తెలుగు (Telugu)</option>
              <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
              <option value="Gujarati">ગુજરાતી (Gujarati)</option>
              <option value="Malayalam">മലയാളം (Malayalam)</option>
              <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
              <option value="Odia">ଓଡ଼ିଆ (Odia)</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick stats on complaints / forms in progress */}
            <div className="hidden md:flex items-center gap-4 text-xs font-bold font-mono">
              <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5" />
                {complaints.filter(c => c.status !== "Resolved").length} Pending Complaints
              </div>
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                <CheckCircle className="w-3.5 h-3.5" />
                {forms.filter(f => f.status === "Submitted").length} Filled Applications
              </div>
            </div>
          </div>
        </header>

        {/* Tab content area */}
        <main className="flex-1 overflow-y-auto p-6" id="viewports-panel">
          {activeTab === "dashboard" && (
            <Dashboard 
              profile={profile} 
              complaints={complaints} 
              forms={forms} 
              onNavigate={(tab) => {
                window.speechSynthesis.cancel();
                setActiveTab(tab);
              }}
              onSetEmergency={() => {
                window.speechSynthesis.cancel();
                setActiveTab("emergency");
              }}
            />
          )}

          {activeTab === "companion" && (
            <CivicCompanion 
              profile={profile} 
              language={language} 
              onSetLanguage={setLanguage} 
            />
          )}

          {activeTab === "schemes" && (
            <Schemes 
              profile={profile} 
              onUpdateProfile={handleUpdateProfile} 
            />
          )}

          {activeTab === "doc-explainer" && (
            <DocumentExplainer 
              language={language} 
            />
          )}

          {activeTab === "form-filler" && (
            <FormFiller 
              profile={profile} 
              forms={forms} 
              onSaveFormDraft={handleSaveFormDraft} 
              onSubmitForm={handleSubmitForm}
            />
          )}

          {activeTab === "complaints" && (
            <Complaints 
              complaints={complaints} 
              onAddComplaint={handleAddComplaint} 
              onUpvoteComplaint={handleUpvoteComplaint} 
            />
          )}

          {activeTab === "policy-hub" && (
            <PolicyExplainer 
              language={language} 
            />
          )}

          {activeTab === "emergency" && (
            <EmergencyCenter 
              profile={profile} 
            />
          )}
        </main>

      </div>
    </div>
  );
}
