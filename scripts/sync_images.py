import os
import json
import cloudinary
import cloudinary.uploader
import cloudinary.api
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io
from datetime import datetime

print("🚀 SCRIPT START: " + str(datetime.now()))

# 1. SETUP
try:
    gdrive_key = json.loads(os.environ['GDRIVE_KEY'])
    root_folder_id = os.environ['GDRIVE_FOLDER_ID']
    cloudinary.config(cloudinary_url=os.environ['CLOUDINARY_URL'])
    
    creds = service_account.Credentials.from_service_account_info(gdrive_key)
    drive_service = build('drive', 'v3', credentials=creds)
    print(f"✅ Credentials Loaded. Targeting GDrive ID: {root_folder_id}")
except Exception as e:
    print(f"❌ Setup Error: {e}")
    exit(1)

BASE_CLOUDINARY_PATH = "Lina_Portfolio"

def sync_all():
    # --- STEP 1: SCAN GDRIVE ---
    print("📡 Scanning Google Drive for subfolders...")
    query = f"'{root_folder_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    folder_results = drive_service.files().list(q=query, fields="files(id, name)").execute()
    subfolders = folder_results.get('files', [])
    
    if not subfolders:
        print("⚠️ No subfolders found! Is the GDrive ID correct and Shared with the Robot email?")
        return

    print(f"📂 Found {len(subfolders)} subfolders: {[f['name'] for f in subfolders]}")

    # --- STEP 2: SYNC FILES ---
    for folder in subfolders:
        folder_name = folder['name'].lower() # lowercase for consistency
        print(f"--- Processing Folder: {folder_name} ---")
        
        # Get media in this subfolder
        m_query = f"'{folder['id']}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')"
        media_results = drive_service.files().list(q=m_query, fields="files(id, name, mimeType)").execute()
        media_files = media_results.get('files', [])
        
        print(f"  📸 Found {len(media_files)} items in {folder_name}")

        manifest_data = []
        cld_path = f"{BASE_CLOUDINARY_PATH}/{folder_name}"

        for f in media_files:
            clean_name = os.path.splitext(f['name'])[0]
            print(f"  >> Syncing: {f['name']}")
            
            # Download from GDrive
            request = drive_service.files().get_media(fileId=f['id'])
            fh = io.BytesIO()
            downloader = MediaIoBaseDownload(fh, request)
            done = False
            while not done:
                _, done = downloader.next_chunk()
            
            fh.seek(0)
            # Upload to Cloudinary
            up_res = cloudinary.uploader.upload(fh, 
                public_id=clean_name,
                folder=cld_path,
                resource_type="auto",
                overwrite=True
            )
            
            # Add to Manifest
            manifest_data.append({
                "url": up_res['secure_url'],
                "type": "video" if "video" in f['mimeType'] else "image"
            })

        # --- STEP 3: WRITE JSON ---
        if folder_name in ["portfolio", "about"]:
            file_path = f"{folder_name}/{folder_name}-gallery.json"
            os.makedirs(folder_name, exist_ok=True)
            with open(file_path, 'w') as jf:
                json.dump(manifest_data, jf, indent=4)
            print(f"  💾 Saved manifest to: {file_path} ({len(manifest_data)} items)")

    # --- STEP 4: FORCE COMMIT FILE ---
    # This ensures GitHub ALWAYS sees a change to test the push logic
    with open("sync_report.txt", "w") as f:
        f.write(f"Last successful sync: {datetime.now()}")

if __name__ == "__main__":
    sync_all()
    print("✨ SCRIPT FINISHED")
