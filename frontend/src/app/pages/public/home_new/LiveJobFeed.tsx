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
    logo: "https://images.unsplash.com/photo-1669220339242-c12788586902?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcHAlMjBsb2dvfGVufDF8fHx8MT79MTI1NDE0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
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
    <section className="w-full bg-white py-20 relative transition-colors duration-300 dark:bg-[#0B0F19]">
      {/* Tinh chỉnh mask lưới grid mờ để hoạt động ăn khớp trên nền giao diện tối */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50 dark:opacity-10 dark:bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]"></div>
      
      <div className="relative mx-auto max-w-7xl px-6">
        
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            {/* Tag Live Update: Thắt chặt dải màu tối dark:bg-blue-950/40 */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 dark:bg-blue-950/40 dark:border-blue-900/50">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-600 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
              </span>
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Live Feed Updated 2m ago</span>
            </div>
            {/* Tiêu đề mục mở rộng sang dark:text-white */}
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Featured AI-Matched Openings</h2>
          </div>
          
          {/* Thanh chuyển đổi Tab (Filter Job Tabs): dark:border-white/10 dark:bg-white/5 */}
          <div className="flex space-x-2 rounded-2xl border border-gray-200 bg-gray-50 p-1 dark:border-white/10 dark:bg-white/5">
            {jobTabs.map((tab, idx) => (
              <button
                key={idx}
                className={`rounded-xl px-5 py-2 text-sm font-medium transition-all ${
                  idx === 0 
                    ? "bg-white text-blue-600 shadow-sm border border-gray-100 dark:bg-blue-600 dark:text-white dark:border-transparent" 
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:border-blue-200 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-500/30"
            >
              {/* Thẻ Job Card riêng biệt: Cấu trúc kính mờ quy chuẩn dark:border-white/10 dark:bg-white/5 */}
              <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img src={job.logo} alt={job.company} className="h-12 w-12 rounded-full border border-gray-100 object-cover dark:border-white/10" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      {/* Thêm chữ trắng cho tên Công ty */}
                      <h4 className="font-semibold text-gray-900 dark:text-white">{job.company}</h4>
                      {job.verified && <ShieldCheck size={16} className="text-emerald-500" />}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Posted 2h ago</span>
                  </div>
                </div>
                {/* Nút lưu yêu thích (Heart icon button) dạng dark mode */}
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-400 transition-colors hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-rose-950/40">
                  <Heart size={18} />
                </button>
              </div>

              <div className="mb-6">
                {/* Tiêu đề vị trí công việc chuyển trắng ở dark mode */}
                <h3 className="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">{job.title}</h3>
                <div className="mb-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
                  {/* Badge dạng nhỏ: dark:bg-white/10 dark:text-gray-300 */}
                  <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">{job.type}</span>
                  <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">{job.experience}</span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="mb-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Estimated Salary</p>
                  <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{job.salary}</p>
                </div>
                {/* Dải Skill tag màu tím: làm dịu lại ở dark mode với dark:bg-purple-950/40 */}
                <div className="mb-8 flex flex-wrap gap-2">
                  {job.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs text-purple-700 dark:border-purple-500/30 dark:bg-purple-950/40 dark:text-purple-300">
                      {skill}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 py-3.5 font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg hover:scale-[1.02]">
                    <Zap size={18} />
                    Quick Apply
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Nút View All Jobs bên dưới */}
        <div className="mt-12 text-center">
          <button className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 hover:border-gray-400 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10">
            View All Jobs
          </button>
        </div>
      </div>
    </section>
  );
}