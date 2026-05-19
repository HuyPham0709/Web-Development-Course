import { Briefcase, Twitter, Linkedin, Github, Instagram, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white pt-20 pb-10 transition-colors duration-300 dark:border-white/10 dark:bg-[#0B0F19]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
          
          {/* Brand & Newsletter Section */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md">
                <Briefcase size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                CoreCareer <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">AI</span>
              </span>
            </div>
            <p className="mb-8 text-sm text-gray-600 dark:text-gray-400 max-w-sm">
              The next-generation AI career intelligence platform. Connecting top global talent with leading tech companies through smart matching.
            </p>
            
            {/* Input Email với hiệu ứng kính mờ ở Dark Mode */}
            <div className="relative max-w-sm">
              <input 
                type="email" 
                placeholder="Enter email for job alerts..." 
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-12 text-sm text-gray-900 placeholder-gray-400 outline-none transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500 dark:focus:border-purple-400 dark:focus:ring-purple-400/50"
              />
              <button className="absolute right-1 top-1 bottom-1 flex w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 transition-opacity">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="mb-6 text-sm font-bold text-gray-900 uppercase tracking-wider dark:text-white/90">Candidates</h4>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Explore Jobs</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">AI Skill Matcher</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Salary Insights</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Career Resources</a></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="mb-6 text-sm font-bold text-gray-900 uppercase tracking-wider dark:text-white/90">Employers</h4>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Post a Job</a></li>
              <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Search Talent</a></li>
              <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Enterprise Hub</a></li>
              <li><a href="#" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Links Column 3 */}
          <div>
            <h4 className="mb-6 text-sm font-bold text-gray-900 uppercase tracking-wider dark:text-white/90">Company</h4>
            <ul className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Press & Media</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact Support</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="mt-20 flex flex-col items-center justify-between border-t border-gray-200 pt-8 md:flex-row dark:border-white/10">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2026 CoreCareer AI. All rights reserved.</p>
          
          {/* Social Icons với nút nền mờ hài hòa khi ở Dark Mode */}
          <div className="mt-4 flex space-x-4 md:mt-0">
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-blue-600 hover:text-white dark:bg-white/5 dark:text-gray-400 dark:hover:bg-blue-600 dark:hover:text-white">
              <Twitter size={18} />
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-blue-700 hover:text-white dark:bg-white/5 dark:text-gray-400 dark:hover:bg-blue-700 dark:hover:text-white">
              <Linkedin size={18} />
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-gray-900 hover:text-white dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white dark:hover:text-[#0B0F19]">
              <Github size={18} />
            </a>
            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-gradient-to-tr hover:from-orange-500 hover:via-pink-500 hover:to-purple-500 hover:text-white dark:bg-white/5 dark:text-gray-400 dark:hover:text-white">
              <Instagram size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}