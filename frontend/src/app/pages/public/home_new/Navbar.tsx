import { Bell, Briefcase, ChevronDown } from "lucide-react";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0F19]/70 px-6 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0052FF] to-[#8B5CF6] text-white">
            <Briefcase size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            CoreCareer <span className="bg-gradient-to-r from-[#0052FF] to-[#8B5CF6] bg-clip-text text-transparent">AI</span>
          </span>
        </div>

        {/* Center: Links */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">
            Explore Jobs
          </a>
          <a href="#" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">
            Top Companies
          </a>
          <a href="#" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">
            Skill Matcher
          </a>
          <a href="#" className="flex items-center gap-1 text-sm font-medium text-gray-300 transition-colors hover:text-white">
            Live Dashboard
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]"></span>
            </span>
          </a>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <button className="relative text-gray-300 hover:text-white">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B5CF6] text-[9px] font-bold text-white ring-2 ring-[#0B0F19]">
              3
            </span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3OTA4MjEwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Profile Avatar"
                className="h-9 w-9 rounded-full border border-white/20 object-cover"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#0B0F19] bg-[#10B981]"></span>
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </div>

          <button className="hidden rounded-full bg-white/5 px-5 py-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(0,82,255,0.2)] ring-1 ring-white/10 backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-[0_0_20px_rgba(0,82,255,0.4)] sm:block">
            Post a Job
          </button>
        </div>
      </div>
    </nav>
  );
}
