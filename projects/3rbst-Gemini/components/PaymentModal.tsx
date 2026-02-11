import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { PricingTier } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: PricingTier;
}

// REPLACE THIS WITH YOUR ACTUAL PAYPAL CLIENT ID FROM DEVELOPER.PAYPAL.COM
const PAYPAL_CLIENT_ID = "AT-QAuhTdArYh03mlWq0w_cbn-j1SVRM8Z5coeyCVaUqF64cIUafpBZk0vaL8Gxg_4fprlWp427oIj5d"; 

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, tier }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'input' | 'payment' | 'success'>('input');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation: must contain numbers, at least 10 digits
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      setError('يرجى إدخال رقم واتساب صحيح (مع مفتاح الدولة، مثال: 49151...)');
      return;
    }
    setStep('payment');
    setError('');
  };

  const handleApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order.capture();
      
      // Call our API to update Supabase
      // We now send the tierId, so the server calculates the credits (More Secure)
      const response = await fetch('/api/fulfill-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''), // Send clean number
          tierId: tier.id, // Server decides how many credits this is worth
          orderId: details.id,
          amount: tier.price
        })
      });

      if (response.ok) {
        setStep('success');
      } else {
        setError('حدث خطأ أثناء تحديث الرصيد. يرجى التواصل مع الدعم وإرسال إيصال الدفع.');
      }
    } catch (err) {
      console.error(err);
      setError('فشلت عملية الدفع. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
        {/* Header */}
        <div className="bg-[#075e54] p-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <h3 className="text-xl font-bold mb-1">شراء باقة {tier.name}</h3>
          <p className="opacity-90">{tier.price} - {tier.period}</p>
        </div>

        <div className="p-6">
          {step === 'input' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </div>
                <h4 className="font-bold text-gray-800">لمن تريد شحن الرصيد؟</h4>
                <p className="text-sm text-gray-500 mt-1">أدخل رقم الواتساب الذي ستستخدمه لإرسال الوثائق.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الواتساب</label>
                <input 
                  type="tel" 
                  placeholder="4915123456789"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-left"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  dir="ltr"
                  required
                />
                <p className="text-xs text-gray-400 mt-1 text-left" dir="ltr">Format: 49...</p>
              </div>

              {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>}

              <button 
                type="submit"
                className="w-full bg-[#075e54] text-white py-3 rounded-xl font-bold hover:bg-[#064e46] transition-colors"
              >
                متابعة للدفع
              </button>
            </form>
          )}

          {step === 'payment' && (
             <div className="space-y-4">
               <div className="text-center mb-4">
                 <p className="text-sm text-gray-500">سيتم شحن الرصيد للرقم:</p>
                 <p className="font-bold text-lg font-mono text-gray-800 tracking-wider" dir="ltr">{phoneNumber}</p>
                 <button onClick={() => setStep('input')} className="text-xs text-blue-500 underline mt-1">تغيير الرقم</button>
               </div>

               <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "EUR" }}>
                  <PayPalButtons 
                    style={{ layout: "vertical", shape: "rect" }} 
                    createOrder={(data, actions) => {
                        const amountValue = tier.price.replace('€', '');
                        return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [{
                                description: `3rbst - ${tier.name}`,
                                amount: {
                                    currency_code: 'EUR',
                                    value: amountValue
                                }
                            }]
                        });
                    }}
                    onApprove={handleApprove}
                  />
               </PayPalScriptProvider>
             </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 animate-bounce">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">تم الدفع بنجاح! 🎉</h3>
              <p className="text-gray-600 mb-6">تم إضافة الرصيد إلى حسابك.<br/>يمكنك الآن إرسال الوثائق عبر الواتساب.</p>
              <button 
                onClick={onClose}
                className="bg-[#25D366] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1ebc57] transition-colors"
              >
                حسناً
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};