document.getElementById('save').addEventListener('click', () => {
    const geminiApiKey = document.getElementById('geminiApiKey').value;
    const customName1 = document.getElementById('customName1').value;
    const customPrompt1 = document.getElementById('customPrompt1').value;
    const customName2 = document.getElementById('customName2').value;
    const customPrompt2 = document.getElementById('customPrompt2').value;
    const customName3 = document.getElementById('customName3').value;
    const customPrompt3 = document.getElementById('customPrompt3').value;

    chrome.storage.sync.set({
        geminiApiKey,
        customName1, customPrompt1,
        customName2, customPrompt2,
        customName3, customPrompt3
    }, () => {
        const status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(() => {
            status.textContent = '';
        }, 2000);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get({
        geminiApiKey: '',
        customName1: '', customPrompt1: '',
        customName2: '', customPrompt2: '',
        customName3: '', customPrompt3: ''
    }, (items) => {
        document.getElementById('geminiApiKey').value = items.geminiApiKey;
        document.getElementById('customName1').value = items.customName1;
        document.getElementById('customPrompt1').value = items.customPrompt1;
        document.getElementById('customName2').value = items.customName2;
        document.getElementById('customPrompt2').value = items.customPrompt2;
        document.getElementById('customName3').value = items.customName3;
        document.getElementById('customPrompt3').value = items.customPrompt3;
    });
});
