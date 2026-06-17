#!/usr/bin/env python3
"""Deploy We Work app to VPS via SSH/SFTP"""

import os
import sys
import tarfile
import io

try:
    import paramiko
except ImportError:
    print("Installing paramiko...")
    os.system(f"{sys.executable} -m pip install paramiko")
    import paramiko

HOST     = "72.61.244.31"
PORT     = 22
USER     = "root"
PASSWORD = "Rushika@2726"
REMOTE   = "/opt/wework"
BASE     = r"c:\vaishnavi\we work"

SKIP_DIRS  = {"node_modules", ".git", "dist", "__pycache__", ".next"}
SKIP_FILES = {".env", "dev.db", "*.db"}

def should_skip(path):
    parts = path.replace("\\", "/").split("/")
    for p in parts:
        if p in SKIP_DIRS:
            return True
    return False

def build_tar():
    print("📦 Building archive...")
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for root, dirs, files in os.walk(BASE):
            dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
            for fname in files:
                if fname.endswith(".db"):
                    continue
                fpath = os.path.join(root, fname)
                rel   = os.path.relpath(fpath, BASE)
                if not should_skip(rel):
                    tar.add(fpath, arcname=rel)
    buf.seek(0)
    print(f"   Archive size: {buf.getbuffer().nbytes / 1024 / 1024:.1f} MB")
    return buf

def run(ssh, cmd, check=True):
    print(f"  $ {cmd}")
    _, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out: print(f"    {out}")
    if err and check: print(f"  ⚠  {err}")
    return out

def main():
    # Build archive
    archive = build_tar()

    # Connect
    print(f"\n🔌 Connecting to {HOST}...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=30)
    print("   Connected ✓")

    # Install Docker if missing
    print("\n🐳 Checking Docker...")
    docker_ver = run(ssh, "docker --version 2>/dev/null || echo MISSING", check=False)
    if "MISSING" in docker_ver:
        print("   Installing Docker...")
        run(ssh, "apt-get update -qq && apt-get install -y -qq docker.io docker-compose")
        run(ssh, "systemctl enable docker && systemctl start docker")
    else:
        print(f"   {docker_ver} ✓")

    # Check docker-compose
    dc_ver = run(ssh, "docker-compose --version 2>/dev/null || docker compose version 2>/dev/null || echo MISSING", check=False)
    if "MISSING" in dc_ver:
        print("   Installing docker-compose...")
        run(ssh, 'curl -sL "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose')
    else:
        print(f"   {dc_ver.splitlines()[0]} ✓")

    # Create remote dir
    run(ssh, f"mkdir -p {REMOTE}")

    # Upload archive
    print("\n📤 Uploading files...")
    sftp = ssh.open_sftp()
    sftp.putfo(archive, f"{REMOTE}/app.tar.gz")
    sftp.close()
    print("   Upload complete ✓")

    # Extract
    print("\n📂 Extracting...")
    run(ssh, f"cd {REMOTE} && tar -xzf app.tar.gz && rm app.tar.gz")

    # Stop old containers if any
    print("\n🛑 Stopping old containers...")
    run(ssh, f"cd {REMOTE} && docker-compose down 2>/dev/null || true", check=False)

    # Build and start
    print("\n🚀 Building and starting containers (this takes 3-5 min)...")
    _, stdout, stderr = ssh.exec_command(
        f"cd {REMOTE} && docker-compose up -d --build 2>&1",
        timeout=600
    )
    for line in stdout:
        print(f"   {line.rstrip()}")

    # Show status
    print("\n✅ Deployment complete!")
    status = run(ssh, "docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'")
    print(f"\n{status}")
    print(f"\n🌐 App is live at: http://{HOST}")
    print(f"   Admin login : admin@wework.com  / adminpass")
    print(f"   Manager login: manager@wework.com / manager123")

    ssh.close()

if __name__ == "__main__":
    main()
