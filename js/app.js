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
  
  // Toggle sidebar visibility
  btnSidebarToggle.addEventListener('click', () => {
    mainContainer.classList.toggle('sidebar-collapsed');
  });

  // Switch tools (Tabs)
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const toolName = item.getAttribute('data-tool');
      
      // Active states in sidebar
      sidebarItems.forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      
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
      const lineNum = extractLineNumber(e, textareaJson.value);
      showError(`Syntax Error: Failed to format JSON. ${e.message}`, lineNum, lineNumbersJson.id);
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
      const lineNum = extractLineNumber(e, textareaJson.value);
      showError(`Syntax Error: Failed to compress JSON. ${e.message}`, lineNum, lineNumbersJson.id);
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
    
    // Split query into tokens while preserving strings intact, supporting decimals and dots
    const regex = /("[^"]*"|'[^']*'|`[^`]*`|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_][a-zA-Z0-9_]*\b|[-+*\/=<>!]+|\.|\s+|,|;|\(|\))/g;
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
      
      if (!trimmed) continue; // skip raw white spaces tokens
      
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
      
      result += token + ' ';
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
    renderDiffOutput(diff, textareaJsonA, divJsonADiff, textareaJsonB, divJsonBDiff);
    
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

  function renderDiffOutput(diff, textareaA, divA, textareaB, divB) {
    textareaA.style.display = 'none';
    textareaB.style.display = 'none';
    divA.style.display = 'block';
    divB.style.display = 'block';
    
    let htmlA = '';
    let htmlB = '';
    
    diff.forEach(item => {
      const escA = escapeHTML(item.valA);
      const escB = escapeHTML(item.valB);
      
      if (item.type === 'unchanged') {
        htmlA += `<div class="diff-line">${escA || '&nbsp;'}</div>`;
        htmlB += `<div class="diff-line">${escB || '&nbsp;'}</div>`;
      } else if (item.type === 'removed') {
        htmlA += `<div class="diff-line removed">- ${escA}</div>`;
        htmlB += `<div class="diff-line empty-placeholder">&nbsp;</div>`;
      } else if (item.type === 'added') {
        htmlA += `<div class="diff-line empty-placeholder">&nbsp;</div>`;
        htmlB += `<div class="diff-line added">+ ${escB}</div>`;
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
});
