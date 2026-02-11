export interface PricingTier {
  id: string;
  icon: string;
  name: string;
  price: string;
  period?: string;
  features: string[];
  highlight?: boolean;
  color: string;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content?: string;
  image?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  // New fields for Action Buttons (WhatsApp Link)
  actionUrl?: string;
  actionLabel?: string;
}