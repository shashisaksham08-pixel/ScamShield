
export type RiskLevel =
  | "Low Risk"
  | "Medium Risk"
  | "High Risk"
  | "Critical Risk";

export interface RiskSignal {
  id: string;
  label: string;
  weight: number;
  confidence: number;
  sourceReliability: number;
  source: string;
  evidence?: string;
}

export interface RiskAssessment {
  riskScore: number;
  verdict: RiskLevel;
  signalsDetected: number;
  reasons: string[];
  explanation: string;
}

export function calculateRisk(
  signals: RiskSignal[]
): RiskAssessment {
  // Remove duplicate signals
  const uniqueSignals = Array.from(
    new Map(
      signals.map(signal => [signal.id, signal])
    ).values()
  );

  // Validate signal values
  const validSignals = uniqueSignals.filter(signal =>
    Number.isFinite(signal.weight) &&
    Number.isFinite(signal.confidence) &&
    Number.isFinite(signal.sourceReliability) &&
    signal.weight >= 0 &&
    signal.weight <= 100 &&
    signal.confidence >= 0 &&
    signal.confidence <= 1 &&
    signal.sourceReliability >= 0 &&
    signal.sourceReliability <= 1
  );

  // Calculate adjusted signal contributions
  const totalWeight = validSignals.reduce(
    (total, signal) => {
      const adjustedWeight =
        signal.weight *
        signal.confidence *
        signal.sourceReliability;

      return total + adjustedWeight;
    },
    0
  );

  const riskScore = Math.min(
    Math.round(totalWeight),
    100
  );

  // Determine verdict
  let verdict: RiskLevel;

  if (riskScore >= 80) {
    verdict = "Critical Risk";
  } else if (riskScore >= 60) {
    verdict = "High Risk";
  } else if (riskScore >= 30) {
    verdict = "Medium Risk";
  } else {
    verdict = "Low Risk";
  }

  const reasons = validSignals.map(signal =>
    signal.evidence
      ? `${signal.label}: ${signal.evidence}`
      : signal.label
  );

  const explanation =
    validSignals.length === 0
      ? "No configured risk indicators were detected."
      : `${validSignals.length} distinct indicators contributed to this preliminary assessment.`;

  return {
    riskScore,
    verdict,
    signalsDetected: validSignals.length,
    reasons,
    explanation,
  };
}

