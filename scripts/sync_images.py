import os
import json
import cloudinary
import cloudinary.uploader
import cloudinary.api
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

# 1. Setup
gdrive_key = json.loads(os.environ['GDRIVE_KEY'])
root_folder_id = os.environ['GDRIVE_FOLDER_ID'] 
cloudinary.config(cloudinary_url=os.environ['CLOUDINARY_URL'])

creds = service_account.Credentials.from_service_account_info(gdrive_key)
drive_service = build('drive', 'v3', credentials=creds)

BASE_CLOUDINARY_PATH = "Lina_Portfolio"

def get_gdrive_subfolders(parent_id):
    query = f"'{parent_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    results = drive_service.files().list(q=query, fields="files(id, name)").execute()
    return results.get('files', [])

def get_gdrive_media(parent_id):
    query = f"'{parent_id}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')"
    results = drive_service.files().list(q=query, fields="files(id, name, mimeType)").execute()
    return results.get('files', [])

def sync_folder(gdrive_id, current_path):
    print(f"📁 Syncing: images/{current_path if current_path else '(root)'}")
    
    # 1. Get GDrive State
    drive_media = get_gdrive_media(gdrive_id)
    # Map of filename (no extension) -> full file data
    drive_map = {os.path.splitext(f['name'])[0]: f for f in drive_media}

    # 2. Get Cloudinary State for this specific folder
    cld_folder_path = f"{BASE_CLOUDINARY_PATH}/{current_path}".strip("/")
    cld_resources = []
    
    for r_type in ['image', 'video']:
        # We use 'prefix' and 'max_results' to ensure we see the whole folder
        res = cloudinary.api.resources(type="upload", prefix=f"{cld_folder_path}/", resource_type=r_type, max_results=500)
        for r in res.get('resources', []):
            # Only count files directly in THIS folder (not subfolders)
            if os.path.dirname(r['public_id']) == cld_folder_path:
                cld_resources.append(r)

    cld_map = {r['public_id'].split('/')[-1]: r for r in cld_resources}

    # 3. UPLOAD/UPDATE PASS
    for name, f_data in drive_map.items():
        if name not in cld_map:
            print(f"  ➕ UPLOADING: {name}")
            request = drive_service.files().get_media(fileId=f_data['id'])
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while done is False:
                status, done = downloader.next_chunk()
            
            fh.seek(0)
            cloudinary.uploader.upload(fh, 
                public_id=name,
                folder=cld_folder_path,
                resource_type="auto",
                overwrite=True
            )

    # 4. DELETE PASS (The "No Mercy" Logic)
    for short_id, r_data in cld_map.items():
        if short_id not in drive_map:
            print(f"  🗑️ DELETING: {short_id} (Not found in GDrive)")
            cloudinary.uploader.destroy(r_data['public_id'], resource_type=r_data['resource_type'])

    # 5. RECURSE into Subfolders
    subfolders = get_gdrive_subfolders(gdrive_id)
    # Get list of folder names in Drive to compare against Cloudinary "Folders" later if needed
    for folder in subfolders:
        new_path = f"{current_path}/{folder['name']}".strip("/")
        sync_folder(folder['id'], new_path)

if __name__ == "__main__":
    print("🔄 Starting Full Mirror Sync (with Delete enabled)...")
    sync_folder(root_folder_id, "")
    print("✨ Sync Complete. Cloudinary is now an identical twin of GDrive.")
