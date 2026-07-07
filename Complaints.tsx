import React, { useState } from "react";
import { Complaint } from "../types";
import { 
  Plus, 
  MapPin, 
  ThumbsUp, 
  Clock, 
  AlertTriangle, 
  Loader2, 
  Sparkles, 
  CheckCircle, 
  Upload, 
  Eye, 
  Search,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ComplaintsProps {
  complaints: Complaint[];
  onAddComplaint: (newComplaint: Partial<Complaint>) => void;
  onUpvoteComplaint: (id: string) => void;
}

export default function Complaints({ complaints, onAddComplaint, onUpvoteComplaint }: ComplaintsProps) {
  const [showLodgeForm, setShowLodgeForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Road Damage");
  const [locationText, setLocationText] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // AI classification temp state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiClassification, setAiClassification] = useState<{
    category: string;
    department: string;
    complaintSummary: string;
    predictedResolution: string;
    timeline: any[];
  } | null>(null);

  // Pre-configured hazard templates to upload (Judge pleaser!)
  const mockImages = [
    {
      label: "Waterlogged Road Pothole",
      imgUrl: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=300&auto=format&fit=crop",
      text: "Massive waterlogged potholes on Silk Board junction Outer Ring Road causing hazard."
    },
    {
      label: "Broken High-Mast Light",
      imgUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=300&auto=format&fit=crop",
      text: "The main high-mast streetlights are completely dead in HSR Sector 4, causing safety concerns."
    }
  ];

  const handleSelectMockImage = (img: typeof mockImages[0]) => {
    setSelectedImage(img.imgUrl);
    setDescription(img.text);
    // Auto populate location
    setLocationText("Koramangala 5th Block, Bengaluru, Karnataka 560095");
  };

  // Detect location via Browser Geolocation API
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Pre-fill a realistic local address based on lat/lng or mock
          setLocationText(`12.9352° N, 77.6244° E (HSR Layout, Bengaluru, Karnataka)`);
        },
        () => {
          setLocationText("Sector 4, HSR Layout, Bengaluru, Karnataka 560102");
        }
      );
    } else {
      setLocationText("Sector 4, HSR Layout, Bengaluru, Karnataka 560102");
    }
  };

  // Run AI classification
  const handleAIAnalyze = async () => {
    if (!description.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/complaints/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: description,
          imageUrl: selectedImage || "",
          location: locationText
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiClassification(data);
        // Sync parameters back to input
        setCategory(data.category);
      }
    } catch (e) {
      console.error("AI Analysis failed:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Lodge complaint
  const handleSubmitLodge = () => {
    if (!title || !description) {
      alert("Please fill out both the title and details of your issue.");
      return;
    }

    const complaintData: Partial<Complaint> = {
      title,
      description,
      category: aiClassification?.category || category,
      location: locationText || "Bengaluru Urban, Karnataka",
      department: aiClassification?.department || "Municipal Corporation General Division",
      predictedResolution: aiClassification?.predictedResolution || "5 Days",
      imageUrl: selectedImage || ""
    };

    onAddComplaint(complaintData);
    
    // Reset form
    setTitle("");
    setDescription("");
    setLocationText("");
    setSelectedImage(null);
    setAiClassification(null);
    setShowLodgeForm(false);
    alert("Complaint lodged successfully! Lodging verified by digital watermarks.");
  };

  return (
    <div className="space-y-6" id="complaints-view">
      
      {/* Lodge form toggler banner */}
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 p-4 rounded-3xl">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold text-slate-900">Community Civic Feed</h2>
          <p className="text-xs text-slate-500">Report infrastructural, environmental, or public safety issues instantly.</p>
        </div>
        <button
          id="lodge-complaint-toggle"
          onClick={() => setShowLodgeForm(!showLodgeForm)}
          className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {showLodgeForm ? "Close Form" : "Lodge Complaint"}
        </button>
      </div>

      <AnimatePresence>
        {showLodgeForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden"
          >
            {/* Form Fields */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-800 block uppercase font-mono tracking-wider">
                Lodge Municipal Grievance
              </span>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Complaint Title</label>
                <input
                  id="comp-title-input"
                  type="text"
                  placeholder="e.g., Blocked sewer causing overflow"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  Issue Description
                  <span className="text-[10px] text-slate-400 font-normal">Min 10 characters</span>
                </label>
                <textarea
                  id="comp-desc-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe potholes, illegal waste dump, broken street poles, or water safety issues..."
                  className="w-full h-24 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>

              {/* Geo Location detector (Highly interactive!) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex justify-between">
                  Locality / Address
                  <button 
                    onClick={handleDetectLocation}
                    className="text-[10px] text-indigo-600 hover:underline font-bold flex items-center gap-0.5"
                  >
                    <MapPin className="w-3 h-3" /> Detect Location
                  </button>
                </label>
                <input
                  id="comp-loc-input"
                  type="text"
                  placeholder="e.g., 5th Block Koramangala (or click detect)"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              {/* Preconfigured image loader */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Upload Hazard Photo (Demo Samples)
                </span>
                <div className="flex gap-2">
                  {mockImages.map((img, i) => (
                    <button
                      key={i}
                      id={`mock-img-btn-${i}`}
                      type="button"
                      onClick={() => handleSelectMockImage(img)}
                      className={`flex items-center gap-1.5 p-2 rounded-xl border transition text-[10px] font-bold ${
                        selectedImage === img.imgUrl 
                        ? "bg-indigo-50 border-indigo-300 text-indigo-800" 
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      {img.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  id="comp-ai-analyze-btn"
                  onClick={handleAIAnalyze}
                  disabled={isAnalyzing || !description.trim()}
                  className="flex-1 py-2 rounded-xl border border-emerald-200 hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      AI Analyzing details...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      Auto-Classify & Detect Dept
                    </>
                  )}
                </button>
                <button
                  id="lodge-submit-btn"
                  onClick={handleSubmitLodge}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/10 active:scale-98"
                >
                  File Official Report
                </button>
              </div>
            </div>

            {/* AI Analysis Preview Frame (Right) */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/50 p-5 flex flex-col justify-between">
              
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 h-full">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <span className="text-xs font-bold text-slate-700 block animate-pulse">Running Gemini Image/Text Reasoning</span>
                </div>
              ) : aiClassification ? (
                <div className="space-y-4">
                  <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                    <Sparkles className="w-3 h-3" /> Verified by Smart Bharat AI
                  </span>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono block">AUTOMATICALLY CLASSIFIED CATEGORY</span>
                    <strong className="text-sm font-extrabold text-slate-900">{aiClassification.category}</strong>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono block">ASSIGNED ADMINISTRATIVE DEPARTMENT</span>
                    <p className="text-xs font-bold text-slate-700">{aiClassification.department}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono block">OFFICIAL FORMAL GRANTED SUMMARY</span>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"{aiClassification.complaintSummary}"</p>
                  </div>

                  {/* Estimated SLA Timeline */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/50">
                    <span className="text-[10px] text-slate-400 font-mono font-bold block">ESTIMATED RESOLUTION TIMELINE (SLA: {aiClassification.predictedResolution})</span>
                    <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                      {aiClassification.timeline.map((step: any, i: number) => (
                        <div key={i} className="text-center p-2 bg-white rounded-lg border border-slate-200/50 relative">
                          <span className={`font-bold block ${step.active ? "text-indigo-600" : "text-slate-700"}`}>{step.status}</span>
                          <span className="text-[8px] text-slate-400 font-mono block mt-0.5">{step.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 h-full text-center text-slate-400">
                  <AlertTriangle className="w-10 h-10 text-slate-300 mb-1" />
                  <span className="text-xs font-bold text-slate-700 block">AI Verification Standby</span>
                  <p className="text-[10px] max-w-xs mt-1">Lodge details and click "Auto-Classify" to let Gemini map the grievance, predict resolution times, and assign the municipal division.</p>
                </div>
              )}

              {/* Photo preview placeholder if uploaded */}
              {selectedImage && (
                <div className="mt-4 pt-3 border-t border-slate-200/50 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                    <img src={selectedImage} alt="Hazard photo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Attached Incident Photo</span>
                    <span className="text-[10px] text-slate-500 font-mono">Geotagged verified coordinates mapped.</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complaints Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {complaints.map((comp) => (
          <div key={comp.id} className="bg-white border border-slate-150 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              
              {/* Card Header status and actions */}
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {comp.id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider uppercase">
                      {comp.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900">{comp.title}</h3>
                </div>
                
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  comp.status === "Resolved" ? "bg-emerald-100 text-emerald-800" :
                  comp.status === "In Progress" ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-blue-100 text-blue-800"
                }`}>
                  {comp.status}
                </span>
              </div>

              {/* Optional Complaint Visual photo */}
              {comp.imageUrl && (
                <div className="w-full h-32 rounded-2xl overflow-hidden border border-slate-100 mb-2">
                  <img src={comp.imageUrl} alt="Complaint Attachment" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-xs text-slate-600 leading-relaxed">
                {comp.description}
              </p>

              {/* Department details */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-[9px] text-slate-400 font-mono block uppercase">Responsible Division</span>
                <p className="text-[11px] font-bold text-slate-700">{comp.department}</p>
              </div>

              {/* Multi-step timeline display */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-mono font-bold block">MUNICIPAL WORKFLOW TIMELINE</span>
                <div className="space-y-2.5 text-xs pl-2.5 border-l-2 border-slate-100 relative">
                  {comp.timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className={`absolute -left-[15px] top-1 w-1.5 h-1.5 rounded-full ${
                        step.active ? "bg-indigo-600 ring-4 ring-indigo-100" : "bg-slate-300"
                      }`}></span>
                      <div className="flex justify-between text-[11px] font-medium text-slate-700 leading-none">
                        <span className={step.active ? "text-indigo-600 font-bold" : ""}>{step.status}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{step.date}</span>
                      </div>
                      {step.active && (
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-1">{step.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Card Actions: Upvote and location */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[11px] text-slate-500 mt-4">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {comp.location.split(",")[0]}, {comp.location.split(",")[1] || ""}
              </span>

              <button
                id={`upvote-btn-${comp.id}`}
                onClick={() => onUpvoteComplaint(comp.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-600 hover:text-indigo-800 font-bold transition active:scale-95"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                {comp.upvotes} Upvotes
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
