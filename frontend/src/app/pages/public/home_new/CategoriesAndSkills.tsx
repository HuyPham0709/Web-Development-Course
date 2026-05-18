import { Code2, PenTool, Megaphone, Truck, BarChart3, TrendingUp } from "lucide-react";

const categories = [
  { name: "IT & Software", icon: Code2, count: "5,204", color: "from-blue-500 to-[#0052FF]" },
  { name: "UI/UX Design", icon: PenTool, count: "1,840", color: "from-purple-500 to-[#8B5CF6]" },
  { name: "Marketing", icon: Megaphone, count: "2,150", color: "from-pink-500 to-rose-500" },
  { name: "Logistics", icon: Truck, count: "930", color: "from-[#10B981] to-emerald-600" },
  { name: "B2B Sales", icon: BarChart3, count: "3,400", color: "from-amber-500 to-orange-500" },
];

const skills = [
  "React.js", "Python", "TensorFlow", "Node.js", "Figma", 
  "Agile", "Solidity", "Kubernetes", "AWS", "Go", 
  "Cybersecurity", "Data Science", "GraphQL"
];

export function CategoriesAndSkills() {
  return (
    <section className="w-full py-20">
      <div className="mx-auto max-w-7xl px-6">
        
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Explore Industries by Demand</h2>
            <p className="mt-2 text-gray-400">Discover where your skills are needed most today.</p>
          </div>
          <button className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-white/10 md:flex">
            View All Categories
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div 
                key={idx}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(0,82,255,0.15)]"
              >
                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.color} opacity-80 transition-opacity group-hover:opacity-100`}>
                  <Icon size={28} className="text-white drop-shadow-md" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{cat.name}</h3>
                <p className="text-sm font-medium text-gray-400 group-hover:text-gray-300">
                  <span className="text-[#10B981]">{cat.count}</span> Open Roles
                </p>
                
                {/* Abstract Glow Hover Effect */}
                <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${cat.color} opacity-0 blur-[40px] transition-opacity group-hover:opacity-20`}></div>
              </div>
            );
          })}
        </div>

        {/* Trending Skills Section */}
        <div className="mt-20 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 lg:p-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8B5CF6]/20 text-[#8B5CF6]">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-xl font-bold text-white">Trending AI & Tech Skills</h3>
          </div>
          
          <div className="flex flex-wrap gap-4">
            {skills.map((skill, idx) => (
              <button
                key={idx}
                className="rounded-full border border-white/10 bg-[#0B0F19] px-6 py-2.5 text-sm font-medium text-gray-300 transition-all hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 hover:text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
