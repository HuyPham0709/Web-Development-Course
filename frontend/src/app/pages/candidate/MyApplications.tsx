import React, { useEffect, useState } from 'react';
import {
  Building,
  MapPin,
  Clock,
  Search,
  Filter,
  Trash2,
  ChevronDown,
  Briefcase,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface Application {
  id: number;
  job_id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  appliedDate: string;
  status: string;
  logoUrl: string;
}

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  const location = useLocation();
  const isProfileView = location.pathname.includes('profile');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/api/applications/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        setApplications([]);
        return;
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        const formattedData = result.data.map((item: any) => ({
          id: item.application_id,
          job_id: item.job_id,
          title: item.job_title || 'No Title',
          company: item.company_name || 'Unknown',
          location: item.location || 'N/A',
          type: item.job_type || 'Full-time',
          appliedDate: item.applied_at
            ? new Date(item.applied_at).toLocaleDateString('vi-VN')
            : 'N/A',
          status: item.status || 'pending',
          logoUrl: item.logo_url
            ? item.logo_url.startsWith('http')
              ? item.logo_url
              : `http://127.0.0.1:5000${item.logo_url.startsWith('/') ? '' : '/'}${item.logo_url}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.company_name || 'Co')}&background=random`
        }));
        setApplications(formattedData);
      }
    } catch (error) {
      console.error("Lỗi fetch:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const withdrawApplication = async (applicationId: number) => {
    if (!window.confirm("Bạn có chắc muốn rút đơn ứng tuyển này không?")) return;
    try {
      setWithdrawingId(applicationId);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://127.0.0.1:5000/api/applications/withdraw/${applicationId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const result = await response.json();
      if (result.success) {
        setApplications((prev) => prev.filter((app) => app.id !== applicationId));
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    } finally {
      setWithdrawingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.title.toLowerCase().includes(search.toLowerCase()) || app.company.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === "All" || app.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    const styles: Record<string, string> = {
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      reviewed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      interviewing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      accepted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[s] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}`}>
        {status}
      </span>
    );
  };

  const renderContent = () => (
    <div className={`w-full ${!isProfileView ? "max-w-5xl mx-auto" : ""}`}>
      {/* HEADER SECTION */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3 pt-8">
          My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Applications</span>
          {!isProfileView && <Sparkles className="text-yellow-400 w-6 h-6 animate-pulse" />}
        </h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">
          Bạn đang quản lý <span className="text-blue-400">{filteredApplications.length}</span> đơn ứng tuyển tiềm năng.
        </p>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 relative z-30">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Tìm kiếm công việc, công ty..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F172A]/60 backdrop-blur-md border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50 focus:bg-[#131C31] transition-all shadow-inner"
          />
        </div>
        <div className="relative min-w-[160px]">
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="w-full h-full flex items-center justify-between gap-3 bg-[#0F172A]/60 backdrop-blur-md border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-gray-300 hover:border-blue-500/30 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-400" />
              <span className="font-semibold">{selectedStatus}</span>
            </div>
            <ChevronDown size={16} className={`transition-transform duration-300 ${showFilter ? 'rotate-180' : ''}`} />
          </button>
          
          {showFilter && (
            <div className="absolute right-0 top-full mt-2 w-full min-w-[180px] bg-[#161F32] border border-white/10 rounded-xl shadow-2xl z-[100] p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
              {["All", "Pending", "Reviewed", "Interviewing", "Accepted", "Rejected"].map((s) => (
                <button 
                  key={s} 
                  onClick={() => { setSelectedStatus(s); setShowFilter(false); }} 
                  className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-colors ${selectedStatus === s ? 'bg-blue-600/20 text-blue-400 font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* JOB LIST */}
      <div className="space-y-4 relative z-10">
        {loading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-gray-500 text-sm font-medium">Đang tải đơn ứng tuyển...</p>
          </div>
        ) : filteredApplications.length > 0 ? (
          filteredApplications.map((app, idx) => (
            <div 
              key={app.id} 
              className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 bg-[#0F172A]/40 border border-white/5 rounded-[24px] hover:bg-[#131C31] hover:border-blue-500/40 hover:shadow-[0_0_40px_-15px_rgba(59,130,246,0.3)] transition-all duration-300 animate-fade-in-up"
              style={{ '--stagger-index': idx } as React.CSSProperties}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#1A2333] border border-white/10 flex items-center justify-center p-2 shrink-0 group-hover:border-blue-500/30 transition-colors shadow-inner overflow-hidden">
                <img src={app.logoUrl} className="max-w-[80%] max-h-[80%] object-contain" alt="logo" />
              </div>
              
              <div className="flex-1 min-w-0">
                <Link to={`/job/${app.job_id}`} className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors block truncate">
                  {app.title}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-400 text-sm font-medium">{app.company}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                  <span className="text-[10px] text-blue-400/80 font-bold uppercase tracking-widest">Top Match</span>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    <MapPin size={12} className="text-blue-400" /> {app.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    <Briefcase size={12} className="text-purple-400" /> {app.type}
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-4 sm:pt-0 border-t sm:border-0 border-white/5">
                {getStatusBadge(app.status)}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] uppercase font-bold text-gray-600 tracking-tighter">Applied on</p>
                    <p className="text-[11px] text-gray-400 font-medium">{app.appliedDate}</p>
                  </div>
                  {app.status.toLowerCase() === "pending" && (
                    <button 
                      onClick={() => withdrawApplication(app.id)}
                      disabled={withdrawingId === app.id}
                      className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90 disabled:opacity-50"
                      title="Rút đơn"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-[32px] bg-[#0F172A]/20 backdrop-blur-sm">
            <div className="w-20 h-20 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto mb-6">
               <Search size={40} className="text-gray-700" />
            </div>
            <h3 className="text-white text-xl font-bold">Không tìm thấy đơn nào</h3>
            <p className="text-gray-500 text-sm mt-2">Hãy thử thay đổi tiêu chí lọc hoặc tìm kiếm nhé.</p>
          </div>
        )}
      </div>
    </div>
  );

  // WRAPPER CHO TỪNG VIEW
  return (
    <div className={isProfileView 
      ? "w-full text-left" 
      : "min-h-screen bg-[#070A13] py-16 px-4 relative overflow-hidden text-left"
    }>
      <style>{`
        @keyframes fadeInUp { 
          from { opacity: 0; transform: translateY(15px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-fade-in-up { 
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; 
          animation-delay: calc(var(--stagger-index) * 80ms); 
        }
      `}</style>
      
      {!isProfileView && (
        <>
          {/* Quầng sáng trang trí cho bản Standalone */}
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-[20%] left-[15%] w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
        </>
      )}

      {renderContent()}
    </div>
  );
}
// style="
//     padding-top: 32px;
// "