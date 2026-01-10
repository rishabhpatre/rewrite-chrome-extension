let activeIcon = null;
let activeModal = null;
let activeOverlay = null;

document.addEventListener('mouseup', handleSelection);
document.addEventListener('mousedown', (e) => {
    // If clicking outside the icon or modal, close them
    if (activeIcon && !activeIcon.contains(e.target)) {
        // Also check if clicking inside the dropdown
        if (activeDropdown && activeDropdown.contains(e.target)) {
            return;
        }
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
        showIcon(rect, text);
    }
}

function showIcon(selectionRect, text) {
    removeIcon(); // Ensure no duplicates

    const container = document.createElement('div');
    container.className = 'rewrite-extension-toolbar'; // Renamed for clarity

    // Initial render: invisible to measure dimensions
    container.style.opacity = '0';
    container.style.left = '0px';
    container.style.top = '0px';
    document.body.appendChild(container); // Append temporarily to measure

    // Helper to create toolbar items (defined before use in full implementation, assuming it exists below)

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
    const explainIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"></path></svg>`;

    // Explain
    container.appendChild(createItem('Explain', 'explain', explainIcon, 'icon-yellow'));

    // Divider
    const div0 = document.createElement('div');
    div0.className = 'rewrite-extension-divider';
    container.appendChild(div0);

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

    // Divider
    const div3 = document.createElement('div');
    div3.className = 'rewrite-extension-divider';
    container.appendChild(div3);

    // More / Dropdown Trigger
    const moreBtn = document.createElement('div');
    moreBtn.className = 'rewrite-extension-item rewrite-extension-more';
    moreBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    moreBtn.onclick = (e) => {
        e.stopPropagation();
        toggleDropdown(container, text);
    };
    container.appendChild(moreBtn);

    // --- Positioning Logic ---
    const toolbarRect = container.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    const margin = 10;

    let finalTop = selectionRect.bottom + scrollY + margin;
    // Default: Align left with selection (or center? Left is standard)
    let finalLeft = selectionRect.left + scrollX;

    // Check if enough space below
    const spaceBelow = window.innerHeight - selectionRect.bottom;

    // If cramped below (< toolbar height + margin), move ABOVE
    if (spaceBelow < (toolbarRect.height + margin)) {
        // Position above: Selection Top - Toolbar Height - Margin
        finalTop = selectionRect.top + scrollY - toolbarRect.height - margin;
    }

    // Apply coordinates
    container.style.left = `${finalLeft}px`;
    container.style.top = `${finalTop}px`;
    container.style.opacity = '1';

    // We already appended it at the start, so just update activeIcon
    activeIcon = container;
}

let activeDropdown = null;

function toggleDropdown(parent, text) {
    if (activeDropdown) {
        removeDropdown();
        return;
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'rewrite-extension-dropdown';

    // Helper to create category
    const createCategory = (title, items) => {
        const cat = document.createElement('div');
        cat.className = 'rewrite-extension-category';

        const header = document.createElement('div');
        header.className = 'rewrite-extension-category-title';
        header.textContent = title;
        cat.appendChild(header);

        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'rewrite-extension-menu-item';
            row.onclick = (e) => {
                e.stopPropagation();
                processText(item.type, text);
            };

            const icon = document.createElement('span');
            icon.className = `rewrite-extension-menu-icon ${item.color}`;
            icon.innerHTML = item.icon;

            const label = document.createElement('span');
            label.textContent = item.label;

            row.appendChild(icon);
            row.appendChild(label);
            cat.appendChild(row);
        });
        return cat;
    };

    // Icons
    const proofIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    const listIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
    const checkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`;

    const mailIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
    const chatIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
    const twitterIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>`;

    const bugIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`; // Car-ish for bug/story differentiation or just specific icons
    const bugRealIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="4" ry="4"></rect><path d="M8 2v20"></path><path d="M16 2v20"></path><path d="M2 8h20"></path><path d="M2 16h20"></path></svg>`; // Grid
    const storyIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`; // Book
    const taskIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`; // Clock/Task

    // 1. Writing Tools
    dropdown.appendChild(createCategory("WRITING TOOLS", [
        { label: "Proofread", type: "proofread", icon: proofIcon, color: "icon-yellow" },
        { label: "Key Points", type: "key_points", icon: listIcon, color: "icon-blue" },
        { label: "Action Items", type: "action_items", icon: checkIcon, color: "icon-red" }
    ]));

    // 2. Platform Tools
    dropdown.appendChild(createCategory("PLATFORM TOOLS", [
        { label: "Email", type: "email", icon: mailIcon, color: "icon-grey" },
        { label: "Whatsapp", type: "whatsapp", icon: chatIcon, color: "icon-green" },
        { label: "Tweet", type: "tweet", icon: twitterIcon, color: "icon-blue" }
    ]));

    // 3. Project Tools
    dropdown.appendChild(createCategory("PROJECT TOOLS", [
        { label: "Bug", type: "bug", icon: bugRealIcon, color: "icon-red" },
        { label: "Story", type: "story", icon: storyIcon, color: "icon-green" },
        { label: "Task", type: "task", icon: taskIcon, color: "icon-blue" }
    ]));

    // 4. Custom Tool
    const starIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

    const customCat = document.createElement('div');
    customCat.className = 'rewrite-extension-category';
    const customHeader = document.createElement('div');
    customHeader.className = 'rewrite-extension-category-title';
    customHeader.textContent = "YOUR TOOLS";
    customCat.appendChild(customHeader);

    const row = document.createElement('div');
    row.className = 'rewrite-extension-menu-item';
    row.onclick = () => processText("custom", text);
    const icon = document.createElement('span');
    icon.className = `rewrite-extension-menu-icon icon-yellow`;
    icon.innerHTML = starIcon;
    const label = document.createElement('span');
    label.textContent = "Custom";
    row.appendChild(icon);
    row.appendChild(label);
    customCat.appendChild(row);

    dropdown.appendChild(customCat);

    // Position it below the toolbar by default
    const rect = parent.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Initial placement (invisible/below to measure)
    dropdown.style.opacity = '0';
    dropdown.style.left = `${rect.left + scrollX}px`;
    dropdown.style.top = `${rect.bottom + scrollY + 8}px`;

    document.body.appendChild(dropdown);
    activeDropdown = dropdown;

    // Smart Positioning
    const dropdownRect = dropdown.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;

    // If not enough space below (and enough above), move it above
    if (spaceBelow < dropdownRect.height && rect.top > dropdownRect.height) {
        dropdown.style.top = `${rect.top + scrollY - dropdownRect.height - 8}px`;
        // Optional: Animate from bottom up? Keep simple fade for now.
    }

    // Make visible
    // Force reflow to ensure transition works if we had one, but we used animation.
    // Reset opacity to let CSS take over (or set to 1)
    dropdown.style.opacity = '1';
}

function removeDropdown() {
    if (activeDropdown) {
        activeDropdown.remove();
        activeDropdown = null;
    }
}

function removeIcon() {
    if (activeIcon) {
        activeIcon.remove();
        activeIcon = null;
    }
    removeDropdown();
}

function processText(type, text) {
    removeIcon();

    let title = "Loading...";
    if (type === 'rewrite') title = "Rewritten Text";
    else if (type === 'summarize') title = "Summarized Text";
    else if (type === 'translate') title = "Translated Text";
    else if (type === 'explain') title = "Explanation";
    else if (type === 'proofread') title = "Proofread Text";
    else if (type === 'key_points') title = "Key Points";
    else if (type === 'action_items') title = "Action Items";
    else if (type === 'email') title = "Email Draft";
    else if (type === 'whatsapp') title = "WhatsApp Message";
    else if (type === 'tweet') title = "Tweet Draft";
    else if (type === 'bug') title = "Bug";
    else if (type === 'story') title = "Story";
    else if (type === 'task') title = "Task";
    else if (type === 'custom') title = "Custom Result";

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
