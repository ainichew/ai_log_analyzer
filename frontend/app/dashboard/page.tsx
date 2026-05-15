"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, getAnalysisHistory, AnalysisHistory, User } from "@/lib/api";
import Link from "next/link";
import { LogOut, Building2, Shield, Activity, FileText, Users, History } from "lucide-react";
import LogUploader from "@/components/LogUploader";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        
        const history = await getAnalysisHistory();
        setAnalyses(history);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="glass border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-blue-400" />
            <h1 className="text-xl font-bold text-slate-100">DevOps AI Analyzer</h1>
          </div>
          
          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="px-3 py-2 text-sm font-medium text-blue-400 bg-blue-900/20 rounded-lg"
            >
              <Activity className="inline h-4 w-4 mr-2" />
              Analyze
            </Link>
            <Link
              href="/dashboard/history"
              className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <History className="inline h-4 w-4 mr-2" />
              History
            </Link>
            {user.role === "admin" && (
              <Link
                href="/dashboard/users"
                className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Users className="inline h-4 w-4 mr-2" />
                Users
              </Link>
            )}
          </nav>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Building2 className="h-4 w-4" />
              <span>{user.organization_name}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full">
              <Shield className={`h-4 w-4 ${user.role === 'admin' ? 'text-purple-400' : user.role === 'sre' ? 'text-blue-400' : 'text-slate-400'}`} />
              <span className="text-sm capitalize text-slate-300">{user.role}</span>
            </div>
            
            <div className="text-sm text-slate-300">
              {user.full_name}
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-2">Log Analysis</h2>
          <p className="text-slate-400">Upload logs and get AI-powered root cause analysis</p>
        </div>
        
        {/* Recent Analyses Preview */}
        {analyses.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-200">Recent Analyses</h3>
              <Link href="/dashboard/history" className="text-sm text-blue-400 hover:text-blue-300">
                View all →
              </Link>
            </div>
            <div className="grid gap-3">
              {analyses.slice(0, 3).map((analysis) => (
                <Link
                  key={analysis.id}
                  href={`/dashboard/history/${analysis.id}`}
                  className="glass p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <div>
                        <div className="font-medium text-slate-200 capitalize">{analysis.domain}</div>
                        <div className="text-sm text-slate-400">{analysis.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${analysis.status === 'completed' ? 'text-emerald-400' : analysis.status === 'failed' ? 'text-red-400' : 'text-amber-400'}`}>
                        {analysis.status}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Log Uploader Component */}
        <LogUploader onAnalysisComplete={() => window.location.reload()} />
      </main>
    </div>
  );
}