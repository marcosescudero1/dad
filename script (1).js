// Global variables
let dictionary = null;
let dictionaryOriginal = null;

// Navigation
function showTool(toolId) {
    // Hide all sections
    document.querySelectorAll('.tool-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(toolId).classList.add('active');
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Update Vigenere UI based on mode
document.addEventListener('DOMContentLoaded', () => {
    const vigMode = document.getElementById('vig-mode');
    if (vigMode) {
        vigMode.addEventListener('change', (e) => {
            const bruteOptions = document.getElementById('vig-brute-options');
            bruteOptions.style.display = e.target.value === 'brute' ? 'block' : 'none';
        });
    }
});

// Utility functions
function clearOutput(outputId) {
    const output = document.getElementById(outputId);
    output.innerHTML = '';
    output.classList.add('empty');
}

function showOutput(outputId, content) {
    const output = document.getElementById(outputId);
    output.innerHTML = content;
    output.classList.remove('empty');
}

function showProgress(progressId, show) {
    const progress = document.getElementById(progressId);
    if (progress) {
        progress.style.display = show ? 'block' : 'none';
    }
}

function updateProgress(progressBarId, percent) {
    const bar = document.getElementById(progressBarId);
    if (bar) {
        bar.style.width = percent + '%';
        bar.textContent = percent + '%';
    }
}

// Load dictionary
async function loadDictionary() {
    if (dictionary) return dictionary;
    
    try {
        const response = await fetch('https://raw.githubusercontent.com/david47k/top-english-wordlists/refs/heads/master/top_english_words_mixed_500000.txt');
        const text = await response.text();
        
        const words = text.split('\n').map(w => w.trim()).filter(w => w.length > 0);
        
        dictionary = new Set(words.map(w => w.toLowerCase()));
        
        dictionaryOriginal = new Map();
        words.forEach(word => {
            const normalized = word.toLowerCase();
            if (!dictionaryOriginal.has(normalized) || 
                (word.match(/[A-Z]/g) || []).length > (dictionaryOriginal.get(normalized).match(/[A-Z]/g) || []).length) {
                dictionaryOriginal.set(normalized, word);
            }
        });
        
        return dictionary;
    } catch (error) {
        alert('Error loading dictionary. Please check your internet connection.');
        return null;
    }
}

// ==================== CIPHER TOOL ====================
function caesarShift(text, n) {
    let output = '';
    for (let char of text) {
        if (char >= 'a' && char <= 'z') {
            let x = char.charCodeAt(0);
            x = x + n;
            if (x > 'z'.charCodeAt(0)) {
                x = 'a'.charCodeAt(0) - 1 + (x - 'z'.charCodeAt(0));
            }
            output += String.fromCharCode(x);
        } else if (char >= 'A' && char <= 'Z') {
            let x = char.charCodeAt(0);
            x = x + n;
            if (x > 'Z'.charCodeAt(0)) {
                x = 'A'.charCodeAt(0) - 1 + (x - 'Z'.charCodeAt(0));
            }
            output += String.fromCharCode(x);
        } else {
            output += char;
        }
    }
    return output;
}

function base64Decode(text) {
    try {
        return atob(text.trim());
    } catch (e) {
        return 'Invalid Base64';
    }
}

function morseDecode(text) {
    const morseDict = {
        '-': 'T', '-.--': 'Y', '.': 'E', '-.-': 'K', '..---': '2', '.--': 'W',
        '-.': 'N', '.--.': 'P', '.-.': 'R', '...': 'S', '.---': 'J', '-..-': 'X',
        '...--': '3', '...-': 'V', '-....': '6', '--..': 'Z', '---': 'O', '-.-.': 'C',
        '-..': 'D', '----.': '9', '--.': 'G', '..-': 'U', '---..': '8', '-...': 'B',
        '..': 'I', '.-..': 'L', '....-': '4', '..-.': 'F', '....': 'H', '.-': 'A',
        '--': 'M', '--...': '7', '.....': '5', '--.-': 'Q', '-----': '0', '.----': '1'
    };
    
    let result = '';
    for (let letter of text.split(' ')) {
        result += morseDict[letter] || '?';
    }
    return result;
}

function mirrorDecode(text) {
    return text.split('').reverse().join('');
}

function letter2number(text) {
    const lowerDict = {
        'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
        'j': 10, 'k': 11, 'l': 12, 'm': 13, 'n': 14, 'o': 15, 'p': 16, 'q': 17,
        'r': 18, 's': 19, 't': 20, 'u': 21, 'v': 22, 'w': 23, 'x': 24, 'y': 25, 'z': 26
    };
    const upperDict = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 10, 'K': 11, 'L': 12, 'M': 13, 'N': 14, 'O': 15, 'P': 16, 'Q': 17,
        'R': 18, 'S': 19, 'T': 20, 'U': 21, 'V': 22, 'W': 23, 'X': 24, 'Y': 25, 'Z': 26
    };
    
    let result = '';
    for (let char of text) {
        if (lowerDict[char]) {
            result += lowerDict[char];
        } else if (upperDict[char]) {
            result += upperDict[char];
        } else {
            result += char;
        }
    }
    return result;
}

function runCipherTool() {
    const input = document.getElementById('cipher-input').value;
    const type = document.getElementById('cipher-type').value;
    
    if (!input.trim()) {
        alert('Please enter ciphertext');
        return;
    }
    
    let output = '<div style="font-family: monospace;">';
    
    if (type === 'auto' || type === 'caesar') {
        output += '<div style="margin-bottom: 20px;"><strong>Caesar Cipher (All ROT values):</strong></div>';
        for (let i = 1; i < 26; i++) {
            const result = caesarShift(input, i);
            const highlight = (result.toLowerCase().includes('flag') || result.toLowerCase().includes('ctf')) 
                ? ' style="background: #fff3cd; padding: 5px;"' : '';
            output += `<div${highlight}>ROT${i}: ${result}</div>`;
        }
    }
    
    if (type === 'auto' || type === 'base64') {
        if (input.trim().length % 4 === 0 || type === 'base64') {
            output += '<div style="margin: 20px 0;"><strong>Base64 Decode:</strong></div>';
            output += `<div>${base64Decode(input)}</div>`;
        }
    }
    
    if (type === 'auto' || type === 'morse') {
        if (/^[\.\-\s]*$/.test(input) || type === 'morse') {
            output += '<div style="margin: 20px 0;"><strong>Morse Code:</strong></div>';
            output += `<div>${morseDecode(input)}</div>`;
        }
    }
    
    if (type === 'auto' || type === 'mirror') {
        output += '<div style="margin: 20px 0;"><strong>Mirror (Reverse):</strong></div>';
        output += `<div>${mirrorDecode(input)}</div>`;
    }
    
    if (type === 'auto' || type === 'l2n') {
        output += '<div style="margin: 20px 0;"><strong>Letter to Number:</strong></div>';
        output += `<div>${letter2number(input)}</div>`;
    }
    
    output += '</div>';
    showOutput('cipher-output', output);
}

// ==================== VIGENERE CRACKER ====================
function vigenereDecrypt(ciphertext, key) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let plaintext = '';
    let keyIndex = 0;
    
    for (let char of ciphertext) {
        if (alphabet.includes(char)) {
            const c = alphabet.indexOf(char);
            const k = alphabet.indexOf(key[keyIndex % key.length]);
            plaintext += alphabet[(c - k + 26) % 26];
            keyIndex++;
        }
    }
    return plaintext;
}

async function runVigenere() {
    const input = document.getElementById('vig-input').value.toLowerCase().replace(/[^a-z]/g, '');
    const mode = document.getElementById('vig-mode').value;
    
    if (!input) {
        alert('Please enter ciphertext');
        return;
    }
    
    const dict = await loadDictionary();
    if (!dict) return;
    
    showProgress('vig-progress', true);
    updateProgress('vig-progress-bar', 0);
    
    const results = [];
    
    if (mode === 'dictionary') {
        const words = Array.from(dict).filter(w => w.length >= 2 && w.length <= input.length);
        
        for (let i = 0; i < words.length; i++) {
            const key = words[i];
            const plaintext = vigenereDecrypt(input, key);
            
            if (dict.has(plaintext)) {
                results.push({ key, plaintext });
            }
            
            if (i % 1000 === 0) {
                updateProgress('vig-progress-bar', Math.round((i / words.length) * 100));
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
    } else {
        // Brute force mode
        const maxLen = parseInt(document.getElementById('vig-max-length').value);
        const alphabet = 'abcdefghijklmnopqrstuvwxyz';
        
        async function* generateKeys(length) {
            if (length === 1) {
                for (let char of alphabet) {
                    yield char;
                }
            } else {
                for (let char of alphabet) {
                    for await (let rest of generateKeys(length - 1)) {
                        yield char + rest;
                    }
                }
            }
        }
        
        let checked = 0;
        const totalKeys = Math.pow(26, maxLen);
        
        for (let len = 2; len <= maxLen; len++) {
            for await (let key of generateKeys(len)) {
                const plaintext = vigenereDecrypt(input, key);
                
                if (dict.has(plaintext)) {
                    results.push({ key, plaintext });
                }
                
                checked++;
                if (checked % 10000 === 0) {
                    updateProgress('vig-progress-bar', Math.round((checked / totalKeys) * 100));
                    await new Promise(resolve => setTimeout(resolve, 0));
                }
            }
        }
    }
    
    updateProgress('vig-progress-bar', 100);
    showProgress('vig-progress', false);
    
    let output = `<strong>Found ${results.length} possible solution(s):</strong><br><br>`;
    
    if (results.length === 0) {
        output += '<em>No valid words found. Try different settings.</em>';
    } else {
        results.forEach(r => {
            output += `<div class="result-item"><strong>Key:</strong> ${r.key} → <strong>Plaintext:</strong> ${r.plaintext}</div>`;
        });
    }
    
    showOutput('vig-output', output);
}

// ==================== BEAUFORT CRACKER ====================
function beaufortDecrypt(ciphertext, key) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let plaintext = '';
    let keyIndex = 0;
    
    for (let char of ciphertext) {
        if (alphabet.includes(char)) {
            const c = alphabet.indexOf(char);
            const k = alphabet.indexOf(key[keyIndex % key.length]);
            plaintext += alphabet[(k - c + 26) % 26];
            keyIndex++;
        }
    }
    return plaintext;
}

async function runBeaufort() {
    const input = document.getElementById('beaufort-input').value.toLowerCase().replace(/[^a-z]/g, '');
    
    if (!input) {
        alert('Please enter ciphertext');
        return;
    }
    
    const dict = await loadDictionary();
    if (!dict) return;
    
    showProgress('beaufort-progress', true);
    updateProgress('beaufort-progress-bar', 0);
    
    const results = [];
    const words = Array.from(dict).filter(w => w.length >= 2 && w.length <= input.length);
    
    for (let i = 0; i < words.length; i++) {
        const key = words[i];
        const plaintext = beaufortDecrypt(input, key);
        
        if (dict.has(plaintext)) {
            results.push({ key, plaintext });
        }
        
        if (i % 1000 === 0) {
            updateProgress('beaufort-progress-bar', Math.round((i / words.length) * 100));
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    
    updateProgress('beaufort-progress-bar', 100);
    showProgress('beaufort-progress', false);
    
    let output = `<strong>Found ${results.length} possible solution(s):</strong><br><br>`;
    
    if (results.length === 0) {
        output += '<em>No valid words found.</em>';
    } else {
        results.forEach(r => {
            output += `<div class="result-item"><strong>Key:</strong> ${r.key} → <strong>Plaintext:</strong> ${r.plaintext}</div>`;
        });
    }
    
    showOutput('beaufort-output', output);
}

// ==================== HEXAHUE DECODER ====================
function runHexahue() {
    const input = document.getElementById('hexahue-input').value.trim().toLowerCase();
    
    if (!input) {
        alert('Please enter hexahue code');
        return;
    }
    
    const letters = {
        'prgybc': 'a', 'rpgybc': 'b', 'rgpybc': 'c', 'rgypbc': 'd', 'rgybpc': 'e',
        'rgybcp': 'f', 'grybcp': 'g', 'gyrbcp': 'h', 'gybrcp': 'i', 'gybcrp': 'j',
        'gybcpr': 'k', 'ygbcpr': 'l', 'ybgcpr': 'm', 'ybcgpr': 'n', 'ybcpgr': 'o',
        'ybcprg': 'p', 'bycprg': 'q', 'bcyprg': 'r', 'bcpyrg': 's', 'bcpryg': 't',
        'bcprgy': 'u', 'cbprgy': 'v', 'cpbrgy': 'w', 'cprbgy': 'x', 'cprgby': 'y',
        'cprgyb': 'z'
    };
    
    const symbols = {
        'bwwbbw': '.', 'wbbwwb': ',', 'wwwwww': ' ', 'kkkkkk': ' '
    };
    
    const numbers = {
        'bgwbgw': '0', 'gbwbgw': '1', 'gwbbgw': '2', 'gwbgbw': '3', 'gwbgwb': '4',
        'wgbgwb': '5', 'wbggwb': '6', 'wbgwgb': '7', 'wbgwbg': '8', 'bwgwbg': '9'
    };
    
    const complete = { ...letters, ...symbols, ...numbers };
    
    const codes = input.split(/\s+/);
    let result = '';
    let notFound = [];
    
    codes.forEach((code, i) => {
        if (complete[code]) {
            result += complete[code];
        } else {
            result += '?';
            notFound.push(`'${code}' (position ${i + 1})`);
        }
    });
    
    let output = `<strong>Decoded:</strong> ${result}<br><br>`;
    
    if (notFound.length > 0) {
        output += `<em>Unrecognized codes: ${notFound.join(', ')}</em>`;
    }
    
    showOutput('hexahue-output', output);
}

// ==================== IOC ANALYZER ====================
function calculateIoC(text) {
    text = text.toUpperCase().replace(/[^A-Z]/g, '');
    const n = text.length;
    if (n <= 1) return 0;
    
    const freq = {};
    for (let char of text) {
        freq[char] = (freq[char] || 0) + 1;
    }
    
    let sum = 0;
    for (let f of Object.values(freq)) {
        sum += f * (f - 1);
    }
    
    return sum / (n * (n - 1));
}

function calculateKappa(ciphertext, period) {
    ciphertext = ciphertext.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (period < 1) return 0;
    
    const cosets = Array(period).fill('');
    for (let i = 0; i < ciphertext.length; i++) {
        cosets[i % period] += ciphertext[i];
    }
    
    const iocs = cosets.filter(c => c.length > 1).map(c => calculateIoC(c));
    
    return iocs.length > 0 ? iocs.reduce((a, b) => a + b, 0) / iocs.length : 0;
}

function plotIoCAnalysis(results, expectedIoC, overallIoC, textLength) {
    const canvas = document.getElementById('ioc-canvas');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Settings
    const padding = { top: 40, right: 40, bottom: 60, left: 80 };
    const width = canvas.width - padding.left - padding.right;
    const height = canvas.height - padding.top - padding.bottom;
    
    // Find min/max values
    const maxPeriod = Math.max(...results.map(r => r.period));
    const maxKappa = Math.max(...results.map(r => r.kappa));
    const maxPhi = Math.max(...results.map(r => r.phi));
    const maxValue = Math.max(maxKappa, maxPhi, expectedIoC, overallIoC);
    const yMax = Math.min(maxValue * 1.2, 1.0);
    
    // Helper functions
    const scaleX = (period) => padding.left + (period / maxPeriod) * width;
    const scaleY = (value) => padding.top + height - (value / yMax) * height;
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 10; i++) {
        const y = padding.top + (height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + width, y);
        ctx.stroke();
        
        // Y-axis labels
        const value = (yMax * (10 - i) / 10).toFixed(3);
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(value, padding.left - 10, y + 4);
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
        const x = padding.left + (width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, padding.top + height);
        ctx.stroke();
        
        // X-axis labels
        const period = Math.round((maxPeriod / 10) * i);
        ctx.fillStyle = '#666';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(period, x, padding.top + height + 20);
    }
    
    // Draw axes
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + height);
    ctx.lineTo(padding.left + width, padding.top + height);
    ctx.stroke();
    
    // Draw expected IoC line
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const expectedY = scaleY(expectedIoC);
    ctx.beginPath();
    ctx.moveTo(padding.left, expectedY);
    ctx.lineTo(padding.left + width, expectedY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw overall IoC line
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const overallY = scaleY(overallIoC);
    ctx.beginPath();
    ctx.moveTo(padding.left, overallY);
    ctx.lineTo(padding.left + width, overallY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw Kappa line
    ctx.strokeStyle = '#ff8c00';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    results.forEach((r, i) => {
        const x = scaleX(r.period);
        const y = scaleY(r.kappa);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Draw Phi line
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    results.forEach((r, i) => {
        const x = scaleX(r.period);
        const y = scaleY(r.phi);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
    
    // Find and mark peaks
    const threshold = 0.055;
    ctx.fillStyle = '#ffc107';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    
    results.forEach((r, i) => {
        if (r.kappa > threshold && i > 0 && i < results.length - 1) {
            if (r.kappa > results[i-1].kappa && r.kappa > results[i+1].kappa) {
                const x = scaleX(r.period);
                const y = scaleY(r.kappa);
                
                // Draw yellow circle
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw label
                ctx.fillStyle = '#000';
                ctx.fillText(r.period.toString(), x, y - 12);
                ctx.fillStyle = '#ffc107';
            }
        }
    });
    
    // Draw legend
    const legendX = padding.left + width - 200;
    const legendY = padding.top + 10;
    
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    
    // Expected IoC
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 30, legendY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#000';
    ctx.fillText(`Expected (${expectedIoC.toFixed(5)})`, legendX + 35, legendY + 4);
    
    // Overall IoC
    ctx.strokeStyle = '#dc3545';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 20);
    ctx.lineTo(legendX + 30, legendY + 20);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#000';
    ctx.fillText(`Overall (${overallIoC.toFixed(5)})`, legendX + 35, legendY + 24);
    
    // Kappa
    ctx.strokeStyle = '#ff8c00';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 40);
    ctx.lineTo(legendX + 30, legendY + 40);
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.fillText('Kappa (avg IoC)', legendX + 35, legendY + 44);
    
    // Phi
    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 60);
    ctx.lineTo(legendX + 30, legendY + 60);
    ctx.stroke();
    ctx.fillStyle = '#000';
    ctx.fillText('Kullback (phi)', legendX + 35, legendY + 64);
    
    // Draw title
    ctx.fillStyle = '#000';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IoC Analysis - Key Length Detection', canvas.width / 2, 25);
    
    // Draw axis labels
    ctx.font = '14px sans-serif';
    ctx.fillText('Period Size', canvas.width / 2, canvas.height - 10);
    
    ctx.save();
    ctx.translate(15, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Index of Coincidence', 0, 0);
    ctx.restore();
}

function runIoC() {
    const input = document.getElementById('ioc-input').value;
    const maxPeriod = parseInt(document.getElementById('ioc-max-period').value);
    
    if (!input.trim()) {
        alert('Please enter ciphertext');
        return;
    }
    
    const ciphertext = input.toUpperCase().replace(/[^A-Z]/g, '');
    const expectedIoC = 0.06678;
    const overallIoC = calculateIoC(ciphertext);
    
    const results = [];
    for (let period = 1; period <= maxPeriod; period++) {
        const kappa = calculateKappa(ciphertext, period);
        const phi = Math.abs(kappa - expectedIoC);
        results.push({ period, kappa, phi });
    }
    
    // Show canvas
    document.getElementById('ioc-canvas-container').style.display = 'block';
    
    // Plot the graph
    plotIoCAnalysis(results, expectedIoC, overallIoC, ciphertext.length);
    
    // Find peaks
    const threshold = 0.055;
    const peaks = results.filter(r => r.kappa > threshold).sort((a, b) => b.kappa - a.kappa);
    
    let output = `<strong>Analysis Results:</strong><br><br>`;
    output += `Text length: ${ciphertext.length} characters<br>`;
    output += `Overall IoC: ${overallIoC.toFixed(5)}<br>`;
    output += `Expected IoC (English): ${expectedIoC.toFixed(5)}<br><br>`;
    
    output += `<strong>Likely Key Lengths:</strong><br>`;
    if (peaks.length === 0) {
        output += '<em>No clear peaks found. Text might be too short or not polyalphabetic.</em><br>';
    } else {
        peaks.slice(0, 10).forEach(r => {
            output += `<div class="result-item">Period ${r.period}: Kappa = ${r.kappa.toFixed(5)}</div>`;
        });
    }
    
    showOutput('ioc-output', output);
}

// ==================== WORD FINDER ====================
function parseQuickMode(input) {
    const bracketRegex = /\[([^\]]+)\]/g;
    const matches = [...input.matchAll(bracketRegex)];
    
    if (matches.length === 0) return null;
    
    const letterLists = [];
    matches.forEach(match => {
        const content = match[1].trim();
        if (content.includes(' ')) {
            letterLists.push(content.split(/\s+/).filter(s => s));
        } else {
            letterLists.push(content.split(''));
        }
    });
    
    return letterLists;
}

function* cartesianProduct(arrays) {
    if (arrays.length === 0) return;
    
    const indices = new Array(arrays.length).fill(0);
    const maxIndices = arrays.map(arr => arr.length - 1);
    
    while (true) {
        yield indices.map((idx, i) => arrays[i][idx]);
        
        let pos = arrays.length - 1;
        while (pos >= 0 && indices[pos] === maxIndices[pos]) {
            indices[pos] = 0;
            pos--;
        }
        
        if (pos < 0) break;
        indices[pos]++;
    }
}

async function runWordFinder() {
    const input = document.getElementById('word-finder-input').value.trim();
    
    if (!input) {
        alert('Please enter bracket notation');
        return;
    }
    
    const letterLists = parseQuickMode(input);
    if (!letterLists) {
        alert('No valid brackets found. Use format: [ABC][DEF][GHI]');
        return;
    }
    
    const dict = await loadDictionary();
    if (!dict) return;
    
    const minLength = letterLists.reduce((sum, opts) => sum + Math.min(...opts.map(o => o.length)), 0);
    const maxLength = letterLists.reduce((sum, opts) => sum + Math.max(...opts.map(o => o.length)), 0);
    const validWords = new Set([...dict].filter(w => w.length >= minLength && w.length <= maxLength));
    
    const totalCombinations = letterLists.reduce((prod, opts) => prod * opts.length, 1);
    
    showProgress('word-finder-progress', true);
    updateProgress('word-finder-progress-bar', 0);
    
    const foundWords = [];
    let checked = 0;
    
    for (let combo of cartesianProduct(letterLists)) {
        const word = combo.join('').toLowerCase();
        if (validWords.has(word)) {
            foundWords.push(word);
        }
        
        checked++;
        if (checked % 10000 === 0 || checked === totalCombinations) {
            updateProgress('word-finder-progress-bar', Math.round((checked / totalCombinations) * 100));
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    
    showProgress('word-finder-progress', false);
    
    let output = `<strong>Found ${foundWords.length} word(s) (${totalCombinations.toLocaleString()} combinations checked):</strong><br><br>`;
    
    if (foundWords.length === 0) {
        output += '<em>No valid words found. Try different letter combinations.</em>';
    } else {
        foundWords.sort().forEach(word => {
            const displayWord = dictionaryOriginal.has(word) ? dictionaryOriginal.get(word) : word;
            output += `<span style="display: inline-block; margin: 5px 10px 5px 0;">${displayWord}</span>`;
        });
    }
    
    showOutput('word-finder-output', output);
}

// ==================== KEYBOARD HEATMAP ====================
function runKeyboard() {
    const input = document.getElementById('keyboard-input').value.toUpperCase();
    const layout = document.getElementById('keyboard-layout').value;
    
    if (!input.trim()) {
        alert('Please enter text to analyze');
        return;
    }
    
    const layouts = {
        qwerty: 'QWERTYUIOP' + 'ASDFGHJKL ' + ' ZXCVBNM  ',
        azerty: 'AZERTYUIOP' + 'QSDFGHJKLM' + ' WXCVBN   ',
        qwertz: 'QWERTZUIOP' + 'ASDFGHJKL ' + ' YXCVBNM  ',
        dvorak: '   PYFGCRL' + 'AOEUIDHTNS' + ' QJKXBMWVZ'
    };
    
    const kb = layouts[layout];
    const freq = new Array(30).fill(0);
    
    for (let char of input) {
        const index = kb.indexOf(char);
        if (index !== -1 && char !== ' ') {
            freq[index]++;
        }
    }
    
    const maxFreq = Math.max(...freq);
    
    let output = '<div style="font-family: monospace; line-height: 2;">';
    output += `<strong>${layout.toUpperCase()} Keyboard Layout</strong><br><br>`;
    
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 10; col++) {
            const idx = row * 10 + col;
            const letter = kb[idx];
            const count = freq[idx];
            
            if (letter === ' ') {
                output += '   ';
            } else {
                const intensity = maxFreq > 0 ? Math.round((count / maxFreq) * 255) : 0;
                const color = `rgb(${255 - intensity}, ${255 - intensity}, 255)`;
                output += `<span style="background: ${color}; padding: 8px 12px; margin: 2px; display: inline-block; border: 1px solid #ccc; min-width: 30px; text-align: center;">${letter}<br><small>${count}</small></span>`;
            }
        }
        output += '<br>';
    }
    
    output += '<br><strong>Statistics:</strong><br>';
    output += `Total letters: ${freq.reduce((a, b) => a + b, 0)}<br>`;
    output += `Most frequent: ${kb[freq.indexOf(maxFreq)]} (${maxFreq} times)`;
    output += '</div>';
    
    showOutput('keyboard-output', output);
}

// ==================== PUNYCODE DECODER ====================
function runPunycode() {
    const input = document.getElementById('punycode-input').value.trim();
    
    if (!input) {
        alert('Please enter punycode');
        return;
    }
    
    try {
        // Simple punycode decoder (basic implementation)
        // For full implementation, would need a proper library
        const decoded = decodePunycode(input);
        showOutput('punycode-output', `<strong>Decoded:</strong><br>${decoded}`);
    } catch (e) {
        showOutput('punycode-output', `<strong>Error:</strong> ${e.message}<br><br><em>Note: This is a basic decoder. For complex punycode, use an external tool.</em>`);
    }
}

function decodePunycode(input) {
    // Basic punycode decoder
    // This is a simplified version - for production use a proper library
    const base = 36;
    const tmin = 1;
    const tmax = 26;
    const skew = 38;
    const damp = 700;
    const initialBias = 72;
    const initialN = 128;
    
    let n = initialN;
    let i = 0;
    let bias = initialBias;
    let output = [];
    
    const delimiterPos = input.lastIndexOf('-');
    if (delimiterPos > 0) {
        output = input.substring(0, delimiterPos).split('');
        input = input.substring(delimiterPos + 1);
    }
    
    let pos = 0;
    while (pos < input.length) {
        const oldi = i;
        let w = 1;
        for (let k = base; ; k += base) {
            if (pos >= input.length) break;
            
            const char = input[pos++];
            let digit;
            if (char >= '0' && char <= '9') {
                digit = char.charCodeAt(0) - 22;
            } else if (char >= 'a' && char <= 'z') {
                digit = char.charCodeAt(0) - 97;
            } else {
                throw new Error('Invalid punycode character');
            }
            
            i += digit * w;
            const t = k <= bias ? tmin : (k >= bias + tmax ? tmax : k - bias);
            if (digit < t) break;
            w *= base - t;
        }
        
        bias = adaptBias(i - oldi, output.length + 1, oldi === 0);
        n += Math.floor(i / (output.length + 1));
        i %= output.length + 1;
        output.splice(i++, 0, String.fromCodePoint(n));
    }
    
    return output.join('');
}

function adaptBias(delta, numPoints, firstTime) {
    const base = 36;
    const tmin = 1;
    const tmax = 26;
    const skew = 38;
    const damp = 700;
    
    delta = firstTime ? Math.floor(delta / damp) : delta >> 1;
    delta += Math.floor(delta / numPoints);
    
    let k = 0;
    while (delta > ((base - tmin) * tmax) >> 1) {
        delta = Math.floor(delta / (base - tmin));
        k += base;
    }
    
    return Math.floor(k + ((base - tmin + 1) * delta) / (delta + skew));
}

// Load dictionary on page load
loadDictionary();
