// src/app/components/candidate/CVTemplateGallery.tsx
import React, { useState, useEffect } from 'react';
import { X, Eye, FileText } from 'lucide-react';
import { CVPreview } from './CVBuilder';
import { TEMPLATES, ACCENT_COLORS } from './CVBuilder';

// ─── Types ───────────────────────────────────────────────────────────────────

interface CVTemplate {
  id: string;
  name: string;
  tags: Array<'Simple' | 'Modern' | 'Creative' | 'Professional'>;
  thumbnailUrl: string;
  isNew: boolean;
  accentColor: string;
  template: string;
}

interface CVTemplateGalleryProps {
  onSelectTemplate: (template: string, accentColor: string) => void;
  onClose?: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, string> = {
  'Simple': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Modern': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Creative': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Professional': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const FILTERS = ['All', 'Simple', 'Modern', 'Creative', 'Professional'];

// Mock data with 8 templates (names kept in Vietnamese as they are proper names)
const MOCK_TEMPLATES: CVTemplate[] = [
  {
    id: 'phuquy1',
    name: 'Đảo Phú Quý',
    tags: ['Modern', 'Professional'],
    thumbnailUrl: 'https://picsum.photos/seed/phuquy1/400/300',
    isNew: true,
    accentColor: ACCENT_COLORS[0],
    template: TEMPLATES[0].id,
  },
  {
    id: 'phuquoc2',
    name: 'Đảo Phú Quốc',
    tags: ['Professional'],
    thumbnailUrl: 'https://picsum.photos/seed/phuquoc2/400/300',
    isNew: false,
    accentColor: ACCENT_COLORS[2],
    template: TEMPLATES[1].id,
  },
  {
    id: 'namdu3',
    name: 'Đảo Nam Du',
    tags: ['Simple', 'Modern'],
    thumbnailUrl: 'https://picsum.photos/seed/namdu3/400/300',
    isNew: true,
    accentColor: ACCENT_COLORS[12],
    template: TEMPLATES[3].id,
  },
  {
    id: 'binhba4',
    name: 'Đảo Bình Ba',
    tags: ['Creative'],
    thumbnailUrl: 'https://picsum.photos/seed/binhba4/400/300',
    isNew: false,
    accentColor: ACCENT_COLORS[1],
    template: TEMPLATES[2].id,
  },
  {
    id: 'phuquy5',
    name: 'Đảo Phú Quý (S)',
    tags: ['Simple'],
    thumbnailUrl: 'https://picsum.photos/seed/phuquy5/400/300',
    isNew: false,
    accentColor: ACCENT_COLORS[3],
    template: TEMPLATES[3].id,
  },
  {
    id: 'trucquynh6',
    name: 'Nguyễn Trúc Quỳnh',
    tags: ['Modern', 'Creative'],
    thumbnailUrl: 'https://picsum.photos/seed/trucquynh6/400/300',
    isNew: true,
    accentColor: ACCENT_COLORS[0],
    template: TEMPLATES[0].id,
  },
  {
    id: 'trucquynh7',
    name: 'Nguyễn Trúc Quỳnh (P)',
    tags: ['Professional'],
    thumbnailUrl: 'https://picsum.photos/seed/trucquynh7/400/300',
    isNew: false,
    accentColor: ACCENT_COLORS[2],
    template: TEMPLATES[1].id,
  },
  {
    id: 'trucquynh8',
    name: 'Nguyễn Trúc Quỳnh (M)',
    tags: ['Modern'],
    thumbnailUrl: 'https://picsum.photos/seed/trucquynh8/400/300',
    isNew: false,
    accentColor: ACCENT_COLORS[0],
    template: TEMPLATES[0].id,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-gray-800 rounded-xl aspect-[4/3] mb-3"></div>
    <div className="h-5 bg-gray-800 rounded w-3/4 mb-2"></div>
    <div className="flex gap-2">
      <div className="h-6 bg-gray-800 rounded-full w-16"></div>
      <div className="h-6 bg-gray-800 rounded-full w-16"></div>
    </div>
  </div>
);

const FilterPill = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-full font-medium transition-all duration-200 text-sm ${
      isActive
        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
        : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700'
    }`}
  >
    {label}
  </button>
);

const PreviewModal = ({
  isOpen,
  onClose,
  template,
  accentColor,
  onUseTemplate,
}: {
  isOpen: boolean;
  onClose: () => void;
  template: string;
  accentColor: string;
  onUseTemplate: () => void;
}) => {
  if (!isOpen) return null;

  const mockPersonal = {
    headline: 'Frontend Developer',
    full_name: 'Nguyen Van A',
    email: 'nguyenvana@example.com',
    phone: '0123 456 789',
    address: 'Hanoi, Vietnam',
    dob: '01/01/1995',
    website: 'https://example.com',
    summary: 'I am a frontend developer with 5 years of experience...',
    avatar_url: null,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full h-full flex flex-col bg-[#0d1117]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Eye size={16} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">Preview CV</h3>
            <span className="text-xs text-gray-500 px-2 py-1 bg-gray-800 rounded-full">
              {TEMPLATES.find(t => t.id === template)?.label || template}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-8 flex justify-center items-start bg-[#080a0f]">
          <div className="bg-white shadow-2xl" style={{ width: '210mm', minHeight: '297mm' }}>
            <CVPreview
              personal={mockPersonal}
              experience={[]}
              education={[]}
              skills="React, TypeScript, Tailwind CSS, Node.js"
              languages={[{ id: '1', language: 'English', level: 'Advanced' }]}
              it={[{ id: '1', name: 'Microsoft Office', level: 'Advanced' }]}
              activities={[]}
              certs=""
              hobbies=""
              template={template}
              lang="en"
              accentColor={accentColor}
            />
          </div>
        </div>

        <div className="border-t border-gray-800 px-6 py-4 flex justify-end gap-3 bg-[#0d1117]">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
          >
            Close
          </button>
          <button
            onClick={() => {
              onUseTemplate();
              onClose();
            }}
            className="px-6 py-2 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            style={{
              backgroundColor: accentColor,
              color: '#ffffff',
            }}
          >
            <FileText size={16} />
            Use this template
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-20">
    <div className="w-24 h-24 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
      <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <p className="text-gray-400 text-lg font-medium">No matching templates found</p>
    <p className="text-gray-500 text-sm mt-1">Try a different filter</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CVTemplateGallery({ onSelectTemplate, onClose }: CVTemplateGalleryProps) {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [filteredTemplates, setFilteredTemplates] = useState<CVTemplate[]>(MOCK_TEMPLATES);
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplate | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsFading(true);
    const filterTimer = setTimeout(() => {
      if (selectedFilter === 'All') {
        setFilteredTemplates(MOCK_TEMPLATES);
      } else {
        setFilteredTemplates(
          MOCK_TEMPLATES.filter((template) =>
            template.tags.includes(selectedFilter as any)
          )
        );
      }
      setIsFading(false);
    }, 200);
    return () => clearTimeout(filterTimer);
  }, [selectedFilter]);

  const handleUseTemplate = (template: CVTemplate) => {
    onSelectTemplate(template.template, template.accentColor);
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">
            CV templates loved by{' '}
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              Top Employers
            </span>
          </h1>
          <p className="text-gray-400 text-base max-w-2xl">
            Explore our collection of professional CV templates, designed to impress employers
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 mb-10 pb-2 border-b border-gray-800">
          {FILTERS.map((filter) => (
            <FilterPill
              key={filter}
              label={filter}
              isActive={selectedFilter === filter}
              onClick={() => setSelectedFilter(filter)}
            />
          ))}
        </div>

        {/* Grid Section */}
        <div className="relative min-h-[400px]">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!isLoading && (
            <div
              className={`transition-all duration-300 ${
                isFading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              }`}
            >
              {filteredTemplates.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="group relative bg-gray-900/40 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 border border-gray-800 hover:border-gray-700"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-800">
                        <img
                          src={template.thumbnailUrl}
                          alt={template.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />

                        {template.isNew && (
                          <div className="absolute top-3 right-3 z-10">
                            <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                              NEW
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3">
                          <button
                            onClick={() => handleUseTemplate(template)}
                            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2"
                            style={{
                              backgroundColor: template.accentColor,
                              color: '#ffffff',
                            }}
                          >
                            <FileText size={16} />
                            Use this template
                          </button>
                          <button
                            onClick={() => setPreviewTemplate(template)}
                            className="px-5 py-2.5 rounded-xl font-medium text-sm transition-all hover:bg-white/10 backdrop-blur-sm border-2 flex items-center gap-2"
                            style={{
                              borderColor: template.accentColor,
                              color: template.accentColor,
                            }}
                          >
                            <Eye size={16} />
                            Preview
                          </button>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="text-white font-bold text-base truncate">
                          {template.name}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {template.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`text-[10px] font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm ${TAG_COLORS[tag]}`}
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

        {!isLoading && filteredTemplates.length > 0 && (
          <div className="mt-10 pt-6 text-center border-t border-gray-800">
            <p className="text-gray-500 text-xs">
              {filteredTemplates.length} matching templates • Click "Use this template" to start building your CV
            </p>
          </div>
        )}
      </div>

      {previewTemplate && (
        <PreviewModal
          isOpen={true}
          onClose={() => setPreviewTemplate(null)}
          template={previewTemplate.template}
          accentColor={previewTemplate.accentColor}
          onUseTemplate={() => handleUseTemplate(previewTemplate)}
        />
      )}
    </div>
  );
}