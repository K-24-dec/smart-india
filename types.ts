/**
 * Shared Type Definitions for Smart Bharat AI Civic Companion
 */

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  state: string;
  district: string;
  income: number; // annual in INR
  occupation: string;
  isFarmer: boolean;
  isStudent: boolean;
  isSeniorCitizen: boolean;
  hasDisability: boolean;
  education: string;
  familySize: number;
  monthlySavingsGoal?: number;
}

export interface Scheme {
  id: string;
  name: string;
  ministry: string;
  description: string;
  eligibilityPercentage: number;
  estimatedBenefits: string;
  whyEligible: string;
  steps: string[];
  category: "Agriculture" | "Health" | "Social Security" | "Education" | "Finance" | "Women Care";
}

export interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  status: "Submitted" | "In Progress" | "Resolved";
  department: string;
  createdAt: string;
  predictedResolution: string;
  timeline: { status: string; date: string; description: string; active: boolean }[];
  imageUrl?: string;
  upvotes: number;
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  value: string;
  suggestedValue?: string;
  explanation?: string;
  error?: string;
  required: boolean;
  options?: string[];
}

export interface GovernmentForm {
  id: string;
  title: string;
  description: string;
  department: string;
  fields: FormField[];
  status: "Draft" | "Submitted";
  lastUpdated: string;
}

export interface ExplainedDocument {
  title: string;
  summary: string;
  simplifiedExplanation: string;
  translation?: string;
  keyDates: { date: string; event: string }[];
  faqs: { question: string; answer: string }[];
  legalTerms: { term: string; simpleDefinition: string }[];
}

export interface PolicyExplanation {
  title: string;
  simplifiedText: string;
  pros: string[];
  cons: string[];
  whoBenefits: string[];
  latestUpdates: string[];
  relatedSchemes: string[];
}

export interface DashboardStats {
  recommendedSchemesCount: number;
  activeComplaintsCount: number;
  pendingApplicationsCount: number;
  totalEstimatedBenefitsInr: number;
  civicHealthScore: number; // 0 to 100
  fraudAlerts: { id: string; title: string; severity: "high" | "medium"; description: string; date: string }[];
}
