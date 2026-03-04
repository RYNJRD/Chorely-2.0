# Chorely-2.0

A chore management application — version 2.0.

---

## Migrating Your Project to This Repository

Yes, you can absolutely add **folders as well as individual files** to this repository! GitHub and Git fully support nested folder structures. Follow the steps below to migrate your saved project here.

### Option 1 — Command Line (Recommended)

This approach lets you push your entire project, including all folders, in one go.

1. **Clone this repository** to your local machine (if you haven't already):
   ```bash
   git clone https://github.com/RYNJRD/Chorely-2.0.git
   cd Chorely-2.0
   ```

2. **Copy your project files and folders** into the cloned `Chorely-2.0` directory.  
   You can drag-and-drop them in your file explorer, or use the command line:
   ```bash
   cp -r /path/to/your/saved/project/. .
   ```

3. **Stage all the new files and folders**:
   ```bash
   git add .
   ```

4. **Commit the changes**:
   ```bash
   git commit -m "Add project files and folders"
   ```

5. **Push to GitHub**:
   ```bash
   git push origin main
   ```

Your entire folder structure will now appear in the repository on GitHub.

---

### Option 2 — GitHub Web UI (Files Only, No Subfolders)

> ⚠️ The GitHub web interface only supports uploading individual files — it does **not** support uploading entire folders through drag-and-drop.  
> For migrating a project with folders, use **Option 1** above.

If you only need to upload a small number of individual files:

1. Go to the repository on GitHub.
2. Click **Add file → Upload files**.
3. Drag and drop your files or click to select them.
4. Scroll down and click **Commit changes**.

---

## Getting Started

Once your project files are here, update this README with:
- A description of the project
- Installation and setup instructions
- How to run the app
- Any other relevant documentation
