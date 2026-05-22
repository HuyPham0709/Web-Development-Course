import React from 'react';
import { useSearchParams } from 'react-router-dom';
<<<<<<< HEAD
import { Hero } from "../../components/business/Hero";
import { JobGrid } from "../../components/business/JobGrid";
=======

// Đã sửa đường dẫn chính xác cho các component
import { Hero as NewHero } from "../../components/public/home/Hero";
import { CategoriesAndSkills } from "../../components/public/home/CategoriesAndSkills";
import { LiveJobFeed } from "../../components/public/home/LiveJobFeed";
import { TopEmployers } from "../../components/public/home/TopEmployers";
import { RecruitmentHubTeaser } from "../../components/public/home/RecruitmentHubTeaser";
>>>>>>> 4caaaecf4d9a0bd2cadb41e7fbae447e76e39d81

export default function Home() {
  const [searchParams] = useSearchParams();
  
<<<<<<< HEAD
  // Lấy giá trị từ thanh địa chỉ: ?title=...&location=...
  const title = searchParams.get('title') || "";
  const location = searchParams.get('location') || "";

  return (
    <>
      <Hero />
      {/* Truyền dữ liệu lọc vào JobGrid qua props. Tuyệt đối không thêm thẻ div bọc ngoài để giữ CSS */}
      <JobGrid titleQuery={title} locationQuery={location} />
    </>
=======
  // Trích xuất từ URL các query params phục vụ tìm kiếm công việc
  const title = searchParams.get('title') || "";
  const location = searchParams.get('location') || "";
  const categoryId = searchParams.get('category_id') || "";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans transition-colors duration-300 dark:bg-[#0B0F19] dark:text-white selection:bg-blue-200 selection:text-blue-900">
      <main>
        {/* Truyền giá trị mặc định để thanh tìm kiếm hiển thị đúng từ URL */}
        <NewHero initialTitle={title} initialLocation={location} initialCategoryId={categoryId} />
        
        <CategoriesAndSkills />
        
        {/* Lắng nghe thay đổi từ URL để tự kích hoạt lại luồng API bên trong */}
        <LiveJobFeed titleFilter={title} locationFilter={location} categoryFilter={categoryId} />
        
        <TopEmployers />
        
        <RecruitmentHubTeaser />
      </main>
    </div>
>>>>>>> 4caaaecf4d9a0bd2cadb41e7fbae447e76e39d81
  );
}