import { Search, MapPin, Briefcase, Zap, Layers } from "lucide-react";
import { motion } from "motion/react";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden pt-20 pb-32">
      {/* Abstract Background Effects */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden opacity-30">
        <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#0052FF] blur-[150px]"></div>
        <div className="absolute top-[20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[#8B5CF6] blur-[150px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
          
          {/* Left Column: Typography & Intro */}
          <div className="flex flex-col justify-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex max-w-max items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
            >
              <Zap size={16} className="text-[#10B981]" />
              <span className="text-sm font-medium text-gray-300">AI-Powered Skill Matching Engine</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl"
            >
              Next-Gen AI <br />
              <span className="bg-gradient-to-r from-[#0052FF] via-[#8B5CF6] to-[#0052FF] bg-[200%_auto] bg-clip-text text-transparent animate-gradient">
                Career Intelligence.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-lg text-lg text-gray-400"
            >
              Automate your job search. Our futuristic AI analyzes your profile, skills, and potential to instantly connect you with top-tier tech opportunities globally.
            </motion.p>
          </div>

          {/* Right Column: 3D Showcase & Widgets */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative flex h-[500px] w-full items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm"
          >
            {/* Main 3D Placeholder Image */}
            <img
              src="https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMDNkJTIwbmVvbiUyMGdlb21ldHJ5fGVufDF8fHx8MTc3OTEyNTQxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="3D Abstract Geometry"
              className="absolute inset-0 h-full w-full rounded-3xl object-cover opacity-60 mix-blend-screen"
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-[#0B0F19] to-transparent"></div>

            {/* Floating Widget 1: Job Stats */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-8 top-12 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 shadow-xl backdrop-blur-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0052FF]/20 text-[#0052FF]">
                <Briefcase size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">14,250+</p>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Active Tech Jobs</p>
              </div>
            </motion.div>

            {/* Floating Widget 2: Match Rate */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -right-6 top-1/2 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 shadow-xl backdrop-blur-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#10B981]/20 text-[#10B981]">
                <Zap size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">98.5%</p>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">AI Match Rate</p>
              </div>
            </motion.div>

            {/* Floating Widget 3: Live Feed */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 left-1/2 w-64 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-4 shadow-xl backdrop-blur-xl"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400">Live Applications</span>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]"></span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzkxMjU0MTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Applicant"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">Alex M. applied to</p>
                  <p className="text-xs text-[#8B5CF6]">Senior Frontend Role</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Search Engine Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="relative z-20 mt-16 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="flex items-center gap-3 rounded-2xl bg-[#0B0F19]/50 px-4 py-3 lg:col-span-2">
              <Search className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search Keywords, Skills, or Roles..."
                className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none"
              />
            </div>
            
            <div className="flex items-center gap-3 rounded-2xl bg-[#0B0F19]/50 px-4 py-3">
              <Layers className="text-gray-400" size={20} />
              <select className="w-full appearance-none bg-transparent text-sm text-gray-300 outline-none">
                <option value="" className="bg-[#0B0F19]">All Categories</option>
                <option value="engineering" className="bg-[#0B0F19]">Engineering</option>
                <option value="design" className="bg-[#0B0F19]">Design</option>
                <option value="data" className="bg-[#0B0F19]">Data Science</option>
              </select>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[#0B0F19]/50 px-4 py-3">
              <MapPin className="text-gray-400" size={20} />
              <select className="w-full appearance-none bg-transparent text-sm text-gray-300 outline-none">
                <option value="" className="bg-[#0B0F19]">Any Location</option>
                <option value="remote" className="bg-[#0B0F19]">Remote</option>
                <option value="ny" className="bg-[#0B0F19]">New York</option>
                <option value="sf" className="bg-[#0B0F19]">San Francisco</option>
              </select>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-[#0B0F19]/50 px-4 py-3">
              <span className="text-gray-400 font-medium">$</span>
              <select className="w-full appearance-none bg-transparent text-sm text-gray-300 outline-none">
                <option value="" className="bg-[#0B0F19]">Salary Range</option>
                <option value="50k" className="bg-[#0B0F19]">$50k - $80k</option>
                <option value="80k" className="bg-[#0B0F19]">$80k - $120k</option>
                <option value="120k" className="bg-[#0B0F19]">$120k+</option>
              </select>
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0052FF] to-[#8B5CF6] px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] lg:col-span-1">
              <Zap size={18} />
              Find Match
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
