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
    print("🚀 Starting Media Sync...")
    
    # --- THE FILTER: Grab anything that is an image OR a video ---
    query = f"'{folder_id}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')"
    
    results = drive_service.files().list(
        q=query,
        fields="files(id, name, mimeType)"
    ).execute()
    drive_files = results.get('files', [])
    drive_names = [os.path.splitext(f['name'])[0] for f in drive_files]

    print(f"📦 Found {len(drive_files)} media files in Drive.")

    # Get existing items from Cloudinary (both images and videos)
    # We check both types because Cloudinary keeps them in separate buckets
    cloudinary_resources = []
    for r_type in ['image', 'video']:
        res = cloudinary.api.resources_by_tag('about_page', resource_type=r_type)
        cloudinary_resources.extend(res.get('resources', []))
    
    cloudinary_ids = [r['public_id'] for r in cloudinary_resources]

    # 2. ADD NEW MEDIA
    for f in drive_files:
        public_id = os.path.splitext(f['name'])[0]
        
        if public_id not in cloudinary_ids:
            print(f"➕ Uploading: {f['name']} ({f['mimeType']})")
            
            request = drive_service.files().get_media(fileId=f['id'])
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while done is False:
                status, done = downloader.next_chunk()
            
            fh.seek(0)
            # 'resource_type="auto"' is the magic that handles videos vs images
            cloudinary.uploader.upload(fh, 
                public_id=public_id,
                tags=['about_page'],
                resource_type="auto", 
                overwrite=True
            )

    # 3. DELETE REMOVED MEDIA
    for res in cloudinary_resources:
        p_id = res['public_id']
        if p_id not in drive_names:
            print(f"🗑️ Deleting from Cloudinary: {p_id}")
            cloudinary.uploader.destroy(p_id, resource_type=res['resource_type'])

    print("✅ Sync Complete!")

if __name__ == "__main__":
    sync()
