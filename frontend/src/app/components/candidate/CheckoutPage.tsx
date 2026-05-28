import { useState } from 'react';
import { ArrowLeft, Sparkles, Tag, CreditCard, Lock, Check } from 'lucide-react';

const VOUCHERS: Record<string, { type: 'percent' | 'fixed'; value: number; label: string }> = {
  SAVE20:   { type: 'percent', value: 20,   label: '20% off applied' },
  FREE10:   { type: 'fixed',   value: 1.00, label: '$1.00 off applied' },
  LAUNCH50: { type: 'percent', value: 50,   label: '50% off applied' },
};

interface CheckoutPageProps {
  plan: { id: string; label: string; price: number };
  onBack: () => void;
  onSuccess: () => void;
}

export function CheckoutPage({ plan, onBack, onSuccess }: CheckoutPageProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<typeof VOUCHERS[string] | null>(null);
  const [voucherMsg, setVoucherMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  const discount = appliedVoucher
    ? appliedVoucher.type === 'percent'
      ? plan.price * appliedVoucher.value / 100
      : appliedVoucher.value
    : 0;
  const total = Math.max(0, plan.price - discount);

  const handleApplyVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    if (!code) { setVoucherMsg({ text: 'Please enter a code.', type: 'error' }); return; }
    if (VOUCHERS[code]) {
      setAppliedVoucher(VOUCHERS[code]);
      setVoucherMsg({ text: VOUCHERS[code].label, type: 'success' });
    } else {
      setAppliedVoucher(null);
      setVoucherMsg({ text: 'Invalid or expired code.', type: 'error' });
    }
  };

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').substring(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').substring(0, 4);
    return d.length >= 3 ? d.substring(0, 2) + ' / ' + d.substring(2) : d;
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      // TODO: gọi API
      // await createCheckoutSession({ plan: plan.id, voucher: voucherCode, total });
      await new Promise(r => setTimeout(r, 1200)); // mock
      setPaid(true);
      setTimeout(onSuccess, 2000);
    } finally {
      setLoading(false);
    }
  };

  if (paid) return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
        <Check className="w-7 h-7 text-emerald-600" />
      </div>
      <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Payment successful!</h3>
      <p className="text-sm text-gray-500">Your {plan.label} plan is now active.</p>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl bg-white dark:bg-[#0B0F19] border border-gray-100 dark:border-white/10 overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-white/5">
        <button onClick={onBack} className="p-1.5 rounded-lg border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5">
          <ArrowLeft className="w-4 h-4 text-gray-400" />
        </button>
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Complete your order</h2>
          <p className="text-[11px] text-gray-500">{plan.label} plan · Monthly billing</p>
        </div>
      </div>

      {/* Order summary */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">{plan.label} plan</p>
              <p className="text-[11px] text-gray-500">Unlimited AI matches</p>
            </div>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">${plan.price.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-100 dark:border-white/5 pt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtotal</span><span>${plan.price.toFixed(2)}</span>
          </div>
          {appliedVoucher && (
            <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400">
              <span>{appliedVoucher.label}</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-1.5 border-t border-gray-100 dark:border-white/5">
            <span>Total due today</span><span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">

        {/* Voucher */}
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2">
            <Tag className="w-3.5 h-3.5" /> Voucher code
          </label>
          <div className="flex gap-2">
            <input
              value={voucherCode}
              onChange={e => setVoucherCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleApplyVoucher()}
              disabled={!!appliedVoucher}
              placeholder="Enter voucher code"
              className="flex-1 h-9 px-3 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 disabled:opacity-50 outline-none focus:border-purple-400"
            />
            <button
              onClick={handleApplyVoucher}
              disabled={!!appliedVoucher}
              className={`px-4 h-9 rounded-xl text-xs font-bold text-white transition-colors ${
                appliedVoucher ? 'bg-emerald-500' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {appliedVoucher ? 'Applied' : 'Apply'}
            </button>
          </div>
          {voucherMsg && (
            <p className={`text-[11px] mt-1.5 ${voucherMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
              {voucherMsg.type === 'success' ? '✓' : '✕'} {voucherMsg.text}
            </p>
          )}
        </div>

        {/* Card details */}
        <div>
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mb-2">
            <CreditCard className="w-3.5 h-3.5" /> Card details
          </label>
          <div className="space-y-2">
            <input
              value={cardNum}
              onChange={e => setCardNum(formatCard(e.target.value))}
              placeholder="Card number"
              className="w-full h-9 px-3 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 outline-none focus:border-purple-400"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={expiry}
                onChange={e => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM / YY"
                className="h-9 px-3 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 outline-none focus:border-purple-400"
              />
              <input
                value={cvc}
                onChange={e => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                placeholder="CVC"
                className="h-9 px-3 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 outline-none focus:border-purple-400"
              />
            </div>
            <input
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              placeholder="Name on card"
              className="w-full h-9 px-3 text-xs rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 outline-none focus:border-purple-400"
            />
          </div>
        </div>

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-bold transition-colors"
        >
          {loading ? 'Processing...' : `Pay $${total.toFixed(2)} now`}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <Lock className="w-3 h-3" /> Secured by SSL · Cancel anytime
        </div>
      </div>
    </div>
  );
}