import React, { useState } from 'react';
import { 
  Download, Briefcase, User, Mail, Phone, Sparkles, Palette, 
  LayoutTemplate, Plus, Trash2, MapPin, Globe, GraduationCap, 
  Wand2, Code2, ArrowLeft 
} from 'lucide-react';

interface CVBuilderProps {
  onClose?: () => void;
}

export const CVBuilder = ({ onClose }: CVBuilderProps) => {
  // UI State
  const [cvData, setCvData] = useState({ template: 'modern', color: 'blue' });

  // Data States
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Alex Walker",
    title: "Senior Frontend Developer",
    email: "alex.walker@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "alexwalker.dev",
    summary: "Passionate Frontend Developer with 5+ years of experience building scalable web applications using React, TypeScript, and modern CSS frameworks."
  });
const getThemeBorder = () => THEMES[cvData.color].split(' ')[1];
  const [experience, setExperience] = useState([
    {
      id: "1", company: "TechFlow Inc.", role: "Frontend Engineer",
      date: "Jan 2021 - Present", description: "Led the migration of legacy monolithic architecture to micro-frontends."
    }
  ]);

  const [education, setEducation] = useState([
    { id: "1", school: "University of California, Berkeley", degree: "B.S. Computer Science", date: "2014 - 2018" }
  ]);

  const [skills, setSkills] = useState("ReactJS, TypeScript, NodeJS, Tailwind CSS, GraphQL, MySQL, Git");

  // Handlers
  const handleDownload = () => alert("Simulating PDF download...");
  const updatePersonalInfo = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  const updateExperience = (id: string, field: string, value: string) => setExperience(experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp));
  const addExperience = () => setExperience([...experience, { id: Date.now().toString(), company: "", role: "", date: "", description: "" }]);
  const removeExperience = (id: string) => setExperience(experience.filter(exp => exp.id !== id));
  const updateEducation = (id: string, field: string, value: string) => setEducation(education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu));
  const addEducation = () => setEducation([...education, { id: Date.now().toString(), school: "", degree: "", date: "" }]);
  const removeEducation = (id: string) => setEducation(education.filter(edu => edu.id !== id));

  // Theme Config
  const THEMES: Record<string, string> = {
    blue: 'text-blue-600 border-blue-600 bg-blue-600 ring-blue-200',
    emerald: 'text-emerald-600 border-emerald-600 bg-emerald-600 ring-emerald-200',
    rose: 'text-rose-600 border-rose-600 bg-rose-600 ring-rose-200',
    violet: 'text-violet-600 border-violet-600 bg-violet-600 ring-violet-200'
  };

  const getThemeText = () => THEMES[cvData.color].split(' ')[0];
  const getThemeBg = () => THEMES[cvData.color].split(' ')[2];

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* ── HEADER MỚI CÓ NÚT QUAY LẠI ── */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onClose && (
            <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition-colors flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">Quay lại</span>
            </button>
          )}
          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-blue-600" />
            <span className="hidden sm:inline">CV Builder</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
        </div>
      </header>

      {/* ── KÉO CONTENT XUỐNG DƯỚI HEADER CỐ ĐỊNH ── */}
      <div className="flex flex-col lg:flex-row w-full h-full pt-[68px]">
        
        {/* LEFT PANEL: Form Builder */}
        <div className="w-full lg:w-1/2 p-6 lg:p-8 overflow-y-auto custom-scrollbar bg-white border-r border-gray-200">
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Color Selection */}
            <section>
              <h2 className="text-lg font-bold flex items-center gap-2 mb-4"><Palette className="w-5 h-5 text-gray-400" /> Màu chủ đạo</h2>
              <div className="flex gap-3">
                {Object.keys(THEMES).map(color => (
                  <button key={color} onClick={() => setCvData({ ...cvData, color })} className={`w-10 h-10 rounded-full ${THEMES[color].split(' ')[2]} ${cvData.color === color ? 'ring-4 ring-offset-2 ' + THEMES[color].split(' ')[3] : 'opacity-70 hover:opacity-100'}`} />
                ))}
              </div>
            </section>

            {/* Personal Info */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><User className="w-5 h-5 text-gray-400" /> Thông tin cá nhân</h2>
              <div className="grid grid-cols-2 gap-4">
                <input name="fullName" value={personalInfo.fullName} onChange={updatePersonalInfo} placeholder="Họ và tên" className="w-full p-3 border border-gray-200 rounded-xl" />
                <input name="title" value={personalInfo.title} onChange={updatePersonalInfo} placeholder="Chức danh" className="w-full p-3 border border-gray-200 rounded-xl" />
                <input name="email" value={personalInfo.email} onChange={updatePersonalInfo} placeholder="Email" className="w-full p-3 border border-gray-200 rounded-xl" />
                <input name="phone" value={personalInfo.phone} onChange={updatePersonalInfo} placeholder="Số điện thoại" className="w-full p-3 border border-gray-200 rounded-xl" />
                <input name="location" value={personalInfo.location} onChange={updatePersonalInfo} placeholder="Địa điểm" className="w-full p-3 border border-gray-200 rounded-xl" />
                <input name="website" value={personalInfo.website} onChange={updatePersonalInfo} placeholder="Website / Link" className="w-full p-3 border border-gray-200 rounded-xl" />
                <textarea name="summary" value={personalInfo.summary} onChange={updatePersonalInfo} placeholder="Giới thiệu bản thân..." className="col-span-2 w-full p-3 border border-gray-200 rounded-xl h-24" />
              </div>
            </section>

            {/* Experience */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><Briefcase className="w-5 h-5 text-gray-400" /> Kinh nghiệm làm việc</h2>
              {experience.map((exp) => (
                <div key={exp.id} className="p-4 border border-gray-200 rounded-xl relative group bg-gray-50/50">
                  <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} placeholder="Tên công ty" className="p-2 border border-gray-200 rounded-lg bg-white" />
                    <input value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} placeholder="Vị trí" className="p-2 border border-gray-200 rounded-lg bg-white" />
                    <input value={exp.date} onChange={e => updateExperience(exp.id, 'date', e.target.value)} placeholder="Thời gian (VD: 2021 - Nay)" className="col-span-2 p-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                  <textarea value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} placeholder="Mô tả công việc" className="w-full p-2 border border-gray-200 rounded-lg bg-white h-20" />
                </div>
              ))}
              <button onClick={addExperience} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-blue-600 font-medium hover:bg-blue-50 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Thêm kinh nghiệm</button>
            </section>

            {/* Education */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5 text-gray-400" /> Học vấn</h2>
              {education.map((edu) => (
                <div key={edu.id} className="p-4 border border-gray-200 rounded-xl relative group bg-gray-50/50">
                  <button onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  <div className="grid grid-cols-2 gap-3">
                    <input value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} placeholder="Tên trường" className="p-2 border border-gray-200 rounded-lg bg-white" />
                    <input value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Chuyên ngành" className="p-2 border border-gray-200 rounded-lg bg-white" />
                    <input value={edu.date} onChange={e => updateEducation(edu.id, 'date', e.target.value)} placeholder="Thời gian" className="col-span-2 p-2 border border-gray-200 rounded-lg bg-white" />
                  </div>
                </div>
              ))}
              <button onClick={addEducation} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-blue-600 font-medium hover:bg-blue-50 flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Thêm học vấn</button>
            </section>
          </div>
        </div>

        {/* RIGHT PANEL: Live Preview */}
        <div className="w-full lg:w-1/2 bg-gray-100 p-6 lg:p-8 overflow-y-auto flex justify-center">
          <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl rounded-sm p-10 print:shadow-none print:m-0 print:p-0">
            {/* Header CV Preview */}
            <div className={`border-b-4 pb-6 mb-6 ${getThemeBorder()}`}>
              <h1 className={`text-4xl font-bold uppercase tracking-wider mb-2 ${getThemeText()}`}>{personalInfo.fullName || 'Họ và Tên'}</h1>
              <p className="text-xl text-gray-600 mb-4">{personalInfo.title || 'Chức danh'}</p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                {personalInfo.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {personalInfo.email}</span>}
                {personalInfo.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {personalInfo.phone}</span>}
                {personalInfo.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {personalInfo.location}</span>}
                {personalInfo.website && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {personalInfo.website}</span>}
              </div>
            </div>

            {/* Content CV Preview */}
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-6">
                {personalInfo.summary && (
                  <div>
                    <h2 className={`text-sm font-bold uppercase tracking-widest mb-3 ${getThemeText()}`}>Tóm tắt</h2>
                    <p className="text-gray-700 text-sm leading-relaxed">{personalInfo.summary}</p>
                  </div>
                )}
                {experience.length > 0 && (
                  <div>
                    <h2 className={`text-sm font-bold uppercase tracking-widest mb-3 ${getThemeText()}`}>Kinh nghiệm làm việc</h2>
                    <div className="space-y-4">
                      {experience.map(exp => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-gray-900">{exp.role}</h3>
                            <span className="text-xs text-gray-500 font-medium">{exp.date}</span>
                          </div>
                          <div className={`text-sm font-medium mb-2 ${getThemeText()}`}>{exp.company}</div>
                          <p className="text-sm text-gray-700 leading-relaxed">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-1 space-y-6">
                {education.length > 0 && (
                  <div>
                    <h2 className={`text-sm font-bold uppercase tracking-widest mb-3 ${getThemeText()}`}>Học vấn</h2>
                    <div className="space-y-4">
                      {education.map(edu => (
                        <div key={edu.id}>
                          <h3 className="font-bold text-gray-900 text-sm">{edu.school}</h3>
                          <div className="text-sm text-gray-700 mt-1">{edu.degree}</div>
                          <div className="text-xs text-gray-500 mt-1">{edu.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {skills && (
                  <div>
                    <h2 className={`text-sm font-bold uppercase tracking-widest mb-3 ${getThemeText()}`}>Kỹ năng</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">{skills}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};