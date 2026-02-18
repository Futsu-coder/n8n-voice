"use client";

import { useEffect, useRef, useState } from "react";

type ApiResult = {
  transcript?: string;
  answer?: string;
  matches?: Array<any>;
  error?: string;
};

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("พร้อมรับคำสั่ง");
  const [result, setResult] = useState<ApiResult>({});

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("เบราว์เซอร์ไม่รองรับ Web Speech API");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "th-TH";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setStatus("กำลังฟังเสียงของคุณ...");
    };

    rec.onend = () => {
      setIsListening(false);
      setStatus("ประมวลผลเสร็จสิ้น");
    };

    rec.onerror = (e: any) => {
      setIsListening(false);
      setStatus(`เกิดข้อผิดพลาด: ${e?.error || "unknown"}`);
      setResult({ error: e?.error || "speech error" });
    };

    rec.onresult = async (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setResult({ transcript });
      setStatus("AI กำลังคิดคำตอบ...");

      const resp = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });

      const data: ApiResult = await resp.json();
      setResult(data);
      setStatus(data.error ? "เกิดข้อผิดพลาด" : "พร้อมรับคำสั่งใหม่");
    };

    recognitionRef.current = rec;
  }, []);

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setResult({});
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error(e);
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="text-center space-y-4 pt-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest animate-pulse">
            AI Assistant System
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            IT Shop Voice
          </h1>
          <p className="text-slate-400 max-w-md mx-auto">
            ถามข้อมูลสินค้าด้วยเสียงของคุณ เช่น "มี SSD รุ่นไหนน่าสนใจบ้าง?"
          </p>
        </header>

        {/* Central Controller */}
        <div className="flex flex-col items-center justify-center space-y-6 py-12">
          <div className="relative">
            {/* Animated Rings when listening */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-cyan-500 animate-ping opacity-20"></div>
                <div className="absolute inset-[-20px] rounded-full border border-cyan-500/30 animate-[ping_2s_infinite] opacity-10"></div>
              </>
            )}
            
            <button 
              onClick={toggleListening}
              className={`relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                isListening 
                ? 'bg-red-500 shadow-red-500/40 hover:scale-95' 
                : 'bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-cyan-500/40 hover:scale-105'
              }`}
            >
              {isListening ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="px-6 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-sm font-medium backdrop-blur-sm">
            <span className={isListening ? "text-cyan-400" : "text-slate-400"}>
              {status}
            </span>
          </div>
        </div>

        {/* Display Results */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Transcript Box */}
          <div className="group p-6 rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-md hover:border-cyan-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider">ข้อความที่คุณพูด</span>
            </div>
            <p className="text-lg font-medium text-slate-100 min-h-[60px]">
              {result.transcript || <span className="text-slate-600 italic">"..."</span>}
            </p>
          </div>

          {/* AI Answer Box */}
          <div className="group p-6 rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-md hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4 text-cyan-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider">คำตอบจาก AI</span>
            </div>
            <div className="text-lg font-medium text-slate-100 min-h-[60px]">
              {result.answer ? (
                <p className="leading-relaxed">{result.answer}</p>
              ) : result.error ? (
                <p className="text-red-400">{result.error}</p>
              ) : (
                <span className="text-slate-600 italic">"รอคำถามของคุณ..."</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}