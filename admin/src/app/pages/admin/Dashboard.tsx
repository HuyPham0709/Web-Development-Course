import { useState, useEffect } from "react"
import { Users, BriefcaseBusiness, AlertCircle, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Sector
} from "recharts"

// Hàm render cho hiệu ứng khi hover vào miếng bánh (Pie Chart)
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6} // Nở rộng ra 6px khi hover
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export function Dashboard() {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    verifiedCompanies: 0,
    pendingJobs: 0,
    activeReports: 0
  });
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Dữ liệu thực tế cho Line Chart lấy từ API backend thay thế cho mock data cũ
  const [trendsData, setTrendsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/dashboard');
        const result = await response.json();

        if (result.success) {
          setStats(result.data.stats);
          
          // Cập nhật dữ liệu xu hướng tin tuyển dụng từ API thật
          if (result.data.trendsData) {
            setTrendsData(result.data.trendsData);
          }

          const rawData = result.data.categoryData;
          let processedData = [];

          if (rawData.length > 6) {
            const sortedData = [...rawData].sort((a, b) => b.value - a.value);
            processedData = sortedData.slice(0, 5);
            const otherValue = sortedData.slice(5).reduce((sum, item) => sum + item.value, 0);
            processedData.push({
              name: "Ngành nghề khác",
              value: otherValue,
              color: "#94A3B8"
            });
          } else {
            processedData = rawData;
          }
          setCategoryData(processedData);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu Dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 font-medium animate-pulse">
        Đang tải dữ liệu hệ thống...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500">System health and high-level metrics in real-time.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Candidates"
          value={stats.totalCandidates}
          icon={<Users className="w-4 h-4 text-slate-400" />}
          subText="Real-time update"
          subColor="text-emerald-600"
        />
        <StatCard
          title="Verified Companies"
          value={stats.verifiedCompanies}
          icon={<Building2 className="w-4 h-4 text-slate-400" />}
          subText="Active partners"
          subColor="text-emerald-600"
        />
        <StatCard
          title="Pending Jobs"
          value={stats.pendingJobs}
          icon={<BriefcaseBusiness className="w-4 h-4 text-amber-500" />}
          subText="Requires moderation"
          subColor="text-amber-600"
        />
        <StatCard
          title="Active Reports"
          value={stats.activeReports}
          icon={<AlertCircle className="w-4 h-4 text-rose-500" />}
          subText="Needs immediate action"
          subColor="text-rose-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Line Chart */}
        <Card className="lg:col-span-4 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Job Posting Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12 }}
                />
                <RechartsTooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="postings"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="lg:col-span-3 shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Job Categories</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex flex-col items-center">
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="75%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      onMouseLeave={() => setActiveIndex(-1)}
                      animationBegin={200}
                      animationDuration={1200}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke="rgba(255,255,255,0.8)"
                          strokeWidth={2}
                          className="outline-none"
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(value: number, name: string) => [
                        <span className="font-bold text-slate-900">{value} tin</span>,
                        <span className="text-slate-500">{name}</span>
                      ]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Custom Legend */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full px-4">
                  {categoryData.map((category, index) => (
                    <div
                      key={category.name}
                      className={`flex items-center text-xs transition-opacity duration-200 ${activeIndex !== -1 && activeIndex !== index ? 'opacity-40' : 'opacity-100'}`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: category.color }} />
                      <span className="truncate text-slate-600 font-medium">{category.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center h-full text-slate-400 italic">Chưa có dữ liệu danh mục</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Component phụ cho Stat Cards để code gọn hơn
function StatCard({ title, value, icon, subText, subColor }: any) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</div>
        <p className={`text-xs mt-1 flex items-center font-medium ${subColor}`}>
          {subText}
        </p>
      </CardContent>
    </Card>
  )
}