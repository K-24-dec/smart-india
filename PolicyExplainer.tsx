import React, { useState } from "react";
import { 
  BookOpen, 
  Sparkles, 
  Search, 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Users, 
  Clock, 
  Compass, 
  Loader2,
  ChevronRight
} from "lucide-react";
import { PolicyExplanation } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface PolicyExplainerProps {
  language: string;
}

export default function PolicyExplainer({ language }: PolicyExplainerProps) {
  const [selectedPolicy, setSelectedPolicy] = useState("Digital Personal Data Protection (DPDP) Act");
  const [customQuery, setCustomQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<PolicyExplanation | null>(null);

  const policyDirectory = [
    "Digital Personal Data Protection (DPDP) Act",
    "National Education Policy (NEP) 2020",
    "Goods & Services Tax (GST) Reforms",
    "National Green Hydrogen Mission"
  ];

  const policyPresets: Record<string, string[]> = {
    "Digital Personal Data Protection (DPDP) Act": [
      "How does this block spam telemarketing?",
      "Can I force an app to delete my Aadhaar details?",
      "Are there extra safety rules for kids under 18?"
    ],
    "National Education Policy (NEP) 2020": [
      "How does this change the standard 10+2 board exam format?",
      "What is the Academic Bank of Credits (ABC)?",
      "Is learning regional languages mandatory?"
    ],
    "Goods & Services Tax (GST) Reforms": [
      "What items are under the tax-free 0% bracket?",
      "How do micro-businesses file simple returns?",
      "What is the e-way bill threshold?"
    ],
    "National Green Hydrogen Mission": [
      "What is green hydrogen and why is India subsidizing it?",
      "How many green jobs are projected by 2030?",
      "What is the target export capacity?"
    ]
  };

  const fetchPolicyExplanation = async (queryText?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/policy/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyName: selectedPolicy,
          query: queryText || customQuery,
          language
        })
      });
      if (res.ok) {
        const data = await res.json();
        setExplanation(data);
      }
    } catch (e) {
      console.error("Failed to load policy explanation:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPolicy = (policy: string) => {
    setSelectedPolicy(policy);
    setCustomQuery("");
    setExplanation(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="policy-explainer-view">
      
      {/* Policy Selection Sidebar (Left 1 column) */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Policy Selector list */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 px-1">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            National Policy Hub
          </h3>

          <div className="space-y-2.5">
            {policyDirectory.map((policy) => {
              const isSelected = selectedPolicy === policy;
              return (
                <button
                  key={policy}
                  id={`policy-select-btn-${policy.split(" ")[0]}`}
                  onClick={() => handleSelectPolicy(policy)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition block text-xs font-bold ${
                    isSelected 
                    ? "bg-slate-950 border-slate-950 text-white" 
                    : "bg-slate-50 border-slate-200/55 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  {policy}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Preset Queries based on selected policy */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5">
          <span className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase block">
            Common Citizen Questions
          </span>

          <div className="space-y-2">
            {policyPresets[selectedPolicy]?.map((preset, idx) => (
              <button
                key={idx}
                id={`policy-preset-${idx}`}
                onClick={() => {
                  setCustomQuery(preset);
                  fetchPolicyExplanation(preset);
                }}
                className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200/50 transition block text-xs text-slate-700 leading-relaxed active:scale-98"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Policy Details Board (Right 2 columns) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Custom Query Search Box */}
        <div className="rounded-3xl border border-slate-250 bg-white p-4 shadow-xs flex gap-3 items-center">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
          <input
            id="policy-search-input"
            type="text"
            placeholder={`Ask a custom question about the ${selectedPolicy}...`}
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            className="flex-1 bg-transparent text-slate-800 text-xs focus:outline-hidden"
          />
          <button
            id="policy-ask-btn"
            onClick={() => fetchPolicyExplanation()}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition active:scale-95 shrink-0"
          >
            {isLoading ? "Analyzing..." : "Ask AI"}
          </button>
        </div>

        {/* Explainer Result Board */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-xs gap-4">
            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            <div className="text-center space-y-1">
              <span className="text-sm font-bold text-slate-900 block animate-pulse">De-codifying National Policy</span>
              <p className="text-slate-500 text-xs">Translating legal jargon, outlining pros/cons, and checking updates...</p>
            </div>
          </div>
        ) : explanation ? (
          <div className="rounded-3xl border border-slate-150 bg-white shadow-xs overflow-hidden space-y-6 p-6">
            
            {/* Header info */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div className="p-3 bg-indigo-100 text-indigo-800 rounded-2xl shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
                  Policy Explainer Result
                </span>
                <h3 className="text-base font-extrabold text-slate-950">{explanation.title}</h3>
              </div>
            </div>

            {/* Main description summary */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
                Simplified Translation (What it actually means):
              </span>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {explanation.simplifiedText}
              </p>
            </div>

            {/* Pros & Cons side-by-side bento layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Pros */}
              <div className="p-4 rounded-2xl bg-emerald-50/20 border border-emerald-100 space-y-3">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Key Benefits & Advantages
                </span>
                <ul className="space-y-2">
                  {explanation.pros.map((pro, idx) => (
                    <li key={idx} className="text-xs text-slate-600 leading-relaxed flex gap-2 items-start">
                      <span className="text-emerald-600 font-mono font-bold">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="p-4 rounded-2xl bg-rose-50/20 border border-rose-100 space-y-3">
                <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-rose-600" /> Challenges & Criticisms
                </span>
                <ul className="space-y-2">
                  {explanation.cons.map((con, idx) => (
                    <li key={idx} className="text-xs text-slate-600 leading-relaxed flex gap-2 items-start">
                      <span className="text-rose-600 font-mono font-bold">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Target beneficiaries & related schemes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              
              {/* Beneficiaries */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" /> Who benefits the most?
                </span>
                <div className="space-y-1.5">
                  {explanation.whoBenefits.map((b, i) => (
                    <div key={i} className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Schemes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-teal-600" /> Linked Welfare Schemes
                </span>
                <div className="space-y-1.5">
                  {explanation.relatedSchemes.map((s, i) => (
                    <div key={i} className="text-xs text-slate-600 flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 font-bold">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Latest updates timeline */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" /> Latest Policy Updates & Gazette Notifications
              </span>
              <div className="space-y-2 pl-3 border-l-2 border-slate-150">
                {explanation.latestUpdates.map((update, idx) => (
                  <div key={idx} className="text-xs text-slate-600 leading-relaxed pb-1 relative">
                    <span className="absolute -left-[17px] top-1.5 w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    {update}
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-slate-50 rounded-3xl border border-slate-100 shadow-xs text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mb-2" />
            <span className="text-sm font-bold text-slate-800 block">No Policy Decoded Yet</span>
            <p className="text-slate-400 text-xs mt-1 max-w-sm">Select a public policy on the left or type a custom question to let the AI Operating System translate dense parliamentary gazettes into citizen-friendly language.</p>
          </div>
        )}

      </div>
    </div>
  );
}
