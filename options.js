document.getElementById('save').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    const customPrompt = document.getElementById('customPrompt').value;
    chrome.storage.sync.set({ geminiApiKey: apiKey, customPrompt: customPrompt }, () => {
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get(['geminiApiKey', 'customPrompt'], (items) => {
        if (items.geminiApiKey) {
            document.getElementById('apiKey').value = items.geminiApiKey;
        }
        if (items.customPrompt) {
            document.getElementById('customPrompt').value = items.customPrompt;
        }
    });
});
