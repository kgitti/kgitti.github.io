# JSON Viewer & Formatter (Compact Light Theme)

A lightweight, offline-ready, 100% client-side JSON parsing, formatting, compressing, escaping/unescaping, and interactive tree viewing utility.

👉 **Live Demo:** [Deploy this to GitHub Pages to view it live]

## Features

- **Format / Beautify**: Format raw JSON strings into clean, readable structures with custom indentation (2 spaces, 4 spaces, tabs).
- **Compress / Minify**: Instantly remove all whitespaces, newlines, and tabs to minify JSON string sizes without breaking values.
- **Escape / Unescape**:
  - **Escape**: Convert raw text into a valid JSON string literal with escaped characters.
  - **Unescape**: Convert escaped string literals (with or without outer quotes, standard logs) back into raw readable JSON.
- **Interactive Tree View**: Visualizes JSON data in a nested tree structure:
  - Toggle collapse/expand on objects and arrays using chevrons (▼/▶).
  - Syntax color-coded nodes based on data types (Strings, Numbers, Booleans, Nulls).
- **Search & Filter**: Real-time search that highlights matches in the tree view and automatically expands nested parents to expose results.
- **Drag-to-Resize Divider**: Smooth mouse dragging vertical separator to adjust editor and viewer panel widths dynamically.
- **Syntax Error Line Highlighting**: Immediate validation with an alert bar and a red line indicator highlighting the exact line of syntax errors.
- **100% Client-side**: Safe and private; no data is ever sent to any server.

## Installation & Usage

Since this is built with pure static assets (HTML5, Vanilla CSS3, Vanilla JS ES6+), no setup is required.

1. Clone this repository:
   ```bash
   git clone https://github.com/kgitti/kgitti.github.io.git
   ```
2. Open `index.html` in any modern web browser:
   ```bash
   open index.html
   ```

## Development & Tech Stack
- **HTML5**: Semantic tags for clean structure.
- **Vanilla CSS3**: Compact design utilizing variables, CSS flexbox/grid layout, and smooth animations.
- **Vanilla JS**: Built-in JSON parser, custom recursive tree rendering engine, and mouse drag coordinate listeners.
