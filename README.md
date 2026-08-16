# Developer Tool Suite (Compact Light Theme)

A lightweight, offline-ready, 100% client-side developer utility suite featuring a JSON Formatter, MySQL Formatter, and Diff Comparison utilities.

👉 **Live Demo:** [Deploy this to GitHub Pages or Cloudflare Pages to view it live]

---

## Features

- **Format / Beautify**: Format raw JSON strings into clean, readable structures with custom indentation (2 spaces, 4 spaces, tabs).
- **Compress / Minify**: Instantly remove all whitespaces, newlines, and tabs to minify JSON string sizes without breaking values.
- **Escape / Unescape**:
  - **Escape**: Convert raw text into a valid JSON string literal with escaped characters.
  - **Unescape**: Convert escaped string literals (with or without outer quotes, standard logs) back into raw readable JSON.
- **MySQL Formatter**: Standardizes and beautifies SQL queries by capitalizing keywords, structuring clauses on newlines, and preserving string literals.
- **Diff Comparer (JSON & Text)**: A side-by-side comparison tool that performs a line-by-line Longest Common Subsequence (LCS) diff. It highlights additions (green), deletions (red), and synchronizes scrolling between both panels.
- **Interactive Tree View**: Visualizes JSON data in a nested tree structure:
  - Toggle collapse/expand on objects and arrays using chevrons (▼/▶).
  - Syntax color-coded nodes based on data types (Strings, Numbers, Booleans, Nulls).
- **Search & Filter**: Real-time search that highlights matches in the tree view and automatically expands nested parents to expose results.
- **Drag-to-Resize Divider**: Smooth mouse dragging vertical separator to adjust editor and viewer panel widths dynamically.
- **Syntax Error Line Highlighting**: Immediate validation with an alert bar and a red line indicator highlighting the exact line of syntax errors.
- **100% Client-side**: Safe and private; no data is ever sent to any server.

---

## Installation & Usage (Local Development)

Since this is built with pure static assets (HTML5, Vanilla CSS3, Vanilla JS ES6+), no setup is required.

1. Clone this repository:
   ```bash
   git clone https://github.com/kgitti/kgitti.github.io.git
   ```
2. Open `index.html` in any modern web browser:
   ```bash
   open index.html
   ```

---

## Deployment to Cloudflare Pages (via GitHub Actions)

To keep your repository **Private** while hosting the web application publicly for free, you can deploy it to **Cloudflare Pages** using GitHub Actions.

### Step 1: Configure Credentials in GitHub
Add the following secrets to your private GitHub repository (Settings > Secrets and variables > Actions):
1. `CLOUDFLARE_API_TOKEN`: Create an API token in Cloudflare (My Profile > API Tokens > Create Token > Cloudflare Pages edit permissions).
2. `CLOUDFLARE_ACCOUNT_ID`: Obtain this from your Cloudflare Dashboard URL (the long string of numbers/letters after `dash.cloudflare.com/`).

### Step 2: Create a GitHub Actions Workflow File
Create a new file at `.github/workflows/deploy.yml` with the following configuration:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: 'your-cloudflare-project-name' # Replace with your Cloudflare Pages project name
          directory: '.' # Deploy files from the root directory
          gitBranch: 'master'
```

Once pushed, every commit to the `master` branch will automatically deploy your private repository code to Cloudflare Pages instantly.

---

## Development & Tech Stack
- **HTML5**: Semantic tags for clean structure.
- **Vanilla CSS3**: Compact design utilizing variables, CSS flexbox/grid layout, and smooth animations.
- **Vanilla JS**: Built-in JSON parser, custom recursive tree rendering engine, MySQL tokenizer, LCS diffing algorithm, and mouse drag coordinate listeners.
