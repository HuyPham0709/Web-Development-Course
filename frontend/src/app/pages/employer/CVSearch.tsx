import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, Plus, Loader2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchCandidates, Candidate } from '../../../services/profileService';

export function CVSearch() {
  const navigate = useNavigate();

  // 1. Quản lý danh sách ứng viên từ API & trạng thái loading
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 2. Trạng thái lưu trữ bộ lọc (Filters State)
  const [keyword, setKeyword] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [selectedExp, setSelectedExp] = useState<string>('');

  // 3. Danh sách kỹ năng nổi bật để filter nhanh
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const popularSkills = ['React', 'Node.js', 'Java', 'Python', 'UI/UX', 'English'];

  // Kế thừa hiệu ứng lướt lên đồng bộ từ file mẫu
  const [animate, setAnimate] = useState(false);

  // Hàm xử lý khi click chọn/bỏ chọn skill nhanh
  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  // Hàm xóa sạch tất cả bộ lọc về mặc định
  const clearAllFilters = () => {
    setKeyword('');
    setLocation('');
    setSelectedExp('');
    setSelectedSkills([]);
  };

  // 4. Gọi API đồng bộ khi bất kỳ filter nào thay đổi (áp dụng Debounce cho ô tìm kiếm)
  useEffect(() => {
    const fetchFilteredCandidates = async () => {
      try {
        setIsLoading(true);
        
        // Gộp các kỹ năng được chọn thành chuỗi keyword bổ sung hoặc xử lý qua tham số truyền đi
        const searchKeyword = [keyword, ...selectedSkills].filter(Boolean).join(' ');

        const data = await searchCandidates({
          keyword: searchKeyword || undefined,
          location: location || undefined,
        });
        setCandidates(data);
      } catch (error) {
        console.error("Lỗi khi tải danh sách ứng viên:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchFilteredCandidates();
    }, 400); // Tránh gửi request liên tục khi đang gõ từ khóa

    return () => clearTimeout(delayDebounceFn);
  }, [keyword, location, selectedExp, selectedSkills]);

  // Kích hoạt hiệu ứng mượt mà ngay sau khi tắt trạng thái loading dữ liệu
  useEffect(() => {
     window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    if (!isLoading) {
      const timer = setTimeout(() => setAnimate(true), 60);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
    }
  }, [isLoading]);

  // Mảng delay tạo hiệu ứng stagger (so le) cho danh sách kết quả tìm kiếm
  const delays = ['delay-75', 'delay-150', 'delay-200', 'delay-300'];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0E1422] py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
        
        {/* 1. Top Search Bar - Lướt lên đầu tiên */}
        <div className={`bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-4 transform transition-all duration-500 ease-out ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo từ khóa, vị trí công việc, kỹ năng..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-12 pr-36 py-3.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 shadow-sm transition-all text-sm outline-none"
            />
            <button className="absolute right-2 px-6 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm shadow-sm">
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* 2. Left Sidebar (Filters) - Lướt lên thứ hai kèm Delay */}
          <div className={`w-full md:w-64 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 p-5 flex flex-col gap-6 sticky top-4 transform transition-all duration-500 ease-out delay-75 ${
            animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2 uppercase tracking-wider">
                <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Bộ lọc ứng viên
              </h3>
              <button 
                onClick={clearAllFilters}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="w-full h-px bg-gray-100 dark:bg-white/10"></div>

            {/* Location Filter */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Địa điểm</label>
              <div className="relative">
                <select 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-[#0E1422] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 py-2.5 pl-4 pr-10 rounded-xl font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500/50 shadow-sm transition-colors cursor-pointer"
                >
                  <option value="" className="dark:bg-[#0E1422]">Tất cả địa điểm</option>
                  <option value="Ho Chi Minh" className="dark:bg-[#0E1422]">TP. Hồ Chí Minh</option>
                  <option value="Hanoi" className="dark:bg-[#0E1422]">Hà Nội</option>
                  <option value="Da Nang" className="dark:bg-[#0E1422]">Đà Nẵng</option>
                  <option value="Remote" className="dark:bg-[#0E1422]">Làm việc từ xa (Remote)</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Experience Filter */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Kinh nghiệm</label>
              <div className="flex flex-col gap-2">
                {['Fresher / Entry', '1 - 3 years', '3 - 5 years', '5+ years'].map(exp => (
                  <label key={exp} className="flex items-center gap-2.5 cursor-pointer group">
                    <input 
                      type="radio"
                      name="exp_filter"
                      checked={selectedExp === exp}
                      onChange={() => setSelectedExp(exp)}
                      className="w-4 h-4 text-blue-600 border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 focus:ring-blue-500 dark:focus:ring-blue-500/50 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{exp}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Skills Filter */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Kỹ năng phổ biến</label>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button 
                      key={skill}
                      type="button"
                      onClick={() => toggleSkillFilter(skill)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors border ${
                        isSelected 
                          ? 'bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-sm' 
                          : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Main Content Area (Results) */}
          <div className="flex-1 w-full">
            <div className={`mb-4 flex items-center justify-between transform transition-all duration-500 ease-out delay-75 ${
              animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
              <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                {isLoading ? 'Đang tìm kiếm...' : `${candidates.length} Ứng viên được tìm thấy`}
              </h2>
            </div>

            {/* Hiển thị Màn hình xoay Loading chuẩn từ file mẫu */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2 text-gray-400 dark:bg-transparent transition-colors duration-300">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="dark:text-gray-400 text-sm font-medium">Đang tải...</span>
              </div>
            ) : candidates.length === 0 ? (
              <div className={`text-center text-sm py-12 border-2 border-dashed rounded-2xl w-full border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500 bg-white dark:bg-transparent transform transition-all duration-500 ease-out delay-150 ${
                animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                Không tìm thấy ứng viên nào phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              /* Grid ứng viên kế thừa hiệu ứng Stagger mượt mà */
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {candidates.map((candidate, index) => {
                  const delayClass = delays[index % delays.length] || 'delay-300';
                  const rawAvatar = candidate.avatar_url || candidate.avatar;
                  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                  
                  // TỐI ƯU HÓA: Tạo url hoàn chỉnh chuẩn xác, nếu trống sẽ chuyển thẳng tới ui-avatars
                  const avatarSrc = rawAvatar
                    ? (rawAvatar.startsWith('http') || rawAvatar.startsWith('data:') 
                        ? rawAvatar 
                        : `${backendUrl}/${rawAvatar.replace(/^\//, '')}`)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name || 'User')}&background=random`;

                  return (
                    <div 
                      key={candidate.id} 
                      className={`bg-white dark:bg-[#0E1422] rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 dark:hover:border-white/20 p-5 flex flex-col hover:shadow-md transition-all group transform transition-all duration-500 ease-out ${delayClass} ${
                        animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden shrink-0 border border-gray-200 dark:border-white/10 transition-colors">
                          <img 
                            // SỬA TẠI ĐÂY: Sử dụng biến avatarSrc đã được tính toán đầy đủ thay vì candidate.avatar gộp gốc
                            src={avatarSrc} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                            onError={(e) => { 
                              const target = e.target as HTMLImageElement;
                              // Phải set onerror = null để tránh lỗi lặp vô hạn (infinite loop) nếu link backup cũng lỗi
                              target.onerror = null; 
                              // Sử dụng placehold.co làm backup an toàn cuối cùng
                              target.src = "https://placehold.co/150x150/e2e8f0/64748b?text=No+Image"; 
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {candidate.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5">{candidate.name}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                              {candidate.exp}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                              {candidate.location}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Danh sách Kỹ năng */}
                      <div className="mt-4 mb-5 flex flex-wrap gap-1.5">
                        {candidate.skills && candidate.skills.map(skill => (
                          <span key={skill} className="px-2.5 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded-md text-xs font-semibold transition-colors">
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Khối Button Actions chuẩn chỉ chỉnh sửa bo góc xịn sò */}
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/10 flex items-center gap-3 transition-colors">
                        <button 
                          onClick={() => navigate(`/employer/candidate/${candidate.id}`)}
                          className="flex-1 py-2 text-gray-600 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm transition-colors text-xs"
                        >
                          Xem chi tiết hồ sơ
                        </button>
                        <button className="flex-1 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5">
                          <Plus className="w-4 h-4" />
                          Mới ứng tuyển
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}