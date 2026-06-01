import React from 'react';
import { Edit2, MapPin, Phone, Calendar, Plus, FileText, UploadCloud, Loader2, Trash2 } from 'lucide-react';
import { ProfileSkeleton } from './ProfileSkeleton';
import { PersonalInfo, WorkExperience, Education } from '../../../../services/profileService';
import { resolveFileUrl } from '../../../../utils/format';

interface ProfileTabProps {
  loading: boolean;
  coverSrc: string;
  avatarSrc: string;
  personalInfo: PersonalInfo;
  experiences: WorkExperience[];
  education: Education[];
  skills: string[];
  cvUploading: boolean;
  coverInputRef: React.RefObject<HTMLInputElement | null>;
  avatarInputRef: React.RefObject<HTMLInputElement | null>;
  cvInputRef: React.RefObject<HTMLInputElement | null>;
  handleCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCVUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCVDelete: () => void;
  openModal: (type: 'personalInfo' | 'experience' | 'education' | 'skills' | null) => void;
  formatDate: (date?: string | null) => string;
}

export function ProfileTab({
  loading, coverSrc, avatarSrc, personalInfo, experiences, education, skills, cvUploading,
  coverInputRef, avatarInputRef, cvInputRef, handleCoverChange, handleAvatarChange,
  handleCVUpload, handleCVDelete, openModal, formatDate
}: ProfileTabProps) {
  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="h-32 md:h-48 w-full relative">
          {loading ? <ProfileSkeleton className="w-full h-full rounded-none" /> : <img src={coverSrc} alt="Cover" className="w-full h-full object-cover" />}
          <button onClick={() => coverInputRef.current?.click()} className="absolute top-4 right-4 bg-white/90 dark:bg-black/60 backdrop-blur-sm p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-black/80 transition-colors shadow"><Edit2 className="w-4 h-4" /></button>
          <input type="file" ref={coverInputRef} accept="image/*" className="hidden" onChange={handleCoverChange} />
        </div>

        <div className="px-6 md:px-8 pb-8 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12 md:-mt-16 mb-4">
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              {loading ? <ProfileSkeleton className="w-full h-full rounded-full" /> : <img src={avatarSrc} alt="Avatar" className="w-full h-full rounded-full border-4 border-white dark:border-[#0E1422] object-cover shadow-md transition-colors" />}
              <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-0 right-0 bg-white dark:bg-white/10 p-2 rounded-full shadow border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Edit2 className="w-4 h-4" /></button>
              <input type="file" ref={avatarInputRef} accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <button onClick={() => openModal('personalInfo')} className="self-start md:self-auto px-6 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors flex items-center gap-2"><Edit2 className="w-4 h-4" /> Edit Profile</button>
          </div>

          {loading ? (
            <div className="space-y-3"><ProfileSkeleton className="h-8 w-48" /><ProfileSkeleton className="h-5 w-72" /></div>
          ) : (
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{personalInfo.full_name || 'Name not set'}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1 font-medium">{personalInfo.title || 'No professional title'}</p>
              {personalInfo.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-2xl leading-relaxed">{personalInfo.bio}</p>}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
                {personalInfo.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {personalInfo.location}</span>}
                {personalInfo.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {personalInfo.phone}</span>}
                {personalInfo.dob && <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(personalInfo.dob)}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Experience */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 md:p-8 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Work Experience</h2>
          <button onClick={() => openModal('experience')} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
        </div>
        {loading ? (
          <div className="space-y-6">{[1, 2].map(i => <ProfileSkeleton key={i} className="h-24" />)}</div>
        ) : experiences.length === 0 ? (
          <button onClick={() => openModal('experience')} className="w-full py-8 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-gray-400 dark:text-gray-500 text-sm hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex flex-col items-center gap-2"><Plus className="w-6 h-6" /> Add Experience</button>
        ) : (
          <div className="space-y-6">
            {experiences.map((exp, i) => (
              <div key={i} className="relative pl-6 border-l-2 border-gray-100 dark:border-white/10 pb-6 last:pb-0">
                <div className={`absolute w-3 h-3 rounded-full -left-[7px] top-1.5 ring-4 ring-white dark:ring-[#0E1422] ${i === 0 ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <h3 className="font-bold text-gray-900 dark:text-white">{exp.position}</h3>
                <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-1">{exp.company_name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{exp.start_date && <>{formatDate(exp.start_date)}{exp.end_date ? ` — ${formatDate(exp.end_date)}` : ' — Present'}</>}</p>
                {exp.description && <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{exp.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Education + Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Education */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 md:p-8 transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Education</h2>
            <button onClick={() => openModal('education')} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
          </div>
          {loading ? <ProfileSkeleton className="h-20" /> :
            education.length === 0 ? (
              <button onClick={() => openModal('education')} className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-gray-400 dark:text-gray-500 text-sm hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex flex-col items-center gap-2"><Plus className="w-5 h-5" /> Add Education</button>
            ) : (
              <div className="space-y-4">
                {education.map((edu, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-500/30"><span className="font-bold text-blue-500 dark:text-blue-400 text-lg">{edu.school_name?.charAt(0).toUpperCase()}</span></div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{edu.school_name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{edu.major}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{edu.start_date && <>{formatDate(edu.start_date)}{edu.end_date ? ` — ${formatDate(edu.end_date)}` : ' — Present'}</>}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>

        {/* Skills */}
        <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 md:p-8 transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Skills</h2>
            <button onClick={() => openModal('skills')} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
          </div>
          {loading ? <ProfileSkeleton className="h-16" /> : (
            <div className="flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <button onClick={() => openModal('skills')} className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl text-gray-400 dark:text-gray-500 text-sm hover:border-blue-300 dark:hover:border-blue-500/50 hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex flex-col items-center gap-2"><Plus className="w-5 h-5" /> Add Skills</button>
              ) : (
                <>
                  {skills.map(skill => <span key={skill} className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm rounded-lg font-medium">{skill}</span>)}
                  <button onClick={() => openModal('skills')} className="px-3 py-1.5 border border-dashed border-gray-300 dark:border-white/20 text-gray-500 dark:text-gray-400 text-sm rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white transition-colors flex items-center gap-1"><Plus className="w-4 h-4" /> Add</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CV Upload */}
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-6 md:p-8 transition-colors duration-300">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Resume / CV</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group ${cvUploading ? 'opacity-60 pointer-events-none' : 'hover:bg-gray-50 dark:hover:bg-white/5 hover:border-blue-300 dark:hover:border-blue-500/50 border-gray-200 dark:border-white/10'}`}>
            <input ref={cvInputRef} type="file" accept=".pdf,.docx" onChange={handleCVUpload} className="hidden" />
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">{cvUploading ? <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" /> : <UploadCloud className="w-6 h-6 text-blue-600 dark:text-blue-400" />}</div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{cvUploading ? 'Uploading...' : 'Upload CV'}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">PDF, DOCX up to 5MB</p>
            <span className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:border-blue-300 dark:group-hover:border-blue-500/50">Choose file</span>
          </label>

          {loading ? <ProfileSkeleton className="rounded-2xl h-40" /> : personalInfo?.cv_url ? (
            <div className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-6 flex flex-col">
              <div className="flex items-start gap-4 mb-auto">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center flex-shrink-0"><FileText className="w-6 h-6" /></div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{personalInfo?.cv_url?.split('/').pop()}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded CV</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <a href={resolveFileUrl(personalInfo.cv_url)} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-center">
                  <a
                    href={resolveFileUrl(personalInfo.cv_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 ..."
                  >
                    View
                  </a>
                </a>
                <button onClick={handleCVDelete} className="flex-1 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
              <FileText className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">No CV uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}