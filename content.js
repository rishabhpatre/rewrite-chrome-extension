let activeIcon = null;
let activeModal = null;
let activeOverlay = null;

document.addEventListener('mouseup', handleSelection);
document.addEventListener('mousedown', (e) => {
    // If clicking outside the icon or modal, close them
    if (activeIcon && !activeIcon.contains(e.target)) {
        setTimeout(() => removeIcon(), 100);
    } else if (activeIcon) {
        // Clicked inside
    }
    // Note: Modal usually has an overlay to handle closing, or a close button.
    // We'll let the overlay click handler deal with modal closing.
});

function handleSelection(e) {
    // If the mouseup event happened inside our icon/container, do NOT re-process selection.
    // This prevents the button from being removed/re-added before the 'click' event fires.
    if (activeIcon && activeIcon.contains(e.target)) {
        return;
    }

    // Also ignore if clicking inside the modal
    if (activeModal && activeModal.contains(e.target)) {
        return;
    }

    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        showIcon(rect.left + window.scrollX, rect.bottom + window.scrollY, text);
    }
}

function showIcon(x, y, text) {
    removeIcon(); // Ensure no duplicates

    const container = document.createElement('div');
    container.className = 'rewrite-extension-toolbar'; // Renamed for clarity
    container.style.left = `${x}px`;
    container.style.top = `${y + 10}px`;

    // Helper to create toolbar items
    const createItem = (label, type, iconSvg, colorClass) => {
        const btn = document.createElement('div');
        btn.className = 'rewrite-extension-item';
        btn.onclick = (e) => {
            e.stopPropagation(); // Prevent ensuring selection logic triggers
            processText(type, text);
        };

        const iconSpan = document.createElement('span');
        iconSpan.className = `rewrite-extension-icon ${colorClass}`;
        iconSpan.innerHTML = iconSvg;

        const textSpan = document.createElement('span');
        textSpan.className = 'rewrite-extension-text';
        textSpan.textContent = label;

        btn.appendChild(iconSpan);
        btn.appendChild(textSpan);
        return btn;
    };

    // SVGs
    const editIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    const summaryIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
    const translateIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
    // Alternate translate icon (A/文 style is complex in simple SVG, using Globe for now or simple character mapping)
    // Actually, let's use a simpler text-like icon or the user's reference style (A with arrow). 
    const translateIcon2 = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l6 6"></path><path d="M4 14h6"></path><path d="M2 5h12"></path><path d="M7 2h1"></path><path d="M22 22l-5-10-5 10"></path><path d="M14 18h6"></path></svg>`;


    // Rewrite
    container.appendChild(createItem('Rewrite', 'rewrite', editIcon, 'icon-blue'));

    // Divider
    const div1 = document.createElement('div');
    div1.className = 'rewrite-extension-divider';
    container.appendChild(div1);

    // Summarize
    container.appendChild(createItem('Summarize', 'summarize', summaryIcon, 'icon-purple'));

    // Divider
    const div2 = document.createElement('div');
    div2.className = 'rewrite-extension-divider';
    container.appendChild(div2);

    // Translate
    container.appendChild(createItem('Translate', 'translate', translateIcon2, 'icon-green'));

    document.body.appendChild(container);
    activeIcon = container;
}

function removeIcon() {
    if (activeIcon) {
        activeIcon.remove();
        activeIcon = null;
    }
}

function processText(type, text) {
    removeIcon();

    let title = "Loading...";
    if (type === 'rewrite') title = "Rewritten Text";
    else if (type === 'summarize') title = "Summarized Text";
    else if (type === 'translate') title = "Translated Text";

    showModal("Loading...", title);

    chrome.runtime.sendMessage({ action: "generate_text", type, text }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("Runtime Custom Error:", chrome.runtime.lastError);
            updateModal(`Error: ${chrome.runtime.lastError.message}`);
            return;
        }
        if (!response) {
            updateModal("Error: No response from background script.");
            return;
        }
        if (response.error) {
            updateModal(`Error: ${response.error}`);
        } else {
            updateModal(response.data);
        }
    });
}

function showModal(initialContent, titleText = "AI Result") {
    // Overlay
    const overlay = document.createElement('div');
    overlay.className = 'rewrite-extension-overlay';
    overlay.onclick = closeModal;
    document.body.appendChild(overlay);
    activeOverlay = overlay;

    // Modal
    const modal = document.createElement('div');
    modal.className = 'rewrite-extension-modal';

    const header = document.createElement('div');
    header.className = 'rewrite-extension-modal-header';

    const title = document.createElement('span');
    title.className = 'rewrite-extension-modal-title';
    title.textContent = titleText;

    const actionsDiv = document.createElement('div');
    actionsDiv.style.display = 'flex';
    actionsDiv.style.alignItems = 'center';
    actionsDiv.style.gap = '10px';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'rewrite-extension-close'; // Reuse style for simplicity or create new
    copyBtn.style.fontSize = '16px';
    copyBtn.innerHTML = '📋'; // Clipboard icon
    copyBtn.title = "Copy to clipboard";
    copyBtn.onclick = () => {
        const textToCopy = document.getElementById('rewrite-extension-output').textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.innerHTML = '✅';
            setTimeout(() => copyBtn.innerHTML = '📋', 2000);
        });
    };

    const closeBtn = document.createElement('button');
    closeBtn.className = 'rewrite-extension-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = closeModal;

    actionsDiv.appendChild(copyBtn);
    actionsDiv.appendChild(closeBtn);

    header.appendChild(title);
    header.appendChild(actionsDiv);

    const content = document.createElement('div');
    content.className = 'rewrite-extension-content';
    content.id = 'rewrite-extension-output';
    content.textContent = initialContent;

    modal.appendChild(header);
    modal.appendChild(content);

    document.body.appendChild(modal);
    activeModal = modal;
}

function updateModal(newContent) {
    const contentEl = document.getElementById('rewrite-extension-output');
    if (contentEl) {
        contentEl.textContent = newContent;
    }
}

function closeModal() {
    if (activeModal) activeModal.remove();
    if (activeOverlay) activeOverlay.remove();
    activeModal = null;
    activeOverlay = null;
}
