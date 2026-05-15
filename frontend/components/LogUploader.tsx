"use client";
import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { analyzeLogs } from "@/lib/api";
import { AnalysisResult } from "@/lib/types";
import AnalysisTabs from "./AnalysisTab";
import { getToken } from "@/lib/api";

interface LogUploaderProps {
  onAnalysisComplete?: () => void;
}

export default function LogUploader({ onAnalysisComplete }: LogUploaderProps) {
  const [logs, setLogs] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

const handleSubmit = async () => {
  if (!logs.trim()) return;
  setLoading(true);
  setError(null);
  try {
    const token = getToken();
    const res = await fetch("http://localhost:8000/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ logs, domain: "kubernetes" }),
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Analysis failed");
    }
    
    const data = await res.json();
    setResult(data.result);
  } catch (err: any) {
    setError(err.message || "Analysis failed. Check backend & API key.");
  } finally {
    setLoading(false);
  }
};

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("File too large. Max 5MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setLogs(ev.target?.result as string);
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          DevOps AI Log Analyzer
        </h1>
        <p className="text-slate-400">Paste logs or upload files. AI will identify root cause & generate mitigation runbook.</p>
      </header>

      <div className="glass rounded-xl p-6 space-y-4 card-hover">
        <div
          className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFileUpload({ target: { files: e.dataTransfer.files } } as any); }}
        >
          <Upload className="mx-auto h-8 w-8 text-slate-500 mb-3" />
          <p className="text-slate-300 font-medium">Drag & drop .log / .txt file</p>
          <p className="text-slate-500 text-sm mt-1">or click to browse</p>
          <input ref={fileInputRef} type="file" accept=".log,.txt" className="hidden" onChange={handleFileUpload} />
        </div>

        <div className="relative">
          <textarea
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
            placeholder="Paste logs here... (JSON, syslog, kubectl logs, etc.)"
            className="w-full h-48 bg-slate-900/50 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-y"
          />
          {logs && (
            <button onClick={() => setLogs("")} className="absolute top-3 right-3 p-1 text-slate-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {error && <div className="text-red-400 text-sm bg-red-900/20 border border-red-700 rounded p-3">{error}</div>}

        <button
          disabled={loading || !logs.trim()}
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <FileText className="h-5 w-5" />}
          {loading ? "Analyzing Logs..." : "Run AI Analysis"}
        </button>
      </div>

      {loading && (
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-800/50 rounded-lg" />)}
          <div className="h-64 bg-slate-800/50 rounded-lg" />
        </div>
      )}

      {result && !loading && <AnalysisTabs data={result} />}
    </div>
  );
}