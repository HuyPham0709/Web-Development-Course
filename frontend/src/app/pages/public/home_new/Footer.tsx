import { Briefcase, Twitter, Linkedin, Github, Instagram, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#0B0F19] pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0052FF] to-[#8B5CF6] text-white shadow-[0_0_15px_rgba(0,82,255,0.4)]">
                <Briefcase size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                CoreCareer <span className="bg-gradient-to-r from-[#0052FF] to-[#8B5CF6] bg-clip-text text-transparent">AI</span>
              </span>
            </div>
            <p className="mb-8 text-sm text-gray-400 max-w-sm">
              The next-generation AI career intelligence platform. Connecting top global talent with leading tech companies through smart matching.
            </p>
            
            <div className="relative max-w-sm">
              <input 
                type="email" 
                placeholder="Enter email for job alerts..." 
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-12 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/50"
              />
              <button className="absolute right-1 top-1 bottom-1 flex w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#0052FF] to-[#8B5CF6] text-white hover:opacity-90 transition-opacity">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Links: Candidates */}
          <div>
            <h4 className="mb-6 text-sm font-bold text-white uppercase tracking-wider">Candidates</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-[#0052FF] transition-colors">Explore Jobs</a></li>
              <li><a href="#" className="hover:text-[#0052FF] transition-colors">AI Skill Matcher</a></li>
              <li><a href="#" className="hover:text-[#0052FF] transition-colors">Salary Insights</a></li>
              <li><a href="#" className="hover:text-[#0052FF] transition-colors">Career Resources</a></li>
            </ul>
          </div>

          {/* Links: Employers */}
          <div>
            <h4 className="mb-6 text-sm font-bold text-white uppercase tracking-wider">Employers</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-[#8B5CF6] transition-colors">Post a Job</a></li>
              <li><a href="#" className="hover:text-[#8B5CF6] transition-colors">Search Talent</a></li>
              <li><a href="#" className="hover:text-[#8B5CF6] transition-colors">Enterprise Hub</a></li>
              <li><a href="#" className="hover:text-[#8B5CF6] transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Links: Company */}
          <div>
            <h4 className="mb-6 text-sm font-bold text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press & Media</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>

        </div>

        <div className="mt-20 flex flex-col items-center justify-between border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">© 2026 CoreCareer AI. All rights reserved.</p>
          
          <div className="mt-4 flex space-x-4 md:mt-0">
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-[#0052FF] hover:text-white">
              <Twitter size={18} />
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-[#0052FF] hover:text-white">
              <Linkedin size={18} />
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-white/10 hover:text-white">
              <Github size={18} />
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all hover:bg-gradient-to-tr hover:from-orange-500 hover:via-pink-500 hover:to-purple-500 hover:text-white">
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
