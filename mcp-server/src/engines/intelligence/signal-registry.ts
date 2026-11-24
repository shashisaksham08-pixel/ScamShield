
export type SignalCategory =
  | "MESSAGE"
  | "URL"
  | "UPI"
  | "PHONE"
  | "PAYMENT";

export interface IntelligenceSignal {
  id: string;
  category: SignalCategory;
  pattern: string;
  description: string;
  weight: number;
  confidence: number;
}

export const SIGNAL_REGISTRY: IntelligenceSignal[] = [
  // MESSAGE indicators
  {
    id: "MSG_URGENT",
    category: "MESSAGE",
    pattern: "urgent",
    description: "Urgency or pressure tactics",
    weight: 15,
    confidence: 0.8,
  },
  {
    id: "MSG_OTP",
    category: "MESSAGE",
    pattern: "otp",
    description: "OTP-related request or wording",
    weight: 25,
    confidence: 0.9,
  },
  {
    id: "MSG_KYC",
    category: "MESSAGE",
    pattern: "kyc",
    description: "KYC-related message",
    weight: 15,
    confidence: 0.8,
  },
  {
    id: "MSG_DIGITAL_ARREST",
    category: "MESSAGE",
    pattern: "digital arrest",
    description: "Digital arrest impersonation wording",
    weight: 70,
    confidence: 0.9,
  },
  {
    id: "MSG_PRIZE",
    category: "MESSAGE",
    pattern: "prize",
    description: "Prize or reward bait",
    weight: 15,
    confidence: 0.7,
  },
  {
    id: "MSG_SEND_MONEY",
    category: "MESSAGE",
    pattern: "send money",
    description: "Direct request to transfer money",
    weight: 20,
    confidence: 0.8,
  },

  // URL indicators
 {
  id: "URL_HTTP",
  category: "URL",
  pattern: "http://",
  description: "Website does not use HTTPS",
  weight: 20,
  confidence: 0.95,
 },
  {
    id: "URL_PUNYCODE",
    category: "URL",
    pattern: "xn--",
    description: "Internationalized punycode domain",
    weight: 45,
    confidence: 0.9,
  },
  {
    id: "URL_SHORTENER",
    category: "URL",
    pattern: "bit.ly",
    description: "URL shortener domain",
    weight: 15,
    confidence: 0.95,
  },

  // UPI indicators
  {
    id: "UPI_REFUND",
    category: "UPI",
    pattern: "refund",
    description: "Refund-related identifier wording",
    weight: 20,
    confidence: 0.7,
  },
  {
    id: "UPI_LOTTERY",
    category: "UPI",
    pattern: "lottery",
    description: "Lottery-related identifier wording",
    weight: 45,
    confidence: 0.8,
  },
  {
    id: "UPI_REWARD",
    category: "UPI",
    pattern: "reward",
    description: "Reward-related identifier wording",
    weight: 20,
    confidence: 0.7,
  },
];

export function getSignalsByCategory(
  category: SignalCategory
): IntelligenceSignal[] {
  return SIGNAL_REGISTRY.filter(
    signal => signal.category === category
  );
}

export function detectRegisteredSignals(
  input: string,
  category: SignalCategory
): IntelligenceSignal[] {
  const normalizedInput = input.toLowerCase();

  return getSignalsByCategory(category).filter(
    signal => normalizedInput.includes(signal.pattern.toLowerCase())
  );
}
