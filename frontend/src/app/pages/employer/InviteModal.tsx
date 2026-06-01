"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import { Label } from "../../components/ui/label";
import { Send, Loader2, AlertCircle } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: string | number;
    name: string;
    title: string;
    avatar?: string;
  } | null;
}

interface Job {
  id: string | number;
  title: string;
}

export const InviteModal = ({
  isOpen,
  onClose,
  candidate,
}: InviteModalProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [message, setMessage] = useState("");

  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setError(null);
      setSelectedJobId("");
    }
  }, [isOpen]);

  // 1. Fetch jobs when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchJobs = async () => {
        setIsLoadingJobs(true);
        setError(null);
        try {
          const response = await fetch(
            "http://localhost:5000/api/invitations/jobs",
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
            },
          );

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || "Unable to load the to-do list.");
          }

          if (result.success) {
            setJobs(result.data);
          }
        } catch (err: any) {
          setError(err.message || "Unable to connect to the server");
        } finally {
          setIsLoadingJobs(false);
        }
      };
      fetchJobs();
    }
  }, [isOpen]);

  // 2. Automatically update template message text (Đổi sang tiếng Việt để đồng bộ dự án)
  useEffect(() => {
    if (candidate) {
      const job = jobs.find((j) => String(j.id) === selectedJobId);
      const jobName = job ? job.title : "[Job opening]";
      setMessage(
        `Hello ${candidate.name}, I find your profile very impressive and I think you are a great fit for the ${jobName} position. I would appreciate it if you would consider applying for this job!`,
      );
    }
  }, [selectedJobId, candidate, jobs]);

  // 3. Handle Send Invite Action (Đã chỉnh sửa phần hứng lỗi 400 động từ Backend)
  const handleSendInvite = async () => {
    if (!selectedJobId || !candidate) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(
        "http://localhost:5000/api/invitations/send",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            candidateId: candidate.id,
            jobId: selectedJobId,
            message,
          }),
        },
      );

      const result = await response.json();

      if (response.ok && result.success) {
        alert(result.message || "Job invitation sent successfully.!");
        onClose();
      } else {
        // Đã tối ưu: Lấy trực tiếp thông báo lỗi cụ thể (ví dụ: "Bạn đã gửi lời mời trước đó rồi...")
        // từ Backend gửi về thay vì hardcode chữ tiếng Anh cố định
        setSubmitError(result.message || "Unable to send job invitation.");
      }
    } catch (err) {
      setSubmitError("An error occurred while sending the job invitation. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-slate-800 bg-[#111827] text-slate-50">
        <DialogHeader>
          <DialogTitle>Invite Candidate for Job</DialogTitle>
          <DialogDescription className="text-slate-400">
            Send a direct invitation to the candidate{" "}
            <span className="text-blue-400">{candidate.name}</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Jobs Fetch Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        {/* Submission Error UI */}
        {submitError && (
          <div className="flex items-start gap-2 p-3 text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg animate-in fade-in zoom-in-95 duration-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>{submitError}</div>
          </div>
        )}

        <div className="grid gap-6 py-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
            <Avatar className="h-12 w-12">
              <AvatarImage src={candidate.avatar} />
              <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{candidate.name}</div>
              <div className="text-sm text-slate-400">{candidate.title}</div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Choose the job position you want to invite the candidate for</Label>
            <Select
              onValueChange={(value) => setSelectedJobId(value)} // 💡 Only need to update the job ID, no need to setSubmitError(null) anymore
              value={selectedJobId}
            >
              <SelectTrigger className="bg-slate-950 border-slate-800">
                <SelectValue
                  placeholder={
                    isLoadingJobs
                      ? "Loading..."
                      : "Select a job position..."
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={String(job.id)}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Message Content</Label>
            <Textarea
              className="min-h-[120px] bg-slate-950 border-slate-800"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSendInvite}
            disabled={isSubmitting || !selectedJobId}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
