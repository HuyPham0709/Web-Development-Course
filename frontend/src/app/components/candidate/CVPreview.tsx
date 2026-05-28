import React from 'react';
import { User } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PersonalInfo {
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

export interface ExpItem {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  desc: string;
}

export interface EduItem {
  id: string;
  school: string;
  major: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export interface LangItem {
  id: string;
  language: string;
  level: string;
}

export interface ItItem {
  id: string;
  name: string;
  level: string;
}

export interface ActivityItem {
  id: string;
  name: string;
  role: string;
  period: string;
  desc: string;
}

const LANG_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Fluent', 'Native'];
const IT_LEVELS = ['Basic', 'Intermediate', 'Advanced', 'Expert'];

// ─── CV Preview ───────────────────────────────────────────────────────────────

const CVPreview = ({
  personal,
  experience,
  education,
  skills,
  languages,
  it,
  activities,
  certs,
  hobbies,
  template,
  lang,
  accentColor,
}: {
  personal: PersonalInfo;
  experience: ExpItem[];
  education: EduItem[];
  skills: string;
  languages: LangItem[];
  it: ItItem[];
  activities: ActivityItem[];
  certs: string;
  hobbies: string;
  template: string;
  lang: 'vi' | 'en';
  accentColor?: string;
}) => {
  const accent = accentColor ?? '#3B82F6';

  const T = {
    vi: {
      contact: 'LIÊN HỆ',
      summary: 'MỤC TIÊU NGHỀ NGHIỆP',
      exp: 'KINH NGHIỆM LÀM VIỆC',
      edu: 'HỌC VẤN',
      skills: 'KỸ NĂNG',
      lang: 'NGOẠI NGỮ',
      it: 'TIN HỌC',
      act: 'HOẠT ĐỘNG',
      certs: 'CHỨNG CHỈ',
      hobbies: 'SỞ THÍCH',
      present: 'Hiện tại',
      position: 'VỊ TRÍ',
    },
    en: {
      contact: 'CONTACT',
      summary: 'CAREER OBJECTIVE',
      exp: 'WORK EXPERIENCE',
      edu: 'EDUCATION',
      skills: 'SKILLS',
      lang: 'LANGUAGES',
      it: 'IT SKILLS',
      act: 'ACTIVITIES',
      certs: 'CERTIFICATIONS',
      hobbies: 'HOBBIES',
      present: 'Present',
      position: 'POSITION',
    },
  }[lang];

  const SecTitle = ({ children }: { children: React.ReactNode }) => (
    <h2
      style={{ color: accent }}
      className="text-[9px] font-bold tracking-widest uppercase mb-2 pb-1 border-b"
    >
      {children}
    </h2>
  );

  return (
    <div
      className="bg-white text-gray-900 text-[10px] leading-[1.45] flex h-full min-h-[297mm]"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      {/* Sidebar */}
      <div
        className="w-[38%] min-h-full p-5 flex flex-col gap-4"
        style={{ backgroundColor: accent + '18' }}
      >
        {/* Avatar */}
        <div className="flex justify-center mb-1">
          <div
            className="w-20 h-20 rounded-full overflow-hidden border-2 flex items-center justify-center"
            style={{ borderColor: accent }}
          >
            {personal.avatar_url ? (
              <img
                src={personal.avatar_url}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: accent + '30' }}
              >
                <User size={32} style={{ color: accent }} />
              </div>
            )}
          </div>
        </div>

        {(template === 'classic' || template === 'bold') && (
          <div className="text-center">
            <div
              className="font-bold text-sm uppercase tracking-wide"
              style={{ color: accent }}
            >
              {personal.full_name ||
                (lang === 'vi' ? 'HỌ VÀ TÊN' : 'FULL NAME')}
            </div>
            <div className="text-gray-500 text-[9px] mt-0.5">
              {personal.headline || T.position}
            </div>
          </div>
        )}

        {/* Contact */}
        <div>
          <SecTitle>{T.contact}</SecTitle>

          <div className="space-y-1.5 text-gray-600">
            {personal.phone && (
              <div className="font-mono tabular-nums">
                📞 {personal.phone}
              </div>
            )}

            {personal.email && (
              <div className="font-mono tabular-nums">
                ✉ {personal.email}
              </div>
            )}

            {personal.dob && (
              <div className="font-mono tabular-nums">
                🎂 {personal.dob}
              </div>
            )}

            {personal.address && (
              <div className="font-mono tabular-nums">
                📍 {personal.address}
              </div>
            )}

            {personal.website && (
              <div className="font-mono tabular-nums">
                🌐 {personal.website}
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {skills && (
          <div>
            <SecTitle>{T.skills}</SecTitle>
            <p className="text-gray-700 leading-relaxed">{skills}</p>
          </div>
        )}

        {/* Languages */}
        {languages.filter((l) => l.language).length > 0 && (
          <div>
            <SecTitle>{T.lang}</SecTitle>

            <div className="space-y-1.5">
              {languages
                .filter((l) => l.language)
                .map((l) => (
                  <div key={l.id}>
                    <div className="flex justify-between text-gray-700">
                      <span>{l.language}</span>
                      <span className="text-gray-500">{l.level}</span>
                    </div>

                    <div className="h-1 bg-gray-200 rounded-full mt-0.5">
                      <div
                        className="h-1 rounded-full"
                        style={{
                          backgroundColor: accent,
                          width: `${
                            ((LANG_LEVELS.indexOf(l.level) + 1) /
                              LANG_LEVELS.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* IT Skills */}
        {it.filter((i) => i.name).length > 0 && (
          <div>
            <SecTitle>{T.it}</SecTitle>

            <div className="space-y-1.5">
              {it
                .filter((i) => i.name)
                .map((i) => (
                  <div key={i.id}>
                    <div className="flex justify-between text-gray-700">
                      <span>{i.name}</span>
                      <span className="text-gray-500">{i.level}</span>
                    </div>

                    <div className="h-1 bg-gray-200 rounded-full mt-0.5">
                      <div
                        className="h-1 rounded-full"
                        style={{
                          backgroundColor: accent,
                          width: `${
                            ((IT_LEVELS.indexOf(i.level) + 1) /
                              IT_LEVELS.length) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Hobbies */}
        {hobbies && (
          <div>
            <SecTitle>{T.hobbies}</SecTitle>
            <p className="text-gray-700">{hobbies}</p>
          </div>
        )}
      </div>

      {/* Main */}
      <div className="flex-1 p-5 flex flex-col gap-4">
        {(template === 'modern' || template === 'minimal') && (
          <div
            className="pb-3 mb-1"
            style={{ borderBottom: `2px solid ${accent}` }}
          >
            <div
              className="text-xl font-bold uppercase tracking-widest"
              style={{ color: accent }}
            >
              {personal.full_name ||
                (lang === 'vi' ? 'HỌ VÀ TÊN' : 'FULL NAME')}
            </div>

            <div className="text-gray-500 text-[10px] mt-0.5 uppercase tracking-widest">
              {personal.headline || T.position}
            </div>
          </div>
        )}

        {/* Summary */}
        {personal.summary && (
          <div>
            <SecTitle>{T.summary}</SecTitle>
            <p className="text-gray-700 leading-relaxed">
              {personal.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.filter((e) => e.company || e.role).length > 0 && (
          <div>
            <SecTitle>{T.exp}</SecTitle>

            <div className="space-y-3">
              {experience
                .filter((e) => e.company || e.role)
                .map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-[10.5px] text-gray-900">
                        {exp.role}
                      </span>

                      <span className="text-gray-500 text-[9px]">
                        {exp.startDate}
                        {exp.startDate && ' – '}
                        {exp.current ? T.present : exp.endDate}
                      </span>
                    </div>

                    <div className="font-medium" style={{ color: accent }}>
                      {exp.company}
                    </div>

                    {exp.desc && (
                      <p className="text-gray-600 mt-0.5 leading-relaxed">
                        {exp.desc}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.filter((e) => e.school).length > 0 && (
          <div>
            <SecTitle>{T.edu}</SecTitle>

            <div className="space-y-3">
              {education
                .filter((e) => e.school)
                .map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-gray-900">
                        {edu.school}
                      </span>

                      <span className="text-gray-500 text-[9px]">
                        {edu.startDate}
                        {edu.startDate && ' – '}
                        {edu.endDate}
                      </span>
                    </div>

                    <div className="text-gray-700">{edu.major}</div>

                    {edu.gpa && (
                      <div className="text-gray-500">
                        GPA: {edu.gpa}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Activities */}
        {activities.filter((a) => a.name).length > 0 && (
          <div>
            <SecTitle>{T.act}</SecTitle>

            <div className="space-y-2">
              {activities
                .filter((a) => a.name)
                .map((act) => (
                  <div key={act.id}>
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-gray-900">
                        {act.name}
                      </span>

                      <span className="text-gray-500 text-[9px]">
                        {act.period}
                      </span>
                    </div>

                    {act.role && (
                      <div style={{ color: accent }}>{act.role}</div>
                    )}

                    {act.desc && (
                      <p className="text-gray-600 mt-0.5">{act.desc}</p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certs && (
          <div>
            <SecTitle>{T.certs}</SecTitle>
            <p className="text-gray-700 leading-relaxed">{certs}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CVPreview;

