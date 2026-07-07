import React, { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  User, 
  Bot, 
  Globe, 
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Play
} from "lucide-react";
import { UserProfile } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CivicCompanionProps {
  profile: UserProfile;
  language: string;
  onSetLanguage: (lang: string) => void;
}

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  isAudioPlaying?: boolean;
}

export default function CivicCompanion({ profile, language, onSetLanguage }: CivicCompanionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "model",
      content: `Namaste! I am your Smart Bharat AI Civic Companion. 

I'm configured with your profile as a ${profile.age}-year-old citizen in ${profile.district}, ${profile.state}.

How can I assist you today? You can:
• Ask about government schemes you are eligible for.
• Simplify difficult legal or government notifications.
• Get step-by-step guidance on passports, PAN cards, or land records.
• Register a civic complaint.

Feel free to type below, select a hot-topic, or click the Microphone to speak in your preferred language!`
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const availableLanguages = [
    { code: "en", name: "English", native: "English" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
    { code: "te", name: "Telugu", native: "తెలుగు" },
    { code: "ta", name: "Tamil", native: "தமிழ்" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
    { code: "ml", name: "Malayalam", native: "മലയാളம்" },
    { code: "mr", name: "Marathi", native: "मराठी" },
    { code: "bn", name: "Bengali", native: "বাংলা" },
    { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
    { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
    { code: "or", name: "Odia", native: "ଓଡ଼ିଆ" }
  ];

  const presetQueries = [
    "What schemes am I eligible for?",
    "How do I apply for Ayushman Bharat?",
    "Explain standard non-ECR passport rules",
    "How do I file a waterlogging complaint?",
    "Tell me about the DPDP Act privacy rules"
  ];

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Setup Web Speech API for Speech-to-Text (STT)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      
      // Match language mapping roughly for STT
      const langMap: Record<string, string> = {
        "English": "en-IN",
        "Hindi": "hi-IN",
        "Telugu": "te-IN",
        "Tamil": "ta-IN",
        "Kannada": "kn-IN",
        "Malayalam": "ml-IN",
        "Marathi": "mr-IN",
        "Bengali": "bn-IN",
        "Gujarati": "gu-IN",
        "Punjabi": "pa-IN",
        "Odia": "or-IN"
      };
      
      rec.lang = langMap[language] || "en-IN";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          // Automatically trigger send for hands-free voice experience
          handleSendMessage(transcript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  // Toggle voice recording
  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not fully supported in this browser environment. Please try typing!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Text-to-Speech (TTS) using Web Speech API
  const speakText = (text: string, msgId: string) => {
    if (isMuted) return;

    // Stop existing speech
    window.speechSynthesis.cancel();

    // Map languages to standard voices if available
    const cleanText = text.replace(/[•*#_`]/g, ""); // strip markdown characters for clean speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    const langMap: Record<string, string> = {
      "English": "en-IN",
      "Hindi": "hi-IN",
      "Telugu": "te-IN",
      "Tamil": "ta-IN",
      "Kannada": "kn-IN",
      "Malayalam": "ml-IN",
      "Marathi": "mr-IN",
      "Bengali": "bn-IN",
      "Gujarati": "gu-IN",
      "Punjabi": "pa-IN",
      "Odia": "or-IN"
    };

    utterance.lang = langMap[language] || "en-IN";
    utterance.rate = 1.0;

    utterance.onstart = () => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isAudioPlaying: true } : m));
    };

    utterance.onend = () => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isAudioPlaying: false } : m));
    };

    utterance.onerror = () => {
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isAudioPlaying: false } : m));
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = (msgId: string) => {
    window.speechSynthesis.cancel();
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isAudioPlaying: false } : m));
  };

  // Sending Message to Server Endpoint
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Build simple chat history payload
      const historyPayload = messages.slice(-5).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          language,
          profile
        })
      });

      if (!res.ok) throw new Error("Server responded with error");
      const data = await res.json();

      const aiMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: "model",
        content: data.text
      };

      setMessages(prev => [...prev, aiMessage]);

      // Speak AI response automatically if not muted
      if (!isMuted) {
        speakText(data.text, aiMessage.id);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-err`,
        role: "model",
        content: "I apologize, but I am having trouble connecting to the Smart Bharat mainframe right now. Please check your internet connection or try again shortly."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)] min-h-[500px]" id="companion-view">
      
      {/* Sidebar: Languages & Quick Hot-Topics */}
      <div className="lg:col-span-1 space-y-6 flex flex-col justify-between h-full bg-slate-50 border border-slate-200/60 rounded-3xl p-5">
        <div className="space-y-6">
          
          {/* Language Picker Header */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase block">
              System Language
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-4 h-4" />
              </div>
              <select 
                id="companion-lang-select"
                value={language}
                onChange={(e) => onSetLanguage(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 font-semibold text-sm text-slate-800 transition focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.name} value={lang.name}>
                    {lang.native} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase block">
              Suggested Questions
            </label>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {presetQueries.map((query, i) => (
                <button
                  key={i}
                  id={`preset-${i}`}
                  onClick={() => {
                    setInputValue(query);
                    handleSendMessage(query);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-white hover:bg-emerald-50 hover:text-emerald-950 text-slate-700 text-xs font-medium transition border border-slate-200/50 hover:border-emerald-200 shadow-xs block active:scale-98"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* User profile card quick summary */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-bold text-emerald-900 block truncate">{profile.name}</span>
            <span className="text-[10px] text-emerald-700 font-mono block">
              Residing: {profile.district}
            </span>
          </div>
        </div>

      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3 flex flex-col justify-between h-full bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
        
        {/* Chat Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/10">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                Bharat Civic AI
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">Dynamic contextual responses in {language}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => {
                window.speechSynthesis.cancel();
                setIsMuted(!isMuted);
              }}
              className={`p-2.5 rounded-xl border transition ${
                isMuted 
                ? "bg-slate-100 border-slate-200 text-slate-400" 
                : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
              title={isMuted ? "Unmute TTS Audio" : "Mute TTS Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => {
                window.speechSynthesis.cancel();
                setMessages([
                  {
                    id: "welcome",
                    role: "model",
                    content: `Namaste! Chat history cleared. How can I assist you with Indian government services today?`
                  }
                ]);
              }}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition"
              title="Reset Chat History"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Scrolling Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} items-start gap-3`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`group relative max-w-[80%] rounded-2xl px-4 py-3.5 shadow-xs text-sm ${
                    isUser 
                    ? "bg-emerald-600 text-white rounded-tr-none font-medium" 
                    : "bg-slate-100/80 text-slate-800 rounded-tl-none border border-slate-200/30 whitespace-pre-line"
                  }`}>
                    {msg.content}

                    {/* Audio Playback button for assistant response */}
                    {!isUser && (
                      <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => msg.isAudioPlaying ? stopSpeaking(msg.id) : speakText(msg.content, msg.id)}
                          className={`p-1.5 rounded-md ${
                            msg.isAudioPlaying 
                            ? "bg-emerald-500 text-white animate-pulse" 
                            : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                          } shadow-xs transition`}
                          title={msg.isAudioPlaying ? "Stop voice" : "Listen in voice"}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Glowing waveform loader when Gemini is reasoning */}
          {isLoading && (
            <div className="flex justify-start items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100/80 border border-slate-200/30 px-5 py-3.5 rounded-2xl rounded-tl-none flex items-center gap-2">
                <span className="text-xs text-slate-500 font-mono font-bold animate-pulse">Smart Bharat is thinking</span>
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce delay-200"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          
          {/* Animated voice activity wave */}
          {isListening && (
            <div className="flex justify-center items-center gap-2 py-2 text-emerald-600 text-xs font-bold font-mono">
              <span className="animate-pulse">Listening... Speak into microphone</span>
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-0.5 bg-emerald-500 h-2 animate-pulse"></span>
                <span className="w-0.5 bg-emerald-500 h-4 animate-pulse delay-75"></span>
                <span className="w-0.5 bg-emerald-500 h-1.5 animate-pulse delay-150"></span>
                <span className="w-0.5 bg-emerald-500 h-3 animate-pulse delay-100"></span>
                <span className="w-0.5 bg-emerald-500 h-1 animate-pulse"></span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              id="companion-voice-btn"
              onClick={handleToggleListening}
              className={`p-3.5 rounded-2xl transition shrink-0 ${
                isListening 
                ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/20" 
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
              }`}
              title={isListening ? "Stop listening" : "Speak using Mic"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <textarea
              id="companion-chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Ask anything in ${language}... (Shift + Enter for new line)`}
              className="flex-1 bg-white border border-slate-200 hover:border-slate-300 px-4 py-3 rounded-2xl text-slate-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none max-h-24 h-12"
              rows={1}
            />

            <button
              id="companion-send-btn"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim() || isLoading}
              className={`p-3.5 rounded-2xl text-white font-bold transition shrink-0 shadow-lg ${
                inputValue.trim() && !isLoading
                ? "bg-emerald-600 hover:bg-emerald-700 hover:scale-102 active:scale-98 shadow-emerald-600/15"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
