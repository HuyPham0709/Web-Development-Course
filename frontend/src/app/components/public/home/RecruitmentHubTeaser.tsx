import { CheckCircle2, Circle, Send, Paperclip } from "lucide-react";
import { motion } from "motion/react";

export function RecruitmentHubTeaser() {
  return (
    <section className="w-full py-24 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white transition-colors duration-300 dark:from-[#0B0F19] dark:to-[#0e1422]">
      
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl dark:text-white">Interactive Recruitment Hub</h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto dark:text-gray-400">
            Experience real-time transparency. Track your applications with precision and communicate directly with hiring managers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          
          {/* CỘT TRÁI - ĐÃ TỐI ƯU HIỆU ỨNG MƯỢT MÀ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} // Thay x bằng y giúp mượt hơn trên mobile & màn hình tần số quét cao
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }} // Trình kích hoạt mượt trước khi lọt hẳn vào mắt người dùng
            transition={{ 
              duration: 0.5, 
              ease: [0.215, 0.610, 0.355, 1.000] // Khôi phục quán tính giảm tốc mượt mà
            }}
            style={{ willChange: "transform, opacity" }} // Ép cứng GPU xử lý riêng Layer này
            className="flex flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-xl dark:border-white/10 dark:bg-white/5"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Application Status</h3>
                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">Senior Frontend Engineer @ NextGen Tech</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40">Active</span>
            </div>

            <div className="relative flex-1 py-4 pl-4">
              <div className="absolute left-7 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700/50"></div>
              <div className="absolute left-7 top-6 h-1/2 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>

              <div className="relative z-10 space-y-8">
                {/* Item 1 */}
                <div className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Application Sent</h4>
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Oct 24, 10:30 AM</p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500">
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Under Review</h4>
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Oct 25, 2:15 PM</p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white border-2 border-emerald-500 dark:bg-[#0B0F19]">
                    <Circle size={10} className="text-emerald-500 fill-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Technical Interview</h4>
                    <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center gap-1 dark:text-emerald-400">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                      </span>
                      Action Required: Schedule Time
                    </p>
                  </div>
                </div>

                {/* Item 4 */}
                <div className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white border-2 border-gray-300 dark:bg-[#0B0F19] dark:border-gray-700">
                    <Circle size={10} className="text-gray-400 dark:text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-500 dark:text-gray-400">Final Decision</h4>
                    <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">Pending</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CỘT PHẢI - ĐÃ TỐI ƯU HIỆU ỨNG VÀ TRÌ HOÃN TRÁNH QUÁ TẢI GPU */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ 
              duration: 0.5, 
              ease: [0.215, 0.610, 0.355, 1.000],
              delay: 0.08 // Trì hoãn nhẹ một nhịp giúp giảm tải việc dựng hình đồng thời
            }}
            style={{ willChange: "transform, opacity" }}
            className="flex flex-col h-[480px] rounded-3xl border border-gray-200 bg-gray-50 shadow-xl overflow-hidden dark:border-white/10 dark:bg-white/5"
          >
            {/* Header hộp chat Recruiter */}
            <div className="flex items-center gap-4 border-b border-gray-200 p-5 bg-white dark:border-b-white/10 dark:bg-white/5">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3OTA4MjEwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Recruiter" className="h-10 w-10 rounded-full object-cover border border-gray-100 dark:border-white/10" />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#0B0F19]"></span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 flex items-center gap-2 dark:text-white">
                  Sarah Jenkins
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full dark:bg-purple-950/60 dark:text-purple-400">Recruiter</span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">NextGen Tech</p>
              </div>
            </div>

            {/* Vùng hiển thị tin nhắn (Message list area) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 flex flex-col justify-end bg-gray-50 dark:bg-transparent">
              {/* Tin nhắn từ Recruiter */}
              <div className="flex gap-3 max-w-[85%]">
                <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3OTA4MjEwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Recruiter" className="h-8 w-8 rounded-full object-cover mt-1" />
                <div className="rounded-2xl rounded-tl-sm bg-white p-3.5 text-sm text-gray-700 border border-gray-200 shadow-sm dark:bg-white/10 dark:text-gray-200 dark:border-white/5">
                  Hi Alex! Your profile looks like a great match for our Senior AI Engineer role. Are you available for a quick chat this Thursday?
                </div>
              </div>

              {/* Tin nhắn từ Candidate */}
              <div className="flex gap-3 max-w-[85%] self-end">
                <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-600 to-purple-600 p-3.5 text-sm text-white shadow-md">
                  Hello Sarah! Thank you. Yes, I'm available this Thursday after 2 PM EST. I'm very interested in the position.
                </div>
                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFksh90fGVufDF8fHx8MTc3OTEyNTQxOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Applicant" className="h-8 w-8 rounded-full object-cover mt-1" />
              </div>

              {/* Đang nhập văn bản */}
              <div className="flex gap-3 max-w-[85%]">
                <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc3OTA4MjEwMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" alt="Recruiter" className="h-8 w-8 rounded-full object-cover mt-1" />
                <div className="rounded-2xl rounded-tl-sm bg-white p-3.5 text-sm text-gray-500 border border-gray-200 shadow-sm flex items-center gap-2 dark:bg-white/10 dark:text-gray-400 dark:border-white/5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gray-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-gray-400"></span>
                  </span>
                  Typing...
                </div>
              </div>
            </div>

            {/* Thanh Input Gửi tin nhắn dưới cùng */}
            <div className="p-4 border-t border-gray-200 bg-white dark:border-t-white/10 dark:bg-white/5">
              <div className="flex items-center gap-2 rounded-full bg-gray-100 p-1.5 border border-gray-200 dark:bg-[#0B0F19] dark:border-white/10">
                <button className="p-2 text-gray-500 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white">
                  <Paperclip size={18} />
                </button>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none px-2 dark:text-white dark:placeholder-gray-400"
                />
                <button className="p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-md hover:shadow-lg transition-all hover:opacity-95">
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