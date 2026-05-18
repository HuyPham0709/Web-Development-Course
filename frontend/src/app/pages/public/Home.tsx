import React from 'react';
import { useSearchParams } from 'react-router-dom';

// 1. GIỮ NGUYÊN: JobGrid cũ (Đi lùi 2 cấp ra ngoài để vào components)
import { JobGrid } from "../../components/business/JobGrid";

// 2. ĐƯỜNG DẪN MỚI CHÍNH XÁC: Import từ thư mục home_new nằm ngay bên cạnh
import { Hero as NewHero } from "./home_new/Hero";
import { CategoriesAndSkills } from "./home_new/CategoriesAndSkills";
import { LiveJobFeed } from "./home_new/LiveJobFeed";
import { TopEmployers } from "./home_new/TopEmployers";
import { RecruitmentHubTeaser } from "./home_new/RecruitmentHubTeaser";

export default function Home() {
  const [searchParams] = useSearchParams();
  
  const title = searchParams.get('title') || "";
  const location = searchParams.get('location') || "";

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-[#8B5CF6]/30 selection:text-white">
      
      <main>
        {/* Lớp 1: Hero Section mới */}
        <NewHero />

        {/* Lớp 2: Danh mục ngành nghề & Kỹ năng */}
        <CategoriesAndSkills />

        {/* Lớp 3: Live Job Feed */}
        <LiveJobFeed />

        {/* Khối data thật nếu sau này cần bật lên để test dữ liệu từ backend cũ */}
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-16">
          <h2 className="text-2xl font-bold mb-6 text-white border-l-4 border-[#8B5CF6] pl-4">
            Việc Làm Thực Tế (Data từ Backend cũ)
          </h2>
          <JobGrid titleQuery={title} locationQuery={location} />
        </div> 
        */}

        {/* Lớp 4: Top Nhà tuyển dụng */}
        <TopEmployers />

        {/* Lớp 5: Khối tính năng quảng bá */}
        <RecruitmentHubTeaser />
      </main>

    </div>
  );
}