"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogDescription 
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "../../components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
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

export const InviteModal = ({ isOpen, onClose, candidate }: InviteModalProps) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [message, setMessage] = useState("");
  
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Lấy danh sách công việc khi mở Modal
  useEffect(() => {
    if (isOpen) {
      const fetchJobs = async () => {
        setIsLoadingJobs(true);
        setError(null);
        try {
          const response = await fetch('http://localhost:5000/api/invitations/jobs', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          const result = await response.json();
          
          if (!response.ok) {
            throw new Error(result.message || "Không thể tải danh sách công việc");
          }

          if (result.success) {
            setJobs(result.data);
          }
        } catch (err: any) {
          setError(err.message || "Lỗi kết nối máy chủ");
        } finally {
          setIsLoadingJobs(false);
        }
      };
      fetchJobs();
    }
  }, [isOpen]);

  // 2. Tự động cập nhật nội dung lời nhắn
  useEffect(() => {
    if (candidate) {
      const job = jobs.find(j => String(j.id) === selectedJobId);
      const jobName = job ? job.title : "[Vị trí tuyển dụng]";
      setMessage(`Chào ${candidate.name}, mình thấy hồ sơ của bạn rất ấn tượng và phù hợp với vị trí ${jobName}. Mời bạn tham khảo và ứng tuyển nhé!`);
    }
  }, [selectedJobId, candidate, jobs]);

  // 3. Xử lý gửi lời mời
  const handleSendInvite = async () => {
    if (!selectedJobId || !candidate) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/invitations/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          candidateId: candidate.id, 
          jobId: selectedJobId, 
          message 
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Gửi lời mời thành công!");
        onClose();
      } else {
        alert("Lỗi: " + (result.message || "Không thể gửi lời mời"));
      }
    } catch (err) {
      alert("Lỗi kết nối hệ thống.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-slate-800 bg-[#111827] text-slate-50">
        <DialogHeader>
          <DialogTitle>Mời ứng tuyển</DialogTitle>
          <DialogDescription className="text-slate-400">
            Gửi lời mời trực tiếp đến ứng viên <span className="text-blue-400">{candidate.name}</span>.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
            <AlertCircle className="h-4 w-4" /> {error}
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
            <Label>Chọn vị trí công việc</Label>
            <Select onValueChange={setSelectedJobId} value={selectedJobId}>
              <SelectTrigger className="bg-slate-950 border-slate-800">
                <SelectValue placeholder={isLoadingJobs ? "Đang tải..." : "Chọn một vị trí..."} />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800">
                {jobs.map(job => (
                  <SelectItem key={job.id} value={String(job.id)}>{job.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Lời nhắn</Label>
            <Textarea 
              className="min-h-[120px] bg-slate-950 border-slate-800"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
          <Button onClick={handleSendInvite} disabled={isSubmitting || !selectedJobId}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Gửi lời mời
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};