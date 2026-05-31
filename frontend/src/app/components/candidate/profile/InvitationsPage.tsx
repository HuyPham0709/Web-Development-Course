// InvitationsPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Thêm navigate
import { Mail, Building2, Calendar, MessageSquare, ArrowUpRight, Loader2, Inbox } from 'lucide-react';

interface Invitation {
  id: number;
  job_id: number; // Đảm bảo Backend trả về job_id
  message: string;
  status: string;
  created_at: string;
  job_title: string;
  company_name: string;
  company_logo: string | null;
  employer_name?: string;
}

export const InvitationsPage = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // 2. Khởi tạo navigate

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:5000/api/invitations/my-invitations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const result = await response.json();
        if (result.success) setInvitations(result.data);
      } catch (error) {
        console.error("Fetch invitations error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvitations();
  }, []);

  // Hàm xử lý khi nhấn xem chi tiết
  const handleViewDetail = (jobId: number) => {
    // Chuyển hướng đến trang chi tiết công việc để người dùng nhấn "Apply Now"
    navigate(`/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">Đang tải lời mời...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lời mời ứng tuyển</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Những cơ hội việc làm tốt nhất được gửi trực tiếp cho bạn.</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-2xl text-sm font-bold border border-blue-100 dark:border-blue-500/20 w-fit">
          <Inbox size={16} />
          {invitations.length} Lời mời
        </div>
      </div>

      {invitations.length === 0 ? (
        <div className="rounded-[32px] border-2 border-dashed border-gray-200 dark:border-white/10 p-16 text-center flex flex-col items-center justify-center bg-gray-50/30 dark:bg-white/5">
          <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center mb-6">
             <Mail className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hộp thư trống</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-2">
            Cập nhật hồ sơ để thu hút thêm nhiều nhà tuyển dụng hàng đầu.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {invitations.map((invite, index) => (
            <div 
              key={invite.id} 
              style={{ animationDelay: `${index * 100}ms` }}
              className="group bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-[32px] p-6 transition-all hover:shadow-2xl hover:-translate-y-1 hover:border-blue-500/30 animate-fade-in-up"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/10 flex items-center justify-center border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
                    {invite.company_logo ? (
                      <img 
                        src={invite.company_logo.startsWith('http') 
                          ? invite.company_logo 
                          : `http://127.0.0.1:5000${invite.company_logo}`} 
                        alt="logo" 
                        className="w-full h-full object-cover p-2"
                      />
                    ) : (
                      <Building2 className="text-gray-400 w-8 h-8" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                      {invite.job_title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                        {invite.company_name}
                      </span>
                      <span className="text-gray-300 dark:text-white/20">•</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(invite.created_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 3. Cập nhật sự kiện onClick */}
                <button 
                  onClick={() => handleViewDetail(invite.job_id)}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
                >
                  Xem chi tiết <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 bg-gray-50 dark:bg-black/20 rounded-2xl p-4 border border-gray-100 dark:border-white/5 relative">
                <div className="flex gap-3">
                  <MessageSquare className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                    "{invite.message}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};