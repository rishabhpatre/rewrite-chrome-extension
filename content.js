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

// Async to fetch custom tool names
async function toggleDropdown(parent, text) {
    if (activeDropdown) {
        removeDropdown();
        return;
    }

    // Fetch Custom Tool Names
    const data = await new Promise(resolve => {
        chrome.storage.sync.get(['customName1', 'customName2', 'customName3'], resolve);
    });

    const name1 = data.customName1 || "Custom 1";
    const name2 = data.customName2 || "Custom 2";
    const name3 = data.customName3 || "Custom 3";

    const dropdown = document.createElement('div');
    dropdown.className = 'rewrite-extension-dropdown';

    // Helper to create category block
    const createCategoryBlock = (title, items) => {
        const cat = document.createElement('div');
        cat.className = 'rewrite-extension-category'; // Just a wrapper now if needed, or stick to column flow

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

            const iconSpan = document.createElement('span');
            iconSpan.className = `rewrite-extension-menu-icon ${item.color}`;
            iconSpan.innerHTML = item.icon;

            const labelSpan = document.createElement('span');
            labelSpan.textContent = item.label;

            row.appendChild(iconSpan);
            row.appendChild(labelSpan);
            cat.appendChild(row);
        });
        return cat;
    };

    // --- ICONS ---
    const proofIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
    const listIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`;
    const checkIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`;
    const scissorsIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>`;

    const mailIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
    const chatIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
    const twitterIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>`;

    // Reply Icons
    const smartIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>`;
    const thumbUpIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>`;
    const penIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>`;
    const counterIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`;
    const questionIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
    const heartIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
    const blockIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>`;
    const checkCircleIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;

    const bugRealIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="4" ry="4"></rect><path d="M8 2v20"></path><path d="M16 2v20"></path><path d="M2 8h20"></path><path d="M2 16h20"></path></svg>`;
    const storyIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`;
    const taskIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;

    // Custom Icons (1, 2, 3)
    const icon1 = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M12 8v8"></path><path d="M10 10l2-2"></path></svg>`;
    const icon2 = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M10 9a2 2 0 1 1 4 0c0 2-3 3-4 6h4"></path></svg>`;
    const icon3 = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M10 9a2 2 0 1 1 4 0c0 .5-.1 1-.5 1.5 2-.5 3 .5 3 2.5S13.5 16 12 16h-2"></path></svg>`;

    // --- COLUMNS ---

    // Column 1: Writing & Platform
    const col1 = document.createElement('div');
    col1.className = 'rewrite-extension-column';
    col1.appendChild(createCategoryBlock("WRITING TOOLS", [
        { label: "Proofread", type: "proofread", icon: proofIcon, color: "icon-yellow" },
        { label: "Simplify", type: "simplify", icon: scissorsIcon, color: "icon-orange" },
        { label: "Key Points", type: "key_points", icon: listIcon, color: "icon-cyan" },
        { label: "Action Items", type: "action_items", icon: checkIcon, color: "icon-red" }
    ]));
    col1.appendChild(createCategoryBlock("PLATFORM TOOLS", [
        { label: "Email", type: "email", icon: mailIcon, color: "icon-grey" },
        { label: "Whatsapp", type: "whatsapp", icon: chatIcon, color: "icon-green" },
        { label: "Tweet", type: "tweet", icon: twitterIcon, color: "icon-blue" }
    ]));

    // Column 2: Reply Tools (The new features!)
    const col2 = document.createElement('div');
    col2.className = 'rewrite-extension-column';
    col2.appendChild(createCategoryBlock("REPLY TOOLS", [
        { label: "Smart (Auto)", type: "smart_reply", icon: smartIcon, color: "icon-pink" },
        { label: "Appreciate", type: "appreciate", icon: thumbUpIcon, color: "icon-red" },
        { label: "Critique", type: "critique", icon: penIcon, color: "icon-purple" },
        { label: "Counter", type: "counter", icon: counterIcon, color: "icon-orange" },
        { label: "Ask a Question", type: "question", icon: questionIcon, color: "icon-blue" },
        { label: "Empathise", type: "empathise", icon: heartIcon, color: "icon-pink" },
        { label: "Accept Positively", type: "accept", icon: checkCircleIcon, color: "icon-green" },
        { label: "Reject Politely", type: "reject", icon: blockIcon, color: "icon-grey" }
    ]));

    // Column 3: Project & Custom
    const col3 = document.createElement('div');
    col3.className = 'rewrite-extension-column';
    col3.appendChild(createCategoryBlock("PROJECT TOOLS", [
        { label: "Bug", type: "bug", icon: bugRealIcon, color: "icon-red" },
        { label: "Story", type: "story", icon: storyIcon, color: "icon-green" },
        { label: "Task", type: "task", icon: taskIcon, color: "icon-blue" }
    ]));
    col3.appendChild(createCategoryBlock("YOUR TOOLS", [
        { label: name1, type: "custom1", icon: icon1, color: "icon-grey" },
        { label: name2, type: "custom2", icon: icon2, color: "icon-grey" },
        { label: name3, type: "custom3", icon: icon3, color: "icon-grey" }
    ]));

    dropdown.appendChild(col1);
    dropdown.appendChild(col2);
    dropdown.appendChild(col3);

    // --- Positioning Logic ---
    const parentRect = parent.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Initial placement (invisible/below to measure)
    dropdown.style.opacity = '0';
    dropdown.style.left = `${parentRect.left + scrollX}px`;
    dropdown.style.top = `${parentRect.bottom + scrollY + 8}px`;

    document.body.appendChild(dropdown);
    activeDropdown = dropdown;

    // Smart Positioning
    const dropdownRect = dropdown.getBoundingClientRect();
    const spaceBelow = window.innerHeight - parentRect.bottom;

    // If not enough space below (and enough above), move it above
    if (spaceBelow < dropdownRect.height && parentRect.top > dropdownRect.height) {
        dropdown.style.top = `${parentRect.top + scrollY - dropdownRect.height - 8}px`;
    }

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
    else if (type === 'simplify') title = "Simplified Text";
    else if (type === 'key_points') title = "Key Points";
    else if (type === 'action_items') title = "Action Items";
    else if (type === 'email') title = "Email Draft";
    else if (type === 'whatsapp') title = "WhatsApp Message";
    else if (type === 'tweet') title = "Tweet Draft";
    else if (type === 'bug') title = "Bug";
    else if (type === 'story') title = "Story";
    else if (type === 'task') title = "Task";
    else if (type === 'custom') title = "Custom Result"; // Legacy fallback
    else if (type === 'custom1') title = "Custom Result";
    else if (type === 'custom2') title = "Custom Result";
    else if (type === 'custom3') title = "Custom Result";
    else if (type === 'smart_reply') title = "Smart Reply";
    else if (type === 'appreciate') title = "Appreciation";
    else if (type === 'critique') title = "Critique";
    else if (type === 'counter') title = "Counterpoint";
    else if (type === 'question') title = "Question";
    else if (type === 'empathise') title = "Empathetic Reply";
    else if (type === 'accept') title = "Acceptance";
    else if (type === 'reject') title = "Rejection";

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
