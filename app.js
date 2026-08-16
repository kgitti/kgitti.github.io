document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const textarea = document.getElementById('json-textarea');
  const lineNumbers = document.getElementById('line-numbers');
  const treeContainer = document.getElementById('tree-container');
  
  const btnFormat = document.getElementById('btn-format');
  const btnCompress = document.getElementById('btn-compress');
  const btnEscape = document.getElementById('btn-escape');
  const btnUnescape = document.getElementById('btn-unescape');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');
  
  const selectIndent = document.getElementById('select-indent');
  const alertBar = document.getElementById('alert-bar');
  const alertMsg = document.getElementById('alert-msg');
  
  const searchInput = document.getElementById('search-input');
  const searchCount = document.getElementById('search-count');
  
  const statusSize = document.getElementById('status-size');
  const statusLines = document.getElementById('status-lines');

  // Initial setup
  updateLineNumbers();
  updateStatus();

  // Scroll Synchronization: Sync gutter scroll with textarea scroll
  textarea.addEventListener('scroll', () => {
    lineNumbers.scrollTop = textarea.scrollTop;
  });

  // Track text changes
  textarea.addEventListener('input', () => {
    updateLineNumbers();
    updateStatus();
    // Parse on input to validate in real-time, but don't force Tree View render unless requested
    validateJSONQuietly();
  });

  // Event Listeners for Toolbar buttons
  btnFormat.addEventListener('click', formatJSON);
  btnCompress.addEventListener('click', compressJSON);
  btnEscape.addEventListener('click', escapeJSON);
  btnUnescape.addEventListener('click', unescapeJSON);
  btnClear.addEventListener('click', clearAll);
  btnCopy.addEventListener('click', copyToClipboard);

  // Re-run format if indentation setting changes
  selectIndent.addEventListener('change', () => {
    if (textarea.value.trim()) {
      formatJSON();
    }
  });

  // Search input handler
  searchInput.addEventListener('input', filterTree);

  // --- Line Numbers ---
  function updateLineNumbers() {
    const text = textarea.value;
    const lines = text.split('\n');
    const totalLines = Math.max(lines.length, 1);
    
    let html = '';
    for (let i = 1; i <= totalLines; i++) {
      html += `<span class="gutter-num" id="ln-${i}">${i}</span>`;
    }
    lineNumbers.innerHTML = html;
    
    // Maintain scroll sync
    lineNumbers.scrollTop = textarea.scrollTop;
  }

  // --- Status Bar Update ---
  function updateStatus() {
    const text = textarea.value;
    
    // Bytes size
    const bytes = new Blob([text]).size;
    let sizeStr = '0 B';
    if (bytes >= 1048576) {
      sizeStr = (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
      sizeStr = (bytes / 1024).toFixed(2) + ' KB';
    } else {
      sizeStr = bytes + ' B';
    }
    
    // Lines count
    const totalLines = text ? text.split('\n').length : 0;
    
    statusSize.textContent = `Size: ${sizeStr}`;
    statusLines.textContent = `Lines: ${totalLines}`;
  }

  // --- Alert Notifications ---
  function showError(message, lineNum = null) {
    alertMsg.textContent = message;
    alertBar.classList.add('active');
    
    // Clear previous error lines in gutter
    document.querySelectorAll('.gutter-num.error-line').forEach(el => {
      el.classList.remove('error-line');
    });
    
    // Highlight error line if provided
    if (lineNum) {
      const errorGutter = document.getElementById(`ln-${lineNum}`);
      if (errorGutter) {
        errorGutter.classList.add('error-line');
        // Scroll the gutter to the error
        errorGutter.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  function hideError() {
    alertBar.classList.remove('active');
    document.querySelectorAll('.gutter-num.error-line').forEach(el => {
      el.classList.remove('error-line');
    });
  }

  // --- Error Parsing Helper ---
  function extractLineNumber(error, text) {
    // 1. Try to find "line X" pattern directly from error message
    const lineMatch = error.message.match(/line (\d+)/i);
    if (lineMatch) {
      return parseInt(lineMatch[1], 10);
    }
    
    // 2. Try to find "position X" pattern and compute line number
    const posMatch = error.message.match(/position (\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const beforeErrorText = text.substring(0, pos);
      return beforeErrorText.split('\n').length;
    }
    
    return null;
  }

  // --- Real-time Validation (Without rendering Tree View) ---
  function validateJSONQuietly() {
    const text = textarea.value.trim();
    if (!text) {
      hideError();
      return true;
    }
    
    try {
      JSON.parse(text);
      hideError();
      return true;
    } catch (e) {
      const lineNum = extractLineNumber(e, textarea.value);
      showError(`Syntax Error: ${e.message}`, lineNum);
      return false;
    }
  }

  // --- Action: Format ---
  function formatJSON() {
    const text = textarea.value.trim();
    if (!text) return;
    
    try {
      const parsed = JSON.parse(text);
      hideError();
      
      const indentVal = selectIndent.value;
      const indent = indentVal === 'tab' ? '\t' : parseInt(indentVal, 10);
      
      const formatted = JSON.stringify(parsed, null, indent);
      textarea.value = formatted;
      
      updateLineNumbers();
      updateStatus();
      
      // Render the tree viewer
      buildJSONTree(parsed);
      
    } catch (e) {
      const lineNum = extractLineNumber(e, textarea.value);
      showError(`Syntax Error: Failed to format. ${e.message}`, lineNum);
    }
  }

  // --- Action: Compress (Remove whitespace) ---
  function compressJSON() {
    const text = textarea.value.trim();
    if (!text) return;
    
    try {
      const parsed = JSON.parse(text);
      hideError();
      
      const compressed = JSON.stringify(parsed);
      textarea.value = compressed;
      
      updateLineNumbers();
      updateStatus();
      
      // Render the tree viewer
      buildJSONTree(parsed);
      
    } catch (e) {
      const lineNum = extractLineNumber(e, textarea.value);
      showError(`Syntax Error: Failed to compress. ${e.message}`, lineNum);
    }
  }

  // --- Action: Escape (Turn text into escaped string literal) ---
  function escapeJSON() {
    const text = textarea.value;
    if (!text) return;
    
    // We escape the raw text into a valid JSON string representation (with quotes)
    const escaped = JSON.stringify(text);
    textarea.value = escaped;
    
    updateLineNumbers();
    updateStatus();
    hideError(); // Text operations don't trigger syntax errors
    
    // Render the single escaped string in the Tree View
    buildJSONTree(escaped);
  }

  // --- Action: Unescape (Remove quotes/slashes back to raw content) ---
  function unescapeJSON() {
    const text = textarea.value.trim();
    if (!text) return;
    
    const unescaped = unescapeJSONString(text);
    textarea.value = unescaped;
    
    updateLineNumbers();
    updateStatus();
    
    // Try to parse the unescaped result as JSON and build tree; fallback to string representation if not valid JSON
    try {
      const parsed = JSON.parse(unescaped);
      hideError();
      buildJSONTree(parsed);
    } catch (e) {
      hideError();
      buildJSONTree(unescaped);
    }
  }

  // Helper function to unescape JSON strings
  function unescapeJSONString(str) {
    let input = str.trim();
    
    // Case 1: Wrapped in double quotes (standard JSON string)
    if (input.startsWith('"') && input.endsWith('"')) {
      try {
        return JSON.parse(input);
      } catch (e) {
        // Fall through
      }
    }
    
    // Case 2: Wrap and parse, escaping literal control characters first
    try {
      const formattedSimple = input
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t');
      
      return JSON.parse('"' + formattedSimple + '"');
    } catch (e) {
      // Case 3: Fallback regex replacement if JSON.parse fails
      return input
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\\//g, '/');
    }
  }

  // --- Action: Copy to Clipboard ---
  function copyToClipboard() {
    const text = textarea.value;
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      const originalText = btnCopy.innerHTML;
      btnCopy.innerHTML = '✔ Copied!';
      btnCopy.style.backgroundColor = '#dcfce7';
      btnCopy.style.color = '#15803d';
      btnCopy.style.borderColor = '#bbf7d0';
      
      setTimeout(() => {
        btnCopy.innerHTML = originalText;
        btnCopy.style.backgroundColor = '';
        btnCopy.style.color = '';
        btnCopy.style.borderColor = '';
      }, 1500);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  // --- Action: Clear All ---
  function clearAll() {
    textarea.value = '';
    treeContainer.innerHTML = '';
    hideError();
    updateLineNumbers();
    updateStatus();
    searchInput.value = '';
    searchCount.textContent = '';
  }

  // --- Tree View Builder ---
  function buildJSONTree(data) {
    treeContainer.innerHTML = '';
    
    // Create root element
    const rootEl = createNodeEl(null, data, true);
    if (rootEl) {
      treeContainer.appendChild(rootEl);
    }
    
    // Filter tree in case search query is already filled
    filterTree();
  }

  function addComma(lineEl, isLast) {
    if (!isLast) {
      const comma = document.createElement('span');
      comma.className = 'json-colon';
      comma.textContent = ',';
      lineEl.appendChild(comma);
    }
  }

  // Recursive element creator for JSON Nodes
  function createNodeEl(key, val, isLast) {
    const line = document.createElement('div');
    line.className = 'tree-node-line';
    
    // 1. Key (if key is defined)
    if (key !== null) {
      const keySpan = document.createElement('span');
      keySpan.className = 'json-key';
      keySpan.textContent = JSON.stringify(key);
      line.appendChild(keySpan);
      
      const colonSpan = document.createElement('span');
      colonSpan.className = 'json-colon';
      colonSpan.textContent = ':';
      line.appendChild(colonSpan);
    }
    
    const type = typeof val;
    
    // Handle Null
    if (val === null) {
      // Add empty align spacer
      const spacer = document.createElement('span');
      spacer.className = 'tree-toggle-empty';
      line.insertBefore(spacer, line.firstChild || null);
      
      const nullSpan = document.createElement('span');
      nullSpan.className = 'json-val-null';
      nullSpan.textContent = 'null';
      line.appendChild(nullSpan);
      
      addComma(line, isLast);
      return line;
    }
    
    // Handle String
    if (type === 'string') {
      const spacer = document.createElement('span');
      spacer.className = 'tree-toggle-empty';
      line.insertBefore(spacer, line.firstChild || null);
      
      const strSpan = document.createElement('span');
      strSpan.className = 'json-val-string';
      strSpan.textContent = JSON.stringify(val);
      line.appendChild(strSpan);
      
      addComma(line, isLast);
      return line;
    }
    
    // Handle Number
    if (type === 'number') {
      const spacer = document.createElement('span');
      spacer.className = 'tree-toggle-empty';
      line.insertBefore(spacer, line.firstChild || null);
      
      const numSpan = document.createElement('span');
      numSpan.className = 'json-val-number';
      numSpan.textContent = val;
      line.appendChild(numSpan);
      
      addComma(line, isLast);
      return line;
    }
    
    // Handle Boolean
    if (type === 'boolean') {
      const spacer = document.createElement('span');
      spacer.className = 'tree-toggle-empty';
      line.insertBefore(spacer, line.firstChild || null);
      
      const boolSpan = document.createElement('span');
      boolSpan.className = 'json-val-boolean';
      boolSpan.textContent = val;
      line.appendChild(boolSpan);
      
      addComma(line, isLast);
      return line;
    }
    
    // Handle Objects and Arrays (Recursive)
    if (type === 'object') {
      const isArray = Array.isArray(val);
      const keys = Object.keys(val);
      
      // Chevron toggle
      const toggle = document.createElement('span');
      toggle.className = 'tree-toggle';
      toggle.textContent = '▼';
      line.insertBefore(toggle, line.firstChild || null);
      
      const bracketOpen = document.createElement('span');
      bracketOpen.className = 'json-bracket';
      bracketOpen.textContent = isArray ? '[' : '{';
      line.appendChild(bracketOpen);
      
      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'tree-node-children';
      
      // Collapsed summary text
      const collapsedText = document.createElement('span');
      collapsedText.className = 'json-collapsed-text';
      collapsedText.style.display = 'none';
      collapsedText.textContent = isArray ? `... ] /* Array(${keys.length}) */` : `... } /* Object(${keys.length}) */`;
      line.appendChild(collapsedText);
      
      // Render children recursively
      keys.forEach((k, idx) => {
        const childLast = idx === keys.length - 1;
        const childEl = createNodeEl(isArray ? null : k, val[k], childLast);
        childEl.classList.add('tree-node');
        childrenContainer.appendChild(childEl);
      });
      
      // Closing bracket line
      const closingLine = document.createElement('div');
      closingLine.className = 'tree-node-line';
      
      const closingSpacer = document.createElement('span');
      closingSpacer.className = 'tree-toggle-empty';
      closingLine.appendChild(closingSpacer);
      
      const bracketClose = document.createElement('span');
      bracketClose.className = 'json-bracket';
      bracketClose.textContent = isArray ? ']' : '}';
      closingLine.appendChild(bracketClose);
      addComma(closingLine, isLast);
      
      // Collapse / Expand toggle logic
      const toggleCollapse = () => {
        const isCollapsed = childrenContainer.style.display === 'none';
        if (isCollapsed) {
          childrenContainer.style.display = 'block';
          closingLine.style.display = 'block';
          collapsedText.style.display = 'none';
          toggle.classList.remove('collapsed');
          toggle.textContent = '▼';
        } else {
          childrenContainer.style.display = 'none';
          closingLine.style.display = 'none';
          collapsedText.style.display = 'inline-block';
          toggle.classList.add('collapsed');
          toggle.textContent = '▶';
        }
      };
      
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCollapse();
      });
      
      collapsedText.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCollapse();
      });
      
      // Node Wrapper containing opening, children, and closing
      const nodeWrapper = document.createElement('div');
      nodeWrapper.appendChild(line);
      nodeWrapper.appendChild(childrenContainer);
      nodeWrapper.appendChild(closingLine);
      return nodeWrapper;
    }
    
    return null;
  }

  // --- Search & Filter Tree nodes ---
  function filterTree() {
    const query = searchInput.value.trim().toLowerCase();
    
    // Clear previous highlights
    document.querySelectorAll('.tree-node-line.matched').forEach(el => {
      el.classList.remove('matched');
    });
    
    if (!query) {
      searchCount.textContent = '';
      return;
    }
    
    let matchCount = 0;
    const lines = document.querySelectorAll('.tree-node-line');
    
    lines.forEach(line => {
      // Don't match the toggle icons or bracket characters in searches
      const searchContentText = Array.from(line.childNodes)
        .filter(node => {
          return !node.classList?.contains('tree-toggle') && 
                 !node.classList?.contains('tree-toggle-empty') &&
                 !node.classList?.contains('json-bracket');
        })
        .map(node => node.textContent)
        .join(' ')
        .toLowerCase();
        
      if (searchContentText.includes(query)) {
        line.classList.add('matched');
        matchCount++;
        
        // Expand parents to make the match visible
        let parent = line.parentElement;
        while (parent && parent !== treeContainer) {
          if (parent.className === 'tree-node-children') {
            // If collapsed, expand it
            if (parent.style.display === 'none') {
              parent.style.display = 'block';
              
              const wrapper = parent.parentElement;
              if (wrapper) {
                const firstLine = wrapper.querySelector(':scope > .tree-node-line');
                const closingLine = wrapper.querySelector(':scope > .tree-node-line:last-child');
                const collapsedText = wrapper.querySelector(':scope > .json-collapsed-text');
                const toggle = wrapper.querySelector(':scope > .tree-toggle');
                
                if (closingLine) closingLine.style.display = 'block';
                if (collapsedText) collapsedText.style.display = 'none';
                if (toggle) {
                  toggle.classList.remove('collapsed');
                  toggle.textContent = '▼';
                }
              }
            }
          }
          parent = parent.parentElement;
        }
      }
    });
    
    searchCount.textContent = `${matchCount} match${matchCount !== 1 ? 'es' : ''}`;
  }

  // --- Resizable Split Panels ---
  const resizer = document.getElementById('panel-resizer');
  const leftPanel = document.querySelector('.panel-left');
  const mainContainer = document.querySelector('.main-container');

  // Set initial width to 50%
  leftPanel.style.width = '50%';
  leftPanel.style.flex = 'none';

  let isResizing = false;

  resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizer.classList.add('active');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    const containerRect = mainContainer.getBoundingClientRect();
    const newLeftWidth = e.clientX - containerRect.left;
    
    // Limits: minimum size for left or right panel is 150px
    const minWidth = 150;
    const maxWidth = containerRect.width - 150;
    
    if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
      leftPanel.style.width = `${newLeftWidth}px`;
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizer.classList.remove('active');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });
});
