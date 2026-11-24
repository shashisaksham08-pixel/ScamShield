
import {
  detectRegisteredSignals,
  type SignalCategory,
} from "../intelligence/signal-registry.js";

import {
  calculateRisk,
  type RiskAssessment,
} from "./risk-engine.js";

export interface FraudDetectionResult {
  category: SignalCategory;
  input: string;
  assessment: RiskAssessment;
  detectedSignalIds: string[];
}

export function detectFraudIndicators(
  input: string,
  category: SignalCategory
): FraudDetectionResult {
  const detectedSignals = detectRegisteredSignals(
    input,
    category
  );

  const assessment = calculateRisk(
    detectedSignals.map(signal => ({
      id: signal.id,
      label: signal.description,
      weight: signal.weight,
      confidence: signal.confidence,
      sourceReliability: 1,
      source: "ScamShield signal registry",
      evidence: `Matched pattern: ${signal.pattern}`,
    }))
  );

  return {
    category,
    input,
    assessment,
    detectedSignalIds: detectedSignals.map(
      signal => signal.id
    ),
  };
}
