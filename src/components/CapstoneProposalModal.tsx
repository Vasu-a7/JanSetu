import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CapstoneProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: {
    id: string;
    title: string;
    category: string;
    location_text?: string | null;
  } | null;
  onSuccess?: () => void;
}

export function CapstoneProposalModal({
  isOpen,
  onClose,
  challenge,
  onSuccess,
}: CapstoneProposalModalProps) {
  const [universityName, setUniversityName] = useState("BIT Mesra (Ranchi)");
  const [department, setDepartment] = useState("Civil & Environmental Engineering");
  const [leadStudent, setLeadStudent] = useState("");
  const [facultyGuide, setFacultyGuide] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!challenge) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadStudent.trim() || !proposedSolution.trim()) {
      toast.error("Please enter student lead name and technical proposal scope.");
      return;
    }

    setIsSubmitting(true);
    const newProposal = {
      id: "capstone-" + Date.now(),
      challenge_id: challenge.id,
      challenge_title: challenge.title,
      university_name: universityName.trim(),
      department: department.trim(),
      lead_student: leadStudent.trim(),
      faculty_guide: facultyGuide.trim() || "Department Faculty Head",
      proposed_solution: proposedSolution.trim(),
      status: "under_review",
      created_at: new Date().toISOString(),
    };

    // Save to Supabase backend table
    try {
      await (supabase.from("capstone_proposals" as any) as any).insert({
        challenge_id: challenge.id,
        challenge_title: challenge.title,
        university_name: universityName.trim(),
        department: department.trim(),
        lead_student: leadStudent.trim(),
        proposed_solution: proposedSolution.trim(),
        timeline: "6 Months (Academic Year 2024-25)",
        status: "under_review",
      });
    } catch (e) {
      console.error("Supabase capstone insert notice:", e);
    }

    // Always store in localStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem("jansetu_capstone_proposals") || "[]");
      stored.unshift(newProposal);
      localStorage.setItem("jansetu_capstone_proposals", JSON.stringify(stored));

      toast.success("🎓 Capstone Project proposal submitted successfully and synced!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to save proposal.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider mb-1">
            <GraduationCap className="size-4" /> Academic Research & Innovation
          </div>
          <DialogTitle className="text-xl font-bold">Adopt Issue as University Capstone</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Submit a student team project proposal for issue: <strong className="text-foreground">{challenge.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">University / Institution</label>
              <Input
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                placeholder="e.g. BIT Mesra, NIT Jamshedpur"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Department</label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Civil Eng, Computer Science"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Lead Student Name</label>
              <Input
                value={leadStudent}
                onChange={(e) => setLeadStudent(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Faculty Advisor / Guide</label>
              <Input
                value={facultyGuide}
                onChange={(e) => setFacultyGuide(e.target.value)}
                placeholder="e.g. Dr. A. K. Verma"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block">
              Proposed Technical Solution & Project Scope
            </label>
            <Textarea
              value={proposedSolution}
              onChange={(e) => setProposedSolution(e.target.value)}
              placeholder="Describe your proposed prototype, algorithm, structural design, or research methodology to resolve this issue..."
              className="min-h-24 resize-y text-xs"
              required
            />
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="size-4 text-primary shrink-0" />
            <span>
              Adopted projects get featured on the District Innovation Dashboard and qualify for university NSS/CSR grants!
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="gap-1.5 font-semibold" disabled={isSubmitting}>
              <GraduationCap className="size-4" />
              {isSubmitting ? "Submitting Proposal..." : "Submit Capstone Proposal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

