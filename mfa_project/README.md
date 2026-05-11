# MFA on AWS – Python Project

## Overview
This repository contains a **complete, production‑ready Python implementation** that:
- Generates a TOTP secret and QR code (compatible with Google Authenticator, Authy, etc.).
- Stores the secret securely in **AWS Secrets Manager** (encrypted with KMS).
- Creates and attaches a **virtual MFA device** to an IAM user using **Boto3**.
- Provides a simple CLI for provisioning, enabling, and verifying MFA.
- Includes helper scripts to deploy the required IAM policy, enable CloudTrail for audit logging, and run CI security checks.

The project is designed to be **stand‑alone** (run locally) but can also be referenced from your portfolio website as a showcase of cloud‑security automation.

---

## Directory Layout
```
 mfa_project/
 ├─ README.md               # ✅ This file
 ├─ requirements.txt         # 📦 Python dependencies
 ├─ mfa.py                  # 🖥️ Main CLI implementation
 ├─ aws_helpers.py          # 🔧 Helper wrapper around Boto3 calls
 ├─ deploy.sh               # 🚀 Bash script to set up IAM policy & CloudTrail
 ├─ security.txt            # 📄 Security disclosure contact
 └─ .github/
    └─ workflows/
        └─ ci.yml          # 🔎 GitHub Actions CI (bandit, pylint, safety)
```
---

## Prerequisites
- **Python 3.10+**
- **AWS CLI** configured with credentials that have permission to create IAM resources, Secrets Manager secrets, and CloudTrail trails.
- **Git** (to clone the repo and run CI locally if desired).

---

## Setup
```bash
# 1️⃣ Clone the repo
git clone https://github.com/Heizenji/mfa-iam-tool.git
cd mfa_project

# 2️⃣ Create a virtual environment & install deps
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 3️⃣ Run the deployment helper (creates policy, enables CloudTrail)
./deploy.sh your-iam-username
```
The script will:
- Create an **IAM policy** (`MFAProvisionPolicy`) granting the least‑privilege actions needed.
- Attach that policy to the specified IAM user.
- Ensure **CloudTrail** is enabled (audit logs for every IAM change).

---

## Usage
### 1️⃣ Provision a new virtual MFA device
```bash
python mfa.py provision --user your-iam-username
```
- Generates a base‑32 secret.
- Saves a QR code under `qr_codes/<username>.png`.
- Stores the secret in Secrets Manager under `aws/mfa/<username>`.
- Prints the **Serial Number** of the virtual device.

### 2️⃣ Enable the device (requires two consecutive OTPs)
```bash
python mfa.py enable --user your-iam-username \
    --code1 123456 --code2 654321
```
The script validates the OTPs against the stored secret and calls `iam.enable_mfa_device`.

### 3️⃣ Verify a single OTP (useful for troubleshooting)
```bash
python mfa.py verify --user your-iam-username --token 123456
```
Returns `✅ Valid token` or `❌ Invalid token`.

---

## Security Considerations
- **No secrets are ever written to disk** – they are stored only in AWS Secrets Manager (encrypted at rest with KMS).
- All AWS SDK calls use **TLS 1.2** (enforced in `aws_helpers.py`).
- The IAM policy follows the **principle of least privilege**; it does **not** grant `*` permissions.
- **CloudTrail** ensures every change is logged and immutable (enable S3 bucket Object Lock in production).
- The repository includes a **GitHub Actions pipeline** that runs static analysis (`bandit`), linting (`pylint`), and vulnerability scanning (`safety`).
- A `security.txt` file is provided for responsible disclosure.

---

## CI / CD Pipeline
`.github/workflows/ci.yml` runs on every push and PR:
- **Bandit** – detects insecure cryptographic usage, hard‑coded credentials, etc.
- **Pylint** – enforces code style and catches bugs.
- **Safety** – checks the dependency lock‑file for known CVEs.
- The pipeline fails on any finding, ensuring the code stays secure.

---

## Extending / Integrating
- **Web integration** – you can expose a simple Flask or FastAPI endpoint that calls `mfa.py` functions, then embed a link/button on your portfolio site.
- **Terraform** – the `deploy.sh` logic can be translated to Terraform for infrastructure‑as‑code.
- **Docker** – containerise the CLI for CI or for an internal toolset.

---

## License
MIT – feel free to clone, modify, and showcase this project on your portfolio or GitHub.

---

**Happy securing!**
