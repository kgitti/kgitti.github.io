# Walkthrough: Double-Sidebar Note App Layout

This walkthrough details the structural changes implemented to achieve a highly organized, master-detail vertical navigation layout for the **Developer Tool Suite**.

---

## 1. Structural Changes

We restructured the navigation into a **Dual-Sidebar Layout** with a refined hierarchy:

```
+------------------+----------------------------------+------------------------------------+
| Primary Sidebar  | Secondary Sidebar (Width: 200px) | Note Workspace (Width: Flex)       |
|                  |                                  |                                    |
| [ ⚙️ Dev      ]   | ☰ Dev Tools                      | Title: [ Project Architecture    ] |
|                  |   Format:                        |                                    |
| [ 📝 Note     ]   |     • JSON                       | +-----------------+----------------+ |
|                  |     • MySQL                      | | YAML Editor     | SVG Mindmap    | |
|                  |   Compare:                       | |                 |                | |
|                  |     • TEXT                       | | Root:           |   Root         | |
|                  |     • JSON                       | |   Core:         |    |--Core     | |
|                  |                                  | |                 |                | |
|                  | ☰ Note                     + New | +-----------------+----------------+ |
|                  |   Task:                          |                                    |
|                  |     • ✅ Sprint Checklist        |                                    |
|                  |   File:                          |                                    |
|                  |     • 📝 Weekly Update           |                                    |
+------------------+----------------------------------+------------------------------------+
```

### A. Primary Sidebar (`.sidebar-primary` - Main Sidebar)
* A narrow, 60px wide column on the far left.
* Houses level-1 categories: **Dev** (`⚙️`) and **Note** (`📝`).
* **Header Hamburger (`☰`) Trigger**: Toggling the top-left header hamburger collapses this primary sidebar (`width: 0`), hiding the `Dev` and `Note` buttons.

### B. Secondary Sidebar (`#sidebar` - Sub-Sidebar)
* A 200px wide column displaying subnav groups based on the active level-1 category:
  * Selecting **Dev** loads both the **Format** and **Compare** utilities.
  * Selecting **Note** loads the checklist Tasks and Files list, with the `+ New` button.
* **Secondary Hamburger (`☰`) Trigger**: Toggling the hamburger button in the subnav header collapses this secondary sidebar (`width: 0`), allowing the Note Workspace to expand to maximum width.

---

## 2. Mockup Actions & Playable Interactivity

We wired complete client-side event bindings in `js/app.js` to let you test this design fully in the browser:

1. **`+ New` Note Menu**:
   * Click `+ New` in the Note subnav header to open a dropdown.
   * Click any option (Plain Text, Markdown, YAML, Task List) to create and select a new empty note item.
2. **Alphabetical Grouping**:
   * Notes are categorized automatically: checklist notes under **Task**, all others under **File**.
   * Note lists in both categories are sorted alphabetically (A-Z).
3. **YAML SVG Mindmap**:
   * Renders node blocks and curves dynamically based on indented YAML text.
   * Tab switches between `Visualizer` (SVG) and `Tree View` (collapsible elements).
4. **Interactive Tasks**:
   * Select the `Sprint Checklist` note.
   * Clicking checkcard tasks on the right dynamically edits the raw Markdown text (`- [ ]` / `- [x]`) inside the textarea on the left.
5. **Momentum Dashboard Overlay**:
   * Click the centered rectangular frosted-glass button (containing an obtuse chevron pointing down) at the top-center header to slide down a peaceful fullscreen overlay.
   * Displays a live digital clock, hourly greeting, and close actions (bottom rectangular frosted-glass button with an obtuse chevron pointing up / `Escape` key).
