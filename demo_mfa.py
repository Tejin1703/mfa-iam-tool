#!/usr/bin/env python3
"""Demo script for MFA that uploads the QR code to S3 and prints a pre‑signed URL.

Steps performed:
1. Generate a TOTP secret.
2. Create a QR code PNG (saved locally).
3. Upload the PNG to an S3 bucket you own.
4. Generate a pre‑signed URL (valid for 1 hour) that can be shared.
5. Optionally create a virtual MFA device and store the secret in Secrets Manager.

Make sure you have AWS credentials configured (e.g. via `aws configure`). The script will
use the default profile and the region from your config.
"""

import argparse
import base64
import os
import sys
from pathlib import Path

import boto3
import pyotp
import qrcode
from botocore.exceptions import ClientError

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def generate_secret() -> str:
    """Create a 160‑bit base32 secret (RFC‑6238)."""
    return base64.b32encode(os.urandom(20)).decode("utf-8").replace("=", "")


def create_qr(secret: str, username: str, out_dir: Path) -> Path:
    """Save a QR PNG that Authenticator apps can scan.

    Returns the Path to the PNG file.
    """
    uri = f"otpauth://totp/AWS:{username}?secret={secret}&issuer=AWS"
    img = qrcode.make(uri)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{username}.png"
    img.save(out_path)
    print(f"✅ QR code saved to {out_path}")
    return out_path


def upload_to_s3(file_path: Path, bucket: str, object_name: str = None) -> str:
    """Upload a file to S3 and return the object name.

    If ``object_name`` is not provided, the filename is used.
    """
    s3 = boto3.client("s3")
    if object_name is None:
        object_name = file_path.name
    try:
        s3.upload_file(str(file_path), bucket, object_name)
        print(f"✅ Uploaded {file_path} to s3://{bucket}/{object_name}")
    except ClientError as e:
        print(f"❌ Failed to upload to S3: {e}")
        sys.exit(1)
    return object_name


def generate_presigned_url(bucket: str, object_name: str, expires: int = 3600) -> str:
    """Generate a pre‑signed URL for the given S3 object.

    ``expires`` is in seconds (default 1 hour).
    """
    s3 = boto3.client("s3")
    try:
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket, "Key": object_name},
            ExpiresIn=expires,
        )
        return url
    except ClientError as e:
        print(f"❌ Could not generate pre‑signed URL: {e}")
        sys.exit(1)

# ---------------------------------------------------------------------------
# Main CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(description="MFA demo that uploads QR to S3 and prints a link")
    parser.add_argument("--user", required=True, help="IAM username (used for QR label)")
    parser.add_argument("--bucket", required=True, help="S3 bucket name to store the QR image")
    parser.add_argument(
        "--expire",
        type=int,
        default=3600,
        help="Expiration time for pre‑signed URL in seconds (default 3600)",
    )
    args = parser.parse_args()

    secret = generate_secret()
    qr_path = create_qr(secret, args.user, Path("qr_demo"))

    # Upload QR to S3 and get a link
    obj_name = upload_to_s3(qr_path, args.bucket)
    link = generate_presigned_url(args.bucket, obj_name, expires=args.expire)
    print("\n--- MFA Demo Link ---")
    print(link)
    print("--- End of link ---\n")
    print("You can now share this URL; it will display the QR code for 1 hour (or the time you set).")
    print("The secret is stored locally; you can also store it in Secrets Manager using the existing mfa.py script.")


if __name__ == "__main__":
    main()
