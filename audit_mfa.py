import boto3

def audit_mfa():
    """Audit all IAM users and report their MFA status."""
    iam = boto3.client("iam")
    users = iam.list_users()

    print("=== MFA Audit Report ===")

    for user in users["Users"]:
        username = user["UserName"]
        mfa_devices = iam.list_mfa_devices(UserName=username)

        if len(mfa_devices["MFADevices"]) == 0:
            print(f"[!] {username} → NO MFA")
        else:
            print(f"[✓] {username} → MFA enabled")

if __name__ == "__main__":
    audit_mfa()
