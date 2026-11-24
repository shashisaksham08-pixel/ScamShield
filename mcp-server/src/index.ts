
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import process from "node:process";
import * as z from "zod/v4";
import { calculateRisk } from "./engines/fraud/risk-engine.js";
import {
  detectRegisteredSignals,
} from "./engines/intelligence/signal-registry.js";

const server = new McpServer({
  name: "scamshield",
  version: "1.0.0",
});

function result(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function assessRisk(
  signals: string[],
  weight = 20
) {
  const uniqueSignals = [...new Set(signals)];

  const assessment = calculateRisk(
    uniqueSignals.map((signal) => {
      const registered = detectRegisteredSignals(
        signal,
        "MESSAGE"
      );

      const match = registered[0];

      return {
        id: match?.id ?? signal,
        label: match?.description ?? signal,
        weight: match?.weight ?? weight,
        confidence: match?.confidence ?? 0.8,
        sourceReliability: 0.7,
        source: "rule-based",
        evidence: signal,
      };
    })
  );

  return {
    ...assessment,
    detectedIndicators: uniqueSignals,
  };
}// TOOL 1: Analyze suspicious messages
server.registerTool(
  "analyze_message",
  {
    title: "Analyze Suspicious Message",
    description: "Analyzes a message for common scam indicators.",
    inputSchema: {
      message: z.string().min(1),
    },
  },
  async ({ message }) => {
    const keywords = [
      "urgent",
      "account blocked",
      "verify your account",
      "click here",
      "otp",
      "kyc",
      "send money",
      "digital arrest",
      "prize",
    ];

    const lower = message.toLowerCase();
    const detected = keywords.filter(word => lower.includes(word));
    const assessment = assessRisk(detected, 15);

    return result({
      tool: "analyze_message",
      ...assessment,
      recommendation:
        assessment.riskScore >= 60
          ? "Do not click links or transfer money. Verify independently."
          : "Be cautious and verify the sender.",
      disclaimer:
        "Preliminary keyword-based analysis. This is not proof of fraud.",
    });
  }
);

// TOOL 2: Check URL
server.registerTool(
  "check_url",
  {
    title: "Check Suspicious URL",
    description: "Checks URL structure for suspicious characteristics.",
    inputSchema: {
      url: z.string().min(1),
    },
  },
  async ({ url }) => {
    const signals: string[] = [];

    try {
      const parsed = new URL(url);

      if (!["http:", "https:"].includes(parsed.protocol)) {
        signals.push("Unsupported URL protocol");
      }

      if (parsed.protocol !== "https:") {
        signals.push("Website does not use HTTPS");
      }

      if (parsed.hostname.includes("xn--")) {
        signals.push("Punycode domain detected");
      }

      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname)) {
        signals.push("IP address used instead of domain");
      }

      if (parsed.username || parsed.password) {
        signals.push("Credentials embedded in URL");
      }

      if (
        /bit\.ly|tinyurl\.com|t\.co|cutt\.ly/i.test(parsed.hostname)
      ) {
        signals.push("URL shortener detected");
      }

      if (
        /login|verify|account|bank|kyc|password|update/i.test(
          parsed.hostname + parsed.pathname + parsed.search
        )
      ) {
        signals.push("Sensitive account-related wording detected");
      }
    } catch {
      signals.push("Invalid URL format");
    }

    const assessment = assessRisk(signals, 20);

    return result({
      tool: "check_url",
      url,
      ...assessment,
      disclaimer:
        "Structural URL analysis only. No live domain reputation check is performed.",
    });
  }
);

// TOOL 3: Check UPI ID
server.registerTool(
  "check_upi",
  {
    title: "Check UPI ID",
    description: "Checks UPI ID format and suspicious naming patterns.",
    inputSchema: {
      upiId: z.string().min(1),
    },
  },
  async ({ upiId }) => {
    const signals: string[] = [];

    const valid = /^[a-z0-9._-]{2,256}@[a-z0-9.-]{2,64}$/i.test(upiId);

    if (!valid) {
      signals.push("Invalid UPI ID format");
    }

    const lower = upiId.toLowerCase();
    const suspiciousWords = [
      "refund",
      "lottery",
      "prize",
      "reward",
      "cashback",
      "claim",
    ];

    for (const word of suspiciousWords) {
      if (lower.includes(word)) {
        signals.push(`Suspicious keyword: ${word}`);
      }
    }

    const username = upiId.split("@")[0] ?? "";

    if (username.length < 4) {
      signals.push("Very short UPI username");
    }

    if (/unknown|temporary|unverified/i.test(upiId)) {
      signals.push("Unverified-looking identifier");
    }

    const assessment = assessRisk(signals, 25);

    return result({
      tool: "check_upi",
      upiId,
      formatValid: valid,
      ...assessment,
      disclaimer:
        "UPI format analysis does not verify the account holder or establish fraud.",
    });
  }
);

// TOOL 4: Check phone number
server.registerTool(
  "check_phone",
  {
    title: "Check Phone Number",
    description: "Checks Indian mobile number formatting and patterns.",
    inputSchema: {
      phone: z.string().min(1),
    },
  },
  async ({ phone }) => {
    let normalized = phone.replace(/[\s-()]/g, "");

    if (normalized.startsWith("+91")) {
      normalized = normalized.slice(3);
    } else if (normalized.startsWith("91") && normalized.length === 12) {
      normalized = normalized.slice(2);
    }

    const signals: string[] = [];
    const valid = /^[6-9]\d{9}$/.test(normalized);

    if (!valid) {
      signals.push("Invalid Indian mobile number format");
    }

    if (/^(\d)\1{9}$/.test(normalized)) {
      signals.push("Repeated-digit number pattern");
    }

    if (
      normalized === "1234567890" ||
      normalized === "9876543210"
    ) {
      signals.push("Sequential number pattern");
    }

    const assessment = assessRisk(signals, 30);

    return result({
      tool: "check_phone",
      originalPhone: phone,
      normalizedPhone: normalized,
      formatValid: valid,
      ...assessment,
      disclaimer:
        "Number-pattern analysis only. It does not identify the caller or verify reputation.",
    });
  }
);

// TOOL 5: Before You Pay
server.registerTool(
  "before_you_pay",
  {
    title: "Before You Pay",
    description: "Combines message, URL, UPI and phone checks.",
    inputSchema: {
      message: z.string().optional(),
      url: z.string().optional(),
      upiId: z.string().optional(),
      phone: z.string().optional(),
    },
  },
  async ({ message, url, upiId, phone }) => {
    const checks: Record<string, unknown> = {};
    const scores: number[] = [];
    const verdicts: string[] = [];

    if (message) {
      const keywords = [
        "urgent", "account blocked", "verify your account",
        "click here", "otp", "kyc", "send money",
        "digital arrest", "prize",
      ];

      const detected = keywords.filter(word =>
        message.toLowerCase().includes(word)
      );

      const assessment = assessRisk(detected, 15);
      checks.message = assessment;
      scores.push(assessment.riskScore);
      verdicts.push(assessment.verdict);
    }

    if (url) {
      const signals: string[] = [];

      try {
        const parsed = new URL(url);

        if (parsed.protocol !== "https:") signals.push("Non-HTTPS URL");
        if (parsed.hostname.includes("xn--")) signals.push("Punycode domain");
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname)) {
          signals.push("IP address used as hostname");
        }
        if (parsed.username || parsed.password) {
          signals.push("Credentials embedded in URL");
        }
        if (/bit\.ly|tinyurl\.com|t\.co|cutt\.ly/i.test(parsed.hostname)) {
          signals.push("URL shortener detected");
        }
        if (/login|verify|account|bank|kyc|password/i.test(
          parsed.hostname + parsed.pathname + parsed.search
        )) {
          signals.push("Sensitive wording in URL");
        }
      } catch {
        signals.push("Invalid URL format");
      }

      const assessment = assessRisk(signals, 20);
      checks.url = assessment;
      scores.push(assessment.riskScore);
      verdicts.push(assessment.verdict);
    }

    if (upiId) {
      const signals: string[] = [];
      const valid = /^[a-z0-9._-]{2,256}@[a-z0-9.-]{2,64}$/i.test(upiId);

      if (!valid) signals.push("Invalid UPI ID format");
      if (/refund|lottery|prize|reward|cashback|claim/i.test(upiId)) {
        signals.push("Suspicious UPI keyword");
      }
      if ((upiId.split("@")[0] ?? "").length < 4) {
        signals.push("Very short UPI username");
      }
      if (/unknown|temporary|unverified/i.test(upiId)) {
        signals.push("Unverified-looking identifier");
      }

      const assessment = assessRisk(signals, 25);
      checks.upi = assessment;
      scores.push(assessment.riskScore);
      verdicts.push(assessment.verdict);
    }

    if (phone) {
      let normalized = phone.replace(/[\s-()]/g, "");
      if (normalized.startsWith("+91")) normalized = normalized.slice(3);
      else if (normalized.startsWith("91") && normalized.length === 12) {
        normalized = normalized.slice(2);
      }

      const signals: string[] = [];
      if (!/^[6-9]\d{9}$/.test(normalized)) {
        signals.push("Invalid Indian mobile number format");
      }
      if (/^(\d)\1{9}$/.test(normalized)) {
        signals.push("Repeated-digit number pattern");
      }

      const assessment = assessRisk(signals, 30);
      checks.phone = assessment;
      scores.push(assessment.riskScore);
      verdicts.push(assessment.verdict);
    }

    const overallScore = scores.length ? Math.max(...scores) : 0;

    const overallVerdict =
      verdicts.includes("Critical Risk") ? "Critical Risk" :
      verdicts.includes("High Risk") ? "High Risk" :
      verdicts.includes("Medium Risk") ? "Medium Risk" :
      "Low Risk";

    return result({
      tool: "before_you_pay",
      checksPerformed: Object.keys(checks),
      overallRiskScore: overallScore,
      overallVerdict,
      individualChecks: checks,
      recommendation:
        overallScore >= 60
          ? "Pause the transaction. Do not transfer money until independently verified."
          : "Verify the recipient and payment details before proceeding.",
      disclaimer:
        "Preliminary rule-based assessment. A low score does not guarantee safety.",
    });
  }
);

// TOOL 6: Golden Hour Help
server.registerTool(
  "golden_hour_help",
  {
    title: "Golden Hour Emergency Help",
    description: "Provides immediate steps after suspected financial fraud.",
    inputSchema: {
      amountLost: z.string().optional(),
      paymentMethod: z.string().optional(),
    },
  },
  async ({ amountLost, paymentMethod }) => {
    return result({
      tool: "golden_hour_help",
      amountLost: amountLost ?? "Not provided",
      paymentMethod: paymentMethod ?? "Not provided",
      emergencySteps: [
        "Immediately contact your bank using its official app or verified phone number.",
        "Request the bank to report and investigate the fraudulent transaction.",
        "Call India's cybercrime helpline 1930 as soon as possible.",
        "Submit a complaint at https://cybercrime.gov.in.",
        "Preserve transaction IDs, screenshots, phone numbers, messages and other evidence.",
        "Change compromised passwords and secure affected accounts.",
        "Keep complaint and bank reference numbers for follow-up.",
      ],
      safetyWarnings: [
        "Never share OTP, UPI PIN, CVV or passwords.",
        "Do not pay anyone claiming they can recover your money for a fee.",
        "Do not delete messages or transaction evidence.",
      ],
      disclaimer:
        "This is general emergency guidance, not a guarantee of fund recovery.",
    });
  }
);

// TOOL 7: Generate Bank Complaint
server.registerTool(
  "generate_bank_complaint",
  {
    title: "Generate Bank Complaint",
    description: "Creates a bank complaint draft. It does not send the complaint.",
    inputSchema: {
      bankName: z.string().min(1),
      amountLost: z.string().min(1),
      transactionId: z.string().min(1),
      incidentDate: z.string().min(1),
      incidentDescription: z.string().min(1),
    },
  },
  async ({
    bankName,
    amountLost,
    transactionId,
    incidentDate,
    incidentDescription,
  }) => {
    const draft = `
To,
The Customer Support / Fraud Department,
${bankName}

Subject: Urgent Complaint Regarding Suspected Fraudulent Transaction

Dear Sir/Madam,

I wish to report a suspected fraudulent transaction associated with my bank account.

Amount involved: ${amountLost}
Transaction ID: ${transactionId}
Incident date: ${incidentDate}

Incident description:
${incidentDescription}

I request you to investigate this transaction urgently, secure my account if necessary, and take appropriate steps to attempt to hold, trace or recover the funds wherever possible.

Please register my complaint and provide an acknowledgment or reference number.

I can provide relevant transaction records and supporting evidence through your official secure channel.

Thank you.

Regards,
[Your Name]
[Registered Contact Details]
`;

    return result({
      tool: "generate_bank_complaint",
      subject: "Urgent Complaint Regarding Suspected Fraudulent Transaction",
      complaintDraft: draft.trim(),
      status: "Draft generated - not sent",
      safetyNote:
        "Do not include OTP, UPI PIN, CVV, password or full card number.",
    });
  }
);

// TOOL 8: Track Complaint
server.registerTool(
  "track_complaint",
  {
    title: "Track Complaint",
    description: "Summarizes complaint details supplied by the user.",
    inputSchema: {
      acknowledgmentNumber: z.string().min(1),
      complaintDate: z.string().min(1),
      amountLost: z.string().min(1),
      currentStatus: z.enum([
        "Submitted",
        "Under Review",
        "Investigation",
        "Resolved",
        "Rejected",
      ]),
      notes: z.string().optional(),
    },
  },
  async ({
    acknowledgmentNumber,
    complaintDate,
    amountLost,
    currentStatus,
    notes,
  }) => {
    const nextAction =
      currentStatus === "Submitted"
        ? "Keep the acknowledgment number and check the official complaint portal."
        : currentStatus === "Under Review"
        ? "Monitor updates and preserve any additional evidence."
        : currentStatus === "Investigation"
        ? "Cooperate with the investigating authority and provide requested evidence through official channels."
        : currentStatus === "Resolved"
        ? "Review the resolution and retain the closure records."
        : "Contact the appropriate official authority for clarification or appeal options.";

    return result({
      tool: "track_complaint",
      acknowledgmentNumber,
      complaintDate,
      amountLost,
      currentStatus,
      notes: notes ?? "No additional notes",
      nextAction,
      reminder:
        "Keep your complaint reference and supporting evidence safe.",
      limitation:
        "Prototype tracker only. It does not connect to government systems or retrieve live complaint status.",
    });
  }
);

// TOOL 9: Family Guard
server.registerTool(
  "family_guard_review",
  {
    title: "Family Guard Message Review",
    description: "Reviews a forwarded message and creates a notification draft.",
    inputSchema: {
      forwardedMessage: z.string().min(1),
      senderLabel: z.string().optional(),
      trustedContactName: z.string().optional(),
    },
  },
  async ({
    forwardedMessage,
    senderLabel,
    trustedContactName,
  }) => {
    const keywords = [
      "urgent",
      "account blocked",
      "verify your account",
      "click here",
      "otp",
      "kyc",
      "send money",
      "digital arrest",
      "prize",
    ];

    const detected = keywords.filter(word =>
      forwardedMessage.toLowerCase().includes(word)
    );

    const assessment = assessRisk(detected, 15);

    const notificationDraft = `
ScamShield Family Guard Alert

Message sender: ${senderLabel ?? "Not specified"}
Risk verdict: ${assessment.verdict}
Risk score: ${assessment.riskScore}/100

Detected indicators:
${detected.length ? detected.join(", ") : "No configured indicators detected"}

Please independently verify this message before clicking links, sharing information or making payments.
`;

    return result({
      tool: "family_guard_review",
      trustedContact: trustedContactName ?? "Not specified",
      ...assessment,
      notificationDraft: notificationDraft.trim(),
      notificationStatus: "Draft generated - not sent",
      disclaimer:
        "Keyword-based preliminary analysis. It does not verify whether a message is fraudulent.",
    });
  }
);

// TOOL 10: Security Audit
server.registerTool(
  "scamshield_security_audit",
  {
    title: "ScamShield Security Audit",
    description:
      "Checks available ScamShield tools and summarizes prototype safety capabilities.",
    inputSchema: {},
  },
  async () => {
    const availableTools = [
      "analyze_message",
      "check_url",
      "check_upi",
      "check_phone",
      "before_you_pay",
      "golden_hour_help",
      "generate_bank_complaint",
      "track_complaint",
      "family_guard_review",
      "scamshield_security_audit",
    ];

    const capabilities = [
      "Suspicious message analysis",
      "URL structural risk checking",
      "UPI ID pattern checking",
      "Indian phone number pattern checking",
      "Combined before-you-pay assessment",
      "Emergency fraud response guidance",
      "Bank complaint draft generation",
      "Complaint tracking prototype",
      "Family Guard message review",
      "Security capability audit",
    ];

    const safetyChecks = [
      "No OTP, UPI PIN, CVV or password requested",
      "Complaint generation produces drafts only",
      "Family Guard notifications are drafts only",
      "No automatic payments or money transfers",
      "Users are advised to verify information independently",
      "Risk assessments include preliminary-analysis disclaimers",
    ];

    const limitations = [
      "Risk analysis currently uses rule-based checks",
      "No live bank account verification",
      "No live UPI account-holder verification",
      "No live phone number reputation database",
      "No automatic government complaint status retrieval",
      "No production fraud intelligence database connected yet",
      "This audit is not a penetration test or security certification",
    ];

    return result({
      product: "ScamShield",
      feature: "Security Audit",
      version: "1.0.0",
      auditStatus: "Prototype capability check completed",
      totalTools: availableTools.length,
      availableTools,
      capabilities,
      safetyChecks,
      limitations,
      recommendation:
        "Continue development with secure database persistence, authentication, logging, automated tests and verified threat intelligence integrations.",
      disclaimer:
        "This prototype capability audit does not certify application security or guarantee fraud detection accuracy.",
    });
  }
);

// Start MCP server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error: unknown) => {
  console.error("ScamShield MCP server failed:", error);
  process.exit(1);
});


//npm.cmd exec tsc -- --noEmit