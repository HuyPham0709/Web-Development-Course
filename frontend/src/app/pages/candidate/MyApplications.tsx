import React, { useEffect, useState } from 'react';
import {
  Building,
  MapPin,
  Clock,
  Search,
  Filter,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
  
  // States cho lọc và tìm kiếm
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
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
    const confirmed = window.confirm("Bạn có chắc muốn rút đơn ứng tuyển này không?");
    if (!confirmed) return;

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
      } else {
        alert(result.message || "Không thể rút đơn");
      }
    } catch (error) {
      alert("Có lỗi xảy ra");
    } finally {
      setWithdrawingId(null);
    }
  };

  // Logic lọc kết hợp (Search + Status)
  const filteredApplications = applications.filter((app) => {
    const matchesSearch = 
      app.title.toLowerCase().includes(search.toLowerCase()) ||
      app.company.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = selectedStatus === "All" || 
                          app.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    const badges: Record<string, JSX.Element> = {
      pending: <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-full text-[10px] font-bold uppercase tracking-wider">Pending</span>,
      reviewed: <span className="px-3 py-1 bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 rounded-full text-[10px] font-bold uppercase tracking-wider">Under Review</span>,
      interviewing: <span className="px-3 py-1 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider">Interviewing</span>,
      accepted: <span className="px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider">Accepted</span>,
      rejected: <span className="px-3 py-1 bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-full text-[10px] font-bold uppercase tracking-wider">Rejected</span>
    };
    return badges[s] || <span className="px-3 py-1 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-full text-[10px] font-bold uppercase">{status}</span>;
  };

  if (loading) return <div className="text-center py-20 text-gray-900 dark:text-white font-medium">Loading applications...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0E1422] transition-colors duration-300 py-8 text-left">
      {/* KHAI BÁO ANIMATION TRỰC TIẾP QUA INLINE STYLE TAG ĐỂ TRÁNH SỬA FILE TAILWIND.CONFIG */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: calc(var(--stagger-index) * 250ms);
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">My Applications</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your job search progress.</p>
          </div>
        </div>

        {/* SEARCH & FILTER BOX */}
        <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title or company..." 
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-[#0E1422]/50 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 border rounded-xl font-medium transition-all ${
                showFilter 
                  ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/50 dark:text-blue-400' 
                  : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 dark:hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm capitalize">{selectedStatus}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
            </button>

            {showFilter && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#161F33] border border-gray-100 dark:border-white/10 rounded-xl shadow-xl z-50 p-2 overflow-hidden border-t-4 border-t-blue-500">
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase px-3 py-2">Filter by Status</p>
                {["All", "Pending", "Reviewed", "Interviewing", "Accepted", "Rejected"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatus(status);
                      setShowFilter(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedStatus.toLowerCase() === status.toLowerCase()
                        ? 'bg-blue-600 text-white dark:bg-blue-500' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* LIST WITH STAGGERED ENTRANCE ANIMATION */}
        <div className="space-y-4">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((app, idx) => (
              <div 
                key={app.id} 
                className="animate-fade-in-up bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md dark:hover:border-white/20 transition-all group"
                style={{ '--stagger-index': idx } as React.CSSProperties}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="w-14 h-14 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex-shrink-0 shadow-sm p-1 flex items-center justify-center overflow-hidden">
                    <img 
                      src={app.logoUrl} 
                      alt={`${app.company} logo`}
                      onError={(e) => { 
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.company)}&background=random`; 
                      }}
                      className="max-w-full max-h-full object-contain" 
                    />
                  </div>
                  
                  <div className="flex-1">
                    <Link to={`/job/${app.job_id}`} className="text-lg font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {app.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
                        <Building className="w-3.5 h-3.5" /> {app.company}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> {app.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {app.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-white/10">
                    {getStatusBadge(app.status)}
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium italic">Applied {app.appliedDate}</span>
                      {app.status.toLowerCase() === "pending" && (
                        <button 
                          onClick={() => withdrawApplication(app.id)}
                          disabled={withdrawingId === app.id}
                          className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50 dark:hover:border-red-500/30"
                          title="Withdraw Application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10 animate-fade-in-up" style={{ '--stagger-index': 0 } as React.CSSProperties}>
               <p className="text-gray-500 dark:text-gray-400 font-medium italic">No matching applications found with status "{selectedStatus}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}