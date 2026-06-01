import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Building2, Eye, ExternalLink } from 'lucide-react';
import { getProfileViews, EmployerView } from '../../../services/candidateVisibilityService';

export const ProfileViews: React.FC = () => {
  const [views, setViews] = useState<EmployerView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfileViews()
      .then(setViews)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (views.length === 0) {
    return (
      <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 p-8 text-center">
        <Eye className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
        <h3 className="text-gray-900 dark:text-white font-medium">No profile views yet</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          When you enable "Allow Employers to find you", their profile visits will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-white/10">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Employers who viewed your profile
        </h2>
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-white/10">
        {views.map((view) => (
          <li key={view.employer_id} className="p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              {view.company_logo ? (
                <img
                  src={view.company_logo}
                  alt={view.company_name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-white/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {view.company_name}
                  </h3>
                  {view.is_new && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      New
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {formatDistanceToNow(new Date(view.viewed_at), {
                      addSuffix: true,
                      locale: enUS,
                    })}
                  </span>
                  <span>•</span>
                  <span>Viewed your profile</span>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};