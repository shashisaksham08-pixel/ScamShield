\# ScamShield 🛡️



\*\*Check before you pay. Act fast if you already did.\*\*



Built for \*\*wHACKiest 2026 | Track 1: Make MCP Matter\*\*



\## About the Project



ScamShield is an MCP-based fraud detection and prevention system that we are building to help people identify potential online scams and take the right steps if they become victims of financial fraud.



The idea behind ScamShield is simple. Before making a payment or trusting a suspicious message, users should be able to check for possible scam indicators. If they have already lost money, the system should guide them on what to do next.



We wanted to bring both of these functionalities together in one system using the Model Context Protocol (MCP).



\## Problem Statement



With the increasing use of UPI and digital payments in India, scams such as fake KYC messages, phishing links, digital arrests and fraudulent payment requests have become a major concern.



Many people are unaware of how to identify these scams. Even after realizing that they have been scammed, they may not know whom to contact or what steps to take.



Through ScamShield, we aim to help users make better decisions before making payments and reduce the confusion after a fraud has occurred.



\## Features



We have currently implemented 10 MCP tools.



| Feature | Description |

|---|---|

| Message Scanner | Checks suspicious messages for common scam indicators. |

| URL Checker | Identifies suspicious patterns in URLs. |

| UPI Checker | Checks UPI ID formats and suspicious patterns. |

| Phone Checker | Checks phone number formats and patterns. |

| Before You Pay | Combines multiple checks before making a payment. |

| Golden Hour Mode | Guides victims on what to do immediately after financial fraud. |

| Bank Complaint Generator | Generates a complaint draft that users can review and submit. |

| Complaint Tracker | Suggests further steps based on the complaint status provided by the user. |

| Family Guard | Generates warning messages for family members. |

| Security Audit | Shows the current capabilities and limitations of ScamShield. |



\## How It Works



The user provides a suspicious message, URL, UPI ID or phone number. The respective MCP tool checks the input for known fraud indicators.



Based on the detected indicators, the risk engine calculates a risk score and provides an explanation along with recommended safety measures.



The basic workflow is:



```text

User Input

&#x20;   |

&#x20;   v

MCP Server

&#x20;   |

&#x20;   v

Fraud Detection Tools

&#x20;   |

&#x20;   v

Risk Assessment Engine

&#x20;   |

&#x20;   v

Risk Score and Explanation

&#x20;   |

&#x20;   v

Recommended Action

```



\## Risk Detection Engine



Instead of simply classifying an input as safe or unsafe, we use a weighted risk scoring system.



The risk engine considers:



\- Detected fraud indicators

\- Weight of each indicator

\- Confidence value

\- Source reliability



Based on these factors, a risk score between 0 and 100 is generated.



| Risk Score | Risk Level |

|---|---|

| 0–29 | Low Risk |

| 30–59 | Medium Risk |

| 60–79 | High Risk |

| 80–100 | Critical Risk |



We have also created a separate signal registry so that we can easily add more fraud detection patterns in the future.



The complete integration of this centralized detector with all MCP tools is still in progress.



\## Example



During testing, we provided the following message:



> Your bank account will be blocked. Urgent KYC verification required. Share your OTP immediately or face digital arrest.



The system returned a risk score of \*\*77/100 (High Risk)\*\* and detected the following indicators:



\- Urgency

\- OTP request

\- KYC-related wording

\- Digital arrest



Based on these indicators, the system recommended avoiding suspicious links and payments and verifying the information independently.



\## Technology Stack



\- TypeScript

\- Node.js

\- Model Context Protocol (MCP)

\- Zod

\- JSON

\- MCP Inspector

\- Git and GitHub



\## Project Structure



```text

ScamShield/

├── .gitignore

├── README.md

└── mcp-server/

&#x20;   ├── package.json

&#x20;   ├── package-lock.json

&#x20;   ├── tsconfig.json

&#x20;   └── src/

&#x20;       ├── index.ts

&#x20;       └── engines/

&#x20;           ├── fraud/

&#x20;           │   ├── fraud-detector.ts

&#x20;           │   ├── fraud-detector.test.ts

&#x20;           │   └── risk-engine.ts

&#x20;           └── intelligence/

&#x20;               └── signal-registry.ts

```



\## How to Run the Project



Make sure Node.js and Git are installed on your system.



\### Step 1: Clone the repository



```bash

git clone https://github.com/shashisaksham08-pixel/ScamShield.git

```



\### Step 2: Open the backend folder



```bash

cd ScamShield/mcp-server

```



\### Step 3: Install dependencies



```bash

npm install

```



\### Step 4: Check for TypeScript errors



```bash

npx tsc --noEmit

```



\### Step 5: Run MCP Inspector



For Windows:



```powershell

npx.cmd -y @modelcontextprotocol/inspector node\_modules/.bin/tsx.cmd src/index.ts

```



For macOS/Linux:



```bash

npx -y @modelcontextprotocol/inspector node\_modules/.bin/tsx src/index.ts

```



Open the URL displayed in the terminal, connect to the MCP server and select the tool you want to test.



\## Testing



We have manually tested all 10 MCP tools using MCP Inspector.



We have also tested our standalone fraud detector using different inputs, including:



\- Digital arrest messages

\- Suspicious UPI IDs

\- Punycode URLs

\- Normal messages



The TypeScript compilation was completed successfully without errors.



To run the standalone detector tests:



```bash

npx tsx src/engines/fraud/fraud-detector.test.ts

```



Further testing and improvements to the risk scoring system are planned.



\## Safety and Privacy



While developing ScamShield, we wanted to make sure that the system itself does not introduce additional security risks.



\- The system does not perform financial transactions.

\- It does not ask users for their OTP, PIN, CVV or passwords.

\- Complaints and family warnings are generated as drafts only.

\- Users have complete control over further actions.



\## Current Limitations



Since this is currently an MVP, there are a few limitations:



\- Fraud detection is mainly rule-based.

\- Live banking and UPI verification are not available.

\- Phone numbers are not checked against live reputation databases.

\- Government complaint tracking is not directly integrated.

\- The risk scoring system needs further testing and calibration.



\## Future Improvements



\- \[ ] Improve the fraud detection engine

\- \[ ] Integrate the centralized detector with all tools

\- \[ ] Develop a user-friendly interface

\- \[ ] Add QR code analysis

\- \[ ] Integrate verified fraud intelligence sources

\- \[ ] Add AI-assisted scam detection

\- \[ ] Implement authentication and data storage

\- \[ ] Improve automated testing



\## Current Status



The backend MVP is working, and all 10 MCP tools have been implemented and manually tested.



We are currently working on improving the detection engine, integrating additional features and making the overall system more reliable.



\## Emergency Resources



In case of financial cyber fraud in India:



\- Cybercrime Helpline: \*\*1930\*\*

\- National Cybercrime Reporting Portal: https://cybercrime.gov.in

\- Contact your bank through its official helpline.



\## Disclaimer



ScamShield is currently a prototype developed for a hackathon. The risk scores are based on detected indicators and should not be considered proof of fraud. A low risk score does not guarantee that an input is safe.



The system provides guidance but cannot guarantee the recovery of lost money.



\---



\*\*ScamShield — Prevent. Respond. Protect.\*\*

