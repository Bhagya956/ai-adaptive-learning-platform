"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  FileText, Upload, CheckCircle, AlertCircle, Lightbulb,
  Target, Briefcase, Clock, CloudUpload, Star,
} from "lucide-react";
import api from "@/src/services/api";
import { useToast } from "@/src/components/ui/Toast";
import Button from "@/src/components/ui/Button";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import ProgressBar from "@/src/components/ui/ProgressBar";

interface ResumeAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  suggestions: string[];
  recommendedRoles: string[];
}

function ScoreGauge({ score }: { score: number }) {
  const color =
    score >= 75 ? "text-success" : score >= 50 ? "text-warning" : "text-danger";
  const label =
    score >= 75 ? "Strong" : score >= 50 ? "Average" : "Needs Work";
  const barColor =
    score >= 75 ? "success" : score >= 50 ? "warning" : "danger";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`text-6xl font-bold tabular-nums ${color}`}>{score}</div>
      <div className="text-text-muted text-sm">/100</div>
      <Badge
        variant={score >= 75 ? "success" : score >= 50 ? "warning" : "danger"}
        size="md"
      >
        <Star size={11} className="mr-1" />
        {label}
      </Badge>
      <div className="w-full max-w-xs">
        <ProgressBar value={score} color={barColor} size="lg" showLabel />
      </div>
    </div>
  );
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Invalid file", "Only PDF files are supported.");
      return;
    }
    setFile(f);
    setAnalysis(null);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning("No file selected", "Please upload a PDF resume first.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const token = JSON.parse(localStorage.getItem("auth-storage") || "{}")?.state?.token;
      const response = await api.post("/resume/analyze", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let raw: string = response.data.analysis;
      raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      setAnalysis(JSON.parse(raw));
      toast.success("Analysis complete!", "Your resume has been analyzed.");
    } catch {
      toast.error("Analysis failed", "Could not analyze the resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <FileText size={22} className="text-blue-600" />
            Resume Analyzer
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Upload your resume and get an AI-powered ATS score with improvement suggestions
          </p>
        </div>
        <Link href="/resume/history">
          <Button variant="secondary" size="sm" leftIcon={<Clock size={14} />}>History</Button>
        </Link>
      </div>

      {/* Upload zone */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
          <p className="text-sm text-text-secondary mt-0.5">PDF format only • Max 10MB</p>
        </CardHeader>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0] ?? null); }}
          onClick={() => fileRef.current?.click()}
          className={[
            "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-150",
            dragOver
              ? "border-brand-500 bg-brand-50"
              : file
              ? "border-success bg-success-bg"
              : "border-border hover:border-brand-300 hover:bg-brand-50",
          ].join(" ")}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-col items-center gap-3">
            {file ? (
              <CheckCircle size={36} className="text-success" />
            ) : (
              <CloudUpload size={36} className="text-text-muted" />
            )}
            {file ? (
              <div>
                <p className="font-semibold text-success">{file.name}</p>
                <p className="text-xs text-text-muted mt-0.5">Click to replace</p>
              </div>
            ) : (
              <div>
                <p className="font-medium text-text-primary">
                  Drop your PDF here, or <span className="text-brand-600">browse</span>
                </p>
                <p className="text-xs text-text-muted mt-1">Only PDF files supported</p>
              </div>
            )}
          </div>
        </div>
        {file && (
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleUpload}
              loading={loading}
              leftIcon={<Upload size={14} />}
              size="lg"
            >
              {loading ? "Analyzing…" : "Analyze Resume"}
            </Button>
          </div>
        )}
      </Card>

      {/* Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Score */}
          <Card>
            <CardHeader>
              <CardTitle>Resume Score</CardTitle>
            </CardHeader>
            <ScoreGauge score={analysis.score} />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-success" />
                  <CardTitle>Strengths</CardTitle>
                </div>
              </CardHeader>
              <ul className="space-y-2">
                {analysis.strengths?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-warning" />
                  <CardTitle>Areas to Improve</CardTitle>
                </div>
              </CardHeader>
              <ul className="space-y-2">
                {analysis.weaknesses?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Missing skills */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-danger" />
                  <CardTitle>Missing Skills</CardTitle>
                </div>
              </CardHeader>
              <div className="flex flex-wrap gap-2">
                {analysis.missingSkills?.map((skill, i) => (
                  <Badge key={i} variant="danger" size="md">{skill}</Badge>
                ))}
              </div>
            </Card>

            {/* Suggestions */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb size={16} className="text-amber-500" />
                  <CardTitle>Suggestions</CardTitle>
                </div>
              </CardHeader>
              <ul className="space-y-2">
                {analysis.suggestions?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Recommended roles */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-brand-600" />
                <CardTitle>Recommended Roles</CardTitle>
              </div>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {analysis.recommendedRoles?.map((role, i) => (
                <Badge key={i} variant="brand" size="md">{role}</Badge>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
