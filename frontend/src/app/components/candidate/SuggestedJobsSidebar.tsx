import React, { useState } from 'react';
import { Heart, MapPin, DollarSign, Clock } from 'lucide-react';
import axios from 'axios';

const SUGGESTED_DATA = [
  { id: 1, title: 'Nhân Viên QC', company: 'Công Ty Cổ Phần Tập Đoàn Kido', salary: '8 - 10 triệu', location: 'TP.HCM', deadline: '17 ngày', logo: 'https://via.placeholder.com/40' },
  { id: 2, title: 'Nhân Viên Tư Vấn - Chăm Sóc...', company: 'Công Ty TNHH Bất Động Sản Vạn...', salary: '7 - 15 triệu', location: 'TP.HCM', deadline: '7 ngày', logo: 'https://via.placeholder.com/40' },
  { id: 3, title: 'Nhân Viên Thu Mua', company: 'Công Ty TNHH Xuất Nhập Khẩu...', salary: '10 - 12 triệu', location: 'TP.HCM', deadline: '29 ngày', logo: 'https://via.placeholder.com/40' },
];

export function SuggestedJobsSidebar() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-800 uppercase">Việc làm gợi ý cho bạn</h2>
      </div>
      
      <div className="space-y-3">
        {SUGGESTED_DATA.map((job) => (
          <div key={job.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative group">
            <button className="absolute top-3 right-3 text-gray-300 hover:text-blue-600">
              <Heart className="w-4 h-4" />
            </button>
            
            <div className="flex gap-3">
              <img src={job.logo} alt={job.company} className="w-10 h-10 rounded-md object-contain border border-gray-50" />
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {job.title}
                </h3>
                <p className="text-[11px] text-gray-500 truncate mb-2">{job.company}</p>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-gray-600">
                    <DollarSign className="w-3 h-3 text-gray-400" /> {job.salary}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-gray-600">
                    <MapPin className="w-3 h-3 text-gray-400" /> {job.location}
                  </div>
                </div>
                
                <div className="mt-3 flex items-center justify-end text-[10px] text-gray-400">
                  <Clock className="w-3 h-3 mr-1" /> Còn {job.deadline}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}