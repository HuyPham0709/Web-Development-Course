import React from "react";
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

export const JobCard: React.FC<JobCardProps> = ({ job, isSaved, onToggleSave, index }) => {
  const navigate = useNavigate();

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

  return (
    <div
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-blue-200 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-500/30"
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
          onClick={(e) => {
            e.stopPropagation(); // Ngăn click nhầm vào card khi bấm save
            onToggleSave(job.id);
          }}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors
            ${
              isSaved
                ? "border-rose-200 bg-rose-50 text-rose-500 dark:bg-rose-950/40"
                : "border-gray-200 bg-gray-50 text-gray-400 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 dark:border-white/10 dark:bg-white/5"
            }
          `}
        >
          <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mb-6">
        <h3
          onClick={() => navigate(`/job/${job.id}`)}
          className="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-600 cursor-pointer transition-colors dark:text-white dark:group-hover:text-blue-400 line-clamp-2"
        >
          {job.title}
        </h3>
        <div className="mb-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5"><MapPin size={16} /><span className="capitalize">{locationName}</span></div>
          <div className="flex items-center gap-1.5"><Clock size={16} /><span className="capitalize">{jobType}</span></div>
        </div>
        <div className="flex gap-2">
          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 capitalize dark:bg-white/10 dark:text-gray-300">{jobType}</span>
          <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 capitalize dark:bg-white/10 dark:text-gray-300">{experience}</span>
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
            onClick={() => navigate(`/job/${job.id}`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg hover:scale-[1.02]"
          >
            <Zap size={18} /> Quick Apply
          </button>
        </div>
      </div>
    </div>
  );
};