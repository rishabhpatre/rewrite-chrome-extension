document.getElementById('save').addEventListener('click', () => {
    const apiKey = document.getElementById('apiKey').value;
    chrome.storage.sync.set({ geminiApiKey: apiKey }, () => {
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get('geminiApiKey', (items) => {
        if (items.geminiApiKey) {
            document.getElementById('apiKey').value = items.geminiApiKey;
        }
    });
});
