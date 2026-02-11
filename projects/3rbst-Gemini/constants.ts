import { PricingTier, Step } from "./types";

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'trial',
    icon: '🆓',
    name: 'تجربة مجانية',
    price: '€0',
    period: 'وثيقة واحدة',
    color: 'gray',
    features: [
      'تحليل كامل',
      'نتائج فورية',
      'بدون التزام'
    ]
  },
  {
    id: 'starter',
    icon: '💚',
    name: 'البداية',
    price: '€7',
    period: '5 وثائق',
    highlight: false,
    color: 'green',
    features: [
      '€1.40 للوثيقة',
      'صلاحية 6 أشهر',
      'دعم أولوية'
    ]
  },
  {
    id: 'value',
    icon: '💼',
    name: 'القيمة',
    price: '€15',
    period: '15 وثيقة',
    highlight: true,
    color: 'blue',
    features: [
      '€1 للوثيقة',
      'وفر €6',
      'صلاحية 12 شهر'
    ]
  },
  {
    id: 'unlimited',
    icon: '🏆',
    name: 'غير محدود',
    price: '€25',
    period: 'شهري',
    color: 'purple',
    features: [
      'وثائق غير محدودة',
      'صلاحية 30 يوم',
      'دعم VIP'
    ]
  }
];

export const HOW_IT_WORKS_STEPS: Step[] = [
  {
    number: "1",
    title: "اضغط على الرابط",
    description: "لا تحتاج لحفظ الرقم. اضغط على زر 'ابدأ' ليفتح الواتساب فوراً."
  },
  {
    number: "2",
    title: "أرسل صورة الوثيقة",
    description: "صور الرسالة الألمانية بوضوح وأرسلها في المحادثة."
  },
  {
    number: "3",
    title: "احصل على الشرح",
    description: "شرح كامل بالعربية مع الخطوات المطلوبة خلال دقائق."
  }
];

export const TRUST_SIGNALS = [
  {
    icon: '⚡',
    title: 'سريع ودقيق',
    desc: 'تحليل فوري ومراجعة ذكية'
  },
  {
    icon: '🇪🇺',
    title: 'متوافق مع GDPR',
    desc: 'خوادم ألمانية آمنة'
  },
  {
    icon: '🛡️',
    title: 'خصوصية تامة',
    desc: 'تشويش تلقائي للبيانات'
  }
];