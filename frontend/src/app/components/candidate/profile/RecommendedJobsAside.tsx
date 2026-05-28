import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  ChevronRight,
  MapPin,
  Clock3,
  Crown,
  Lock,
  Check,
  X,
  User,
} from 'lucide-react';
import { CheckoutPage } from '../CheckoutPage';

interface RecommendedJob {
  id: number;
  title: string;
  salary_min: number;
  salary_max: number;
  job_type: string;
  experience_level: string;
  company_logo: string | null;
  slug: string;
  created_at: string;
  company_name: string;
  location_name: string;
  match_score: number;
}

interface RecommendedJobsAsideProps {
  recommendedJobs?: RecommendedJob[];
  isPremium?: boolean;
  openModal: (
    type: 'personalInfo' | 'experience' | 'education' | 'skills' | null
  ) => void;
}

const plans = [
  {
    id: 'basic',
    label: 'Basic',
    monthly: 4.99,
    yearly: 3.99,
    features: [
      { text: '5 AI matches/day', active: true },
      { text: 'Match score', active: true },
      { text: 'Priority apply', active: false },
    ],
  },
  {
    id: 'pro',
    label: 'Pro',
    monthly: 9.99,
    yearly: 7.99,
    popular: true,
    features: [
      { text: 'Unlimited matches', active: true },
      { text: 'Match score', active: true },
      { text: 'Priority apply', active: true },
    ],
  },
  {
    id: 'elite',
    label: 'Elite',
    monthly: 19.99,
    yearly: 15.99,
    features: [
      { text: 'Unlimited matches', active: true },
      { text: 'CV review AI', active: true },
      { text: 'Career coach', active: true },
    ],
  },
];

//===========================================================================
//Voucher thử được: SAVE20 (giảm 20%), FREE10 (giảm $1), LAUNCH50 (giảm 50%).
//===========================================================================

function PricingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isYearly, setIsYearly] = useState(false);
  const [selected, setSelected] = useState('pro');

  // STEP
  const [step, setStep] = useState<'plans' | 'checkout'>('plans');

  if (!isOpen) return null;

  const selectedPlan = plans.find(p => p.id === selected)!;
  const price = isYearly
    ? selectedPlan.yearly
    : selectedPlan.monthly;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-[520px] rounded-2xl bg-white dark:bg-[#0B0F19] border border-gray-100 dark:border-white/10 overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Upgrade your plan
            </h2>

            <p className="text-xs text-gray-500 mt-0.5">
              Unlock AI job matching and more
            </p>
          </div>

          <button
            onClick={() => {
              setStep('plans');
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* STEP CONTENT */}
        {step === 'plans' ? (
          <>
            {/* BILLING TOGGLE */}
            <div className="flex items-center justify-center gap-3 py-3">
              <span className="text-xs text-gray-500">
                Monthly
              </span>

              <button
                onClick={() =>
                  setIsYearly(!isYearly)
                }
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  isYearly
                    ? 'bg-purple-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    isYearly
                      ? 'translate-x-5'
                      : 'translate-x-0.5'
                  }`}
                />
              </button>

              <span className="text-xs text-gray-500">
                Yearly
              </span>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                Save 20%
              </span>
            </div>

            {/* PLAN CARDS */}
            <div className="grid grid-cols-3 gap-3 px-5 pb-2">
              {plans.map(plan => (
                <button
                  key={plan.id}
                  onClick={() =>
                    setSelected(plan.id)
                  }
                  className={`relative text-left rounded-xl p-3 transition-all ${
                    selected === plan.id
                      ? 'border-2 border-purple-500'
                      : plan.popular
                      ? 'border-2 border-blue-400'
                      : 'border border-gray-100 dark:border-white/10'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-b-md whitespace-nowrap">
                      Most popular
                    </div>
                  )}

                  {/* ICON */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                      plan.popular ? 'mt-3' : ''
                    } ${
                      plan.id === 'basic'
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                        : plan.id === 'pro'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                    }`}
                  >
                    {plan.id === 'basic' && (
                      <User className="w-4 h-4" />
                    )}

                    {plan.id === 'pro' && (
                      <Sparkles className="w-4 h-4" />
                    )}

                    {plan.id === 'elite' && (
                      <Crown className="w-4 h-4" />
                    )}
                  </div>

                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {plan.label}
                  </div>

                  <div className="mt-1 mb-3">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      $
                      {(
                        isYearly
                          ? plan.yearly
                          : plan.monthly
                      ).toFixed(2)}
                    </span>

                    <span className="text-[10px] text-gray-400">
                      /mo
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {plan.features.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400"
                      >
                        {f.active ? (
                          <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        ) : (
                          <X className="w-3 h-3 text-gray-300 flex-shrink-0" />
                        )}

                        {f.text}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* CTA */}
            <div className="px-5 py-4">
              <button
                onClick={() =>
                  setStep('checkout')
                }
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold transition-colors"
              >
                Continue with {selectedPlan.label} — $
                {price.toFixed(2)}/
                {isYearly ? 'yr' : 'mo'}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-gray-400">
                <Lock className="w-3 h-3" />
                Secure payment · Cancel anytime
              </div>
            </div>
          </>
        ) : (
          <CheckoutPage
            plan={{
              id: selected,
              label: selectedPlan.label,
              price: price,
            }}
            onBack={() =>
              setStep('plans')
            }
            onSuccess={() => {
              setStep('plans');
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
}

export function RecommendedJobsAside({
  recommendedJobs = [],
  isPremium = false,
  openModal,
}: RecommendedJobsAsideProps) {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <aside className="hidden 2xl:block w-[360px] pl-6 flex-shrink-0 sticky top-24 self-start">
      <div className="space-y-4">

        {/* AI RECOMMENDED JOBS */}
        <div className="relative overflow-hidden rounded-[24px] border border-gray-100 dark:border-white/10 bg-white dark:bg-[#0B1120] shadow-sm dark:shadow-none">

          {/* Header */}
          <div className="relative px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-[12px] font-black uppercase tracking-wider text-gray-900 dark:text-white">
                  AI Job Matches
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Top picks for you
                </p>
              </div>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-600 dark:text-blue-400">
              PREMIUM
            </div>
          </div>

          {/* Jobs list với premium gate */}
          <div className="relative p-3 max-h-[580px] overflow-y-auto custom-scrollbar space-y-2">

            {/* Blur jobs khi chưa premium */}
            <div className={!isPremium ? 'opacity-25 blur-sm pointer-events-none select-none' : ''}>
              {recommendedJobs.length === 0 ? (
                <div className="py-12 text-center">
                  <Briefcase className="w-8 h-8 mx-auto text-gray-300 mb-3" />
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">No recommendations</h4>
                  <p className="text-[11px] text-gray-500">Complete profile to unlock</p>
                </div>
              ) : (
                recommendedJobs.map((job, idx) => (
                  <Link
                    key={job.id || idx}
                    to={`/job/${job.id}`}
                    className="group relative block rounded-2xl border border-transparent bg-gray-50/50 dark:bg-white/[0.03] p-3 transition-all hover:border-blue-500/30 hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-md"
                  >
                    <div className="flex gap-3">
                      <div className="relative w-11 h-11 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 dark:border-white/10 bg-white p-1.5">
                        <img
                          src={
                            job.company_logo ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company_name || 'C')}&background=random`
                          }
                          alt={job.company_name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[13px] text-gray-900 dark:text-white line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {job.company_name}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {job.location_name || 'Remote'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock3 className="w-3 h-3" /> {job.job_type}
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                          <span className="text-[12px] font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
                            {job.salary_min
                              ? `$${job.salary_min / 1000}k - $${job.salary_max / 1000}k`
                              : 'Negotiable'}
                          </span>
                          {job.match_score > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                                {job.match_score}%
                              </span>
                              <div className="w-12 h-1 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                  style={{ width: `${job.match_score}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Lock overlay khi chưa premium */}
            {!isPremium && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center mb-3">
                  <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Premium feature
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                  Upgrade to see AI-matched jobs tailored to your profile and skills.
                </p>
                <button
                  onClick={() => setShowPricing(true)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-bold transition-colors"
                >
                  Upgrade to Premium
                </button>
                <p className="text-[10px] text-gray-400 mt-2">From $4.99/month · Cancel anytime</p>
              </div>
            )}
          </div>
        </div>

        {/* PROFILE BOOST */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-indigo-600 to-blue-700 p-5 text-white shadow-lg">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span className="text-[10px] font-black tracking-widest uppercase opacity-90">Profile Boost</span>
            </div>
            <h3 className="text-lg font-bold leading-tight">Increase Match Score</h3>
            <div className="mt-4 p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="flex justify-between text-[10px] font-bold mb-1.5">
                <span>Strength</span>
                <span>80%</span>
              </div>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-[80%] bg-gradient-to-r from-cyan-400 to-white" />
              </div>
            </div>
            <button
              onClick={() => openModal('personalInfo')}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-[12px] font-black text-indigo-700 transition-all hover:bg-blue-50 active:scale-[0.98]"
            >
              Upgrade Profile
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
      </div>

      {/* Pricing Modal */}
      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </aside>
  );
}