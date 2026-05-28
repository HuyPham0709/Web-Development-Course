import { useState } from 'react';
import {
  X,
  Sparkles,
  User,
  Crown,
  Check,
  Lock,
} from 'lucide-react';

import { CheckoutPage } from './CheckoutPage';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  {
    id: 'basic',
    label: 'Basic',
    icon: <User className="w-4 h-4" />,
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-500',
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
    icon: <Sparkles className="w-4 h-4" />,
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600',
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
    icon: <Crown className="w-4 h-4" />,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600',
    monthly: 19.99,
    yearly: 15.99,
    features: [
      { text: 'Unlimited matches', active: true },
      { text: 'CV review AI', active: true },
      { text: 'Career coach', active: true },
    ],
  },
];

export function PricingModal({
  isOpen,
  onClose,
}: PricingModalProps) {

  const [isYearly, setIsYearly] = useState(false);
  const [selected, setSelected] = useState('pro');

  // STEP
  const [step, setStep] = 
        useState<'plans' | 'checkout'>('plans');

  if (!isOpen) return null;

  const selectedPlan = plans.find( p => p.id === selected )!; 
  const price = isYearly ? selectedPlan.yearly : selectedPlan.monthly;

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
            onClick={onClose}
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
                    : 'bg-gray-300'
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

                  <div
                    className={`w-8 h-8 rounded-lg ${plan.iconBg} flex items-center justify-center mb-2 ${
                      plan.popular ? 'mt-3' : ''
                    } ${plan.iconColor}`}
                  >
                    {plan.icon}
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
                onClick={() => setStep('checkout')}
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
            onSuccess={onClose}
          />
        )}
      </div>
    </div>
  );
}
