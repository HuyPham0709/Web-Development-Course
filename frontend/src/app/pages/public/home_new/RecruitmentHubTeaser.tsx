import { CheckCircle2, Circle, MessageSquare, Send, Paperclip } from "lucide-react";
import { motion } from "motion/react";

export function RecruitmentHubTeaser() {
  return (
    <section className="w-full py-24 relative overflow-hidden bg-gradient-to-b from-[#0B0F19] to-[#0a0d14]">
      
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Interactive Recruitment Hub</h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Experience real-time transparency. Track your applications with precision and communicate directly with hiring managers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          
          {/* Application Tracker Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Application Status</h3>
                <p className="text-sm text-gray-400 mt-1">Senior Frontend Engineer @ NextGen Tech</p>
              </div>
              <span className="rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#10B981] border border-[#10B981]/20">Active</span>
            </div>

            <div className="relative flex-1 py-4 pl-4">
              {/* Vertical Line */}
              <div className="absolute left-7 top-6 bottom-6 w-0.5 bg-white/10"></div>
              {/* Active Progress Line */}
              <div className="absolute left-7 top-6 h-1/2 w-0.5 bg-gradient-to-b from-[#0052FF] to-[#8B5CF6] shadow-[0_0_10px_rgba(0,82,255,0.8)]"></div>

              {/* Steps */}
              <div className="relative z-10 space-y-8">
                <div className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0052FF]">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Application Sent</h4>
                    <p className="text-xs text-gray-500 mt-1">Oct 24, 10:30 AM</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8B5CF6]">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Under Review</h4>
                    <p className="text-xs text-gray-500 mt-1">Oct 25, 2:15 PM</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0B0F19] border-2 border-white/20">
                    <Circle size={10} className="text-[#10B981] fill-[#10B981]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Technical Interview</h4>
                    <p className="text-xs text-[#10B981] mt-1 font-medium flex items-center gap-1">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10B981] opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10B981]"></span>
                      </span>
                      Action Required: Schedule Time
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0B0F19] border-2 border-white/10">
                    <Circle size={10} className="text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-500">Final Decision</h4>
                    <p className="text-xs text-gray-600 mt-1">Pending</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Chat Box Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col h-[480px] rounded-3xl border border-white/10 bg-[#0B0F19] shadow-[0_0_50px_rgba(139,92,246,0.1)]"
          >
            {/* Chat Header */}
            <div className="flex items-center gap-4 border-b border-white/10 p-5 bg-white/5 rounded-t-3xl backdrop-blur-md">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3OTA4MjEwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Recruiter" className="h-10 w-10 rounded-full object-cover border border-white/20" />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0B0F19] bg-[#10B981]"></span>
              </div>
              <div>
                <h4 className="font-semibold text-white flex items-center gap-2">
                  Sarah Jenkins
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B5CF6] bg-[#8B5CF6]/10 px-2 py-0.5 rounded-full">Recruiter</span>
                </h4>
                <p className="text-xs text-gray-400">NextGen Tech</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col justify-end">
              <div className="flex gap-3 max-w-[85%]">
                <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3OTA4MjEwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Recruiter" className="h-8 w-8 rounded-full object-cover mt-1" />
                <div className="rounded-2xl rounded-tl-sm bg-white/10 p-3.5 text-sm text-gray-200 backdrop-blur-md border border-white/5">
                  Hi Alex! Your profile looks like a great match for our Senior AI Engineer role. Are you available for a quick chat this Thursday?
                </div>
              </div>

              <div className="flex gap-3 max-w-[85%] self-end">
                <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-[#0052FF] to-[#8B5CF6] p-3.5 text-sm text-white shadow-lg">
                  Hello Sarah! Thank you. Yes, I'm available this Thursday after 2 PM EST. I'm very interested in the position.
                </div>
                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdHxlbnwxfHx8fDE3NzkxMjU0MTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Applicant" className="h-8 w-8 rounded-full object-cover mt-1" />
              </div>

              <div className="flex gap-3 max-w-[85%]">
                <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3OTA4MjEwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Recruiter" className="h-8 w-8 rounded-full object-cover mt-1" />
                <div className="rounded-2xl rounded-tl-sm bg-white/10 p-3.5 text-sm text-gray-200 backdrop-blur-md border border-white/5 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-gray-400"></span>
                  </span>
                  Typing...
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-white/10 bg-white/5 rounded-b-3xl">
              <div className="flex items-center gap-2 rounded-full bg-[#0B0F19] p-1.5 border border-white/10">
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <Paperclip size={18} />
                </button>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none px-2"
                />
                <button className="p-2.5 bg-gradient-to-r from-[#0052FF] to-[#8B5CF6] text-white rounded-full shadow-lg hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] transition-all">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
