import base64
with open('/tmp/file_attachments/Screenshot 2026-06-15 at 11.08.23 PM.png', 'rb') as f:
    print(base64.b64encode(f.read())[:100].decode('utf-8'))
