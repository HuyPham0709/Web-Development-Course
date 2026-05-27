import React, { memo, useRef } from "react";
import { ShieldCheck, MapPin, Heart, Zap, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IJob } from "../../../types/job";
import { formatRelativeTime } from "../../../../utils/format";

interface JobCardProps {
  job: IJob;
  isSaved: boolean;
  onToggleSave: (jobId: number) => void;
  index: number;
}

export const JobCard = memo(({ job, isSaved, onToggleSave, index }: JobCardProps) => {
  const navigate = useNavigate();
  
  const clickStart = useRef<{ x: number; y: number } | null>(null);

  const companyName = job.Company?.name || job.company_name || "Company";
  const companyLogo = job.Company?.logo_url || job.logo_url || "https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e";
  const isVerified = job.Company?.is_verified ?? job.is_verified ?? false;
  const locationName = job.Location?.name || job.location_name || job.location || "Remote";
  const jobType = job.job_type || job.type || "Full-time";
  const experience = job.experience_level || job.experience || "Not specified";
  const formattedSalary = job.salary_min && job.salary_max
    ? `$${job.salary_min / 1000}k - $${job.salary_max / 1000}k`
    : "Negotiable";

  let skillList: string[] = ["Tech"];
  if (Array.isArray(job.Skills)) {
    skillList = job.Skills.map((s) => s.name);
  } else if (Array.isArray(job.skills)) {
    skillList = job.skills.map((s: any) => s.name || s);
  } else if (typeof job.skills === "string") {
    skillList = job.skills.split(",").map((s) => s.trim());
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    clickStart.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!clickStart.current) return;
    
    const diffX = Math.abs(e.clientX - clickStart.current.x);
    const diffY = Math.abs(e.clientY - clickStart.current.y);
    
    if (diffX < 5 && diffY < 5) {
      navigate(`/job/${job.id}`);
    }
    clickStart.current = null;
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      /* SỬA ĐỔI CHÍNH Ở ĐÂY:
        1. Đổi "group" -> "group/card" để cô lập sự kiện hover text.
        2. Đổi "transition-colors duration-200" -> "transition-all duration-300 ease-out" giúp chuyển cảnh phóng to mượt mà.
        3. Thêm "hover:scale-[1.02] hover:shadow-lg dark:hover:shadow-black/30" làm card to lên một chút và đổ bóng sâu hơn khi hover.
      */
      className="cursor-pointer group/card relative flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg hover:border-blue-400 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-500/50 dark:hover:bg-white/10 dark:hover:shadow-black/30"
    >
      <div className="mb-6 flex items-start justify-between">
        <div className="flex items-center gap-4">
          <img src={companyLogo} alt={companyName} className="h-12 w-12 rounded-full border border-gray-100 object-cover dark:border-white/10" />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-gray-900 dark:text-white">{companyName}</h4>
              {isVerified && <ShieldCheck size={16} className="text-emerald-500" />}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatRelativeTime(job.created_at)}
            </span>
          </div>
        </div>
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => {
            e.stopPropagation();
            onToggleSave(job.id);
          }}
          onClick={(e) => e.stopPropagation()}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-200
            ${
              isSaved
                ? "border-rose-200 bg-rose-50 text-rose-500 dark:bg-rose-950/40"
                : "border-gray-200 bg-gray-50 text-gray-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-rose-500/10"
            }
          `}
        >
          <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mb-6">
        {/* SỬA ĐỔI CHÍNH Ở ĐÂY:
          Đổi "group-hover:" -> "group-hover/card:" để chữ chỉ xanh khi chính card này được hover.
        */}
        <h3 
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => {
            e.stopPropagation();
            navigate(`/job/${job.id}`);
          }}
          onClick={(e) => e.stopPropagation()}
          className="mb-2 text-xl font-bold text-gray-900 transition-colors hover:text-blue-600 group-hover/card:text-blue-600 dark:text-white dark:hover:text-blue-400 dark:group-hover/card:text-blue-400 line-clamp-2 cursor-pointer"
        >
          {job.title}
        </h3>
        <div className="mb-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5"><MapPin size={16} /><span className="capitalize">{locationName}</span></div>
          <div className="flex items-center gap-1.5"><Clock size={16} /><span className="capitalize">{jobType}</span></div>
        </div>
        <div className="flex gap-2">
          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600 dark:bg-white/10 dark:text-gray-300">{jobType}</span>
          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600 dark:bg-white/10 dark:text-gray-300">{experience}</span>
        </div>
      </div>

      <div className="mt-auto">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Estimated Salary</p>
          <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{formattedSalary}</p>
        </div>
        <div className="mb-8 flex flex-wrap gap-2">
          {skillList.slice(0, 4).map((skill, sIdx) => (
            <span key={sIdx} className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700 dark:border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-300">{skill}</span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => {
              e.stopPropagation();
              navigate(`/job/${job.id}`);
            }}
            onClick={(e) => e.stopPropagation()}
            className="group/btn flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 font-semibold text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
          >
            <Zap size={18} className="transition-colors duration-200 group-hover/btn:text-yellow-300" /> 
            Quick Apply
          </button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.isSaved === nextProps.isSaved && prevProps.job.id === nextProps.job.id;
});