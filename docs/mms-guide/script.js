function processCodeSnippets() {
    document.querySelectorAll('.code-snippet').forEach(async (container) => {
        const link = container.querySelector('a');
        if (!link) return;

        const href = link.getAttribute('href');
        
        if (!href || !/(^\.\/examples\/|^examples\/)/.test(href) || !/(\.py|\.R|\.ipynb)$/.test(href)) {
            console.error(`Invalid code snippet link: ${href}`);
            return;
        }

        const filename = link.textContent.replace(/[`[\]]/g, '');
        const ext = href.match(/\.(py|R|ipynb)$/)[1];

        try {
            const collapsible = document.createElement('div');
            collapsible.className = 'collapsible';

            if (ext === 'ipynb') {
                await handleNotebook(collapsible, href, filename);
            } else {
                await handleCodeFile(collapsible, href, filename, ext);
            }

            container.replaceWith(collapsible);

            const header = collapsible.querySelector('.collapsible-header');
            const downloadBtns = collapsible.querySelectorAll('.collapsible-download');
            
            header.addEventListener('click', function(e) {
                if (!Array.from(downloadBtns).some(btn => e.target === btn || btn.contains(e.target))) {
                    collapsible.classList.toggle('open');
                }
            });
        } catch (error) {
            console.error(`Error loading ${href}:`, error);
        }
    });
}

async function handleCodeFile(collapsible, href, filename, ext) {
    const response = await fetch(href);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    const code = await response.text();

    collapsible.innerHTML = `
        <div class="collapsible-header">
            <div class="collapsible-header-left">
                <span class="collapsible-toggle">▶</span>
                <span class="collapsible-filename">${filename}</span>
            </div>
            <a href="${href}" download class="collapsible-download">Download</a>
        </div>
        <div class="collapsible-content">
            <pre><code>${escapeHtml(code)}</code></pre>
        </div>
    `;
}

async function handleNotebook(collapsible, href, filename) {
    const baseName = href.replace(/\.ipynb$/, '');
    const htmlPath = baseName + '.html';
    const ipynbPath = href;
    const pyPath = baseName + '.py';

    const htmlResponse = await fetch(htmlPath);
    if (!htmlResponse.ok) throw new Error(`Failed to fetch HTML: ${htmlResponse.status}`);
    const html = await htmlResponse.text();

    collapsible.innerHTML = `
        <div class="collapsible-header">
            <div class="collapsible-header-left">
                <span class="collapsible-toggle">▶</span>
                <span class="collapsible-filename">${filename}</span>
            </div>
            <div class="collapsible-downloads">
                <a href="${htmlPath}" target="_blank" class="collapsible-download">View in new tab</a>
                <a href="${ipynbPath}" download class="collapsible-download">Download .ipynb</a>
                <a href="${pyPath}" download class="collapsible-download">Download .py</a>
            </div>
        </div>
        <div class="collapsible-content">
            <iframe class="notebook-iframe" sandbox="allow-same-origin"></iframe>
        </div>
    `;

    const iframe = collapsible.querySelector('.notebook-iframe');
    iframe.srcdoc = html;
}


function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

processCodeSnippets();

// function processCodeSnippets() {
//     document.querySelectorAll('.code-snippet').forEach(async (container) => {
//     const link = container.querySelector('a');
//     if (!link) return;

//     const href = link.getAttribute('href');
    
//     if (!href || !/(^\.\/examples\/|^examples\/)/.test(href) || !/(\.py|\.R)$/.test(href)) {
//         console.error(`Invalid code snippet link: ${href}`);
//         return;
//     }

//     const filename = link.textContent.replace(/[`[\]]/g, '');

//     try {
//         const response = await fetch(href);
//         if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
//         const code = await response.text();

//         const collapsible = document.createElement('div');
//         collapsible.className = 'collapsible';
//         collapsible.innerHTML = `
//             <div class="collapsible-header">
//                 <div class="collapsible-header-left">
//                     <span class="collapsible-toggle">▶</span>
//                     <span class="collapsible-filename">${filename}</span>
//                 </div>
//                 <a href="${href}" download class="collapsible-download">Download</a>
//             </div>
//             <div class="collapsible-content">
//                 <pre><code>${escapeHtml(code)}</code></pre>
//             </div>
//         `;

//         container.replaceWith(collapsible);

//         const header = collapsible.querySelector('.collapsible-header');
//         const downloadBtn = collapsible.querySelector('.collapsible-download');
        
//         header.addEventListener('click', function(e) {
//             if (e.target !== downloadBtn && !downloadBtn.contains(e.target)) {
//                 collapsible.classList.toggle('open');
//             }
//         });
//     } catch (error) {
//         console.error(`Error loading ${href}:`, error);
//     }
//     });
// }

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function generateTOC() {
  const tocContainer = document.getElementById('toc');
  
  const headings = document.querySelectorAll('h2, h3, h4, h5, h6');
  if (headings.length === 0) return;
  
  const list = document.createElement('ul');
  let currentLevel = parseInt(headings[0].tagName[1]);
  let currentList = list;
  const levelStack = [{ level: currentLevel, list }];
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName[1]);
    const id = heading.id || `heading-${index}`;
    heading.id = id;
    
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.textContent = heading.textContent;
    
    const item = document.createElement('li');
    item.appendChild(link);
    
    if (level > currentLevel) {
      for (let i = currentLevel; i < level; i++) {
        const newList = document.createElement('ul');
        const newItem = document.createElement('li');
        newItem.appendChild(newList);
        currentList.lastElementChild.appendChild(newList);
        levelStack.push({ level: i + 1, list: newList });
        currentList = newList;
      }
    } else if (level < currentLevel) {
      while (levelStack.length > 1 && levelStack[levelStack.length - 1].level > level) {
        levelStack.pop();
      }
      currentList = levelStack[levelStack.length - 1].list;
    }
    
    currentList.appendChild(item);
    currentLevel = level;
  });
  
  const heading = document.createElement('h2');
  heading.textContent = 'Table of Contents';
  tocContainer.appendChild(heading);
  tocContainer.appendChild(list);

}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processCodeSnippets);
    document.addEventListener('DOMContentLoaded', generateTOC);
} else {
    generateTOC();
    processCodeSnippets();
}