import React, { useState, useRef } from 'react';
import {
  ArrowLeft, Download, LayoutGrid, Globe, CheckCircle2, Plus, Trash2,
  User, Briefcase, GraduationCap, Code2, Languages, Monitor, Users,
  Activity, Award, Heart, ChevronRight, ChevronDown, Upload, Camera,
  AlertCircle, Info, Mail, Phone, MapPin, Calendar, Link as LinkIcon
} from 'lucide-react';
import axios from 'axios';
import jsPDF from "jspdf";
import { domToCanvas } from 'modern-screenshot';
import CVPreview from './CVPreview';


// ─── Types ───────────────────────────────────────────────────────────────────

interface PersonalInfo {
  headline: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  website: string;
  summary: string;
  avatar_url: string | null;
}
interface ExpItem { id: string; company: string; role: string; startDate: string; endDate: string; current: boolean; desc: string; }
interface EduItem { id: string; school: string; major: string; startDate: string; endDate: string; gpa: string; }
interface LangItem { id: string; language: string; level: string; }
interface ItItem { id: string; name: string; level: string; }
interface ContactItem { id: string; name: string; phone: string; relation: string; }
interface ActivityItem { id: string; name: string; role: string; period: string; desc: string; }

type SectionKey = 'personal' | 'experience' | 'education' | 'skills' | 'languages' | 'it' | 'contact' | 'activities' | 'certs' | 'hobbies';

// ─── Constants ────────────────────────────────────────────────────────────────

export const TEMPLATES = [
  { id: 'modern', label: 'Modern', color: '#3B82F6' },
  { id: 'classic', label: 'Classic', color: '#10B981' },
  { id: 'bold', label: 'Bold', color: '#8B5CF6' },
  { id: 'minimal', label: 'Minimal', color: '#F59E0B' },
];

export const ACCENT_COLORS = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B',
  '#EC4899', '#EF4444', '#14B8A6', '#6366F1',
  '#1D4ED8', '#65A30D', '#B45309', '#DB2777',
  '#475569', '#1E293B', '#0EA5E9', '#F472B6',
];

const LANG_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Fluent', 'Native'];
const IT_LEVELS = ['Basic', 'Intermediate', 'Advanced', 'Expert'];

const mkId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const mkExp = (): ExpItem => ({ id: mkId(), company: '', role: '', startDate: '', endDate: '', current: false, desc: '' });
const mkEdu = (): EduItem => ({ id: mkId(), school: '', major: '', startDate: '', endDate: '', gpa: '' });
const mkLang = (): LangItem => ({ id: mkId(), language: '', level: 'Beginner' });
const mkIt = (): ItItem => ({ id: mkId(), name: '', level: 'Basic' });
const mkContact = (): ContactItem => ({ id: mkId(), name: '', phone: '', relation: '' });
const mkActivity = (): ActivityItem => ({ id: mkId(), name: '', role: '', period: '', desc: '' });

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({
  icon: Icon, title, isOpen, onToggle, score
}: { icon: any; title: string; isOpen: boolean; onToggle: () => void; score?: number }) => (
  <button
    onClick={onToggle}
    className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-all rounded-xl mb-1 ${isOpen ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-gray-800/50 border border-transparent'
      }`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${isOpen ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
        <Icon size={18} />
      </div>
      <div>
        <span className={`block font-bold text-sm ${isOpen ? 'text-white' : 'text-gray-300'}`}>{title}</span>
        {score !== undefined && score > 0 && (
          <span className="text-[10px] text-green-400 font-medium">Completed +{score}%</span>
        )}
      </div>
    </div>
    {isOpen
      ? <ChevronDown size={18} className="text-blue-400" />
      : <ChevronRight size={18} className="text-gray-500" />}
  </button>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; required?: boolean; icon?: any }) => {
  const { label, required, icon: Icon, ...rest } = props;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <Icon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
        )}
        <input
          {...rest}
          className={`w-full bg-[#161b22] border border-gray-700/50 text-gray-200 text-sm rounded-xl py-2.5 transition-all outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 placeholder-gray-600 ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
        />
      </div>
    </div>
  );
};

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; maxChars?: number }) => {
  const { label, maxChars, ...rest } = props;
  const val = (rest.value as string) || '';
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">{label}</label>}
      <textarea
        {...rest}
        className="w-full bg-[#161b22] border border-gray-700/50 text-gray-200 text-sm rounded-xl px-4 py-3 transition-all outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 placeholder-gray-600 resize-none min-h-[100px]"
      />
      {maxChars && (
        <div className="flex justify-end mt-1">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${val.length > maxChars ? 'bg-red-500/10 text-red-500' : 'bg-gray-800 text-gray-500'}`}>
            {val.length} / {maxChars}
          </span>
        </div>
      )}
    </div>
  );
};

const Select = ({ label, value, onChange, options }: {
  label?: string; value: string; onChange: (v: string) => void; options: string[];
}) => (
  <div className="flex flex-col gap-1.5">
    {label && <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">{label}</label>}
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-[#161b22] border border-gray-700/50 text-gray-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-blue-500/50 appearance-none cursor-pointer"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
    </div>
  </div>
);

const AddBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-center gap-2 py-3 mt-4 border-2 border-dashed border-gray-800 hover:border-blue-500/50 hover:bg-blue-500/5 text-gray-400 hover:text-blue-400 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
  >
    <Plus size={16} /> {label}
  </button>
);

const RemoveBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
    <Trash2 size={16} />
  </button>
);

const ItemCard = ({ children, title, onRemove }: { children: React.ReactNode; title: string; onRemove: () => void }) => (
  <div className="group relative bg-[#11161d] border border-gray-800 rounded-2xl p-5 mb-5 hover:border-gray-700 transition-all shadow-sm">
    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-800/50">
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</span>
      <RemoveBtn onClick={onRemove} />
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);



// ─── Template Picker Panel ─────────────────────────────────────────────────────

const TemplatePicker = ({
  template, setTemplate, accentColor, setAccentColor, onClose,
}: {
  template: string;
  setTemplate: (t: string) => void;
  accentColor: string;
  setAccentColor: (c: string) => void;
  onClose: () => void;
}) => (
  <div className="absolute top-16 right-4 z-50 bg-[#161b22] border border-gray-700/80 rounded-2xl p-5 shadow-2xl w-80 animate-in fade-in slide-in-from-top-2 duration-200">
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-bold text-white uppercase tracking-widest">Customize CV</span>
      <button onClick={onClose} className="p-1 text-gray-500 hover:text-white rounded-lg transition-all">✕</button>
    </div>

    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2.5">CV Template</p>
    <div className="grid grid-cols-4 gap-2 mb-5">
      {TEMPLATES.map(t => (
        <button
          key={t.id}
          onClick={() => setTemplate(t.id)}
          className={`py-2.5 rounded-xl text-[10px] font-bold border transition-all ${template === t.id
            ? 'bg-blue-500/10 text-blue-400'
            : 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200'
            }`}
          style={template === t.id ? { borderColor: accentColor, color: accentColor } : {}}
        >
          {t.label}
        </button>
      ))}
    </div>

    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2.5">Accent Color</p>
    <div className="grid grid-cols-8 gap-2">
      {ACCENT_COLORS.map(color => (
        <button
          key={color}
          onClick={() => setAccentColor(color)}
          title={color}
          className="w-full aspect-square rounded-lg transition-all hover:scale-110 active:scale-95"
          style={{
            background: color,
            outline: accentColor === color ? `2.5px solid white` : '2.5px solid transparent',
            outlineOffset: '1.5px',
          }}
        />
      ))}
    </div>

    <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-xl border border-gray-800">
      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: accentColor }} />
      <span className="text-[11px] text-gray-400">
        Template: <span className="text-white font-medium">{TEMPLATES.find(t => t.id === template)?.label}</span>
        {' · '}
        <span className="font-mono" style={{ color: accentColor }}>{accentColor}</span>
      </span>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const CVBuilder = ({
  onClose,
  initialTemplate,
  initialAccentColor
}: {
  onClose?: () => void;
  initialTemplate?: string;
  initialAccentColor?: string;
}) => {
  const [template, setTemplate] = useState(initialTemplate || 'modern');
  const [accentColor, setAccentColor] = useState(initialAccentColor || '#3B82F6');
  const [lang, setLang] = useState<'vi' | 'en'>('en'); // Default to English for preview
  const [showTemplates, setShowTemplates] = useState(false);

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    personal: true, experience: false, education: false, skills: false,
    languages: false, it: false, contact: false, activities: false,
    certs: false, hobbies: false,
  });

  const [personal, setPersonal] = useState<PersonalInfo>({
    headline: '', full_name: '', email: '', phone: '', address: '',
    dob: '', website: '', summary: '', avatar_url: null,
  });
  const [experience, setExperience] = useState<ExpItem[]>([]);
  const [education, setEducation] = useState<EduItem[]>([]);
  const [skills, setSkills] = useState('');
  const [languages, setLanguages] = useState<LangItem[]>([]);
  const [it, setIt] = useState<ItItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [certs, setCerts] = useState('');
  const [hobbies, setHobbies] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Progress
  const filledFields = [
    personal.full_name, personal.email, personal.phone, personal.address,
    personal.summary, personal.headline,
    ...experience.map(e => e.company), ...education.map(e => e.school),
    skills, ...languages.map(l => l.language), ...it.map(i => i.name),
  ].filter(Boolean).length;
  const progress = Math.min(100, Math.round((filledFields / 20) * 100));

  const toggle = (key: SectionKey) => setOpenSections(s => ({ ...s, [key]: !s[key] }));

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setPersonal(p => ({ ...p, avatar_url: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const upd = (setter: React.Dispatch<React.SetStateAction<any[]>>, id: string, field: string, value: any) =>
    setter((arr: any[]) => arr.map(item => item.id === id ? { ...item, [field]: value } : item));
  const del = (setter: React.Dispatch<React.SetStateAction<any[]>>, id: string) =>
    setter((arr: any[]) => arr.filter(item => item.id !== id));

  const handleSave = async () => { alert('CV information saved!'); };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    try {
      const canvas = await domToCanvas(previewRef.current, {
        scale: 2, backgroundColor: '#ffffff', logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('My_CV.pdf');
    } catch (err) {
      console.error('PDF ERROR:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Header ── */}
      <header className="relative flex items-center justify-between px-6 py-3 bg-[#0d1117] border-b border-gray-800/80 z-50 shrink-0">
        <div className="flex items-center gap-6">
          {onClose && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
              <ArrowLeft size={20} />
            </button>
          )}
          {/* Progress ring */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <svg viewBox="0 0 32 32" className="w-full h-full -rotate-90 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                <circle cx="16" cy="16" r="14" fill="none" stroke="#1f2937" strokeWidth="3" />
                <circle cx="16" cy="16" r="14" fill="none" stroke="#3b82f6" strokeWidth="3"
                  strokeDasharray={`${progress * 0.88} 88`} strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                {progress}%
              </span>
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-tighter">Completion</div>
              <div className="text-[10px] text-gray-500 font-medium">Professional profile</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Template picker button */}
          <button
            onClick={() => setShowTemplates(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all ${showTemplates
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
              }`}
          >
            <LayoutGrid size={16} />
            CV Template
            <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ background: accentColor }} />
          </button>

          {/* Language toggle */}
          <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl">
            <button
              onClick={() => setLang('vi')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${lang === 'vi' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >VN</button>
            <button
              onClick={() => setLang('en')}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${lang === 'en' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
            >EN</button>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <CheckCircle2 size={16} /> Save CV
          </button>
        </div>

        {/* Dropdown picker */}
        {showTemplates && (
          <TemplatePicker
            template={template}
            setTemplate={setTemplate}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Form */}
        <div className="w-[45%] flex flex-col overflow-y-auto bg-[#0d1117] custom-scrollbar px-6 py-6 space-y-4">

          {/* Personal Information */}
          <div className="bg-[#161b22]/40 rounded-2xl border border-gray-800/60 p-2">
            <SectionHeader icon={User} title="Personal Information" isOpen={openSections.personal} onToggle={() => toggle('personal')} score={20} />
            {openSections.personal && (
              <div className="p-4 pt-2 space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex gap-6 items-start">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="relative w-24 h-24 rounded-2xl bg-gray-800 border-2 border-dashed border-gray-700 hover:border-blue-500/50 cursor-pointer overflow-hidden transition-all group"
                    >
                      {personal.avatar_url ? (
                        <img src={personal.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 group-hover:text-blue-400">
                          <Camera size={24} />
                          <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">4x6 Photo</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={20} className="text-white" />
                      </div>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
                  </div>
                  <div className="flex-1 space-y-4">
                    <Input label="Full Name" icon={User} value={personal.full_name} onChange={e => setPersonal(p => ({ ...p, full_name: e.target.value }))} placeholder="e.g., Nguyen Van A" />
                    <Input label="Job Title" icon={Briefcase} value={personal.headline} onChange={e => setPersonal(p => ({ ...p, headline: e.target.value }))} placeholder="e.g., Sales Staff" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Email" icon={Mail} value={personal.email} onChange={e => setPersonal(p => ({ ...p, email: e.target.value }))} placeholder="abc@gmail.com" />
                  <Input
                    label="Phone"
                    icon={Phone}
                    value={personal.phone}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10);

                      setPersonal((p) => ({
                        ...p,
                        phone: onlyNumbers,
                      }));
                    }}
                    placeholder="0901847437"
                  />
                  <Input label="Date of Birth" icon={Calendar} value={personal.dob} onChange={e => setPersonal(p => ({ ...p, dob: e.target.value }))} placeholder="DD/MM/YYYY" />
                  <Input label="Website / LinkedIn" icon={LinkIcon} value={personal.website} onChange={e => setPersonal(p => ({ ...p, website: e.target.value }))} placeholder="linkedin.com/in/..." />
                </div>
                <Input label="Current Address" icon={MapPin} value={personal.address} onChange={e => setPersonal(p => ({ ...p, address: e.target.value }))} placeholder="District, City" />
                <Textarea label="Short Introduction" value={personal.summary} onChange={e => setPersonal(p => ({ ...p, summary: e.target.value }))} placeholder="Brief summary of your skills and career goals..." maxChars={400} />
              </div>
            )}
          </div>

          {/* Work Experience */}
          <div className="bg-[#161b22]/40 rounded-2xl border border-gray-800/60 p-2">
            <SectionHeader icon={Briefcase} title="Work Experience" isOpen={openSections.experience} onToggle={() => toggle('experience')} score={experience.length * 5} />
            {openSections.experience && (
              <div className="p-4 pt-2">
                {experience.map((exp, idx) => (
                  <ItemCard key={exp.id} title={`Job #${idx + 1}`} onRemove={() => del(setExperience, exp.id)}>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Company" value={exp.company} onChange={e => upd(setExperience, exp.id, 'company', e.target.value)} placeholder="e.g., Google" />
                      <Input label="Position" value={exp.role} onChange={e => upd(setExperience, exp.id, 'role', e.target.value)} placeholder="e.g., Manager" />
                      <Input label="Start Date" value={exp.startDate} onChange={e => upd(setExperience, exp.id, 'startDate', e.target.value)} placeholder="MM/YYYY" />
                      <Input label="End Date" value={exp.endDate} onChange={e => upd(setExperience, exp.id, 'endDate', e.target.value)} disabled={exp.current} placeholder="MM/YYYY" />
                    </div>
                    <label className="flex items-center gap-2.5 w-fit cursor-pointer group px-1">
                      <input type="checkbox" checked={exp.current} onChange={e => upd(setExperience, exp.id, 'current', e.target.checked)} className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-0 transition-all" />
                      <span className="text-xs font-medium text-gray-500 group-hover:text-gray-300">I currently work here</span>
                    </label>
                    <Textarea label="Job Description & Achievements" value={exp.desc} onChange={e => upd(setExperience, exp.id, 'desc', e.target.value)} placeholder="Describe what you did and achieved..." />
                  </ItemCard>
                ))}
                <AddBtn onClick={() => setExperience(e => [...e, mkExp()])} label="Add New Experience" />
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-[#161b22]/40 rounded-2xl border border-gray-800/60 p-2">
            <SectionHeader icon={GraduationCap} title="Education" isOpen={openSections.education} onToggle={() => toggle('education')} score={education.length * 5} />
            {openSections.education && (
              <div className="p-4 pt-2">
                {education.map((edu, idx) => (
                  <ItemCard key={edu.id} title={`Education #${idx + 1}`} onRemove={() => del(setEducation, edu.id)}>
                    <Input label="School / Center" value={edu.school} onChange={e => upd(setEducation, edu.id, 'school', e.target.value)} placeholder="e.g., Hanoi University of Technology" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Major" value={edu.major} onChange={e => upd(setEducation, edu.id, 'major', e.target.value)} placeholder="e.g., Software Engineering" />
                      <Input label="GPA" value={edu.gpa} onChange={e => upd(setEducation, edu.id, 'gpa', e.target.value)} placeholder="e.g., 3.8/4.0" />
                      <Input label="From Year" value={edu.startDate} onChange={e => upd(setEducation, edu.id, 'startDate', e.target.value)} placeholder="YYYY" />
                      <Input label="To Year" value={edu.endDate} onChange={e => upd(setEducation, edu.id, 'endDate', e.target.value)} placeholder="YYYY" />
                    </div>
                  </ItemCard>
                ))}
                <AddBtn onClick={() => setEducation(e => [...e, mkEdu()])} label="Add New Education" />
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="bg-[#161b22]/40 rounded-2xl border border-gray-800/60 p-2">
            <SectionHeader icon={Code2} title="Skills & Expertise" isOpen={openSections.skills} onToggle={() => toggle('skills')} score={skills ? 10 : 0} />
            {openSections.skills && (
              <div className="p-4 pt-2">
                <Textarea placeholder="e.g., Photoshop, Office, ReactJS, Teamwork..." value={skills} onChange={e => setSkills(e.target.value)} rows={4} />
              </div>
            )}
          </div>

          {/* Languages */}
          <div className="bg-[#161b22]/40 rounded-2xl border border-gray-800/60 p-2">
            <SectionHeader icon={Globe} title="Languages" isOpen={openSections.languages} onToggle={() => toggle('languages')} score={languages.length * 3} />
            {openSections.languages && (
              <div className="p-4 pt-2">
                {languages.map((l, idx) => (
                  <ItemCard key={l.id} title={`Language #${idx + 1}`} onRemove={() => del(setLanguages, l.id)}>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Language" value={l.language} onChange={e => upd(setLanguages, l.id, 'language', e.target.value)} placeholder="e.g., English" />
                      <Select label="Proficiency" value={l.level} onChange={v => upd(setLanguages, l.id, 'level', v)} options={LANG_LEVELS} />
                    </div>
                  </ItemCard>
                ))}
                <AddBtn onClick={() => setLanguages(l => [...l, mkLang()])} label="Add Language" />
              </div>
            )}
          </div>

          {/* IT Skills */}
          <div className="bg-[#161b22]/40 rounded-2xl border border-gray-800/60 p-2">
            <SectionHeader icon={Monitor} title="Computer Skills" isOpen={openSections.it} onToggle={() => toggle('it')} score={it.length * 3} />
            {openSections.it && (
              <div className="p-4 pt-2">
                {it.map((item, idx) => (
                  <ItemCard key={item.id} title={`Software #${idx + 1}`} onRemove={() => del(setIt, item.id)}>
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Software Name" value={item.name} onChange={e => upd(setIt, item.id, 'name', e.target.value)} placeholder="e.g., Excel" />
                      <Select label="Proficiency" value={item.level} onChange={v => upd(setIt, item.id, 'level', v)} options={IT_LEVELS} />
                    </div>
                  </ItemCard>
                ))}
                <AddBtn onClick={() => setIt(i => [...i, mkIt()])} label="Add Software" />
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="bg-[#161b22]/40 rounded-2xl border border-gray-800/60 p-2">
            <SectionHeader icon={Activity} title="Activities & Volunteering" isOpen={openSections.activities} onToggle={() => toggle('activities')} score={activities.length * 3} />
            {openSections.activities && (
              <div className="p-4 pt-2">
                {activities.map((act, idx) => (
                  <ItemCard key={act.id} title={`Activity #${idx + 1}`} onRemove={() => del(setActivities, act.id)}>
                    <Input label="Organization / Club" value={act.name} onChange={e => upd(setActivities, act.id, 'name', e.target.value)} placeholder="e.g., Volunteer Club" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Role" value={act.role} onChange={e => upd(setActivities, act.id, 'role', e.target.value)} placeholder="e.g., Team Leader" />
                      <Input label="Period" value={act.period} onChange={e => upd(setActivities, act.id, 'period', e.target.value)} placeholder="e.g., 2022 – 2023" />
                    </div>
                    <Textarea label="Description" value={act.desc} onChange={e => upd(setActivities, act.id, 'desc', e.target.value)} placeholder="Describe your role and contributions..." />
                  </ItemCard>
                ))}
                <AddBtn onClick={() => setActivities(a => [...a, mkActivity()])} label="Add Activity" />
              </div>
            )}
          </div>

          {/* Certificates */}
          <div className="bg-[#161b22]/40 rounded-2xl border border-gray-800/60 p-2">
            <SectionHeader icon={Award} title="Certificates & Awards" isOpen={openSections.certs} onToggle={() => toggle('certs')} score={certs ? 5 : 0} />
            {openSections.certs && (
              <div className="p-4 pt-2">
                <Textarea value={certs} onChange={e => setCerts(e.target.value)} placeholder="List your certificates and awards..." />
              </div>
            )}
          </div>

          {/* Hobbies */}
          <div className="bg-[#161b22]/40 rounded-2xl border border-gray-800/60 p-2">
            <SectionHeader icon={Heart} title="Hobbies" isOpen={openSections.hobbies} onToggle={() => toggle('hobbies')} score={hobbies ? 2 : 0} />
            {openSections.hobbies && (
              <div className="p-4 pt-2">
                <Textarea value={hobbies} onChange={e => setHobbies(e.target.value)} placeholder="Reading, traveling, sports..." />
              </div>
            )}
          </div>

          <div className="h-10 shrink-0" />
        </div>

        {/* Right Preview */}
        <div className="w-[55%] bg-[#080a0f] flex flex-col border-l border-gray-800 relative">
          <div className="flex items-center justify-between px-6 py-3 bg-[#0d1117] border-b border-gray-800/80 shrink-0">
            <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">A4 Print Preview</span>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-xl shadow-lg transition-all active:scale-95"
            >
              <Download size={14} /> Download PDF
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-12 custom-scrollbar flex justify-center items-start">
            <div
              ref={previewRef}
              className="bg-white shadow-[0_24px_80px_rgba(0,0,0,0.4)]"
              style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}
            >
              <CVPreview
                personal={personal}
                experience={experience}
                education={education}
                skills={skills}
                languages={languages}
                it={it}
                activities={activities}
                certs={certs}
                hobbies={hobbies}
                template={template}
                lang={lang}
                accentColor={accentColor}
              />
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1f2937; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #374151; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-top { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation: fade-in 0.3s ease-out forwards, slide-in-top 0.3s ease-out forwards; }
      `}} />
    </div>
  );
};

export default CVBuilder;