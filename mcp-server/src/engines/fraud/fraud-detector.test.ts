
import {
  detectFraudIndicators,
} from "./fraud-detector.js";

const testCases = [
  {
    name: "Digital arrest message",
    input: "You are under digital arrest. Act urgent!",
    category: "MESSAGE" as const,
  },
  {
    name: "Suspicious UPI ID",
    input: "lotterywinner@unknown",
    category: "UPI" as const,
  },
  {
    name: "Punycode URL",
    input: "https://xn--example-abc.com/login",
    category: "URL" as const,
  },
  {
    name: "Normal message",
    input: "Hello, how are you?",
    category: "MESSAGE" as const,
  },
];

for (const test of testCases) {
  const result = detectFraudIndicators(
    test.input,
    test.category
  );

  console.log("\n------------------------------");
  console.log("TEST:", test.name);
  console.log("CATEGORY:", result.category);
  console.log("RISK SCORE:", result.assessment.riskScore);
  console.log("VERDICT:", result.assessment.verdict);
  console.log("SIGNALS:", result.detectedSignalIds);
}
