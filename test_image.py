import subprocess
import os

try:
    # Use python's base64 to encode the image for easy viewing
    subprocess.run(["base64", "-w", "0", "/tmp/file_attachments/Screenshot 2026-06-15 at 11.08.23 PM.png"])
except Exception as e:
    print(e)
