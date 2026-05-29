// src/app/components/candidate/CvLibraryTab.tsx

import React, { useEffect, useState } from 'react';
import {
  Check,
  Eye,
  FileText,
  Sparkles,
  X,
} from 'lucide-react';

import CVPreview from '../CVPreview';
import { TEMPLATES, ACCENT_COLORS } from '../CVBuilder';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface CVTemplate {
  id: string;
  name: string;
  tags: Array<'Đơn giản' | 'Hiện đại' | 'Sáng tạo' | 'Chuyên nghiệp'>;
  image: string;
  isNew: boolean;
  accentColor: string;
  template: string;
}

interface CvLibraryTabProps {
  templateFilter: string;
  setTemplateFilter: (id: string) => void;
  setShowFullCVBuilder: (show: boolean) => void;
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, string> = {
  'Đơn giản':
    'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  'Hiện đại':
    'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  'Sáng tạo':
    'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  'Chuyên nghiệp':
    'bg-orange-500/15 text-orange-400 border border-orange-500/20',
};

const TEMPLATE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Đơn giản', label: 'Simple' },
  { id: 'Hiện đại', label: 'Modern' },
  { id: 'Sáng tạo', label: 'Creative' },
  { id: 'Chuyên nghiệp', label: 'Professional' },
];

const CV_TEMPLATES: CVTemplate[] = [
  {
    id: '1',
    name: 'Đảo Phú Quý',
    tags: ['Đơn giản', 'Chuyên nghiệp'],
    isNew: true,
    image:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=800&fit=crop',
    accentColor: ACCENT_COLORS[0],
    template: TEMPLATES[0].id,
  },
  {
    id: '2',
    name: 'Đảo Phú Quốc',
    tags: ['Đơn giản', 'Chuyên nghiệp'],
    isNew: false,
    image:
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=800&fit=crop',
    accentColor: ACCENT_COLORS[1],
    template: TEMPLATES[1].id,
  },
  {
    id: '3',
    name: 'Đảo Nam Du',
    tags: ['Đơn giản', 'Hiện đại'],
    isNew: true,
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=800&fit=crop',
    accentColor: ACCENT_COLORS[2],
    template: TEMPLATES[2].id,
  },
  {
    id: '4',
    name: 'Đảo Bình Ba',
    tags: ['Sáng tạo'],
    isNew: false,
    image:
      'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&h=800&fit=crop',
    accentColor: ACCENT_COLORS[3],
    template: TEMPLATES[3].id,
  },
  {
    id: '5',
    name: 'Đảo Phú Quý (S)',
    tags: ['Đơn giản', 'Sáng tạo'],
    isNew: true,
    image:
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=800&fit=crop',
    accentColor: ACCENT_COLORS[4],
    template: TEMPLATES[0].id,
  },
  {
    id: '6',
    name: 'Nguyễn Trúc Quỳnh',
    tags: ['Hiện đại', 'Sáng tạo'],
    isNew: true,
    image:
      'https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=600&h=800&fit=crop',
    accentColor: ACCENT_COLORS[5],
    template: TEMPLATES[1].id,
  },
  {
    id: '7',
    name: 'Nguyễn Trúc Quỳnh (P)',
    tags: ['Chuyên nghiệp', 'Hiện đại'],
    isNew: false,
    image:
      'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=600&h=800&fit=crop',
    accentColor: ACCENT_COLORS[6],
    template: TEMPLATES[2].id,
  },
  {
    id: '8',
    name: 'Nguyễn Trúc Quỳnh (M)',
    tags: ['Sáng tạo', 'Đơn giản'],
    isNew: false,
    image:
      'https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=600&h=800&fit=crop',
    accentColor: ACCENT_COLORS[7],
    template: TEMPLATES[3].id,
  },
];

// ─────────────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────────────

const FilterPill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
      active
        ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20'
        : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/40 hover:text-violet-600 dark:hover:text-violet-400'
    }`}
  >
    {active && <Check className="inline w-3 h-3 mr-1" />}
    {label}
  </button>
);

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="aspect-[1/1.35] rounded-2xl bg-gray-200 dark:bg-white/5 mb-4" />
    <div className="h-5 w-2/3 rounded bg-gray-200 dark:bg-white/5 mb-2" />
    <div className="flex gap-2">
      <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-white/5" />
      <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-white/5" />
    </div>
  </div>
);

const EmptyState = () => (
  <div className="py-24 text-center">
    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-5">
      <Sparkles className="w-10 h-10 text-gray-400" />
    </div>

    <h3 className="text-xl font-bold text-gray-700 dark:text-white">
      No matching templates found
    </h3>

    <p className="text-gray-500 dark:text-gray-400 mt-2">
      Try another filter
    </p>
  </div>
);

const PreviewModal = ({
  template,
  onClose,
}: {
  template: CVTemplate | null;
  onClose: () => void;
}) => {
  if (!template) return null;

  const mockPersonal = {
    headline: 'Frontend Developer',
    full_name: 'Nguyen Van A',
    email: 'nguyenvana@example.com',
    phone: '0123 456 789',
    address: 'Hanoi, Vietnam',
    dob: '01/01/2000',
    website: 'https://portfolio.com',
    summary:
      'Frontend Developer với kinh nghiệm xây dựng giao diện hiện đại bằng React và TypeScript.',
    avatar_url: null,
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
      <div className="w-full h-full bg-[#0d1117] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-violet-400" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                CV Preview
              </h3>

              <p className="text-sm text-gray-400">
                {template.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-8 bg-[#080a0f] flex justify-center">
          <div
            className="bg-white shadow-2xl"
            style={{
              width: '210mm',
              minHeight: '297mm',
            }}
          >
            <CVPreview
              personal={mockPersonal}
              experience={[]}
              education={[]}
              skills="React, TypeScript, TailwindCSS, NodeJS"
              languages={[
                {
                  id: '1',
                  language: 'English',
                  level: 'Advanced',
                },
              ]}
              it={[
                {
                  id: '1',
                  name: 'Microsoft Office',
                  level: 'Advanced',
                },
              ]}
              activities={[]}
              certs=""
              hobbies=""
              template={template.template}
              lang="vi"
              accentColor={template.accentColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export function CvLibraryTab({
  templateFilter,
  setTemplateFilter,
  setShowFullCVBuilder,
}: CvLibraryTabProps) {
  const [filteredTemplates, setFilteredTemplates] =
    useState<CVTemplate[]>(CV_TEMPLATES);

  const [loading, setLoading] = useState(true);

  const [previewTemplate, setPreviewTemplate] =
    useState<CVTemplate | null>(null);

  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsFading(true);

    const timer = setTimeout(() => {
      if (templateFilter === 'all') {
        setFilteredTemplates(CV_TEMPLATES);
      } else {
        setFilteredTemplates(
          CV_TEMPLATES.filter((t) =>
            t.tags.includes(templateFilter as any)
          )
        );
      }

      setIsFading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [templateFilter]);

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="mb-10">
  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-3">
    CV Templates Loved by{' '}
    <span className="bg-gradient-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
      Top Employers
    </span>
  </h2>

  <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
    Choose a professional CV template that matches your career and personal style.
  </p>
</div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-10">
        {TEMPLATE_FILTERS.map((filter) => (
          <FilterPill
            key={filter.id}
            label={filter.label}
            active={templateFilter === filter.id}
            onClick={() => setTemplateFilter(filter.id)}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {[...Array(8)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : (
          <div
            className={`transition-all duration-300 ${
              isFading
                ? 'opacity-0 translate-y-3'
                : 'opacity-100 translate-y-0'
            }`}
          >
            {filteredTemplates.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="group relative overflow-hidden rounded-3xl bg-white dark:bg-[#111827] border border-gray-100 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10"
                  >
                    {/* Image */}
                    <div className="relative aspect-[1/1.35] overflow-hidden">
                      <img
                        src={template.image}
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3">
                        <button
                          onClick={() =>
                            setShowFullCVBuilder(true)
                          }
                          className="px-5 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
                          style={{
                            backgroundColor:
                              template.accentColor,
                          }}
                        >
                          <FileText className="w-4 h-4" />
                          Use this template
                        </button>

                        <button
                          onClick={() =>
                            setPreviewTemplate(template)
                          }
                          className="px-5 py-2.5 rounded-xl text-sm font-semibold border backdrop-blur-sm flex items-center gap-2 transition-all hover:bg-white/10"
                          style={{
                            borderColor:
                              template.accentColor,
                            color: template.accentColor,
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                      </div>

                      {/* NEW badge */}
                      {template.isNew && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            NEW
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-gray-800 dark:text-white mb-3 truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {template.name}
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {template.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${TAG_COLORS[tag]}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && filteredTemplates.length > 0 && (
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-white/10 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {filteredTemplates.length} mẫu CV phù hợp •
            Choose a template to start building your professional CV
          </p>
        </div>
      )}

      {/* Preview Modal */}
      <PreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </div>
  );
}