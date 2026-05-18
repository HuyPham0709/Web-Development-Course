import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { JobGrid } from "../../components/business/JobGrid";
import { Hero as NewHero } from "./home_new/Hero";
import { CategoriesAndSkills } from "./home_new/CategoriesAndSkills";
import { LiveJobFeed } from "./home_new/LiveJobFeed";
import { TopEmployers } from "./home_new/TopEmployers";
import { RecruitmentHubTeaser } from "./home_new/RecruitmentHubTeaser";

// File: Home.tsx
export default function Home() {
  const [searchParams] = useSearchParams(); //
  const title = searchParams.get('title') || ""; //
  const location = searchParams.get('location') || ""; //

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans transition-colors duration-300 dark:bg-[#0B0F19] dark:text-white selection:bg-blue-200 selection:text-blue-900">
      <main>
        <NewHero /> {/* */}
        <CategoriesAndSkills /> {/* */}
        <LiveJobFeed /> {/* */}
        <TopEmployers /> {/* */}
        <RecruitmentHubTeaser /> {/* */}
      </main>
    </div>
  );
}