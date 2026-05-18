import { ShieldCheck, MapPin, Heart, Zap, Clock } from "lucide-react";
import { motion } from "motion/react";

const jobTabs = ["All Jobs", "Full-Time", "Contract", "Remote"];

const jobs = [
  {
    company: "NextGen Tech",
    logo: "https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwdGVjaCUyMGxvZ298ZW58MXx8fHwxNzc5MTI1NDEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    verified: true,
    title: "Senior AI Engineer",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "Senior",
    salary: "$140k - $180k",
    skills: ["Python", "TensorFlow", "NLP"]
  },
  {
    company: "Alpha Commerce",
    logo: "https://images.unsplash.com/photo-1669220339242-c12788586902?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcHAlMjBsb2dvfGVufDF8fHx8MTc3OTEyNTQxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    verified: true,
    title: "Lead UX/UI Designer",
    location: "Remote",
    type: "Contract",
    experience: "Lead",
    salary: "$100k - $130k",
    skills: ["Figma", "Prototyping", "Design Systems"]
  },
  {
    company: "GrowthHackers",
    logo: "https://images.unsplash.com/photo-1776243365809-b259876c75a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB0ZWNoJTIwbG9nb3xlbnwxfHx8fDE3NzkxMjU0MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    verified: false,
    title: "Performance Marketer",
    location: "New York, NY",
    type: "Full-time",
    experience: "Mid-level",
    salary: "$90k - $115k",
    skills: ["Google Ads", "Analytics", "SEO"]
  },
  {
    company: "CryptoVault",
    logo: "https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwdGVjaCUyMGxvZ298ZW58MXx8fHwxNzc5MTI1NDEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    verified: true,
    title: "Smart Contract Dev",
    location: "Remote",
    type: "Freelance",
    experience: "Senior",
    salary: "40M - 60M VND",
    skills: ["Solidity", "Rust", "Web3"]
  },
  {
    company: "DataSync",
    logo: "https://images.unsplash.com/photo-1669220339242-c12788586902?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcHAlMjBsb2dvfGVufDF8fHx8MTc3OTEyNTQxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    verified: true,
    title: "Data Scientist",
    location: "London, UK",
    type: "Full-time",
    experience: "Mid-level",
    salary: "£75k - £95k",
    skills: ["Python", "SQL", "Machine Learning"]
  },
  {
    company: "CloudScale",
    logo: "https://images.unsplash.com/photo-1776243365809-b259876c75a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB0ZWNoJTIwbG9nb3xlbnwxfHx8fDE3NzkxMjU0MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    verified: false,
    title: "DevOps Engineer",
    location: "Berlin, DE",
    type: "Full-time",
    experience: "Senior",
    salary: "€85k - €110k",
    skills: ["Kubernetes", "AWS", "CI/CD"]
  }
];

export function LiveJobFeed() {
  return (
    <section className="w-full bg-[#0B0F19]/50 py-20 backdrop-blur-3xl relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
      
      <div className="relative mx-auto max-w-7xl px-6">
        
        {/* Header & Tabs */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0052FF]/10 px-3 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0052FF] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0052FF]"></span>
              </span>
              <span className="text-xs font-semibold text-[#0052FF]">Live Feed Updated 2m ago</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Featured AI-Matched Openings</h2>
          </div>
          
          <div className="flex space-x-2 rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
            {jobTabs.map((tab, idx) => (
              <button
                key={idx}
                className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${
                  idx === 0 
                    ? "bg-[#0B0F19] text-white shadow-lg" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Job Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
            >
              {/* Top Row */}
              <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img src={job.logo} alt={job.company} className="h-12 w-12 rounded-full border border-white/10 object-cover" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-gray-200">{job.company}</h4>
                      {job.verified && <ShieldCheck size={16} className="text-[#10B981]" />}
                    </div>
                    <span className="text-xs text-gray-500">Posted 2h ago</span>
                  </div>
                </div>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#0B0F19] text-gray-400 transition-colors hover:border-rose-500/50 hover:text-rose-500">
                  <Heart size={18} />
                </button>
              </div>

              {/* Middle Row */}
              <div className="mb-6">
                <h3 className="mb-2 text-xl font-bold text-white group-hover:text-[#0052FF] transition-colors">{job.title}</h3>
                <div className="mb-4 flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} />
                    <span>{job.type}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium text-gray-300">{job.type}</span>
                  <span className="rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium text-gray-300">{job.experience}</span>
                </div>
              </div>

              {/* Salary & Skills */}
              <div className="mt-auto">
                <div className="mb-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Estimated Salary</p>
                  <p className="text-2xl font-bold tracking-tight text-[#10B981] drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">{job.salary}</p>
                </div>
                <div className="mb-8 flex flex-wrap gap-2">
                  {job.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1 text-xs text-[#8B5CF6]">
                      {skill}
                    </span>
                  ))}
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0052FF] to-[#8B5CF6] py-3.5 font-semibold text-white shadow-[0_0_15px_rgba(0,82,255,0.3)] transition-all hover:shadow-[0_0_25px_rgba(0,82,255,0.5)] hover:scale-[1.02]">
                    <Zap size={18} />
                    Quick Apply
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-white/5">
            View All Jobs
          </button>
        </div>
      </div>
    </section>
  );
}
