import os
import json
import cloudinary
import cloudinary.uploader
import cloudinary.api
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

# 1. Setup Credentials
gdrive_key = json.loads(os.environ['GDRIVE_KEY'])
folder_id = os.environ['GDRIVE_FOLDER_ID']
cloudinary.config(cloudinary_url=os.environ['CLOUDINARY_URL'])

creds = service_account.Credentials.from_service_account_info(gdrive_key)
drive_service = build('drive', 'v3', credentials=creds)

def sync():
    print("Checking Google Drive...")
    # Get files from GDrive
    results = drive_service.files().list(
        q=f"'{folder_id}' in parents and trashed = false",
        fields="files(id, name, mimeType)"
    ).execute()
    drive_files = results.get('files', [])
    drive_names = [f['name'] for f in drive_files]

    print(f"Found {len(drive_names)} files in Drive.")

    # Get files from Cloudinary
    # We use the tag 'about_page' to identify gallery images
    cloudinary_resources = cloudinary.api.resources_by_tag('about_page')['resources']
    cloudinary_names = [r['public_id'] for r in cloudinary_resources]

    # 2. ADD NEW FILES
    for f in drive_files:
        # We strip extension for the public_id comparison
        public_id = os.path.splitext(f['name'])[0]
        if public_id not in cloudinary_names:
            print(f"Uploading new image: {f['name']}")
            request = drive_service.files().get_media(fileId=f['id'])
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while done is False:
                status, done = downloader.next_chunk()
            
            fh.seek(0)
            cloudinary.uploader.upload(fh, 
                public_id=public_id,
                tags=['about_page'],
                overwrite=True
            )

    # 3. DELETE REMOVED FILES
    for public_id in cloudinary_names:
        # Check if this public_id (filename) still exists in Drive
        if not any(os.path.splitext(n)[0] == public_id for n in drive_names):
            print(f"Deleting removed image: {public_id}")
            cloudinary.uploader.destroy(public_id)

    print("Sync Complete!")

if __name__ == "__main__":
    sync()
