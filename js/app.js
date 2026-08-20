document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const mainContainer = document.querySelector('.main-container');
  const sidebar = document.getElementById('sidebar');
  const btnSidebarToggle = document.getElementById('btn-sidebar-toggle');
  const headerTitle = document.getElementById('header-title');
  
  // Sidebar Items & Tool Panels
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  const toolViews = document.querySelectorAll('.tool-view');
  const toolbarGroups = document.querySelectorAll('.toolbar-group');

  // --- TOOL: JSON Formatter Elements ---
  const textareaJson = document.getElementById('json-textarea');
  const lineNumbersJson = document.getElementById('line-numbers');
  const treeContainerJson = document.getElementById('tree-container');
  const btnFormatJson = document.getElementById('btn-format');
  const btnCompressJson = document.getElementById('btn-compress');
  const btnEscapeJson = document.getElementById('btn-escape');
  const btnUnescapeJson = document.getElementById('btn-unescape');
  const btnCopyJson = document.getElementById('btn-copy');
  const btnClearJson = document.getElementById('btn-clear');
  const selectIndentJson = document.getElementById('select-indent');
  const searchInputJson = document.getElementById('search-input');
  const searchCountJson = document.getElementById('search-count');

  // --- TOOL: MySQL Formatter Elements ---
  const textareaMysql = document.getElementById('mysql-textarea');
  const lineNumbersMysql = document.getElementById('line-numbers-mysql');
  const textareaMysqlOut = document.getElementById('mysql-textarea-out');
  const lineNumbersMysqlOut = document.getElementById('line-numbers-mysql-out');
  const btnFormatMysql = document.getElementById('btn-mysql-format');
  const btnCopyMysql = document.getElementById('btn-mysql-copy');
  const btnClearMysql = document.getElementById('btn-mysql-clear');

  // --- TOOL: JSON Compare Elements ---
  const textareaJsonA = document.getElementById('json-a-textarea');
  const textareaJsonB = document.getElementById('json-b-textarea');
  const divJsonADiff = document.getElementById('json-a-diff');
  const divJsonBDiff = document.getElementById('json-b-diff');
  const btnCompareJson = document.getElementById('btn-json-compare');
  const btnEditJsonCompare = document.getElementById('btn-json-compare-edit');
  const btnClearJsonCompare = document.getElementById('btn-json-compare-clear');

  // --- TOOL: Text Compare Elements ---
  const textareaTextA = document.getElementById('text-a-textarea');
  const textareaTextB = document.getElementById('text-b-textarea');
  const divTextADiff = document.getElementById('text-a-diff');
  const divTextBDiff = document.getElementById('text-b-diff');
  const btnCompareText = document.getElementById('btn-text-compare');
  const btnEditTextCompare = document.getElementById('btn-text-compare-edit');
  const btnClearTextCompare = document.getElementById('btn-text-compare-clear');

  // --- Structural Elements ---
  const alertBar = document.getElementById('alert-bar');
  const alertMsg = document.getElementById('alert-msg');
  const statusSize = document.getElementById('status-size');
  const statusLines = document.getElementById('status-lines');

  // --- 1. Sidebar Toggling & SPA Switcher ---
  
  // Toggle primary sidebar visibility
  btnSidebarToggle.addEventListener('click', () => {
    mainContainer.classList.toggle('sidebar-primary-collapsed');
  });

  // Switch tools (Tabs)
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const toolName = item.getAttribute('data-tool');
      
      // Active states in sidebar
      sidebarItems.forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      
      // Make sure primary Dev button is active for dev tools
      const primaryDevBtn = document.querySelector('.sidebar-primary-btn[data-group="dev"]');
      if (primaryDevBtn) {
        document.querySelectorAll('.sidebar-primary-btn').forEach(el => el.classList.remove('active'));
        primaryDevBtn.classList.add('active');
      }
      
      // Show chosen panel, hide others
      toolViews.forEach(view => {
        view.classList.remove('active-tool');
        view.style.display = 'none';
      });
      const activeView = document.getElementById(`tool-${toolName}`);
      if (activeView) {
        activeView.classList.add('active-tool');
        activeView.style.display = 'flex';
      }
      
      // Show chosen toolbar group, hide others
      toolbarGroups.forEach(group => {
        group.style.display = 'none';
      });
      const activeToolbar = document.getElementById(`toolbar-${toolName}`);
      if (activeToolbar) {
        activeToolbar.style.display = 'flex';
      }
      
      // Update Header Title
      updateHeaderTitle(toolName);
      
      // Hide error bar on tab switch to avoid confusion
      hideError();
      
      // Update status bar for the new active editor
      updateStatusForTool(toolName);

      // On mobile, auto-close sidebar on item selection
      if (window.innerWidth <= 768) {
        mainContainer.classList.add('sidebar-collapsed');
      }
    });
  });

  function updateHeaderTitle(toolName) {
    switch (toolName) {
      case 'json-format':
        headerTitle.textContent = 'JSON Viewer & Formatter';
        break;
      case 'mysql-format':
        headerTitle.textContent = 'MySQL Formatter';
        break;
      case 'json-compare':
        headerTitle.textContent = 'JSON Compare';
        break;
      case 'text-compare':
        headerTitle.textContent = 'Text Compare';
        break;
    }
  }

  // --- 2. Scroll Sync & Line Numbers Helper ---
  
  function setupLineSync(textarea, gutterEl) {
    if (!textarea || !gutterEl) return;
    
    const updateGutter = () => {
      const text = textarea.value;
      const lines = text.split('\n');
      const totalLines = Math.max(lines.length, 1);
      
      let html = '';
      for (let i = 1; i <= totalLines; i++) {
        html += `<span class="gutter-num" id="ln-${gutterEl.id}-${i}">${i}</span>`;
      }
      gutterEl.innerHTML = html;
      gutterEl.scrollTop = textarea.scrollTop;
    };

    textarea.addEventListener('scroll', () => {
      gutterEl.scrollTop = textarea.scrollTop;
    });

    textarea.addEventListener('input', updateGutter);
    
    // Initial run
    updateGutter();
    return updateGutter;
  }

  // Bind line number synchronization
  const updateLinesJson = setupLineSync(textareaJson, lineNumbersJson);
  const updateLinesMysql = setupLineSync(textareaMysql, lineNumbersMysql);
  const updateLinesMysqlOut = setupLineSync(textareaMysqlOut, lineNumbersMysqlOut);

  // Sync scroll for side-by-side diff divs
  function setupDiffScrollSync(divA, divB) {
    let activeScrolling = null;
    
    divA.addEventListener('scroll', () => {
      if (activeScrolling === null || activeScrolling === divA) {
        activeScrolling = divA;
        divB.scrollTop = divA.scrollTop;
        divB.scrollLeft = divA.scrollLeft;
      }
    });
    
    divB.addEventListener('scroll', () => {
      if (activeScrolling === null || activeScrolling === divB) {
        activeScrolling = divB;
        divA.scrollTop = divB.scrollTop;
        divA.scrollLeft = divB.scrollLeft;
      }
    });

    document.addEventListener('mouseup', () => {
      activeScrolling = null;
    });
  }
  setupDiffScrollSync(divJsonADiff, divJsonBDiff);
  setupDiffScrollSync(divTextADiff, divTextBDiff);

  // --- 3. Split Panels Resize Handlers ---
  
  function setupResizer(resizerId, leftPanel, container) {
    if (!resizerId || !leftPanel || !container) return;
    
    const resizer = document.getElementById(resizerId);
    if (!resizer) return;
    
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
      
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = e.clientX - containerRect.left;
      
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
  }

  // Bind drag-to-resize separators for each view
  setupResizer('panel-resizer', document.querySelector('#tool-json-format .panel-left'), document.querySelector('#tool-json-format .split-view'));
  setupResizer('panel-resizer-mysql', document.querySelector('#tool-mysql-format .panel-left'), document.querySelector('#tool-mysql-format .split-view'));
  setupResizer('panel-resizer-json-comp', document.querySelector('#tool-json-compare .panel-left'), document.querySelector('#tool-json-compare .split-view'));
  setupResizer('panel-resizer-text-comp', document.querySelector('#tool-text-compare .panel-left'), document.querySelector('#tool-text-compare .split-view'));

  // --- 4. Status Bar Actions ---
  
  function getActiveToolName() {
    const activeItem = document.querySelector('.sidebar-item.active');
    return activeItem ? activeItem.getAttribute('data-tool') : 'json-format';
  }

  function updateStatusForTool(toolName) {
    let text = '';
    switch (toolName) {
      case 'json-format':
        text = textareaJson.value;
        break;
      case 'mysql-format':
        text = textareaMysql.value;
        break;
      case 'json-compare':
        text = textareaJsonA.value + textareaJsonB.value;
        break;
      case 'text-compare':
        text = textareaTextA.value + textareaTextB.value;
        break;
    }
    
    const bytes = new Blob([text]).size;
    let sizeStr = '0 B';
    if (bytes >= 1048576) {
      sizeStr = (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
      sizeStr = (bytes / 1024).toFixed(2) + ' KB';
    } else {
      sizeStr = bytes + ' B';
    }
    
    const totalLines = text ? text.split('\n').length : 0;
    
    statusSize.textContent = `Size: ${sizeStr}`;
    statusLines.textContent = `Lines: ${totalLines}`;
  }

  // Listen to inputs of all text areas to update status bar
  const allTextareas = [textareaJson, textareaMysql, textareaJsonA, textareaJsonB, textareaTextA, textareaTextB];
  allTextareas.forEach(ta => {
    ta.addEventListener('input', () => {
      updateStatusForTool(getActiveToolName());
    });
  });

  // Initial update
  updateStatusForTool('json-format');

  // --- 5. Alert Notifications ---
  
  function showError(message, lineNum = null, gutterId = null) {
    alertMsg.textContent = message;
    alertBar.classList.add('active');
    
    // Clear previous error lines
    document.querySelectorAll('.gutter-num.error-line').forEach(el => {
      el.classList.remove('error-line');
    });
    
    // Highlight specific line in gutter
    if (lineNum && gutterId) {
      const errorGutter = document.getElementById(`ln-${gutterId}-${lineNum}`);
      if (errorGutter) {
        errorGutter.classList.add('error-line');
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

  function extractLineNumber(error, text) {
    const lineMatch = error.message.match(/line (\d+)/i);
    if (lineMatch) {
      return parseInt(lineMatch[1], 10);
    }
    const posMatch = error.message.match(/position (\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      return text.substring(0, pos).split('\n').length;
    }
    return null;
  }

  // --- TOOL ACTION: JSON Viewer & Formatter ---
  
  function validateJSONQuietly() {
    const text = textareaJson.value.trim();
    if (!text) {
      hideError();
      return true;
    }
    try {
      JSON.parse(text);
      hideError();
      return true;
    } catch (e) {
      const lineNum = extractLineNumber(e, textareaJson.value);
      showError(`Syntax Error: ${e.message}`, lineNum, lineNumbersJson.id);
      return false;
    }
  }

  textareaJson.addEventListener('input', validateJSONQuietly);

  function balanceJsonBrackets(cleaned) {
    let insideDoubleQuote = false;
    let insideSingleQuote = false;
    let escaped = false;
    let stack = [];

    for (let i = 0; i < cleaned.length; i++) {
      let char = cleaned[i];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === '\\') {
        escaped = true;
        continue;
      }
      if (char === '"' && !insideSingleQuote) {
        insideDoubleQuote = !insideDoubleQuote;
        continue;
      }
      if (char === "'" && !insideDoubleQuote) {
        insideSingleQuote = !insideSingleQuote;
        continue;
      }
      if (!insideDoubleQuote && !insideSingleQuote) {
        if (char === '{') {
          stack.push('}');
        } else if (char === '[') {
          stack.push(']');
        } else if (char === '}') {
          if (stack.length > 0 && stack[stack.length - 1] === '}') {
            stack.pop();
          }
        } else if (char === ']') {
          if (stack.length > 0 && stack[stack.length - 1] === ']') {
            stack.pop();
          }
        } else if (char === ':') {
          // If we see a colon but we are inside an array context (top of stack is ']')
          if (stack.length > 0 && stack[stack.length - 1] === ']') {
            // We must have missed a closing bracket ']' before the key of this colon.
            // Let's find the start of the key to insert '],' before it.
            let keyStartIdx = -1;
            let j = i - 1;
            // Skip whitespace backward
            while (j >= 0 && /\s/.test(cleaned[j])) {
              j--;
            }
            if (j >= 0 && (cleaned[j] === '"' || cleaned[j] === "'")) {
              const quoteChar = cleaned[j];
              j--;
              // Find opening quote
              while (j >= 0) {
                if (cleaned[j] === quoteChar && cleaned[j - 1] !== '\\') {
                  keyStartIdx = j;
                  break;
                }
                j--;
              }
            } else {
              // Key is unquoted (lenient keys)
              while (j >= 0 && /[a-zA-Z0-9_-]/.test(cleaned[j])) {
                j--;
              }
              keyStartIdx = j + 1;
            }

            if (keyStartIdx !== -1) {
              // Insert '],' before the key to close the array and separate it from the key
              cleaned = cleaned.slice(0, keyStartIdx) + '],' + cleaned.slice(keyStartIdx);
              // Pop the ']' from stack since we just closed it
              stack.pop();
              // Since we inserted two characters, adjust the loop index i
              i += 2;
            }
          }
        }
      }
    }

    if (insideDoubleQuote) {
      cleaned += '"';
    } else if (insideSingleQuote) {
      cleaned += "'";
    }

    cleaned = cleaned.trim();
    while (stack.length > 0) {
      cleaned += stack.pop();
    }

    return cleaned;
  }

  function lenientJsonRepair(text) {
    let cleaned = text.trim();

    // Remove single-line and multi-line comments
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');

    // Balance unclosed quotes and brackets
    cleaned = balanceJsonBrackets(cleaned);

    // Replace unquoted wildcard/asterisk placeholders (like **********)
    cleaned = cleaned.replace(/:\s*(\*+)/g, ':"$1"');
    
    // Replace unquoted common keywords (undefined, NaN)
    cleaned = cleaned.replace(/:\s*undefined\b/g, ':null');
    cleaned = cleaned.replace(/:\s*NaN\b/g, ':null');

    // Replace single quotes wrapping keys with double quotes
    cleaned = cleaned.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'\s*:/g, '"$1":');
    // Replace single quotes wrapping string values with double quotes
    cleaned = cleaned.replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, ':"$1"');

    // Remove trailing commas before closing braces/brackets
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

    // Add double quotes to unquoted alphanumeric/dash keys
    cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_-]*)\s*:/g, '$1"$2":');

    // Run trailing comma replacement a second time in case quoting introduced new trailing comma syntax
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

    return cleaned;
  }

  btnFormatJson.addEventListener('click', () => {
    const text = textareaJson.value.trim();
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      hideError();
      
      const indentVal = selectIndentJson.value;
      const indent = indentVal === 'tab' ? '\t' : parseInt(indentVal, 10);
      
      const formatted = JSON.stringify(parsed, null, indent);
      textareaJson.value = formatted;
      
      updateLinesJson();
      updateStatusForTool('json-format');
      buildJSONTree(parsed);
    } catch (e) {
      // Try to repair and format
      try {
        const repaired = lenientJsonRepair(text);
        const parsed = JSON.parse(repaired);
        hideError();
        
        const indentVal = selectIndentJson.value;
        const indent = indentVal === 'tab' ? '\t' : parseInt(indentVal, 10);
        
        const formatted = JSON.stringify(parsed, null, indent);
        textareaJson.value = formatted;
        
        updateLinesJson();
        updateStatusForTool('json-format');
        buildJSONTree(parsed);
      } catch (repairErr) {
        const lineNum = extractLineNumber(e, textareaJson.value);
        showError(`Syntax Error: Failed to format JSON. ${e.message}`, lineNum, lineNumbersJson.id);
      }
    }
  });

  btnCompressJson.addEventListener('click', () => {
    const text = textareaJson.value.trim();
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      hideError();
      const compressed = JSON.stringify(parsed);
      textareaJson.value = compressed;
      updateLinesJson();
      updateStatusForTool('json-format');
      buildJSONTree(parsed);
    } catch (e) {
      // Try to repair and compress
      try {
        const repaired = lenientJsonRepair(text);
        const parsed = JSON.parse(repaired);
        hideError();
        const compressed = JSON.stringify(parsed);
        textareaJson.value = compressed;
        updateLinesJson();
        updateStatusForTool('json-format');
        buildJSONTree(parsed);
      } catch (repairErr) {
        const lineNum = extractLineNumber(e, textareaJson.value);
        showError(`Syntax Error: Failed to compress JSON. ${e.message}`, lineNum, lineNumbersJson.id);
      }
    }
  });

  btnEscapeJson.addEventListener('click', () => {
    const text = textareaJson.value;
    if (!text) return;
    const escaped = JSON.stringify(text);
    textareaJson.value = escaped;
    updateLinesJson();
    updateStatusForTool('json-format');
    hideError();
    buildJSONTree(escaped);
  });

  btnUnescapeJson.addEventListener('click', () => {
    const text = textareaJson.value.trim();
    if (!text) return;
    const unescaped = unescapeJSONString(text);
    textareaJson.value = unescaped;
    updateLinesJson();
    updateStatusForTool('json-format');
    try {
      const parsed = JSON.parse(unescaped);
      hideError();
      buildJSONTree(parsed);
    } catch (e) {
      hideError();
      buildJSONTree(unescaped);
    }
  });

  function unescapeJSONString(str) {
    let input = str.trim();
    if (input.startsWith('"') && input.endsWith('"')) {
      try {
        return JSON.parse(input);
      } catch (e) {}
    }
    try {
      const formatted = input.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
      return JSON.parse('"' + formatted + '"');
    } catch (e) {
      return input
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\r/g, '\r')
        .replace(/\\\//g, '/');
    }
  }

  btnCopyJson.addEventListener('click', () => {
    copyTextHelper(textareaJson.value, btnCopyJson);
  });

  btnClearJson.addEventListener('click', () => {
    textareaJson.value = '';
    treeContainerJson.innerHTML = '';
    hideError();
    updateLinesJson();
    updateStatusForTool('json-format');
    searchInputJson.value = '';
    searchCountJson.textContent = '';
  });

  // Render tree function
  function buildJSONTree(data) {
    treeContainerJson.innerHTML = '';
    const rootEl = createNodeEl(null, data, true);
    if (rootEl) treeContainerJson.appendChild(rootEl);
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

  function createNodeEl(key, val, isLast) {
    const line = document.createElement('div');
    line.className = 'tree-node-line';
    
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
    
    if (val === null) {
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
    
    if (type === 'object') {
      const isArray = Array.isArray(val);
      const keys = Object.keys(val);
      
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
      
      const collapsedText = document.createElement('span');
      collapsedText.className = 'json-collapsed-text';
      collapsedText.style.display = 'none';
      collapsedText.textContent = isArray ? `... ] /* Array(${keys.length}) */` : `... } /* Object(${keys.length}) */`;
      line.appendChild(collapsedText);
      
      keys.forEach((k, idx) => {
        const childLast = idx === keys.length - 1;
        const childEl = createNodeEl(isArray ? null : k, val[k], childLast);
        childEl.classList.add('tree-node');
        childrenContainer.appendChild(childEl);
      });
      
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
      
      const nodeWrapper = document.createElement('div');
      nodeWrapper.appendChild(line);
      nodeWrapper.appendChild(childrenContainer);
      nodeWrapper.appendChild(closingLine);
      return nodeWrapper;
    }
    return null;
  }

  function filterTree() {
    const query = searchInputJson.value.trim().toLowerCase();
    document.querySelectorAll('.tree-node-line.matched').forEach(el => {
      el.classList.remove('matched');
    });
    if (!query) {
      searchCountJson.textContent = '';
      return;
    }
    let matchCount = 0;
    const lines = document.querySelectorAll('.tree-node-line');
    lines.forEach(line => {
      const searchContentText = Array.from(line.childNodes)
        .filter(node => !node.classList?.contains('tree-toggle') && !node.classList?.contains('tree-toggle-empty') && !node.classList?.contains('json-bracket'))
        .map(node => node.textContent)
        .join(' ')
        .toLowerCase();
        
      if (searchContentText.includes(query)) {
        line.classList.add('matched');
        matchCount++;
        
        let parent = line.parentElement;
        while (parent && parent !== treeContainerJson) {
          if (parent.className === 'tree-node-children') {
            if (parent.style.display === 'none') {
              parent.style.display = 'block';
              const wrapper = parent.parentElement;
              if (wrapper) {
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
    searchCountJson.textContent = `${matchCount} match${matchCount !== 1 ? 'es' : ''}`;
  }
  searchInputJson.addEventListener('input', filterTree);

  // --- TOOL ACTION: MySQL Formatter ---
  
  btnFormatMysql.addEventListener('click', () => {
    const rawSql = textareaMysql.value.trim();
    if (!rawSql) return;
    
    const beautified = beautifySQL(rawSql);
    textareaMysqlOut.value = beautified;
    updateLinesMysqlOut();
    updateStatusForTool('mysql-format');
  });

  btnCopyMysql.addEventListener('click', () => {
    copyTextHelper(textareaMysqlOut.value, btnCopyMysql);
  });

  btnClearMysql.addEventListener('click', () => {
    textareaMysql.value = '';
    textareaMysqlOut.value = '';
    updateLinesMysql();
    updateLinesMysqlOut();
    updateStatusForTool('mysql-format');
  });

  function beautifySQL(sql) {
    if (!sql) return '';
    
    // Robust regex: matches strings, comments, numbers, words (including Thai), operators, dots, commas, semicolons, brackets, and fallback single chars
    const regex = /("[^"]*"|'[^']*'|`[^`]*`|\/\*[\s\S]*?\*\/|--[^\r\n]*|#[^\r\n]*|\b\d+(?:\.\d+)?\b|[\w\u0e00-\u0e7f]+|[-+*\/=<>!]+|\.|\s+|,|;|\(|\)|.)/gu;
    const tokens = sql.match(regex) || [sql];
    
    const keywords = new Set([
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 
      'ON', 'GROUP', 'ORDER', 'LIMIT', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 
      'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'HAVING', 'IN', 'AS', 'UNION', 
      'ALL', 'BY', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX'
    ]);
    
    const majorClauses = new Set([
      'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'GROUP', 'ORDER', 
      'LIMIT', 'SET', 'VALUES', 'UNION', 'HAVING'
    ]);
    
    let result = '';
    
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      const trimmed = token.trim();
      
      if (!trimmed) continue; // skip raw white space tokens
      
      // Comments
      if (trimmed.startsWith('--') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
        result = result.trimEnd() + '\n' + trimmed + '\n';
        continue;
      }
      
      const upper = trimmed.toUpperCase();
      if (keywords.has(upper)) {
        token = upper; // convert to capitalized keywords
      }
      
      if (token === 'SELECT') {
        result += 'SELECT ';
        continue;
      }
      
      if (majorClauses.has(token)) {
        result = result.trimEnd() + '\n' + token + ' ';
        continue;
      }
      
      if (token === 'AND' || token === 'OR') {
        result = result.trimEnd() + '\n  ' + token + ' ';
        continue;
      }
      
      if (token === ',') {
        result = result.trimEnd() + ', ';
        continue;
      }
      
      if (token === '(') {
        result += '(';
        continue;
      }
      
      if (token === '.') {
        result = result.trimEnd() + '.';
        continue;
      }
      
      if (token === ')') {
        result = result.trimEnd() + ') ';
        continue;
      }

      if (token === ';') {
        result = result.trimEnd() + ';\n\n';
        continue;
      }

      // Space operators properly
      if (/^[-+*\/=<>!]+$/.test(token)) {
        result = result.trimEnd() + ' ' + token + ' ';
        continue;
      }
      
      // Default: append token with space, check if we need to avoid space after dots or open parens
      if (result.endsWith('.') || result.endsWith('(') || result.endsWith('\n')) {
        result += token;
      } else {
        result += token + ' ';
      }
    }
    
    return result.trim();
  }

  // --- TOOL ACTION: JSON & Text Comparer (LCS Diff Engine) ---
  
  // JSON Compare Action
  btnCompareJson.addEventListener('click', () => {
    let textA = textareaJsonA.value.trim();
    let textB = textareaJsonB.value.trim();
    if (!textA && !textB) return;

    // Try formatting the JSON inputs first to ignore simple whitespace differences
    try {
      if (textA) textA = JSON.stringify(JSON.parse(textA), null, 2);
    } catch(e) {
      showError(`JSON A Syntax Error: ${e.message}`, null, null);
      return;
    }
    try {
      if (textB) textB = JSON.stringify(JSON.parse(textB), null, 2);
    } catch(e) {
      showError(`JSON B Syntax Error: ${e.message}`, null, null);
      return;
    }
    hideError();

    const diff = runLCSDiff(textA, textB);
    const processedDiff = processDiffWithModified(diff);
    renderDiffOutput(processedDiff, textareaJsonA, divJsonADiff, textareaJsonB, divJsonBDiff);
    
    btnCompareJson.style.display = 'none';
    btnEditJsonCompare.style.display = 'inline-flex';
  });

  btnEditJsonCompare.addEventListener('click', () => {
    resetDiffView(textareaJsonA, divJsonADiff, textareaJsonB, divJsonBDiff);
    btnCompareJson.style.display = 'inline-flex';
    btnEditJsonCompare.style.display = 'none';
  });

  btnClearJsonCompare.addEventListener('click', () => {
    textareaJsonA.value = '';
    textareaJsonB.value = '';
    resetDiffView(textareaJsonA, divJsonADiff, textareaJsonB, divJsonBDiff);
    btnCompareJson.style.display = 'inline-flex';
    btnEditJsonCompare.style.display = 'none';
    hideError();
    updateStatusForTool('json-compare');
  });

  // Text Compare Action
  btnCompareText.addEventListener('click', () => {
    const textA = textareaTextA.value;
    const textB = textareaTextB.value;
    if (!textA && !textB) return;
    
    hideError();
    const diff = runLCSDiff(textA, textB);
    renderDiffOutput(diff, textareaTextA, divTextADiff, textareaTextB, divTextBDiff);
    
    btnCompareText.style.display = 'none';
    btnEditTextCompare.style.display = 'inline-flex';
  });

  btnEditTextCompare.addEventListener('click', () => {
    resetDiffView(textareaTextA, divTextADiff, textareaTextB, divTextBDiff);
    btnCompareText.style.display = 'inline-flex';
    btnEditTextCompare.style.display = 'none';
  });

  btnClearTextCompare.addEventListener('click', () => {
    textareaTextA.value = '';
    textareaTextB.value = '';
    resetDiffView(textareaTextA, divTextADiff, textareaTextB, divTextBDiff);
    btnCompareText.style.display = 'inline-flex';
    btnEditTextCompare.style.display = 'none';
    hideError();
    updateStatusForTool('text-compare');
  });

  // Diff Rendering and LCS algorithm
  function runLCSDiff(textA, textB) {
    const linesA = textA.split('\n');
    const linesB = textB.split('\n');
    const n = linesA.length;
    const m = linesB.length;
    
    const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        if (linesA[i - 1] === linesB[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    let i = n, j = m;
    const diff = [];
    
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
        diff.unshift({ type: 'unchanged', valA: linesA[i - 1], valB: linesB[j - 1] });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        diff.unshift({ type: 'added', valA: null, valB: linesB[j - 1] });
        j--;
      } else {
        diff.unshift({ type: 'removed', valA: linesA[i - 1], valB: null });
        i--;
      }
    }
    return diff;
  }

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function processDiffWithModified(diff) {
    const processed = [];
    for (let idx = 0; idx < diff.length; idx++) {
      const current = diff[idx];
      const next = diff[idx + 1];
      
      if (next && current.type === 'removed' && next.type === 'added' && current.valA && next.valB) {
        // Regex matches: spacing, "key", ":", value (non-greedy), optional trailing comma
        const keyValRegex = /^(\s*)"([^"]+)"\s*:\s*(.*?)(,?)$/;
        const matchA = current.valA.match(keyValRegex);
        const matchB = next.valB.match(keyValRegex);
        
        if (matchA && matchB && matchA[2] === matchB[2]) {
          // Matching key!
          processed.push({
            type: 'modified',
            indent: matchA[1],
            key: matchA[2],
            valA: matchA[3],
            valB: matchB[3],
            commaA: matchA[4] || '',
            commaB: matchB[4] || '',
            rawA: current.valA,
            rawB: next.valB
          });
          idx++; // Skip next item since we merged it
          continue;
        }
      }
      processed.push(current);
    }
    return processed;
  }

  function renderDiffOutput(diff, textareaA, divA, textareaB, divB) {
    textareaA.style.display = 'none';
    textareaB.style.display = 'none';
    divA.style.display = 'block';
    divB.style.display = 'block';
    
    let htmlA = '';
    let htmlB = '';
    
    diff.forEach(item => {
      if (item.type === 'unchanged') {
        const escA = escapeHTML(item.valA);
        const escB = escapeHTML(item.valB);
        htmlA += `<div class="diff-line">${escA || '&nbsp;'}</div>`;
        htmlB += `<div class="diff-line">${escB || '&nbsp;'}</div>`;
      } else if (item.type === 'removed') {
        const escA = escapeHTML(item.valA);
        htmlA += `<div class="diff-line removed">- ${escA}</div>`;
        htmlB += `<div class="diff-line empty-placeholder">&nbsp;</div>`;
      } else if (item.type === 'added') {
        const escB = escapeHTML(item.valB);
        htmlA += `<div class="diff-line empty-placeholder">&nbsp;</div>`;
        htmlB += `<div class="diff-line added">+ ${escB}</div>`;
      } else if (item.type === 'modified') {
        const escIndent = escapeHTML(item.indent);
        const escKey = escapeHTML(item.key);
        const escValA = escapeHTML(item.valA);
        const escValB = escapeHTML(item.valB);
        const escCommaA = escapeHTML(item.commaA);
        const escCommaB = escapeHTML(item.commaB);
        
        htmlA += `<div class="diff-line modified">${escIndent}"${escKey}": <span class="diff-val-removed">${escValA}</span>${escCommaA}</div>`;
        htmlB += `<div class="diff-line modified">${escIndent}"${escKey}": <span class="diff-val-added">${escValB}</span>${escCommaB}</div>`;
      }
    });
    
    divA.innerHTML = htmlA;
    divB.innerHTML = htmlB;
  }

  function resetDiffView(textareaA, divA, textareaB, divB) {
    textareaA.style.display = 'block';
    textareaB.style.display = 'block';
    divA.style.display = 'none';
    divB.style.display = 'none';
    divA.innerHTML = '';
    divB.innerHTML = '';
  }

  // --- 6. Helper: Clipboard Copy Utility ---
  
  function copyTextHelper(text, btnElement) {
    if (!text) return;
    
    navigator.clipboard.writeText(text).then(() => {
      const originalHTML = btnElement.innerHTML;
      btnElement.innerHTML = '✔ Copied!';
      btnElement.style.backgroundColor = '#dcfce7';
      btnElement.style.color = '#15803d';
      btnElement.style.borderColor = '#bbf7d0';
      
      setTimeout(() => {
        btnElement.innerHTML = originalHTML;
        btnElement.style.backgroundColor = '';
        btnElement.style.color = '';
        btnElement.style.borderColor = '';
      }, 1500);
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  // --- 7. Helper: Drag & Drop File Upload Utility ---
  function setupDragAndDrop(textarea) {
    if (!textarea) return;

    textarea.addEventListener('dragenter', (e) => {
      e.preventDefault();
      e.stopPropagation();
      textarea.classList.add('drag-over');
    });

    textarea.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      textarea.classList.add('drag-over');
    });

    textarea.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      textarea.classList.remove('drag-over');
    });

    textarea.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      textarea.classList.remove('drag-over');

      const dt = e.dataTransfer;
      if (!dt) {
        console.warn("DragAndDrop: e.dataTransfer is null or undefined.");
        return;
      }

      const files = dt.files;
      console.log("DragAndDrop: Dropped files count = ", files ? files.length : 0);

      if (files && files.length > 0) {
        const file = files[0];
        console.log("DragAndDrop: File detected:", file.name, "size:", file.size, "bytes");
        const reader = new FileReader();

        reader.onload = (event) => {
          console.log("DragAndDrop: FileReader loaded successfully. Content length:", event.target.result.length);
          textarea.value = event.target.result;
          textarea.dispatchEvent(new Event('input'));
        };

        reader.onerror = (err) => {
          console.error("DragAndDrop: FileReader error: ", err);
        };

        reader.readAsText(file);
      } else {
        // Fallback: If text was dragged instead of a file
        const text = dt.getData('text/plain') || dt.getData('text');
        if (text) {
          console.log("DragAndDrop: Text drop fallback detected. Content length:", text.length);
          textarea.value = text;
          textarea.dispatchEvent(new Event('input'));
        } else {
          console.warn("DragAndDrop: No files or text data found in dropped payload.");
        }
      }
    });
  }

  // --- TOOL: Notes App Local Database Integration (IndexedDB) ---

  const DB_NAME = 'DeveloperToolSuiteDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'notes';
  let db = null;
  let mockNotes = [];
  let activeNoteId = null;

  // Initialize IndexedDB
  function initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onupgradeneeded = (e) => {
        const dbInstance = e.target.result;
        if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
          dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (e) => {
        db = e.target.result;
        resolve(db);
      };
      
      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  // Fetch all notes from IndexedDB
  function getAllNotesFromDB() {
    return new Promise((resolve, reject) => {
      if (!db) return resolve([]);
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Put (create or update) note in DB
  function saveNoteToDB(note) {
    return new Promise((resolve, reject) => {
      if (!db) return resolve();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(note);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Remove note from DB
  function deleteNoteFromDB(id) {
    return new Promise((resolve, reject) => {
      if (!db) return resolve();
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Seed default notes if the DB is empty
  async function seedDatabaseIfEmpty() {
    const seedNotes = [
      {
        id: 'mock-task-1',
        title: 'Sprint Checklist',
        type: 'task',
        content: '- [x] Setup repository structure\n- [x] Design mock UI layout\n- [x] Restructure dual-sidebar navigation\n- [x] Integrate IndexedDB storage (Phase 1)\n- [x] Render mindmap SVG dynamically\n- [x] Create ZIP backup exporter',
        category: 'Work',
        updatedAt: Date.now() - 300000
      },
      {
        id: 'mock-file-1',
        title: 'Weekly Update',
        type: 'markdown',
        content: '# Weekly Update\n\n## Achievements\n- Added MySQL query formatter.\n- Built responsive diff comparison panel.\n- Created compact light theme layout.\n\n## Next Steps\n- Integrate client-side Note-taking app.\n- Add markdown HTML preview.',
        category: 'Work',
        updatedAt: Date.now() - 86400000
      },
      {
        id: 'mock-file-2',
        title: 'Project Architecture',
        type: 'yaml',
        content: 'Project:\n  Core:\n    HTML: Structure layout\n    CSS: Vanilla styling\n    JS: Application logic\n  Infrastructure:\n    Host: Cloudflare Pages\n    Storage: Browser IndexedDB\n  Features:\n    Diff: Text & JSON comparisons\n    Format: JSON & SQL formatters',
        category: 'Work',
        updatedAt: Date.now() - 3600000
      },
      {
        id: 'mock-file-3',
        title: 'DB Credentials',
        type: 'text',
        content: 'Database Host: localhost\nDatabase Port: 3306\nDatabase User: root\nDatabase Pass: local_password_123\n\n(Note: This content is 100% private. No data is ever transmitted online!)',
        category: 'General',
        updatedAt: Date.now() - 172800000
      }
    ];

    for (const note of seedNotes) {
      await saveNoteToDB(note);
    }
    return seedNotes;
  }

  // DOM Notes Elements
  const toolNotes = document.getElementById('tool-notes');
  const toolbarNotes = document.getElementById('toolbar-notes');
  const btnSidebarClose = document.getElementById('btn-sidebar-close');
  const btnNewDropdown = document.getElementById('btn-new-dropdown');
  const newNoteDropdown = document.getElementById('new-note-dropdown');
  const sidebarTasksList = document.getElementById('sidebar-tasks-list');
  const sidebarFilesList = document.getElementById('sidebar-files-list');
  const sidebarGroupTasks = document.getElementById('sidebar-group-tasks');
  const sidebarGroupFiles = document.getElementById('sidebar-group-files');

  const noteTitleInput = document.getElementById('note-title-input');
  const noteTypeLabel = document.getElementById('note-type-label');
  const noteEditorTitle = document.getElementById('note-editor-title');
  const noteTextarea = document.getElementById('note-textarea');
  const lineNumbersNotes = document.getElementById('line-numbers-notes');
  const tabNotePreview = document.getElementById('tab-note-preview');
  const tabNoteTree = document.getElementById('tab-note-tree');
  const notePreviewContent = document.getElementById('note-preview-content');
  const noteTreeContent = document.getElementById('note-tree-content');
  const selectNoteCategory = document.getElementById('select-note-category');
  const btnNoteExport = document.getElementById('btn-note-export');
  const btnNotesExportAll = document.getElementById('btn-notes-export-all');
  const btnNoteDelete = document.getElementById('btn-note-delete');

  // Helper: Get active note object
  function getActiveNote() {
    return mockNotes.find(n => n.id === activeNoteId);
  }

  // Bind primary sidebar button interactions
  const primaryButtons = document.querySelectorAll('.sidebar-primary-btn');
  const subnavGroups = document.querySelectorAll('.subnav-group');
  
  primaryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetGroup = btn.getAttribute('data-group');
      
      // Update primary active state
      primaryButtons.forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      
      // Show matching subnav group, hide others
      subnavGroups.forEach(group => {
        group.style.display = 'none';
      });
      const activeSubnav = document.getElementById(`subnav-${targetGroup}`);
      if (activeSubnav) {
        activeSubnav.style.display = 'flex';
      }
      
      // Expand secondary sidebar if collapsed
      mainContainer.classList.remove('sidebar-collapsed');
      
      // Auto-click first item or trigger active note view
      if (targetGroup === 'notes') {
        renderSidebarNotes();
        loadActiveNote();
        switchViewToNotes();
      } else {
        const firstItem = activeSubnav.querySelector('.sidebar-item');
        if (firstItem) {
          firstItem.click();
        }
      }
    });
  });

  // Bind all secondary sidebar close toggle buttons
  document.querySelectorAll('.btn-sidebar-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      mainContainer.classList.toggle('sidebar-collapsed');
    });
  });

  // Toggle dropdown menu
  if (btnNewDropdown) {
    btnNewDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = newNoteDropdown.style.display === 'flex';
      newNoteDropdown.style.display = isVisible ? 'none' : 'flex';
    });
  }

  document.addEventListener('click', () => {
    if (newNoteDropdown) {
      newNoteDropdown.style.display = 'none';
    }
  });

  // Dropdown options click
  document.querySelectorAll('.new-note-opt').forEach(opt => {
    opt.addEventListener('click', async (e) => {
      e.stopPropagation();
      newNoteDropdown.style.display = 'none';
      const type = opt.getAttribute('data-type');
      
      let title = '';
      let placeholderContent = '';
      if (type === 'text') {
        title = 'New Text Note';
        placeholderContent = 'Write text here...';
      } else if (type === 'markdown') {
        title = 'New Markdown Note';
        placeholderContent = '# Title\n\nWrite documentation here...';
      } else if (type === 'yaml') {
        title = 'New Mindmap Note';
        placeholderContent = 'Root:\n  Concept A:\n    Detail 1\n  Concept B:\n    Detail 2';
      } else if (type === 'task') {
        title = 'New Task List';
        placeholderContent = '- [ ] Task 1\n- [ ] Task 2';
      }
      
      const newNote = {
        id: 'note-' + Date.now(),
        title: title,
        type: type,
        content: placeholderContent,
        category: selectNoteCategory ? selectNoteCategory.value : 'Work',
        updatedAt: Date.now()
      };
      
      mockNotes.push(newNote);
      activeNoteId = newNote.id;
      localStorage.setItem('activeNoteId', activeNoteId);
      
      await saveNoteToDB(newNote);
      renderSidebarNotes();
      loadActiveNote();
      switchViewToNotes();
    });
  });

  // Switch view helper
  function switchViewToNotes() {
    sidebarItems.forEach(el => el.classList.remove('active'));
    
    // Highlight matching item in sidebar
    const activeBtn = document.querySelector(`.sidebar-item[data-note-id="${activeNoteId}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
    // Make sure the primary sidebar Note button is active
    const primaryNoteBtn = document.querySelector('.sidebar-primary-btn[data-group="notes"]');
    if (primaryNoteBtn) {
      primaryButtons.forEach(el => el.classList.remove('active'));
      primaryNoteBtn.classList.add('active');
    }
    
    // Make sure subnav-notes is shown
    subnavGroups.forEach(group => {
      group.style.display = 'none';
    });
    const activeSubnav = document.getElementById('subnav-notes');
    if (activeSubnav) {
      activeSubnav.style.display = 'flex';
    }
    
    toolViews.forEach(view => {
      view.classList.remove('active-tool');
      view.style.display = 'none';
    });
    
    toolNotes.classList.add('active-tool');
    toolNotes.style.display = 'flex';
    
    toolbarGroups.forEach(group => {
      group.style.display = 'none';
    });
    toolbarNotes.style.display = 'flex';
    
    updateHeaderTitle('notes');
    hideError();
  }

  // Update Header title utility helper
  function updateHeaderTitle(toolName) {
    if (toolName === 'json-format') {
      headerTitle.textContent = 'JSON Viewer & Formatter';
    } else if (toolName === 'mysql-format') {
      headerTitle.textContent = 'MySQL Formatter';
    } else if (toolName === 'json-compare') {
      headerTitle.textContent = 'JSON Compare (Diff)';
    } else if (toolName === 'text-compare') {
      headerTitle.textContent = 'Text Compare (Diff)';
    } else if (toolName === 'notes') {
      headerTitle.textContent = 'Personal Note Workspace';
    }
  }

  // Sort notes alphabetically A-Z and group them
  function renderSidebarNotes() {
    sidebarTasksList.innerHTML = '';
    sidebarFilesList.innerHTML = '';
    
    // Sort Alphabetically
    const sortedNotes = [...mockNotes].sort((a, b) => a.title.localeCompare(b.title));
    
    let taskCount = 0;
    let fileCount = 0;
    
    sortedNotes.forEach(note => {
      const btn = document.createElement('button');
      btn.className = `sidebar-item ${note.id === activeNoteId ? 'active' : ''}`;
      btn.setAttribute('data-tool', 'notes');
      btn.setAttribute('data-note-id', note.id);
      
      let icon = '📄';
      if (note.type === 'task') icon = '✅';
      else if (note.type === 'markdown') icon = '📝';
      else if (note.type === 'yaml') icon = '🌿';
      
      btn.innerHTML = `<span class="sidebar-item-dot">•</span> ${icon} ${note.title}`;
      
      btn.addEventListener('click', () => {
        activeNoteId = note.id;
        localStorage.setItem('activeNoteId', activeNoteId);
        renderSidebarNotes();
        loadActiveNote();
        switchViewToNotes();
      });
      
      if (note.type === 'task') {
        sidebarTasksList.appendChild(btn);
        taskCount++;
      } else {
        sidebarFilesList.appendChild(btn);
        fileCount++;
      }
    });
    
    // Toggle groups visibility
    sidebarGroupTasks.style.display = taskCount > 0 ? 'flex' : 'none';
    sidebarGroupFiles.style.display = fileCount > 0 ? 'flex' : 'none';
  }

  // Load selected active note details into fields
  function loadActiveNote() {
    const note = getActiveNote();
    if (!note) return;
    
    noteTitleInput.value = note.title;
    noteTextarea.value = note.content;
    
    if (selectNoteCategory) {
      selectNoteCategory.value = note.category;
    }
    
    // Setup View Label & Tabs visibility
    if (note.type === 'yaml') {
      noteTypeLabel.textContent = 'YAML / Mindmap';
      noteEditorTitle.textContent = 'YAML Editor';
      tabNoteTree.style.display = 'block';
    } else {
      tabNoteTree.style.display = 'none';
      noteTreeContent.style.display = 'none';
      notePreviewContent.classList.add('active-tab-content');
      tabNotePreview.classList.add('active');
      tabNoteTree.classList.remove('active');
      
      if (note.type === 'task') {
        noteTypeLabel.textContent = 'Task List';
        noteEditorTitle.textContent = 'Tasks Editor (Markdown)';
      } else if (note.type === 'markdown') {
        noteTypeLabel.textContent = 'Markdown File';
        noteEditorTitle.textContent = 'Markdown Editor';
      } else if (note.type === 'text') {
        noteTypeLabel.textContent = 'Plain Text File';
        noteEditorTitle.textContent = 'Text Editor';
      }
    }
    
    renderNotePreview();
    updateLineNumbersNotes();
    updateFooterStatsNotes();
  }

  // Title edit handler (autosaved instantly)
  noteTitleInput.addEventListener('input', async () => {
    const note = getActiveNote();
    if (note) {
      note.title = noteTitleInput.value.trim() || 'Untitled Note';
      note.updatedAt = Date.now();
      
      // Update matching sidebar item name in real-time
      const activeBtn = document.querySelector(`.sidebar-item[data-note-id="${note.id}"]`);
      if (activeBtn) {
        let icon = '📄';
        if (note.type === 'task') icon = '✅';
        else if (note.type === 'markdown') icon = '📝';
        else if (note.type === 'yaml') icon = '🌿';
        activeBtn.innerHTML = `<span class="sidebar-item-dot">•</span> ${icon} ${note.title}`;
      }
      
      await saveNoteToDB(note);
    }
  });

  // Category select change handler
  if (selectNoteCategory) {
    selectNoteCategory.addEventListener('change', async () => {
      const note = getActiveNote();
      if (note) {
        note.category = selectNoteCategory.value;
        note.updatedAt = Date.now();
        await saveNoteToDB(note);
      }
    });
  }

  // Delete note trigger
  if (btnNoteDelete) {
    btnNoteDelete.addEventListener('click', async () => {
      const note = getActiveNote();
      if (!note) return;
      
      if (confirm(`Are you sure you want to delete "${note.title}"?`)) {
        mockNotes = mockNotes.filter(n => n.id !== note.id);
        await deleteNoteFromDB(note.id);
        
        // Select next remaining note, or fall back to JSON Formatter
        if (mockNotes.length > 0) {
          activeNoteId = mockNotes[0].id;
          localStorage.setItem('activeNoteId', activeNoteId);
          renderSidebarNotes();
          loadActiveNote();
          switchViewToNotes();
        } else {
          // Switch to JSON viewer if no notes remain
          localStorage.removeItem('activeNoteId');
          const defaultBtn = document.querySelector('.sidebar-item[data-tool="json-format"]');
          if (defaultBtn) defaultBtn.click();
        }
      }
    });
  }

  // Input listener inside textarea to update preview & save to DB
  let saveDebounceTimer;
  noteTextarea.addEventListener('input', () => {
    const note = getActiveNote();
    if (note) {
      note.content = noteTextarea.value;
      note.updatedAt = Date.now();
      renderNotePreview();
      updateLineNumbersNotes();
      updateFooterStatsNotes();
      
      // Debounce database write for smoother performance
      clearTimeout(saveDebounceTimer);
      saveDebounceTimer = setTimeout(async () => {
        await saveNoteToDB(note);
      }, 300);
    }
  });

  // Visualizer Tab Switching
  tabNotePreview.addEventListener('click', () => {
    tabNotePreview.classList.add('active');
    tabNoteTree.classList.remove('active');
    notePreviewContent.classList.add('active-tab-content');
    noteTreeContent.style.display = 'none';
  });

  tabNoteTree.addEventListener('click', () => {
    tabNoteTree.classList.add('active');
    tabNotePreview.classList.remove('active');
    noteTreeContent.style.display = 'block';
    notePreviewContent.classList.remove('active-tab-content');
    
    // Render Tree View structure
    const note = getActiveNote();
    if (note && note.type === 'yaml') {
      try {
        const treeObj = parseYAMLToTree(note.content);
        noteTreeContent.innerHTML = renderTreeHTML(treeObj);
        
        // Bind collapse folder toggles
        noteTreeContent.querySelectorAll('.tree-toggle').forEach(toggle => {
          toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const childContainer = toggle.parentElement.nextElementSibling;
            if (childContainer && childContainer.classList.contains('tree-node-children')) {
              const isCollapsed = childContainer.style.display === 'none';
              childContainer.style.display = isCollapsed ? 'block' : 'none';
              toggle.classList.toggle('collapsed');
            }
          });
        });
      } catch (err) {
        noteTreeContent.innerHTML = `<div style="color:var(--color-error-text); font-family:var(--font-mono); font-size:12px; padding:10px;">YAML Parse Error: ${err.message}</div>`;
      }
    }
  });

  // Sync scroll between textarea and line gutter
  noteTextarea.addEventListener('scroll', () => {
    lineNumbersNotes.scrollTop = noteTextarea.scrollTop;
  });

  // Line numbering generator
  function updateLineNumbersNotes() {
    const text = noteTextarea.value;
    const lines = text.split('\n');
    let gutterHtml = '';
    for (let i = 1; i <= lines.length; i++) {
      gutterHtml += `<span class="gutter-num">${i}</span>`;
    }
    lineNumbersNotes.innerHTML = gutterHtml;
  }

  // Footer status information updater
  function updateFooterStatsNotes() {
    const text = noteTextarea.value;
    const lines = text.split('\n').length;
    const size = new Blob([text]).size;
    
    let sizeStr = '';
    if (size < 1024) sizeStr = size + ' B';
    else sizeStr = (size / 1024).toFixed(1) + ' KB';
    
    statusLines.textContent = `Lines: ${lines}`;
    statusSize.textContent = `Size: ${sizeStr}`;
  }

  // --- RENDER PREVIEWS ACCORDING TO TYPE ---
  function renderNotePreview() {
    const note = getActiveNote();
    if (!note) return;
    
    if (note.type === 'text') {
      renderPlainTextStats(note.content);
    } else if (note.type === 'markdown') {
      notePreviewContent.innerHTML = `<div class="markdown-body" style="font-size:13px; line-height:1.6; padding:10px;">${parseMarkdown(note.content)}</div>`;
    } else if (note.type === 'yaml') {
      try {
        const treeObj = parseYAMLToTree(note.content);
        notePreviewContent.innerHTML = renderMindmapSVG(treeObj);
        hideError();
      } catch (err) {
        notePreviewContent.innerHTML = `<div style="color:var(--color-error-text); font-family:var(--font-mono); font-size:12px; padding:10px;">YAML Parse Error: ${err.message}</div>`;
        showError(`YAML Syntax Error: ${err.message}`);
      }
    } else if (note.type === 'task') {
      notePreviewContent.innerHTML = renderChecklist(note.content);
      
      // Bind click triggers to checklist card checkboxes
      notePreviewContent.querySelectorAll('.task-item-card').forEach(card => {
        card.addEventListener('click', () => {
          const lineIndex = parseInt(card.getAttribute('data-line-index'));
          toggleTaskLineCheckbox(lineIndex);
        });
      });
    }
  }

  // Toggle Markdown checkbox state on task click
  async function toggleTaskLineCheckbox(lineIndex) {
    const note = getActiveNote();
    if (!note) return;
    
    const lines = note.content.split('\n');
    const line = lines[lineIndex];
    
    const match = line.match(/^(\s*)-\s+\[([ xX])\](\s+.*)$/);
    if (match) {
      const currentVal = match[2].toLowerCase() === 'x';
      const newVal = currentVal ? ' ' : 'x';
      lines[lineIndex] = `${match[1]}- [${newVal}]${match[3]}`;
      
      note.content = lines.join('\n');
      noteTextarea.value = note.content;
      note.updatedAt = Date.now();
      
      renderNotePreview();
      updateLineNumbersNotes();
      updateFooterStatsNotes();
      
      await saveNoteToDB(note);
    }
  }

  // Render plain text analytics view
  function renderPlainTextStats(text) {
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    const paragraphs = text.trim() === '' ? 0 : text.split(/\n\s*\n/).length;
    const readTime = Math.ceil(words / 200); // 200 words per minute average reading speed
    
    notePreviewContent.innerHTML = `
      <div style="padding:15px; display:flex; flex-direction:column; gap:12px; font-family:var(--font-sans);">
        <div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-muted);">Text Statistics</div>
        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px;">
          <div style="background:var(--bg-gutter); padding:8px 10px; border-radius:4px; border:1px solid var(--border-color);">
            <div style="font-size:10px; color:var(--text-muted);">Words</div>
            <div style="font-size:18px; font-weight:bold; color:var(--text-main);">${words}</div>
          </div>
          <div style="background:var(--bg-gutter); padding:8px 10px; border-radius:4px; border:1px solid var(--border-color);">
            <div style="font-size:10px; color:var(--text-muted);">Characters</div>
            <div style="font-size:18px; font-weight:bold; color:var(--text-main);">${chars} <span style="font-size:11px; font-weight:normal; color:var(--text-muted);">(${charsNoSpace} no spaces)</span></div>
          </div>
          <div style="background:var(--bg-gutter); padding:8px 10px; border-radius:4px; border:1px solid var(--border-color);">
            <div style="font-size:10px; color:var(--text-muted);">Paragraphs</div>
            <div style="font-size:18px; font-weight:bold; color:var(--text-main);">${paragraphs}</div>
          </div>
          <div style="background:var(--bg-gutter); padding:8px 10px; border-radius:4px; border:1px solid var(--border-color);">
            <div style="font-size:10px; color:var(--text-muted);">Reading Time</div>
            <div style="font-size:18px; font-weight:bold; color:var(--text-main);">${readTime} min</div>
          </div>
        </div>
        
        <div style="margin-top:10px; display:flex; flex-direction:column; gap:6px;">
          <div style="font-size:11px; font-weight:600; color:var(--text-muted);">Text Actions</div>
          <div style="display:flex; gap:6px;">
            <button id="btn-text-upper" class="btn" style="flex:1; justify-content:center;">UPPERCASE</button>
            <button id="btn-text-lower" class="btn" style="flex:1; justify-content:center;">lowercase</button>
            <button id="btn-text-copy" class="btn btn-primary" style="flex:1; justify-content:center;">Copy Content</button>
          </div>
        </div>
      </div>
    `;
    
    // Bind buttons in plain text stats
    const btnUpper = document.getElementById('btn-text-upper');
    const btnLower = document.getElementById('btn-text-lower');
    const btnCopy = document.getElementById('btn-text-copy');
    
    if (btnUpper) {
      btnUpper.addEventListener('click', async () => {
        noteTextarea.value = noteTextarea.value.toUpperCase();
        noteTextarea.dispatchEvent(new Event('input'));
      });
    }
    if (btnLower) {
      btnLower.addEventListener('click', async () => {
        noteTextarea.value = noteTextarea.value.toLowerCase();
        noteTextarea.dispatchEvent(new Event('input'));
      });
    }
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(noteTextarea.value);
        const originalText = btnCopy.textContent;
        btnCopy.textContent = 'Copied!';
        setTimeout(() => { btnCopy.textContent = originalText; }, 1000);
      });
    }
  }

  // Lightweight regex Markdown parser compiler
  function parseMarkdown(mdText) {
    let html = mdText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Headers
      .replace(/^# (.*?)$/gm, '<h1 style="font-size:1.4em; font-weight:600; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:3px;">$1</h1>')
      .replace(/^## (.*?)$/gm, '<h2 style="font-size:1.2em; font-weight:600; margin-top:12px; margin-bottom:6px;">$1</h2>')
      .replace(/^### (.*?)$/gm, '<h3 style="font-size:1.05em; font-weight:600; margin-top:10px; margin-bottom:4px;">$1</h3>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre style="background:#f1f5f9; padding:8px; border-radius:4px; overflow:auto; font-family:var(--font-mono); font-size:11px; border:1px solid var(--border-color); margin-bottom:10px;">$1</pre>')
      // Inline codes
      .replace(/`(.*?)`/g, '<code style="background:#f1f5f9; padding:2px 4px; border-radius:3px; font-family:var(--font-mono); border:1px solid #e2e8f0;">$1</code>')
      // Lists (Simple conversion)
      .replace(/^- (.*?)$/gm, '<li style="margin-left:14px; list-style-type:disc; padding:1px 0;">$1</li>');

    // Group adjacent lists
    html = html.replace(/(<li.*?>.*?<\/li>)+/g, '<ul style="margin-bottom:10px;">$&</ul>');
    // Paragraph spacing
    html = html.replace(/\n\s*\n/g, '<p style="margin-bottom:8px;"></p>');
    return html;
  }

  // Simple indent-based YAML hierarchy tree builder parser
  function parseYAMLToTree(yamlText) {
    const lines = yamlText.split('\n');
    const root = { name: "Root", children: [] };
    const stack = [{ indent: -1, node: root }];
    
    lines.forEach(line => {
      if (!line.trim() || line.trim().startsWith('#')) return;
      const match = line.match(/^(\s*)([^:]+)(?::\s*(.*))?$/);
      if (!match) return;
      
      const indent = match[1].length;
      const key = match[2].trim();
      const val = match[3] ? match[3].trim() : '';
      
      const node = { name: key + (val ? ': ' + val : ''), children: [] };
      
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      
      const parentNode = stack[stack.length - 1].node;
      parentNode.children.push(node);
      stack.push({ indent: indent, node: node });
    });
    
    if (root.children.length === 1) {
      return root.children[0];
    }
    return root;
  }

  // Render horizontal dynamic SVG mindmap node layouts
  function renderMindmapSVG(treeData) {
    const svgWidth = 800;
    const svgHeight = 450;
    let svgHtml = `<div class="mindmap-svg-container"><svg class="mindmap-svg" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
    
    const nodes = [];
    const edges = [];
    
    function layoutNode(node, depth, yStart, yEnd) {
      const x = 30 + depth * 180;
      const y = (yStart + yEnd) / 2;
      
      nodes.push({ name: node.name, x: x, y: y, isRoot: depth === 0 });
      
      if (node.children && node.children.length > 0) {
        const childCount = node.children.length;
        const yRange = (yEnd - yStart);
        const segmentHeight = yRange / childCount;
        
        node.children.forEach((child, index) => {
          const childYStart = yStart + index * segmentHeight;
          const childYEnd = childYStart + segmentHeight;
          const childX = 30 + (depth + 1) * 180;
          const childY = (childYStart + childYEnd) / 2;
          
          edges.push({ x1: x, y1: y, x2: childX, y2: childY });
          layoutNode(child, depth + 1, childYStart, childYEnd);
        });
      }
    }
    
    layoutNode(treeData, 0, 10, svgHeight - 10);
    
    // Draw connecting bezier path curves
    edges.forEach(edge => {
      const cp1x = edge.x1 + 90;
      const cp1y = edge.y1;
      const cp2x = edge.x2 - 90;
      const cp2y = edge.y2;
      svgHtml += `<path class="mindmap-edge-path" d="M ${edge.x1} ${edge.y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${edge.x2} ${edge.y2}" />`;
    });
    
    // Draw node card shapes
    nodes.forEach(node => {
      const textLen = node.name.length;
      const rectWidth = Math.max(90, textLen * 6.5 + 16);
      const rectHeight = 22;
      const rectX = node.x;
      const rectY = node.y - rectHeight / 2;
      
      svgHtml += `
        <g>
          <rect class="mindmap-node-rect ${node.isRoot ? 'root' : ''}" x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" />
          <text class="mindmap-node-text ${node.isRoot ? 'root' : ''}" x="${rectX + 8}" y="${node.y + 4}">${node.name}</text>
        </g>
      `;
    });
    
    svgHtml += `</svg></div>`;
    return svgHtml;
  }

  // Recursive YAML-style collapsible Tree rendering (No braces)
  function renderTreeHTML(node) {
    if (!node.children || node.children.length === 0) {
      return `<div class="tree-node-line"><span class="tree-toggle-empty"></span><span class="json-key">${node.name}</span></div>`;
    }
    
    let html = `<div class="tree-node">
      <div class="tree-node-line">
        <span class="tree-toggle">▼</span>
        <span class="json-key">${node.name}</span>
      </div>
      <div class="tree-node-children">`;
    
    node.children.forEach(child => {
      html += renderTreeHTML(child);
    });
    
    html += `</div></div>`;
    return html;
  }

  // Markdown Checklist generator
  function renderChecklist(taskText) {
    const lines = taskText.split('\n');
    let total = 0;
    let completed = 0;
    let cardsHtml = '';
    
    lines.forEach((line, index) => {
      const match = line.match(/^(\s*)-\s+\[([ xX])\]\s+(.*)$/);
      if (match) {
        total++;
        const isDone = match[2].toLowerCase() === 'x';
        if (isDone) completed++;
        
        cardsHtml += `
          <div class="task-item-card ${isDone ? 'completed' : ''}" data-line-index="${index}">
            <input type="checkbox" class="task-item-checkbox" ${isDone ? 'checked' : ''} onclick="event.preventDefault();">
            <span>${match[3]}</span>
          </div>
        `;
      }
    });
    
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return `
      <div class="task-list-wrapper">
        <div class="task-progress-container">
          <div class="task-progress-info">
            <span>Task Progress</span>
            <span>${completed}/${total} Completed (${percent}%)</span>
          </div>
          <div class="task-progress-bar-bg">
            <div class="task-progress-bar-fill" style="width: ${percent}%;"></div>
          </div>
        </div>
        <div class="task-items-container">
          ${cardsHtml || '<div style="color:var(--text-muted); font-size:12px; padding:10px 0;">No tasks found. Use standard markdown `- [ ] Task name` list to create tasks.</div>'}
        </div>
      </div>
    `;
  }

  // Sync splitter drag sizing handler
  const resizerNotes = document.getElementById('panel-resizer-notes');
  const panelLeftNotes = resizerNotes?.previousElementSibling;
  
  if (resizerNotes && panelLeftNotes) {
    let isResizing = false;
    resizerNotes.addEventListener('mousedown', (e) => {
      isResizing = true;
      resizerNotes.classList.add('active');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      const workspaceRect = resizerNotes.parentElement.getBoundingClientRect();
      const leftWidth = e.clientX - workspaceRect.left;
      const percent = (leftWidth / workspaceRect.width) * 100;
      if (percent > 15 && percent < 85) {
        panelLeftNotes.style.width = `${percent}%`;
        panelLeftNotes.style.flex = 'none';
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        resizerNotes.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    });
  }

  // Note export handlers (Single & ZIP All Backup)
  if (btnNoteExport) {
    btnNoteExport.addEventListener('click', () => {
      const note = getActiveNote();
      if (!note) return;
      
      let ext = '.txt';
      if (note.type === 'markdown') ext = '.md';
      else if (note.type === 'yaml') ext = '.yaml';
      else if (note.type === 'task') ext = '.todo.md';
      
      const blob = new Blob([note.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = note.title.toLowerCase().replace(/\s+/g, '_') + ext;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }

  if (btnNotesExportAll) {
    btnNotesExportAll.addEventListener('click', () => {
      if (typeof JSZip === 'undefined') {
        alert('JSZip library is still loading from CDN. Please wait a moment and try again.');
        return;
      }
      
      const zip = new JSZip();
      
      mockNotes.forEach(note => {
        let ext = '.txt';
        if (note.type === 'markdown') ext = '.md';
        else if (note.type === 'yaml') ext = '.yaml';
        else if (note.type === 'task') ext = '.todo.md';
        
        const fileName = note.title.toLowerCase().replace(/\s+/g, '_') + ext;
        zip.file(fileName, note.content);
      });
      
      zip.generateAsync({ type: 'blob' }).then(content => {
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'devtools_notes_backup.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }).catch(err => {
        console.error('ZIP compilation failed:', err);
        alert('Failed to generate ZIP archive.');
      });
    });
  }

  // Load notes database and seed if required
  async function loadNotesDB() {
    try {
      await initDB();
      let notes = await getAllNotesFromDB();
      
      if (notes.length === 0) {
        notes = await seedDatabaseIfEmpty();
      }
      
      mockNotes = notes;
      
      // Select last active note
      const savedActiveId = localStorage.getItem('activeNoteId');
      if (savedActiveId && mockNotes.some(n => n.id === savedActiveId)) {
        activeNoteId = savedActiveId;
      } else if (mockNotes.length > 0) {
        activeNoteId = mockNotes[0].id;
      }
      
      renderSidebarNotes();
      loadActiveNote();
    } catch (err) {
      console.error('IndexedDB load failed, falling back to mock database:', err);
      // Fallback: use mock notes in memory
      activeNoteId = mockNotes.length > 0 ? mockNotes[0].id : null;
      renderSidebarNotes();
      loadActiveNote();
    }
  }

  // Trigger local database load
  loadNotesDB();

  // --- Momentum Dashboard Overlay Logic ---
  const btnDashboardToggle = document.getElementById('btn-dashboard-toggle');
  const dashboardWrapper = document.getElementById('dashboard-wrapper');
  const btnDashboardClose = document.getElementById('btn-dashboard-close');
  const dashboardClock = document.getElementById('dashboard-clock');
  const dashboardGreeting = document.getElementById('dashboard-greeting');

  // --- Focus Timer (Pomodoro) state ---
  let focusTimeLeft = 25 * 60;
  let focusDuration = 25 * 60;
  let focusTimerId = null;
  let focusState = 'stopped'; // 'stopped', 'running', 'paused'
  let currentFocusMode = 'pomodoro'; // 'pomodoro', 'short', 'long'

  // --- Audio Context and Ambient Soundscapes setup ---
  let audioCtx = null;
  let brownNoiseNode = null;
  let brownGainNode = null;

  const ambientAudios = {
    rain: new Audio('sounds/rain.mp3'),
    wind: new Audio('sounds/wind.mp3'),
    forest: new Audio('sounds/forest.mp3'),
    campfire: new Audio('sounds/campfire.mp3'),
    river: new Audio('sounds/river.mp3'),
    bell: new Audio('sounds/bell.mp3')
  };

  // Configure loop property for loops
  for (let key in ambientAudios) {
    ambientAudios[key].loop = true;
    ambientAudios[key].volume = 0;
  }

  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function startBrownNoise() {
    initAudioContext();
    if (!brownNoiseNode) {
      const sampleRate = audioCtx.sampleRate;
      const bufferSize = 2 * sampleRate;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // compensation gain
      }
      brownNoiseNode = audioCtx.createBufferSource();
      brownNoiseNode.buffer = noiseBuffer;
      brownNoiseNode.loop = true;

      brownGainNode = audioCtx.createGain();
      brownGainNode.gain.value = 0;

      brownNoiseNode.connect(brownGainNode);
      brownGainNode.connect(audioCtx.destination);
      brownNoiseNode.start(0);
    }
  }

  function playBowlChime() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.frequency.value = 180;
      osc2.frequency.value = 282; // non-integer harmonic
      osc3.frequency.value = 398;

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc3.type = 'sine';

      const osc1Gain = ctx.createGain();
      const osc2Gain = ctx.createGain();
      const osc3Gain = ctx.createGain();

      osc1Gain.gain.setValueAtTime(0.5, now);
      osc2Gain.gain.setValueAtTime(0.3, now);
      osc3Gain.gain.setValueAtTime(0.15, now);

      osc1.connect(osc1Gain);
      osc2.connect(osc2Gain);
      osc3.connect(osc3Gain);

      osc1Gain.connect(gainNode);
      osc2Gain.connect(gainNode);
      osc3Gain.connect(gainNode);

      gainNode.connect(ctx.destination);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.8, now + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 5.0);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);

      osc1.stop(now + 5.0);
      osc2.stop(now + 5.0);
      osc3.stop(now + 5.0);
    } catch (err) {
      console.warn("Audio chime play failed:", err);
    }
  }

  let lastAmbientVolumes = { rain: 0, wind: 0, forest: 0, campfire: 0, river: 0, bell: 0, brown: 0 };
  let isAmbientPlaying = false;

  function updateAmbientPlayPauseButton(state) {
    const btnPause = document.getElementById('btn-soundscapes-pause');
    const textPause = document.getElementById('text-soundscapes-pause');
    const iconPause = document.getElementById('icon-soundscapes-pause');

    if (!btnPause) return;

    if (state === 'playing') {
      btnPause.title = "Pause Ambient Sounds";
      if (textPause) textPause.textContent = "Pause";
      if (iconPause) {
        iconPause.innerHTML = `
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        `;
      }
    } else {
      btnPause.title = "Play Ambient Sounds";
      if (textPause) textPause.textContent = "Play";
      if (iconPause) {
        iconPause.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
      }
    }
  }

  function stopAllAmbientSounds(saveState = false) {
    const soundIds = ['rain', 'wind', 'forest', 'campfire', 'river', 'bell', 'brown'];
    
    if (saveState) {
      soundIds.forEach(id => {
        const slider = document.getElementById(`volume-${id}`);
        lastAmbientVolumes[id] = slider ? parseInt(slider.value, 10) : 0;
      });
    }

    for (const key in ambientAudios) {
      const audio = ambientAudios[key];
      if (audio) {
        if (!audio.paused) {
          audio.pause();
        }
      }
    }
    if (brownGainNode) {
      brownGainNode.gain.value = 0;
    }

    isAmbientPlaying = false;
    updateAmbientPlayPauseButton('paused');
  }

  function playAllAmbientSounds() {
    initAudioContext();
    const soundIds = ['rain', 'wind', 'forest', 'campfire', 'river', 'bell', 'brown'];

    // Check if there are any sliders currently set above 0 in the UI
    let hasAnySliderValue = soundIds.some(id => {
      const slider = document.getElementById(`volume-${id}`);
      return slider && parseInt(slider.value, 10) > 0;
    });

    // If all sliders are currently 0, restore from lastAmbientVolumes or default to rain: 25
    if (!hasAnySliderValue) {
      const hasSavedVolumes = soundIds.some(id => lastAmbientVolumes[id] > 0);
      if (!hasSavedVolumes) {
        lastAmbientVolumes.rain = 25; // Default: soft rain
      }
      // Populate slider values from saved configuration
      soundIds.forEach(id => {
        const slider = document.getElementById(`volume-${id}`);
        if (slider) {
          slider.value = lastAmbientVolumes[id];
        }
      });
    }

    // Now play matching the slider values
    soundIds.forEach(id => {
      const slider = document.getElementById(`volume-${id}`);
      const vol = slider ? parseInt(slider.value, 10) : 0;
      const volumePercent = vol / 100;

      if (id === 'brown') {
        if (vol > 0) {
          startBrownNoise();
          if (brownGainNode) {
            brownGainNode.gain.value = volumePercent;
          }
        }
      } else {
        const audio = ambientAudios[id];
        if (audio) {
          audio.volume = volumePercent;
          if (vol > 0) {
            if (audio.paused) {
              audio.play().catch(e => console.log("Audio playback failed to start:", e));
            }
          } else {
            if (!audio.paused) {
              audio.pause();
            }
          }
        }
      }
    });

    isAmbientPlaying = true;
    updateAmbientPlayPauseButton('playing');
  }

  function isAnyAmbientSoundActive() {
    const soundIds = ['rain', 'wind', 'forest', 'campfire', 'river', 'bell', 'brown'];
    return soundIds.some(id => {
      const slider = document.getElementById(`volume-${id}`);
      return slider && parseInt(slider.value, 10) > 0;
    });
  }

  function handleVolumeChange(soundKey, volumeValue) {
    initAudioContext();
    const volumePercent = volumeValue / 100;

    if (soundKey === 'brown') {
      startBrownNoise();
      if (brownGainNode) {
        brownGainNode.gain.value = volumePercent;
      }
    } else {
      const audio = ambientAudios[soundKey];
      if (audio) {
        audio.volume = volumePercent;
        if (volumePercent > 0) {
          if (audio.paused) {
            audio.play().catch(e => console.log("Audio playback failed to start:", e));
          }
        } else {
          if (!audio.paused) {
            audio.pause();
          }
        }
      }
    }

    if (isAnyAmbientSoundActive()) {
      isAmbientPlaying = true;
      updateAmbientPlayPauseButton('playing');
    } else {
      isAmbientPlaying = false;
      updateAmbientPlayPauseButton('paused');
    }
  }

  function initRulerTimer() {
    const ticksContainer = document.getElementById('ruler-ticks');
    const rangeInput = document.getElementById('focus-timer-range');
    const valDisplay = document.getElementById('ruler-value');

    if (ticksContainer) {
      let ticksHtml = '';
      for (let i = 1; i <= 90; i++) {
        const isMajor = (i % 5 === 0);
        ticksHtml += `<span class="ruler-tick ${isMajor ? 'major' : ''}"></span>`;
      }
      ticksContainer.innerHTML = ticksHtml;
    }

    if (rangeInput && valDisplay) {
      const startMins = parseInt(rangeInput.value, 10);
      focusDuration = startMins * 60;
      focusTimeLeft = focusDuration;
      valDisplay.textContent = startMins;

      rangeInput.addEventListener('input', (e) => {
        const mins = parseInt(e.target.value, 10);
        valDisplay.textContent = mins;

        if (focusState === 'stopped') {
          focusDuration = mins * 60;
          focusTimeLeft = focusDuration;
        }
      });
    }
  }

  function updateTimerDisplay() {
    if (!dashboardClock) return;

    const mins = Math.floor(focusTimeLeft / 60);
    const secs = focusTimeLeft % 60;
    dashboardClock.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    const progressPercent = ((focusDuration - focusTimeLeft) / focusDuration) * 100;
    const progressBar = document.getElementById('focus-timer-bar');
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }
  }

  function toggleFocusTimer() {
    const btnToggle = document.getElementById('btn-focus-toggle');
    const btnStop = document.getElementById('btn-focus-stop');
    const container = document.getElementById('focus-timer-container');
    const textToggle = document.getElementById('text-focus-toggle');
    const iconToggle = document.getElementById('icon-focus-toggle');
    const rulerValDisplay = document.getElementById('focus-ruler-value-display');
    const rulerSlider = document.getElementById('focus-ruler-slider-container');

    if (focusState === 'stopped' || focusState === 'paused') {
      focusState = 'running';
      if (textToggle) textToggle.textContent = 'Pause';
      if (iconToggle) {
        iconToggle.innerHTML = `
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        `;
      }
      if (btnStop) btnStop.style.display = 'inline-flex';
      if (container) container.classList.add('running');
      if (rulerValDisplay) rulerValDisplay.style.display = 'none';
      if (rulerSlider) rulerSlider.style.display = 'none';

      focusTimerId = setInterval(() => {
        if (focusTimeLeft > 0) {
          focusTimeLeft--;
          updateTimerDisplay();
        } else {
          if (isAnyAmbientSoundActive()) {
            stopAllAmbientSounds(true); // Save current slider configuration!
          }
          stopFocusTimer();

          let finishMsg = "Time's up! Focus session complete.";
          alert(finishMsg);
        }
      }, 1000);

      updateTimerDisplay();
    } else if (focusState === 'running') {
      focusState = 'paused';
      if (textToggle) textToggle.textContent = 'Start';
      if (iconToggle) {
        iconToggle.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
      }
      clearInterval(focusTimerId);
    }
  }

  function stopFocusTimer() {
    focusState = 'stopped';
    clearInterval(focusTimerId);
    focusTimerId = null;

    const btnToggle = document.getElementById('btn-focus-toggle');
    const btnStop = document.getElementById('btn-focus-stop');
    const container = document.getElementById('focus-timer-container');
    const textToggle = document.getElementById('text-focus-toggle');
    const iconToggle = document.getElementById('icon-focus-toggle');
    const rulerValDisplay = document.getElementById('focus-ruler-value-display');
    const rulerSlider = document.getElementById('focus-ruler-slider-container');

    if (textToggle) textToggle.textContent = 'Start';
    if (iconToggle) {
      iconToggle.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
    }
    if (btnStop) btnStop.style.display = 'none';
    if (container) container.classList.remove('running');
    if (rulerValDisplay) rulerValDisplay.style.display = 'flex';
    if (rulerSlider) rulerSlider.style.display = 'flex';

    const progressBar = document.getElementById('focus-timer-bar');
    if (progressBar) {
      progressBar.style.width = '0%';
    }

    const rangeInput = document.getElementById('focus-timer-range');
    if (rangeInput) {
      focusDuration = parseInt(rangeInput.value, 10) * 60;
    } else {
      focusDuration = 25 * 60;
    }
    focusTimeLeft = focusDuration;
    updateDashboardClock();
  }

  function updateDashboardClock() {
    if (focusState === 'running' || focusState === 'paused') {
      return;
    }
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    if (dashboardClock) {
      dashboardClock.textContent = `${hours}:${minutes}`;
    }

    updateDashboardGreeting(now.getHours());
  }

  function updateDashboardGreeting(hours) {
    if (!dashboardGreeting) return;

    let greeting = 'Hello';
    if (hours >= 5 && hours < 12) {
      greeting = 'Good morning';
    } else if (hours >= 12 && hours < 17) {
      greeting = 'Good afternoon';
    } else if (hours >= 17 && hours < 22) {
      greeting = 'Good evening';
    } else {
      greeting = 'Good night';
    }

    dashboardGreeting.textContent = `${greeting}, Developer.`;
  }

  if (btnDashboardToggle && dashboardWrapper) {
    btnDashboardToggle.addEventListener('click', () => {
      updateDashboardClock();
      dashboardWrapper.classList.add('active');
    });
  }

  if (btnDashboardClose && dashboardWrapper) {
    btnDashboardClose.addEventListener('click', () => {
      dashboardWrapper.classList.remove('active');
    });
  }

  // Close dashboard on click outside (clicks on the transparent wrapper margins)
  if (dashboardWrapper) {
    dashboardWrapper.addEventListener('click', (e) => {
      if (e.target === dashboardWrapper) {
        dashboardWrapper.classList.remove('active');
      }
    });
  }

  // Close dashboard on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dashboardWrapper && dashboardWrapper.classList.contains('active')) {
      dashboardWrapper.classList.remove('active');
    }
  });

  // --- Focus Timer Event Listeners ---
  const btnFocusToggle = document.getElementById('btn-focus-toggle');
  const btnFocusStop = document.getElementById('btn-focus-stop');

  if (btnFocusToggle) btnFocusToggle.addEventListener('click', toggleFocusTimer);
  if (btnFocusStop) btnFocusStop.addEventListener('click', stopFocusTimer);

  // Initialize custom ruler dial
  initRulerTimer();

  // --- Soundscapes Event Listeners ---
  const btnSoundscapesToggle = document.getElementById('btn-soundscapes-toggle');
  const soundscapesWrapper = document.querySelector('.soundscapes-wrapper');

  if (btnSoundscapesToggle && soundscapesWrapper) {
    btnSoundscapesToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      soundscapesWrapper.classList.toggle('active');
    });

    const btnSoundscapesPause = document.getElementById('btn-soundscapes-pause');
    if (btnSoundscapesPause) {
      btnSoundscapesPause.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isAmbientPlaying) {
          stopAllAmbientSounds(true); // Save current configuration and pause
        } else {
          playAllAmbientSounds(); // Resume previous configuration
        }
      });
    }

    // Close soundscape drawer when clicking outside
    document.addEventListener('click', (e) => {
      if (!soundscapesWrapper.contains(e.target)) {
        soundscapesWrapper.classList.remove('active');
      }
    });
  }

  // Bind volume range sliders
  const soundIds = ['rain', 'wind', 'forest', 'campfire', 'river', 'bell', 'brown'];
  soundIds.forEach(id => {
    const slider = document.getElementById(`volume-${id}`);
    if (slider) {
      slider.addEventListener('input', (e) => {
        handleVolumeChange(id, parseInt(e.target.value, 10));
      });
    }
  });

  // Start clock timer immediately
  updateDashboardClock();
  setInterval(updateDashboardClock, 1000);

  // --- Weather Forecast Dashboard Logic ---
  let activeDayIndex = 0;
  let weatherDays = [];
  let weatherDataGrouped = {};
  let currentWeatherCode = 0;

  // WMO weather themes
  const weatherThemes = {
    0: { class: 'weather-sunny', bg: 'rgba(251, 146, 60, 0.12)', border: 'rgba(251, 146, 60, 0.25)' },
    1: { class: 'weather-sunny', bg: 'rgba(251, 146, 60, 0.12)', border: 'rgba(251, 146, 60, 0.25)' },
    2: { class: 'weather-cloudy', bg: 'rgba(147, 197, 253, 0.12)', border: 'rgba(147, 197, 253, 0.25)' },
    3: { class: 'weather-cloudy', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.25)' },
    45: { class: 'weather-foggy', bg: 'rgba(203, 213, 225, 0.12)', border: 'rgba(203, 213, 225, 0.25)' },
    48: { class: 'weather-foggy', bg: 'rgba(203, 213, 225, 0.12)', border: 'rgba(203, 213, 225, 0.25)' },
    51: { class: 'weather-rainy', bg: 'rgba(71, 85, 105, 0.20)', border: 'rgba(148, 163, 184, 0.3)' },
    53: { class: 'weather-rainy', bg: 'rgba(71, 85, 105, 0.20)', border: 'rgba(148, 163, 184, 0.3)' },
    55: { class: 'weather-rainy', bg: 'rgba(71, 85, 105, 0.20)', border: 'rgba(148, 163, 184, 0.3)' },
    61: { class: 'weather-rainy', bg: 'rgba(51, 65, 85, 0.22)', border: 'rgba(100, 116, 139, 0.3)' },
    63: { class: 'weather-rainy', bg: 'rgba(51, 65, 85, 0.22)', border: 'rgba(100, 116, 139, 0.3)' },
    65: { class: 'weather-rainy', bg: 'rgba(30, 41, 59, 0.25)', border: 'rgba(71, 85, 105, 0.35)' },
    71: { class: 'weather-snowy', bg: 'rgba(241, 245, 249, 0.18)', border: 'rgba(255, 255, 255, 0.35)' },
    73: { class: 'weather-snowy', bg: 'rgba(241, 245, 249, 0.18)', border: 'rgba(255, 255, 255, 0.35)' },
    75: { class: 'weather-snowy', bg: 'rgba(241, 245, 249, 0.18)', border: 'rgba(255, 255, 255, 0.35)' },
    80: { class: 'weather-rainy', bg: 'rgba(51, 65, 85, 0.22)', border: 'rgba(100, 116, 139, 0.3)' },
    81: { class: 'weather-rainy', bg: 'rgba(51, 65, 85, 0.22)', border: 'rgba(100, 116, 139, 0.3)' },
    82: { class: 'weather-rainy', bg: 'rgba(30, 41, 59, 0.25)', border: 'rgba(71, 85, 105, 0.35)' },
    95: { class: 'weather-stormy', bg: 'rgba(99, 102, 241, 0.18)', border: 'rgba(129, 140, 248, 0.3)' },
    96: { class: 'weather-stormy', bg: 'rgba(99, 102, 241, 0.18)', border: 'rgba(129, 140, 248, 0.3)' },
    99: { class: 'weather-stormy', bg: 'rgba(99, 102, 241, 0.18)', border: 'rgba(129, 140, 248, 0.3)' }
  };

  const weatherIconsOutline = {
    'sunny': `<svg class="weather-icon-svg" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
    'cloudy': `<svg class="weather-icon-svg" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.05-1.22.14A6 6 0 0 0 3.5 13 3.5 3.5 0 0 0 7 16.5H17.5z"/></svg>`,
    'rainy': `<svg class="weather-icon-svg" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><path d="M8 19v3M12 19v3M16 19v3"/></svg>`,
    'stormy': `<svg class="weather-icon-svg" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 8.58"/><path d="M13 18l-3 4h4l-3 4"/></svg>`,
    'snowy': `<svg class="weather-icon-svg" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#93c5fd" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5L7 19M5 5l14 14"/><circle cx="12" cy="12" r="1" fill="#fff"/></svg>`,
    'foggy': `<svg class="weather-icon-svg" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M2 10h20M5 14h14M3 18h18"/></svg>`
  };

  const weatherIconsSolid = {
    'sunny': `<svg class="weather-icon-svg" viewBox="0 0 24 24" width="30" height="30" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`,
    'cloudy': `<svg class="weather-icon-svg" viewBox="0 0 24 24" width="30" height="30" fill="none"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.05-1.22.14A6 6 0 0 0 3.5 13 3.5 3.5 0 0 0 7 16.5H17.5z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
    'rainy': `<svg class="weather-icon-svg" viewBox="0 0 24 24" width="30" height="30" fill="none"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.05-1.22.14A6 6 0 0 0 3.5 13 3.5 3.5 0 0 0 7 16.5H17.5z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 20v2M12 20v2M16 20v2" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/></svg>`,
    'stormy': `<svg class="weather-icon-svg" viewBox="0 0 24 24" width="30" height="30" fill="none"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.05-1.22.14A6 6 0 0 0 3.5 13 3.5 3.5 0 0 0 7 16.5H17.5z" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5" stroke-linejoin="round"/><path d="M13 18l-3 4h4l-3 4" fill="#fbbf24" stroke="#d97706" stroke-width="1" stroke-linejoin="round"/></svg>`,
    'snowy': `<svg class="weather-icon-svg" viewBox="0 0 24 24" width="30" height="30" fill="none"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.05-1.22.14A6 6 0 0 0 3.5 13 3.5 3.5 0 0 0 7 16.5H17.5z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5" stroke-linejoin="round"/><circle cx="8" cy="21" r="1.2" fill="#93c5fd"/><circle cx="12" cy="21" r="1.2" fill="#93c5fd"/><circle cx="16" cy="21" r="1.2" fill="#93c5fd"/></svg>`,
    'foggy': `<svg class="weather-icon-svg" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#e2e8f0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h16M2 12h20M5 16h14M8 20h8"/></svg>`
  };

  function getWeatherIcon(code, style = 'outline') {
    const list = style === 'solid' ? weatherIconsSolid : weatherIconsOutline;
    if (code === 0 || code === 1) return list.sunny;
    if (code === 2 || code === 3) return list.cloudy;
    if (code === 45 || code === 48) return list.foggy;
    if (code >= 51 && code <= 65) return list.rainy;
    if (code >= 71 && code <= 75) return list.snowy;
    if (code >= 80 && code <= 82) return list.rainy;
    if (code >= 95 && code <= 99) return list.stormy;
    return list.sunny;
  }

  function getWeatherLabel(code) {
    if (code === 0) return 'Sunny';
    if (code === 1) return 'Mainly Clear';
    if (code === 2) return 'Partly Cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Foggy';
    if (code >= 51 && code <= 55) return 'Drizzle';
    if (code >= 61 && code <= 65) return 'Rainy';
    if (code >= 71 && code <= 75) return 'Snowy';
    if (code >= 80 && code <= 82) return 'Rain Showers';
    if (code >= 95 && code <= 99) return 'Thunderstorms';
    return 'Clear';
  }

  function formatHourLabel(hourStr) {
    const hourInt = parseInt(hourStr.split(':')[0], 10);
    if (hourInt === 0) return '12 AM';
    if (hourInt === 12) return '12 PM';
    if (hourInt < 12) return `${hourInt} AM`;
    return `${hourInt - 12} PM`;
  }

  function renderActiveDayForecast() {
    const container = document.getElementById('weather-hourly-container');
    const dayLabel = document.getElementById('weather-current-day-label');
    const statusText = document.getElementById('weather-status-text');
    const widget = document.getElementById('weather-widget');
    
    if (!container || !dayLabel || !statusText || !widget || weatherDays.length === 0) return;
    
    const dateStr = weatherDays[activeDayIndex];
    const dayHours = weatherDataGrouped[dateStr];
    if (!dayHours) return;

    const dateObj = new Date(dateStr);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let label = '';
    if (activeDayIndex === 0) {
      label = `Today, ${dateObj.getDate()} ${monthNames[dateObj.getMonth()]}`;
    } else if (activeDayIndex === 1) {
      label = `Tomorrow, ${dateObj.getDate()} ${monthNames[dateObj.getMonth()]}`;
    } else {
      label = `${dayNames[dateObj.getDay()]}, ${dateObj.getDate()} ${monthNames[dateObj.getMonth()]}`;
    }
    dayLabel.textContent = label;

    let dayCode = currentWeatherCode;
    if (activeDayIndex > 0 && dayHours.length > 12) {
      dayCode = dayHours[12].code;
    }
    
    const theme = weatherThemes[dayCode] || weatherThemes[0];
    widget.style.setProperty('--weather-bg-color', theme.bg);
    widget.style.setProperty('--weather-border-color', theme.border);
    
    const maxTemp = Math.max(...dayHours.map(h => h.temp));
    const minTemp = Math.min(...dayHours.map(h => h.temp));
    const weatherLabel = getWeatherLabel(dayCode);
    
    if (activeDayIndex === 0) {
      statusText.textContent = `${weatherLabel} conditions today. Temperature ranging from ${Math.round(minTemp)}°C to ${Math.round(maxTemp)}°C.`;
    } else {
      statusText.textContent = `${weatherLabel} conditions forecast. Temperature ranging from ${Math.round(minTemp)}°C to ${Math.round(maxTemp)}°C.`;
    }

    let html = '';
    const currentHourInt = new Date().getHours();
    
    dayHours.forEach(h => {
      const hInt = parseInt(h.hour.split(':')[0], 10);
      let timeText = formatHourLabel(h.hour);
      let isCurrent = false;
      
      if (activeDayIndex === 0 && hInt === currentHourInt) {
        timeText = 'Now';
        isCurrent = true;
      }
      
      html += `
        <div class="weather-hourly-item ${isCurrent ? 'current-hour' : ''}">
          <span class="weather-hour-time">${timeText}</span>
          <span class="weather-hour-icon">${getWeatherIcon(h.code, 'outline')}</span>
          <span class="weather-hour-temp">${Math.round(h.temp)}°</span>
        </div>
      `;
    });
    
    container.innerHTML = html;

    if (activeDayIndex === 0) {
      const activeEl = container.querySelector('.current-hour');
      if (activeEl) {
        container.scrollLeft = activeEl.offsetLeft - (container.clientWidth / 2) + (activeEl.clientWidth / 2);
      } else {
        container.scrollLeft = 0;
      }
    } else {
      container.scrollLeft = 0;
    }
  }

  async function loadWeatherForecast() {
    const CACHE_DATA_KEY = 'weather_forecast_data';
    const CACHE_TIME_KEY = 'weather_forecast_timestamp';
    const ONE_HOUR = 60 * 60 * 1000;
    
    const now = Date.now();
    const cachedData = localStorage.getItem(CACHE_DATA_KEY);
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
    
    let weatherData = null;
    
    if (cachedData && cachedTime && (now - parseInt(cachedTime, 10) < ONE_HOUR)) {
      try {
        weatherData = JSON.parse(cachedData);
      } catch (e) {
        console.error("Failed to parse cached weather:", e);
      }
    }
    
    if (!weatherData) {
      let lat = 13.75;
      let lon = 100.51;
      
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3500 });
        });
        lat = position.coords.latitude;
        lon = position.coords.longitude;
      } catch (e) {
        console.warn("Geolocation failed, using default coords:", e.message);
      }
      
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&current_weather=true&timezone=auto`;
      const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
      
      try {
        const [weatherRes, geoRes] = await Promise.all([
          fetch(url),
          fetch(geoUrl).catch(err => {
            console.warn("Geocoding fetch failed:", err);
            return null;
          })
        ]);
        
        if (weatherRes.ok) {
          weatherData = await weatherRes.json();
          
          let cityName = 'Bangkok';
          if (geoRes && geoRes.ok) {
            try {
              const geoData = await geoRes.json();
              
              let district = '';
              let city = '';
              if (geoData.localityInfo && Array.isArray(geoData.localityInfo.administrative)) {
                // Find adminLevel 6 (district / amphoe / khet)
                const districtObj = geoData.localityInfo.administrative.find(item => item.adminLevel === 6);
                if (districtObj) {
                  district = districtObj.name;
                }
                // Find adminLevel 4 (province / city / Krung Thep Maha Nakhon)
                const cityObj = geoData.localityInfo.administrative.find(item => item.adminLevel === 4);
                if (cityObj) {
                  city = cityObj.name;
                  // Simplify "Krung Thep Maha Nakhon" to "Bangkok" for clean display
                  if (city === 'Krung Thep Maha Nakhon') {
                    city = 'Bangkok';
                  }
                }
              }
              
              if (!city) city = geoData.city || geoData.principalSubdivision || 'Bangkok';
              if (!district) district = geoData.locality || '';
              
              if (district && city && district !== city) {
                cityName = `${district}, ${city}`;
              } else {
                cityName = city || district || 'Bangkok';
              }
            } catch (err) {
              console.warn("Failed to parse geocoding JSON:", err);
            }
          }
          weatherData.cityName = cityName;
          
          localStorage.setItem(CACHE_DATA_KEY, JSON.stringify(weatherData));
          localStorage.setItem(CACHE_TIME_KEY, now.toString());
        }
      } catch (err) {
        console.error("Failed to fetch weather forecast:", err);
      }
    }
    
    if (weatherData) {
      const locEl = document.getElementById('weather-location');
      const divEl = document.getElementById('weather-divider');
      if (locEl) {
        locEl.textContent = '📍 ' + (weatherData.cityName || 'Bangkok');
        locEl.style.display = 'inline-flex';
      }
      if (divEl) {
        divEl.style.display = 'inline-flex';
      }
      
      try {
        currentWeatherCode = weatherData.current_weather.weathercode;
        
        weatherDataGrouped = {};
        const times = weatherData.hourly.time;
        const temps = weatherData.hourly.temperature_2m;
        const codes = weatherData.hourly.weathercode;
        
        for (let k = 0; k < times.length; k++) {
          const dateStr = times[k].substring(0, 10);
          const hourStr = times[k].substring(11, 16);
          
          if (!weatherDataGrouped[dateStr]) {
            weatherDataGrouped[dateStr] = [];
          }
          weatherDataGrouped[dateStr].push({
            hour: hourStr,
            temp: temps[k],
            code: codes[k]
          });
        }
        
        weatherDays = Object.keys(weatherDataGrouped).sort();
        activeDayIndex = 0;
        
        renderActiveDayForecast();
      } catch (err) {
        console.error("Error formatting weather response:", err);
      }
    }
  }

  // Bind weather buttons
  const btnWeatherPrev = document.getElementById('btn-weather-prev-day');
  const btnWeatherNext = document.getElementById('btn-weather-next-day');
  
  if (btnWeatherPrev) {
    btnWeatherPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeDayIndex > 0) {
        activeDayIndex--;
        renderActiveDayForecast();
      }
    });
  }
  
  if (btnWeatherNext) {
    btnWeatherNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeDayIndex < weatherDays.length - 1) {
        activeDayIndex++;
        renderActiveDayForecast();
      }
    });
  }

  // --- Calendar Popup Events & Render ---
  const dayLabelBtn = document.getElementById('weather-current-day-label');
  const calModal = document.getElementById('calendar-modal');
  const btnCalClose = document.getElementById('btn-calendar-close');
  const btnCalPrevYear = document.getElementById('btn-cal-prev-year');
  const btnCalNextYear = document.getElementById('btn-cal-next-year');

  if (dayLabelBtn) {
    dayLabelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCalendarModal();
    });
  }

  if (btnCalClose) {
    btnCalClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeCalendarModal();
    });
  }

  if (btnCalPrevYear) {
    btnCalPrevYear.addEventListener('click', (e) => {
      e.stopPropagation();
      calendarYear--;
      renderCalendarGrid();
    });
  }

  if (btnCalNextYear) {
    btnCalNextYear.addEventListener('click', (e) => {
      e.stopPropagation();
      calendarYear++;
      renderCalendarGrid();
    });
  }

  if (calModal) {
    // Close on click outside the card
    calModal.addEventListener('click', (e) => {
      if (e.target === calModal) {
        closeCalendarModal();
      }
    });
    
    const calCard = calModal.querySelector('.calendar-card');
    if (calCard) {
      calCard.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }

  let calendarYear = new Date().getFullYear();

  function openCalendarModal() {
    if (calModal) {
      const activeDateStr = weatherDays[activeDayIndex];
      if (activeDateStr) {
        calendarYear = new Date(activeDateStr).getFullYear();
      } else {
        calendarYear = new Date().getFullYear();
      }
      renderCalendarGrid();
      calModal.classList.add('active');
    }
  }

  function closeCalendarModal() {
    if (calModal) {
      calModal.classList.remove('active');
    }
  }

  function renderCalendarGrid() {
    const gridContainer = document.getElementById('calendar-months-grid');
    const yearLabel = document.getElementById('calendar-year-label');
    if (!gridContainer || !yearLabel) return;

    yearLabel.textContent = calendarYear;

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const selectedStr = weatherDays[activeDayIndex];

    let html = '';

    for (let m = 0; m < 12; m++) {
      const firstDay = new Date(calendarYear, m, 1).getDay();
      const numDays = new Date(calendarYear, m + 1, 0).getDate();

      html += `
        <div class="calendar-month-box">
          <div class="calendar-month-title">${monthNames[m]}</div>
          <div class="calendar-days-header">
            ${dayLetters.map(d => `<span>${d}</span>`).join('')}
          </div>
          <div class="calendar-days-grid">
      `;

      for (let empty = 0; empty < firstDay; empty++) {
        html += `<span class="calendar-day empty"></span>`;
      }

      for (let d = 1; d <= numDays; d++) {
        const dateString = `${calendarYear}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const isToday = (dateString === todayStr);
        const isSelected = (dateString === selectedStr);
        const forecastIndex = weatherDays.indexOf(dateString);
        const isForecastable = (forecastIndex !== -1);

        let classes = ['calendar-day'];
        if (isToday) classes.push('today');
        if (isSelected) classes.push('selected');
        if (isForecastable) classes.push('forecastable');

        html += `
          <span class="${classes.join(' ')}" data-date="${dateString}">
            ${d}
          </span>
        `;
      }

      // Pad remaining cells to always have exactly 42 cells (6 rows * 7 columns)
      const totalCells = firstDay + numDays;
      const extraEmpty = 42 - totalCells;
      for (let empty = 0; empty < extraEmpty; empty++) {
        html += `<span class="calendar-day empty"></span>`;
      }

      html += `
          </div>
        </div>
      `;
    }

    gridContainer.innerHTML = html;

    const dayCells = gridContainer.querySelectorAll('.calendar-day:not(.empty)');
    dayCells.forEach(cell => {
      cell.addEventListener('click', (e) => {
        e.stopPropagation();
        const dateStr = cell.getAttribute('data-date');
        const forecastIndex = weatherDays.indexOf(dateStr);
        if (forecastIndex !== -1) {
          activeDayIndex = forecastIndex;
          renderActiveDayForecast();
          closeCalendarModal();
        } else {
          showCalendarToast("Forecast only available for the 7-day period (dashed outline).");
        }
      });
    });
  }

  function showCalendarToast(msg) {
    let toast = document.getElementById('calendar-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'calendar-toast';
      toast.style.cssText = `
        position: absolute;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(239, 68, 68, 0.95);
        color: #ffffff;
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1100;
        pointer-events: none;
        text-align: center;
        white-space: nowrap;
      `;
      document.querySelector('.calendar-card').appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
    }, 2500);
  }

  // Convert vertical wheel scrolling to horizontal scroll inside weather-hourly-container
  const hourlyContainer = document.getElementById('weather-hourly-container');
  if (hourlyContainer) {
    hourlyContainer.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        hourlyContainer.scrollLeft += e.deltaY;
      }
    });
  }

  // Pre-load weather when page starts
  loadWeatherForecast();

  // --- Drag and drop loader setup ---
  // Bind drag-and-drop to all editor input textareas
  setupDragAndDrop(textareaJson);
  setupDragAndDrop(textareaMysql);
  setupDragAndDrop(textareaJsonA);
  setupDragAndDrop(textareaJsonB);
  setupDragAndDrop(textareaTextA);
  setupDragAndDrop(textareaTextB);
  setupDragAndDrop(noteTextarea);

  // --- Wallpaper Switcher ---
  function initWallpaperSwitcher() {
    const btnWallpaper = document.getElementById('btn-wallpaper-switch');
    const overlay = document.getElementById('dashboard-overlay');
    if (!btnWallpaper || !overlay) return;

    const wallpapers = [
      {
        type: 'default',
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1920&q=80',
        title: 'Default Landscape'
      },
      {
        type: 'bing',
        url: 'https://bing.biturl.top/?resolution=1920&format=image&index=0',
        title: 'Bing Daily Wallpaper'
      },
      {
        type: 'random',
        url: 'https://picsum.photos/1920/1080',
        title: 'Random scenic (Picsum)'
      }
    ];

    let currentType = localStorage.getItem('dashboard_wallpaper_type') || 'default';
    
    function applyWallpaper(type, isClick = false) {
      let wp = wallpapers.find(w => w.type === type);
      if (!wp) wp = wallpapers[0];
      
      let url = wp.url;
      if (type === 'random' && isClick) {
        url = `${wp.url}?sig=${Date.now()}`;
      }
      
      overlay.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.45)), url('${url}')`;
      btnWallpaper.title = `Wallpaper: ${wp.title} (Click to Switch)`;
      localStorage.setItem('dashboard_wallpaper_type', type);
    }

    applyWallpaper(currentType);

    btnWallpaper.addEventListener('click', () => {
      let currentIndex = wallpapers.findIndex(w => w.type === currentType);
      let nextIndex = (currentIndex + 1) % wallpapers.length;
      currentType = wallpapers[nextIndex].type;
      applyWallpaper(currentType, true);
    });
  }

  initWallpaperSwitcher();
});
