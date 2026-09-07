import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, Award, CheckCircle2, UserCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface FieldVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: {
    id: string;
    title: string;
    location_text?: string | null;
  } | null;
  onSuccess?: () => void;
}

export function FieldVerificationModal({
  isOpen,
  onClose,
  challenge,
  onSuccess,
}: FieldVerificationModalProps) {
  const [volunteerName, setVolunteerName] = useState("");
  const [collegeName, setCollegeName] = useState("Ranchi University");
  const [verificationStatus, setVerificationStatus] = useState<"verified_active" | "verified_resolved" | "work_in_progress">("verified_active");
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [auditNotes, setAuditNotes] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!challenge) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!volunteerName.trim() || !auditNotes.trim()) {
      toast.error("Please enter student volunteer name and ground audit notes.");
      return;
    }

    setIsSubmitting(true);
    const newVerification = {
      id: "verify-" + Date.now(),
      challenge_id: challenge.id,
      challenge_title: challenge.title,
      volunteer_name: volunteerName.trim(),
      college_name: collegeName.trim(),
      status: verificationStatus,
      quality_rating: qualityRating,
      audit_notes: auditNotes.trim(),
      credits_earned: 50,
      certificate_id: "CERT-JANSETU-" + Math.floor(100000 + Math.random() * 900000),
      verified_at: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    // Save to Supabase backend table
    try {
      await (supabase.from("field_verifications" as any) as any).insert({
        challenge_id: challenge.id,
        challenge_title: challenge.title,
        volunteer_name: volunteerName.trim(),
        audit_notes: auditNotes.trim(),
        credits_earned: 50,
        certificate_id: newVerification.certificate_id,
      });
    } catch (e) {
      console.error("Supabase verification insert notice:", e);
    }

    // Always store in localStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem("jansetu_field_verifications") || "[]");
      stored.unshift(newVerification);
      localStorage.setItem("jansetu_field_verifications", JSON.stringify(stored));

      toast.success("🏅 Ground Field Verification submitted! +50 Student Volunteer Credits earned.");
      setShowCertificate(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Failed to save field verification.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        {!showCertificate ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider mb-1">
                <ShieldCheck className="size-4" /> Student Civic Volunteer Corps
              </div>
              <DialogTitle className="text-xl font-bold">Ground Audit & Field Verification</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Verify ground status for: <strong className="text-foreground">{challenge.title}</strong>
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Student Volunteer Name</label>
                  <Input
                    value={volunteerName}
                    onChange={(e) => setVolunteerName(e.target.value)}
                    placeholder="e.g. Priya Kumari"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">College / University</label>
                  <Input
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. Ranchi University"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Observed Ground Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerificationStatus("verified_active")}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      verificationStatus === "verified_active"
                        ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ⚠️ Active Issue Confirmed
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationStatus("work_in_progress")}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      verificationStatus === "work_in_progress"
                        ? "border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🚜 Work In Progress
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationStatus("verified_resolved")}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                      verificationStatus === "verified_resolved"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    ✅ Verified Fixed
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Ground Quality & Satisfaction Score (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setQualityRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`size-6 ${
                          star <= qualityRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-foreground ml-2">{qualityRating} / 5 Rating</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">
                  Field Audit Notes & Evidence Summary
                </label>
                <Textarea
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="Describe what you inspected on ground (e.g., Streetlight replaced, pothole filled cleanly, drainage cleared)..."
                  className="min-h-20 resize-y text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" className="gap-1.5 font-semibold bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isSubmitting}>
                  <Award className="size-4" />
                  {isSubmitting ? "Submitting Audit..." : "Submit Audit & Get Certificate"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <Award className="size-10 animate-bounce" />
            </div>
            
            <div className="rounded-2xl border-2 border-emerald-500/30 bg-card p-6 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Official Digital Badge
              </div>
              <p className="text-xs uppercase tracking-widest text-emerald-600 font-extrabold mb-1">JanSetu Civic Commons</p>
              <h3 className="text-lg font-bold text-foreground">Certificate of Civic Volunteer Audit</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                This digital badge certifies that <strong className="text-foreground">{volunteerName}</strong> ({collegeName}) has successfully verified ground resolution for:
              </p>
              <p className="mt-2 font-semibold text-xs text-primary bg-primary/5 p-2 rounded-lg">
                "{challenge.title}"
              </p>
              <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground border-t pt-3">
                <span>Verified: <strong>50 NSS Credits Earned</strong></span>
                <span>Audit Date: {new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <Button onClick={onClose} className="w-full font-semibold">
              Done & Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

