import { Code2, PenTool, Megaphone, Truck, BarChart3, TrendingUp } from "lucide-react";

const categories = [
  { name: "IT & Software", icon: Code2, count: "5,204", color: "from-blue-500 to-blue-600" },
  { name: "UI/UX Design", icon: PenTool, count: "1,840", color: "from-purple-500 to-purple-600" },
  { name: "Marketing", icon: Megaphone, count: "2,150", color: "from-pink-500 to-rose-500" },
  { name: "Logistics", icon: Truck, count: "930", color: "from-emerald-500 to-emerald-600" },
  { name: "B2B Sales", icon: BarChart3, count: "3,400", color: "from-amber-500 to-orange-500" },
];

const skills = [
  "React.js", "Python", "TensorFlow", "Node.js", "Figma", 
  "Agile", "Solidity", "Kubernetes", "AWS", "Go", 
  "Cybersecurity", "Data Science", "GraphQL"
];

export function CategoriesAndSkills() {
  return (
    <section className="w-full py-20 bg-gray-50 transition-colors duration-300 dark:bg-[#0B0F19]">
      <div className="mx-auto max-w-7xl px-6">
        
        <div className="mb-12 flex items-center justify-between">
          <div>
            {/* Thêm dark:text-white để tiêu đề nổi bật trên nền tối */}
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Explore Industries by Demand</h2>
            {/* Thêm dark:text-gray-400 để giảm độ tương phản cho text mô tả phụ */}
            <p className="mt-2 text-gray-500 dark:text-gray-400">Discover where your skills are needed most today.</p>
          </div>
          {/* Thêm dark:border-white/10 dark:bg-white/5 dark:text-gray-300 để biến nút thành dạng kính mờ tinh tế */}
          <button className="hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 md:flex shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10">
            View All Categories
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div 
                key={idx}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-lg dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-500/40"
              >
                {/* Thêm hiệu ứng kính mờ dark:border-white/10 dark:bg-white/5 và đổi màu hover border thành màu xanh neon mờ */}
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} text-white`}>
                  <Icon size={28} />
                </div>
                {/* Thêm dark:text-white cho tên danh mục */}
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{cat.name}</h3>
                {/* Thêm dark:text-gray-400 cho text đếm số lượng, giữ nguyên màu xanh emerald của con số để tạo điểm nhấn */}
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  <span className="text-emerald-600 dark:text-emerald-400">{cat.count}</span> Open Roles
                </p>
              </div>
            );
          })}
        </div>

        {/* Khung chứa danh sách kỹ năng trending với giao diện kính mờ sang trọng */}
        <div className="mt-20 rounded-3xl border border-gray-200 bg-white p-8 lg:p-12 shadow-sm transition-colors duration-300 dark:border-white/10 dark:bg-white/5">
          <div className="mb-8 flex items-center gap-3">
            {/* Tinh chỉnh nhẹ màu nền icon ở dark mode để giảm độ chói `dark:bg-purple-950/50` */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
              <TrendingUp size={20} />
            </div>
            {/* Thêm dark:text-white */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Trending AI & Tech Skills</h3>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {skills.map((skill, idx) => (
              <button
                key={idx}
                className="rounded-full border border-gray-200 bg-gray-50 px-6 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:border-purple-500/30 dark:hover:bg-purple-950/40 dark:hover:text-purple-400"
              >
                {/* Thêm dark:bg-white/5 dark:text-gray-300 để các tag skill hòa hợp với background tối */}
                {skill}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}