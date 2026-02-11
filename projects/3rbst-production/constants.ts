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
      'شرح كامل',
      'فوري ودقيق',
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
    title: "افتح الواتساب",
    description: "اضغط على زر 'ابدأ المحادثة' - مثل أي محادثة عادية"
  },
  {
    number: "2",
    title: "صور الوثيقة",
    description: "صور الوثيقة الألمانية وأرسلها - بس كذا"
  },
  {
    number: "3",
    title: "احصل على الشرح",
    description: "شرح فوري ودقيق بالعربي - في أقل من 30 ثانية"
  }
];

export const TRUST_SIGNALS = [
  {
    icon: '⚡',
    title: 'شرح فوري',
    desc: 'أقل من 30 ثانية - متوفر 24/7'
  },
  {
    icon: '🎯',
    title: 'دقة عالية',
    desc: '98% نسبة دقة في الشرح'
  },
  {
    icon: '🔒',
    title: 'خصوصية تامة',
    desc: 'متوافق مع GDPR - آمن 100%'
  }
];