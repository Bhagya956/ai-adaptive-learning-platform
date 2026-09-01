"use client";

import { useEffect, useState } from "react";
import { GitBranch, Sparkles, CheckCircle, AlertCircle, Lightbulb, Code2 } from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import { PageLoader, InlineLoader } from "@/src/components/ui/LoadingSpinner";

export default function PortfolioAnalyzerPage() {
  const [githubUsername, setGithubUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const toast = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const analyzePortfolio = async () => {
    if (!githubUsername.trim()) {
      toast.warning("Username required", "Enter a GitHub username to analyze.");
      return;
    }
    setAnalyzing(true);
    try {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
      const response = await api.post("/portfolio-analyzer", { githubUsername }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalysis(response.data);
      fetchHistory();
      toast.success("Analysis complete!", "GitHub portfolio has been analyzed.");
    } catch {
      toast.error("Analysis failed", "Could not analyze the GitHub portfolio.");
    } finally {
      setAnalyzing(false);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
      const response = await api.get("/portfolio-analyzer/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(response.data);
      if (response.data.length > 0) setAnalysis(response.data[0]);
    } catch {
      console.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageLoader message="Loading portfolio data…" />;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <GitBranch size={22} className="text-text-primary" />
          Portfolio Analyzer
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Analyze any GitHub profile to understand strengths, weaknesses, and recommendations
        </p>
      </div>

      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle>Analyze GitHub Portfolio</CardTitle>
          <p className="text-sm text-text-secondary mt-0.5">Enter a GitHub username</p>
        </CardHeader>
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="e.g. torvalds, gaearon, Dan Abramov"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && analyzePortfolio()}
              leftIcon={<GitBranch size={14} />}
            />
          </div>
          <Button onClick={analyzePortfolio} loading={analyzing} leftIcon={<Sparkles size={14} />}>
            {analyzing ? "Analyzing…" : "Analyze"}
          </Button>
        </div>
      </Card>

      {analyzing && <InlineLoader message="Fetching GitHub data and running AI analysis…" />}

      {/* Analysis results */}
      {analysis && !analyzing && (
        <div className="space-y-4">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  <GitBranch size={20} className="text-slate-700" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">GitHub User</p>
                  <p className="font-semibold text-text-primary">{analysis.githubUsername}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Code2 size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-text-muted">Repositories</p>
                  <p className="font-semibold text-text-primary">{analysis.totalRepos}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-text-muted mb-2">Top Languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.topLanguages?.map((lang: string, i: number) => (
                    <Badge key={i} variant="default" size="sm">{lang}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <CardTitle>Strengths</CardTitle>
                </div>
              </CardHeader>
              <ul className="space-y-2">
                {analysis.strengths?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-warning" />
                  <CardTitle>Areas to Improve</CardTitle>
                </div>
              </CardHeader>
              <ul className="space-y-2">
                {analysis.weaknesses?.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500" />
                <CardTitle>Recommendations</CardTitle>
              </div>
            </CardHeader>
            <ul className="space-y-2">
              {analysis.recommendations?.map((item: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />{item}
                </li>
              ))}
            </ul>
          </Card>

          {analysis.analysis && (
            <Card className="border-l-4 border-l-brand-500">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-brand-600" />
                  <CardTitle>AI Portfolio Summary</CardTitle>
                </div>
              </CardHeader>
              <p className="text-sm text-text-secondary leading-relaxed">{analysis.analysis}</p>
            </Card>
          )}

          {/* History */}
          {history.length > 1 && (
            <Card>
              <CardHeader><CardTitle>Analysis History</CardTitle></CardHeader>
              <div className="space-y-2">
                {history.slice(1).map((item: any) => (
                  <div key={item._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <GitBranch size={14} className="text-text-muted" />
                      <span className="text-sm text-text-secondary">{item.githubUsername}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="default" size="sm">{item.totalRepos} repos</Badge>
                      <span className="text-xs text-text-muted">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {!analysis && !analyzing && (
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
            <GitBranch size={32} className="text-slate-600" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Analyze a GitHub portfolio</h2>
          <p className="text-text-secondary text-sm max-w-sm mx-auto">
            Enter a GitHub username above to get an AI-powered analysis of their repositories and skills.
          </p>
        </Card>
      )}
    </div>
  );
}
