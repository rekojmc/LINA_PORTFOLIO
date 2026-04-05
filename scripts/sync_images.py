import os
import json
import cloudinary
import cloudinary.uploader
import cloudinary.api
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload
import io

# --- CONFIG ---
BASE_CLOUDINARY_PATH = "Lina_Portfolio"

print("🔍 Initializing Script...")

try:
    gdrive_key = json.loads(os.environ['GDRIVE_KEY'])
    root_folder_id = os.environ['GDRIVE_FOLDER_ID'] 
    cloudinary.config(cloudinary_url=os.environ['CLOUDINARY_URL'])
    
    creds = service_account.Credentials.from_service_account_info(gdrive_key)
    drive_service = build('drive', 'v3', credentials=creds)
    print(f"✅ Credentials Loaded. Root ID: {root_folder_id}")
except Exception as e:
    print(f"❌ Initialization Error: {e}")
    exit(1)

def get_gdrive_subfolders(parent_id):
    query = f"'{parent_id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    results = drive_service.files().list(q=query, fields="files(id, name)").execute()
    return results.get('files', [])

def get_gdrive_media(parent_id):
    query = f"'{parent_id}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')"
    results = drive_service.files().list(q=query, fields="files(id, name, mimeType)").execute()
    return results.get('files', [])

def sync_folder(gdrive_id, current_path):
    print(f"📁 Checking GDrive Folder: images/{current_path if current_path else '(root)'}")
    
    drive_media = get_gdrive_media(gdrive_id)
    print(f"  > Found {len(drive_media)} media files in GDrive.")
    
    drive_map = {os.path.splitext(f['name'])[0]: f for f in drive_media}
    cld_folder_path = f"{BASE_CLOUDINARY_PATH}/{current_path}".strip("/")
    
    # Mirror Logic
    for name, f_data in drive_map.items():
        # (Upload logic here... exactly as before)
        pass 

    # Recurse
    subfolders = get_gdrive_subfolders(gdrive_id)
    for folder in subfolders:
        sync_folder(folder['id'], f"{current_path}/{folder['name']}".strip("/"))

def generate_split_manifests():
    print("📜 Generating Manifests...")
    
    # We will fetch ALL folders in Cloudinary under Lina_Portfolio 
    # to see what exists, regardless of case.
    try:
        # Get folders list
        folders_res = cloudinary.api.sub_folders(BASE_CLOUDINARY_PATH)
        existing_folders = [f['name'].lower() for f in folders_res.get('folders', [])]
        print(f"  > Folders found in Cloudinary: {existing_folders}")

        manifest_targets = {
            "portfolio": "portfolio/portfolio-gallery.json",
            "about": "about/about-gallery.json"
        }

        for target, file_path in manifest_targets.items():
            # Match the target (lowercase) to the actual folder name
            actual_folder = next((f['name'] for f in folders_res.get('folders', []) if f['name'].lower() == target), None)
            
            if not actual_folder:
                print(f"  ⚠️ Skipping {target}: Folder not found in Cloudinary.")
                continue

            print(f"  > Building manifest for: {actual_folder}")
            path = f"{BASE_CLOUDINARY_PATH}/{actual_folder}"
            manifest_data = []

            for r_type in ['image', 'video']:
                res = cloudinary.api.resources(type="upload", prefix=f"{path}/", resource_type=r_type, max_results=500)
                for r in res.get('resources', []):
                    manifest_data.append({
                        "url": r['secure_url'],
                        "type": r_type
                    })

            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, 'w') as f:
                json.dump(manifest_data, f, indent=4)
            print(f"  ✅ Created {file_path} with {len(manifest_data)} items.")

    except Exception as e:
        print(f"❌ Manifest Error: {e}")

if __name__ == "__main__":
    print("🔄 Starting Content Sync...")
    sync_folder(root_folder_id, "")
    generate_split_manifests()
    print("✨ Process Complete.")
