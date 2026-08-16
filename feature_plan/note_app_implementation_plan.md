# Feature Plan: Web Note App (Version 1 - Refined Layout)

This document outlines the final UI/UX design and architecture specification for Version 1 of the **Web Note App**, focusing on space-efficiency, ease of navigation, and a clean, compact layout.

---

## 1. UI/UX Workspace Layout

```
+---------------------------------------------------------------------------------------------------------------------+
| ☰ Developer Tool Suite                      [ Category: Work v ] [ Saved Locally ✓ ]  [ 📥 Export ] [ 🗑 Delete ] |
+--------------------------------------------+------------------------------------------------------------------------+
| ☰ NAVIGATION SIDEBAR (Width: 240px)   + New| NOTE WORKSPACE (Width: Flex)                                           |
|Task:                                       |                                                                        |
| • ✅ Sprint Checklist (Tasks)              |                                                                        | 
|File:                                       |                                                                        |
|  • 📝 Weekly Update (Markdown)             |  Title Input: [ Project Architecture                                   ]  |
|  • 🌿 Project Architecture (YAML)          |  Note Type: [ YAML / Mindmap v ]                                       |
|  • 📄 DB Credentials (Text)                |                                                                        |
|                                            |  +--------------------------------+--------------------------------+   |
|                                            |  | YAML EDITOR                    | VISUALIZER (TABS)              |   |
|                                            |  |                                | [🌿 Mindmap]  [🗂 Tree View]   |   |
|                                            |  |  1: Project:                   |                                |   |
|                                            |  |  2:   Core:                    |   +-----------+   +------+     |   |
|                                            |  |  3:     HTML: Structure        |   |  Project  |===| Core |     |   |
|                                            |  |  4:     CSS: Style             |   +-----------+   +------+     |   |
|                                            |  |  5:     JS: Logic              |       ||              |        |   |
|                                            |  |  6:   Infrastructure:          |       ||              +--HTML  |   |
|                                            |  |  7:     Host: Cloudflare       |       +-[Infras]--Host         |   |
|                                            |  |                                |                                |   |
|                                            |  |                                |                                |   |
|                                            |  +--------------------------------+--------------------------------+   |
|                                            |  Lines: 7 | Words: 10             | Errors: None (Valid YAML)      |   |
+--------------------------------------------+------------------------------------------------------------------------+
```

---

## 2. Refined Design Features

### 2.1 Double Hamburger Toggle (Sidebar Collapse)
* **Design**: 
  * A main hamburger menu `☰` in the header bar.
  * A second hamburger menu `☰` inside the **NAVIGATION SIDEBAR** header.
* **Behavior**: Clicking either button toggles the sidebar's visibility. When collapsed, the sidebar transitions smoothly to `width: 0` (hidden), allowing the Note Workspace to expand to **100% of the screen width**, maximizing editor space.

### 2.2 Create Dropdown (`+ New`)
* **Design**: Placed at the top-right corner of the **NAVIGATION SIDEBAR**.
* **Behavior**: Clicking `+ New` opens a clean, compact absolute-positioned dropdown menu listing:
  * `📄 Plain Text` (.txt)
  * `✍️ Markdown` (.md)
  * `🌿 YAML Mindmap` (.yaml)
  * `✅ Task List` (.todo)
* Selecting an item creates an empty note of that type in the local database and loads it.

### 2.3 Sorted Sidebar Groups: **Task** vs **File**
The sidebar organizes the notes into two groups, sorted alphabetically (A-Z) by title:
1. **Task**: Lists notes of type `"task"`.
2. **File**: Lists all other note types (`"text"`, `"markdown"`, `"yaml"`).
* **Renaming**: Users can edit the title directly in the Note Workspace's title input. The sidebar name and sorting order will update automatically in real-time as the user types.

### 2.4 Editor & Split Visualizer Panels
* The editing workspace adopts the exact split-pane structure as the current **JSON Format / Viewer**:
  * **Left Panel**: Source text editor with monospace fonts and line numbering.
  * **Middle**: Resize divider bar which supports mouse-drag positioning.
  * **Right Panel**: Output Visualizer.
* The panels use matching header styles, backgrounds, and status bars at the bottom.

---

## 3. Storage Design (IndexedDB)

Notes are stored locally in the browser's IndexedDB.

### Database Record Schema
```json
{
  "id": "uuid-v4-string",
  "title": "Project Architecture",
  "type": "text" | "markdown" | "yaml" | "task",
  "content": "Root:\n  Core:\n    HTML: Structure",
  "category": "Work",
  "createdAt": 1700000000000,
  "updatedAt": 1700000005000
}
```

---

## 4. Implementation Steps (Phase 1 Mockup)

To verify the visual layout, we can implement the HTML mockup inside the current repository files:
1. **HTML Layout**: Add the `#tool-notes` workspace container to `index.html` alongside the sidebar modifications.
2. **CSS Classes**: Write classes in `css/style.css` for sidebar collapse animations, the `+ New` dropdown menu, and split panels.
3. **JS Mock Data**: Initialize mock notes in `js/app.js` to populate the sidebar list (Tasks & Files) and display mock data in the editor and visualizer (SVG Mindmap/Tree) upon switching.
