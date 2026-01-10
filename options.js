// DOM Elements
const providerSelect = document.getElementById('providerSelect');
const geminiGroup = document.getElementById('geminiGroup');
const openaiGroup = document.getElementById('openaiGroup');

// Toggle Visibility
providerSelect.addEventListener('change', () => {
    if (providerSelect.value === 'gemini') {
        geminiGroup.style.display = 'block';
        openaiGroup.style.display = 'none';
    } else {
        geminiGroup.style.display = 'none';
        openaiGroup.style.display = 'block';
    }
});

document.getElementById('save').addEventListener('click', () => {
    const provider = providerSelect.value;
    const geminiApiKey = document.getElementById('geminiApiKey').value;
    const openaiApiKey = document.getElementById('openaiApiKey').value;
    const englishLevel = document.getElementById('englishLevel').value;

    // Custom Tools
    const customName1 = document.getElementById('customName1').value;
    const customPrompt1 = document.getElementById('customPrompt1').value;
    const customName2 = document.getElementById('customName2').value;
    const customPrompt2 = document.getElementById('customPrompt2').value;
    const customName3 = document.getElementById('customName3').value;
    const customPrompt3 = document.getElementById('customPrompt3').value;

    chrome.storage.sync.set({
        selectedProvider: provider,
        geminiApiKey,
        openaiApiKey,
        englishLevel,
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
    chrome.storage.sync.get({
        selectedProvider: 'gemini',
        geminiApiKey: '',
        openaiApiKey: '',
        englishLevel: 'neutral',
        customName1: '', customPrompt1: '',
        customName2: '', customPrompt2: '',
        customName3: '', customPrompt3: ''
    }, (items) => {
        providerSelect.value = items.selectedProvider;
        document.getElementById('geminiApiKey').value = items.geminiApiKey;
        document.getElementById('openaiApiKey').value = items.openaiApiKey;
        document.getElementById('englishLevel').value = items.englishLevel;

        // Trigger visibility update
        providerSelect.dispatchEvent(new Event('change'));

        document.getElementById('customName1').value = items.customName1;
        document.getElementById('customPrompt1').value = items.customPrompt1;
        document.getElementById('customName2').value = items.customName2;
        document.getElementById('customPrompt2').value = items.customPrompt2;
        document.getElementById('customName3').value = items.customName3;
        document.getElementById('customPrompt3').value = items.customPrompt3;
    });
});
