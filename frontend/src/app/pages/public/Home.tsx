import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Hero } from "../../components/business/Hero";
import { JobGrid } from "../../components/business/JobGrid";

export default function Home() {
  const [searchParams] = useSearchParams();
  
  // Lấy giá trị từ thanh địa chỉ: ?title=...&location=...
  const title = searchParams.get('title') || "";
  const location = searchParams.get('location') || "";

  return (
    <>
      <Hero />
      {/* Truyền dữ liệu lọc vào JobGrid qua props. Tuyệt đối không thêm thẻ div bọc ngoài để giữ CSS */}
      <JobGrid titleQuery={title} locationQuery={location} />
    </>
  );
}