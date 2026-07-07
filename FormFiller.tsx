import React, { useState } from "react";
import { 
  GovernmentForm, 
  UserProfile, 
  FormField 
} from "../types";
import { 
  FileText, 
  Sparkles, 
  HelpCircle, 
  CheckCircle, 
  Save, 
  Send, 
  Loader2, 
  Edit2, 
  AlertCircle,
  Building,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FormFillerProps {
  profile: UserProfile;
  forms: GovernmentForm[];
  onSaveFormDraft: (formId: string, updatedFields: FormField[]) => void;
  onSubmitForm: (formId: string) => void;
}

export default function FormFiller({ profile, forms, onSaveFormDraft, onSubmitForm }: FormFillerProps) {
  const [selectedFormId, setSelectedFormId] = useState<string>(forms[0]?.id || "");
  const [localFields, setLocalFields] = useState<FormField[]>(forms[0]?.fields || []);
  const [isFilling, setIsFilling] = useState(false);
  const [justAutoFilled, setJustAutoFilled] = useState(false);

  const selectedForm = forms.find(f => f.id === selectedFormId);

  // Sync state when selecting a different form
  const handleSelectForm = (id: string) => {
    setSelectedFormId(id);
    const form = forms.find(f => f.id === id);
    if (form) {
      setLocalFields(form.fields);
    }
    setJustAutoFilled(false);
  };

  const handleFieldChange = (fieldName: string, val: string) => {
    setLocalFields(prev => prev.map(f => f.name === fieldName ? { ...f, value: val } : f));
  };

  // Trigger server-side AI Autocomplete filling
  const handleAIAutoComplete = async () => {
    if (!selectedForm) return;
    setIsFilling(true);
    try {
      const res = await fetch("/api/forms/fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formName: selectedForm.title,
          fields: localFields,
          profile
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Merge AI suggestions into local fields
        setLocalFields(prev => prev.map(field => {
          const aiField = data.fields?.find((f: any) => f.name === field.name);
          return {
            ...field,
            value: aiField?.suggestedValue || field.value,
            suggestedValue: aiField?.suggestedValue,
            explanation: aiField?.explanation,
            error: aiField?.error || undefined
          };
        }));
        setJustAutoFilled(true);
      }
    } catch (e) {
      console.error("Failed to autocomplete form:", e);
    } finally {
      setIsFilling(false);
    }
  };

  const handleSaveDraft = () => {
    onSaveFormDraft(selectedFormId, localFields);
    alert("Draft saved successfully to Citizen OS database!");
  };

  const handleSubmitForm = () => {
    // Basic verification check
    const missingRequired = localFields.filter(f => f.required && !f.value);
    if (missingRequired.length > 0) {
      alert(`Please fill out all required fields: ${missingRequired.map(f => f.label).join(", ")}`);
      return;
    }

    onSubmitForm(selectedFormId);
    alert("Congratulations! Application submitted officially. Tracking token created.");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="form-filler-view">
      
      {/* Left List of Forms */}
      <div className="lg:col-span-1 space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 px-1">
          <Building className="w-4 h-4 text-emerald-600" />
          Government Form Directory
        </h3>

        <div className="space-y-3">
          {forms.map((form) => {
            const isSelected = form.id === selectedFormId;
            return (
              <button
                key={form.id}
                id={`select-form-${form.id}`}
                onClick={() => handleSelectForm(form.id)}
                className={`w-full text-left p-4 rounded-3xl border transition block relative overflow-hidden ${
                  isSelected 
                  ? "bg-slate-950 border-slate-950 text-white" 
                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1 max-w-[80%]">
                    <span className={`text-[10px] font-bold font-mono tracking-wider uppercase px-2 py-0.5 rounded ${
                      isSelected ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-600"
                    }`}>
                      {form.department.split("(")[0]}
                    </span>
                    <h4 className="text-xs font-extrabold truncate block">{form.title}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    form.status === "Submitted" 
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                    : isSelected ? "bg-amber-400/20 text-amber-300" : "bg-amber-100 text-amber-800"
                  }`}>
                    {form.status}
                  </span>
                </div>
                <p className={`text-[10px] leading-relaxed mt-2 line-clamp-1 ${
                  isSelected ? "text-slate-300" : "text-slate-400"
                }`}>
                  {form.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Form Body */}
      <div className="lg:col-span-2 space-y-6">
        
        {selectedForm ? (
          <div className="rounded-3xl border border-slate-150 bg-white shadow-xs overflow-hidden">
            
            {/* Form Title & Auto-fill button */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
                  {selectedForm.department}
                </span>
                <h3 className="text-base font-extrabold text-slate-950">{selectedForm.title}</h3>
                <p className="text-xs text-slate-500">{selectedForm.description}</p>
              </div>

              {selectedForm.status === "Draft" && (
                <button
                  id="ai-autofill-btn"
                  onClick={handleAIAutoComplete}
                  disabled={isFilling}
                  className="px-4 py-2.5 rounded-xl bg-linear-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0 shadow-lg shadow-emerald-600/10"
                >
                  {isFilling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      AI Filling...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                      AI Auto-Complete
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Fields List */}
            <div className="p-6 space-y-5 h-[400px] overflow-y-auto">
              
              {justAutoFilled && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div>
                    <strong className="font-bold">Form Auto-Completed!</strong> Smart Bharat AI scanned your primary profile data, filled in relevant options, performed Non-ECR qualification matching, and explained administrative terms below.
                  </div>
                </div>
              )}

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                {localFields.map((field) => (
                  <div key={field.name} className="space-y-1 bg-slate-50/40 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      {field.suggestedValue && (
                        <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100/60 border border-emerald-100">
                          <Sparkles className="w-3 h-3" />
                          AI Suggested
                        </span>
                      )}
                    </div>

                    {/* Inputs based on type */}
                    {field.type === "select" ? (
                      <select
                        id={`input-${field.name}`}
                        value={field.value}
                        disabled={selectedForm.status === "Submitted"}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 font-medium"
                      >
                        <option value="">-- Select option --</option>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={`input-${field.name}`}
                        type={field.type}
                        value={field.value}
                        disabled={selectedForm.status === "Submitted"}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        placeholder={field.placeholder || `Enter ${field.label}`}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 font-medium"
                      />
                    )}

                    {/* Explanations & Error checks */}
                    {field.error && (
                      <div className="flex items-center gap-1.5 text-[11px] text-rose-600 font-semibold pt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {field.error}
                      </div>
                    )}
                    {field.explanation && (
                      <p className="text-[10px] text-slate-400 font-medium pt-1 italic pl-1 leading-relaxed">
                        • {field.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </form>

            </div>

            {/* Bottom Form Actions */}
            {selectedForm.status === "Draft" && (
              <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3 font-bold">
                <button
                  id="save-draft-btn"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                <button
                  id="submit-form-btn"
                  onClick={handleSubmitForm}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-600/10 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Submit Application
                </button>
              </div>
            )}

            {selectedForm.status === "Submitted" && (
              <div className="bg-emerald-50 border-t border-emerald-100 px-6 py-4 flex items-center justify-between font-bold text-xs text-emerald-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Application submitted to Ministry on {new Date(selectedForm.lastUpdated).toLocaleDateString()}
                </span>
                <span className="font-mono text-[10px] bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded">
                  TOKEN: SUB-{selectedForm.id.toUpperCase()}
                </span>
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100 italic text-slate-400 text-xs">
            No active forms found in this portal directory.
          </div>
        )}

      </div>
    </div>
  );
}
