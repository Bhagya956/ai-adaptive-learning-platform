"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import api from "@/src/services/api";
import Card, { CardHeader, CardTitle } from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { useToast } from "@/src/components/ui/Toast";

export default function CreateMentorPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.warning("All fields required", "Please fill in name, email and password.");
      return;
    }
    setCreating(true);
    try {
      await api.post("/organization/mentors", { name: name.trim(), email: email.trim(), password });
      toast.success("Mentor created!", `${name} can now log in and use the Educator module.`);
      router.push("/organization/mentors");
    } catch (e: any) {
      toast.error("Failed", e?.response?.data?.message ?? "Could not create mentor.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => router.back()}>
        Back to Mentors
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Users size={22} className="text-indigo-600" />
          Add Mentor
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Create a mentor account. The mentor will be assigned the Educator / Mentor role automatically.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>Mentor Details</CardTitle></CardHeader>
        <div className="space-y-4">
          <Input label="Full Name" placeholder="e.g. Dr. Jane Smith" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email Address" type="email" placeholder="mentor@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Temporary Password" type="password" placeholder="Set an initial password" value={password} onChange={(e) => setPassword(e.target.value)}
            hint="The mentor can update their password after logging in." onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
        </div>
      </Card>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <strong>Note:</strong> The created account will have role <code className="bg-blue-100 px-1 rounded">educator</code> and will be tied to your organization. The mentor logs in at the regular login page and reaches the Educator dashboard.
      </div>

      <Button onClick={handleCreate} loading={creating} className="w-full" size="lg">
        {creating ? "Creating mentor…" : "Create Mentor"}
      </Button>
    </div>
  );
}
