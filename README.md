# PCA Visualizer

An interactive Principal Component Analysis (PCA) visualization built with React and Vite.

🔗 **Live site:** https://sumuko98.github.io/PCA/

---

## Deploying to GitHub Pages (one-time setup)

The repository already contains everything needed to deploy automatically. You just need to complete two steps in the GitHub UI.

### Step 1 — Merge the pull request

1. Go to the **Pull requests** tab in this repository
2. Open the open pull request
3. Click **"Merge pull request"** → **"Confirm merge"**

This merges the deployment workflow into `main`.

### Step 2 — Enable GitHub Pages

> You do **not** need a custom domain. GitHub provides a free `github.io` URL automatically.

1. Go to **Settings** (top-right of the repo page)
2. In the left sidebar click **Pages**
3. Under **"Build and deployment"**, set **Source** to **"GitHub Actions"**
4. Click **Save**

That's it! After merging the PR, the Actions workflow will run automatically and publish the site.  
You can watch it run under the **Actions** tab. Once it finishes (usually ~1–2 minutes) the site will be live at:

```
https://sumuko98.github.io/PCA/
```

---

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build        # output goes to dist/
npm run preview      # preview the production build locally
```
