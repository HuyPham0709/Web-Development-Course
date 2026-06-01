import React, { useEffect, useState } from 'react';
import {
  Building,
  MapPin,
  Clock,
  Search,
  Filter,
  Trash2,
  ChevronDown,
  Briefcase
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

// Import thêm Component và Service cho mục Recommended
import { RecommendedJobsAside } from '../../components/candidate/profile/RecommendedJobsAside';
import { getRecommendations } from '../../../services/recommendationService';
import { useSharedProfile } from '../../../hooks/useSharedProfile';

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
  const { userData } = useSharedProfile();
  const navigate = useNavigate();

  // States cho lọc và tìm kiếm
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFilter, setShowFilter] = useState(false);

  // State cho Recommended Jobs
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    fetchApplications();
    fetchRecommendedJobs();
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

  const fetchRecommendedJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await getRecommendations();
        const data = response?.data?.jobs;
        setRecommendedJobs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Lỗi fetch recommended jobs:", error);
      setRecommendedJobs([]);
    }
  };

  const withdrawApplication = async (applicationId: number) => {
    const confirmed = window.confirm("Are you sure you want to withdraw this application?");
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
        alert(result.message || "Cannot withdraw application");
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
      pending: <span className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold uppercase tracking-wider border border-gray-200 dark:border-white/10">Pending</span>,
      reviewed: <span className="px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider border border-orange-200 dark:border-orange-500/20">Under Review</span>,
      interviewing: <span className="px-3 py-1.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-xs font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-500/20">Interviewing</span>,
      accepted: <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">Accepted</span>,
      rejected: <span className="px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold uppercase tracking-wider border border-rose-200 dark:border-rose-500/20">Rejected</span>
    };
    return badges[s] || <span className="px-3 py-1.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-full text-xs font-bold uppercase border border-gray-200 dark:border-white/10">{status}</span>;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 transition-colors duration-300 dark:bg-[#070A13] dark:text-gray-100 relative overflow-hidden text-left pb-16">
      
      {/* CSS Keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: calc(var(--stagger-index) * 100ms);
        }
      `}</style>

      {/* Background Decorators */}
      <div className="absolute top-0 right-1/4 h-[500px] w-[600px] translate-x-1/2 rounded-full bg-gradient-to-bl from-blue-500/10 to-purple-500/10 blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute top-40 left-10 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none -z-10"></div>

      {/* Nới rộng max-w để chứa cả Applications và Sidebar */}
      <div className="mx-auto max-w-7xl xl:max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
        
        {/* HEADER */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
            My <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Applications</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Track and manage your job search progress in one place.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 rounded-3xl border border-gray-200 bg-white p-3 shadow-xl shadow-gray-100/50 transition-all dark:border-white/5 dark:bg-[#0B0F19]/80 dark:shadow-none md:grid-cols-12 md:gap-2 relative z-20">
            <div className="relative flex items-center md:col-span-8 px-3">
              <Search className="absolute left-4 text-blue-500" size={20} />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by job title or company..." 
                className="w-full bg-transparent py-3 pl-9 pr-4 text-sm text-gray-800 outline-none placeholder-gray-400 dark:text-gray-100"
              />
            </div>
            
            <div className="h-px bg-gray-100 dark:bg-white/5 md:h-8 md:w-px md:self-center md:col-span-1 justify-self-center hidden md:block"></div>

            <div className="relative flex items-center md:col-span-3 px-3">
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className="w-full flex items-center justify-between gap-2 py-3 text-sm text-gray-700 dark:text-gray-300 outline-none"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-purple-500" />
                  <span className="capitalize font-medium">{selectedStatus}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
              </button>

              {/* DROPDOWN MENU */}
              {showFilter && (
                <div className="absolute right-0 top-full mt-4 w-56 bg-white dark:bg-[#0B0F19] border border-gray-100 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden">
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase px-3 py-2">Filter by Status</p>
                  {["All", "Pending", "Reviewed", "Interviewing", "Accepted", "Rejected"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setShowFilter(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded-xl transition-all ${
                        selectedStatus.toLowerCase() === status.toLowerCase()
                          ? 'bg-blue-50 text-blue-600 font-semibold dark:bg-blue-500/20 dark:text-blue-400' 
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
        </div>

        {/* LAYOUT GRID CHIA CỘT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* CỘT TRÁI: LIST OF APPLICATIONS */}
          <div className="lg:col-span-3 space-y-5 min-h-[500px]">
            {loading ? (
              <div className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-3xl border border-gray-200 bg-white dark:border-white/5 dark:bg-[#0B0F19]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-500"></div>
                <p className="text-sm font-medium text-gray-400">Loading your applications...</p>
              </div>
            ) : filteredApplications.length > 0 ? (
              filteredApplications.map((app, idx) => (
                <div 
                  key={app.id} 
                  className="animate-fade-in-up group flex flex-col sm:flex-row sm:items-center gap-5 p-5 bg-white dark:bg-[#0B0F19] rounded-3xl border border-gray-200 dark:border-white/5 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1"
                  style={{ '--stagger-index': idx } as React.CSSProperties}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex-shrink-0 shadow-sm p-1.5 flex items-center justify-center overflow-hidden">
                    <img 
                      src={app.logoUrl} 
                      alt={`${app.company} logo`}
                      onError={(e) => { 
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.company)}&background=random`; 
                      }}
                      className="max-w-full max-h-full object-contain rounded-xl" 
                    />
                  </div>
                  
                  <div className="flex-1">
                    <Link to={`/job/${app.job_id}`} className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                      {app.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                        <Building size={16} /> {app.company}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={16} /> {app.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase size={16} /> {app.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100 dark:border-white/10">
                    {getStatusBadge(app.status)}
                    
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Applied: {app.appliedDate}</span>
                      {app.status.toLowerCase() === "pending" && (
                        <button 
                          onClick={() => withdrawApplication(app.id)}
                          disabled={withdrawingId === app.id}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-400 transition-all duration-300 hover:scale-110 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500 active:scale-95 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-rose-500/10"
                          title="Withdraw Application"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-3xl border border-dashed border-gray-200 bg-white dark:border-white/10 dark:bg-[#0B0F19] animate-fade-in-up" style={{ '--stagger-index': 0 } as React.CSSProperties}>
                <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-4 text-gray-400">
                  <Briefcase size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">No applications found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                  We couldn't find any applications matching "{selectedStatus}".
                </p>
                {(search !== "" || selectedStatus !== "All") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectedStatus("All");
                    }}
                    className="mt-5 rounded-xl border border-blue-500 px-5 py-2 text-sm font-semibold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* CỘT PHẢI: SIDEBAR RECOMMENDED JOBS */}
          <aside className="sticky top-24 hidden lg:flex lg:flex-col gap-6 lg:col-span-1 overflow-x-hidden">
            <RecommendedJobsAside
              recommendedJobs={recommendedJobs}
              userData={userData}
              openModal={(type) => {
                if (type === "personalInfo") {
                  navigate('/profile');
                }
              }}
            />
          </aside>

        </div>
      </div>
    </div>
  );
}