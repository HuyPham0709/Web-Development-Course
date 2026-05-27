import React from 'react';
import { useSearchParams } from 'react-router-dom';

// Đã sửa đường dẫn chính xác cho các component
import { Hero as NewHero } from "../../components/public/home/Hero";
import { CategoriesAndSkills } from "../../components/public/home/CategoriesAndSkills";
import { LiveJobFeed } from "../../components/public/home/LiveJobFeed";
import { TopEmployers } from "../../components/public/home/TopEmployers";
import { RecruitmentHubTeaser } from "../../components/public/home/RecruitmentHubTeaser";

export default function Home() {
  const [searchParams] = useSearchParams();
  
  // Trích xuất từ URL các query params phục vụ tìm kiếm công việc
  const title = searchParams.get('title') || "";
  const location = searchParams.get('location') || "";
  const categoryId = searchParams.get('category_id') || "";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans transition-colors duration-300 dark:bg-[#0B0F19] dark:text-white selection:bg-blue-200 selection:text-blue-900">
      <main>
        {/* Truyền giá trị mặc định để thanh tìm kiếm hiển thị đúng từ URL */}
        <NewHero initialTitle={title} initialLocation={location} initialCategoryId={categoryId} />
        
        {/* ĐÃ CHUYỂN LÊN TRÊN: Lắng nghe thay đổi từ URL để tự kích hoạt lại luồng API bên trong */}
        <LiveJobFeed titleFilter={title} locationFilter={location} categoryFilter={categoryId} />
        
        {/* ĐÃ CHUYỂN XUỐNG DƯỚI: Browse by Category */}
        <CategoriesAndSkills />
        
        <TopEmployers />
        
        <RecruitmentHubTeaser />
      </main>
    </div>
  );
}