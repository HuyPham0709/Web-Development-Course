import { ShieldCheck, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

const employers = [
  {
    name: "NextGen Tech",
    logo: "https://images.unsplash.com/photo-1760037028517-e5cc6e3ebd3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwdGVjaCUyMGxvZ298ZW58MXx8fHwxNzc5MTI1NDEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    bg: "from-[#0052FF] to-blue-800",
    desc: "Pioneering AI solutions for the modern workforce. Join our rapid growth.",
    tech: ["React", "Python", "AWS"]
  },
  {
    name: "Alpha Commerce",
    logo: "https://images.unsplash.com/photo-1669220339242-c12788586902?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcHAlMjBsb2dvfGVufDF8fHx8MTc3OTEyNTQxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    bg: "from-[#8B5CF6] to-purple-900",
    desc: "Global e-commerce leaders building next-gen marketplace infrastructure.",
    tech: ["Node.js", "GraphQL", "GCP"]
  },
  {
    name: "GrowthHackers",
    logo: "https://images.unsplash.com/photo-1776243365809-b259876c75a1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjB0ZWNoJTIwbG9nb3xlbnwxfHx8fDE3NzkxMjU0MTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    bg: "from-[#10B981] to-emerald-900",
    desc: "Data-driven marketing tech platform empowering B2B enterprises.",
    tech: ["Vue", "Ruby", "Docker"]
  }
];

export function TopEmployers() {
  return (
    <section className="w-full py-24 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#8B5CF6]/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Top Verified Employers Showcase</h2>
          <p className="mt-3 text-gray-400">Discover premium hubs from the world's most innovative tech giants.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {employers.map((emp, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -10 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F19] shadow-2xl transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
            >
              {/* Card Banner */}
              <div className={`h-32 w-full bg-gradient-to-br ${emp.bg} opacity-80 backdrop-blur-3xl group-hover:opacity-100 transition-opacity`}></div>
              
              {/* Content Box */}
              <div className="relative px-6 pb-8 pt-12">
                {/* Floating Logo */}
                <div className="absolute -top-10 left-6 h-20 w-20 rounded-2xl border-4 border-[#0B0F19] bg-white p-1 shadow-xl">
                  <img src={emp.logo} alt={emp.name} className="h-full w-full rounded-xl object-cover" />
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-white">{emp.name}</h3>
                  <ShieldCheck size={20} className="text-[#10B981] drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </div>
                
                <p className="mb-6 text-sm text-gray-400 line-clamp-2">{emp.desc}</p>
                
                {/* Tech Stack */}
                <div className="mb-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Tech Stack</p>
                  <div className="flex flex-wrap gap-2">
                    {emp.tech.map((t, tIdx) => (
                      <span key={tIdx} className="rounded-lg bg-white/5 px-3 py-1 text-xs font-medium text-gray-300 border border-white/10">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* CTA */}
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 border border-white/5 hover:border-white/20">
                  View Hub & Jobs
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
