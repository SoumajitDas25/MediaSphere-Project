# Uploader Component – Cloudinary Signed Upload

This component handles **direct-to-Cloudinary uploads** of a video and its thumbnail image using **signed upload presets**.

## ⚙️ Workflow Overview

1. **Receive Files from Redux Slice**  
   The uploader accesses the selected files (video & thumbnail) from the Redux slice.

2. **Request Signed Upload Credentials**  
   For **each file**, a POST request is sent to the backend to fetch:
   - `timestamp`
   - `api_key`
   - `signature`
   - `folder`
   - `upload_url`

3. **Upload to Cloudinary**  
   - Each file is uploaded using `axios` to the `upload_url`(Cloudinary Upload API endpoint)
   - Payload is sent as `FormData` containing the file and its signed credentials.
   - **Per-file progress** is tracked via `onUploadProgress` of Axios.
   - A **combined upload progress** (based on the total bytes sent out of the total size for both files) is calculated and displayed in the UI.
   - UI updates are **throttled using Lodash's `throttle`** method to ensure smooth rendering without excessive re-renders.

4. **Post-Upload Handling**  
   Once both files are successfully uploaded:
   - Cloudinary response data (`secure_url`, `public_id`, etc.)
   - Additional upload metadata (from the slice)  
   ⮕ All are sent to the backend for persistence in the database.

## 📦 Technologies Used

- **Cloudinary Signed Upload API**
- **Axios** for uploads and progress callbacks
- **Lodash** (`throttle`) for smooth progress updates
- **Redux** for managing selected files
- **Node.js Backend** for generating Cloudinary signatures

## ✅ Notes

- Uploads are **authenticated per file** using signed credentials from the backend.
- Only supports uploading **one video and one thumbnail per session**(by design as per use-case).
- **Progress is visually represented as a single percentage**, reflecting the combined state of both uploads.

