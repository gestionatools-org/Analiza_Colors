/**
 * Main Application Controller
 * Handles UI interactions and coordinates modules
 */

import { ColorUtils } from './colorUtils.js';
import { ColorHarmony } from './colorHarmony.js';
import { GradientGenerator } from './gradientGenerator.js';
import { ImageColorExtractor } from './imageColorExtractor.js';

class ColorPaletteApp {
    constructor() {
        this.currentColor = '#FF5733';
        this.currentTab = 'hex';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generatePalette(this.currentColor);
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Hex input
        const hexInput = document.getElementById('hex-input');
        hexInput.addEventListener('input', (e) => {
            let value = e.target.value;
            if (!value.startsWith('#')) {
                value = '#' + value;
                e.target.value = value;
            }
            if (ColorUtils.isValidHex(value)) {
                this.currentColor = ColorUtils.normalizeHex(value);
                document.getElementById('color-picker').value = this.currentColor;
            }
        });

        hexInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && ColorUtils.isValidHex(e.target.value)) {
                this.generatePalette(this.currentColor);
            }
        });

        // Color picker
        const colorPicker = document.getElementById('color-picker');
        colorPicker.addEventListener('input', (e) => {
            this.currentColor = e.target.value.toUpperCase();
            hexInput.value = this.currentColor;
        });

        // RGB inputs
        const rInput = document.getElementById('r-input');
        const gInput = document.getElementById('g-input');
        const bInput = document.getElementById('b-input');

        const updateFromRgb = () => {
            const r = parseInt(rInput.value) || 0;
            const g = parseInt(gInput.value) || 0;
            const b = parseInt(bInput.value) || 0;

            if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
                this.currentColor = ColorUtils.rgbToHex(r, g, b);
                hexInput.value = this.currentColor;
                colorPicker.value = this.currentColor;
            }
        };

        [rInput, gInput, bInput].forEach(input => {
            input.addEventListener('input', updateFromRgb);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    updateFromRgb();
                    this.generatePalette(this.currentColor);
                }
            });
        });

        // Image upload
        const imageInput = document.getElementById('image-input');
        imageInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.handleImageUpload(file);
            }
        });

        // Generate button
        const generateBtn = document.getElementById('generate-btn');
        generateBtn.addEventListener('click', () => {
            this.generatePalette(this.currentColor);
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    async handleImageUpload(file) {
        const canvas = document.getElementById('image-canvas');
        try {
            const color = await ImageColorExtractor.extractFromFile(file, canvas);
            this.currentColor = color;

            // Update inputs
            document.getElementById('hex-input').value = color;
            document.getElementById('color-picker').value = color;

            const rgb = ColorUtils.hexToRgb(color);
            document.getElementById('r-input').value = rgb.r;
            document.getElementById('g-input').value = rgb.g;
            document.getElementById('b-input').value = rgb.b;

            this.generatePalette(color);
            this.showNotification(`Color más abundante: ${color}`);
        } catch (error) {
            console.error('Error extracting color from image:', error);
            this.showNotification('Error al procesar la imagen', 'error');
        }
    }

    generatePalette(hex) {
        if (!ColorUtils.isValidHex(hex)) {
            this.showNotification('Color hexadecimal no válido', 'error');
            return;
        }

        hex = ColorUtils.normalizeHex(hex);
        this.currentColor = hex;

        // Update base color display
        this.updateBaseColor(hex);

        // Generate harmonies
        const harmonies = ColorHarmony.all(hex);

        // Update complementary colors
        this.renderColorGrid('complementary-colors', ColorHarmony.splitComplementary(hex));

        // Update analogous colors
        this.renderColorGrid('analogous-colors', harmonies.analogous);

        // Update triadic colors
        this.renderColorGrid('triadic-colors', harmonies.triadic);

        // Update tetradic colors
        this.renderColorGrid('tetradic-colors', harmonies.tetradic);

        // Update monochromatic colors
        this.renderColorGrid('monochromatic-colors', harmonies.monochromatic);

        // Generate gradients
        this.renderGradients(hex);
    }

    updateBaseColor(hex) {
        const baseColorDiv = document.getElementById('base-color');
        const preview = baseColorDiv.querySelector('.color-preview');
        const hexValue = baseColorDiv.querySelector('.hex-value');
        const rgbValue = baseColorDiv.querySelector('.rgb-value');

        preview.style.backgroundColor = hex;

        const rgb = ColorUtils.hexToRgb(hex);
        hexValue.textContent = hex;
        rgbValue.textContent = `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    renderColorGrid(containerId, colors) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        colors.forEach(color => {
            const card = this.createColorCard(color);
            container.appendChild(card);
        });
    }

    createColorCard(hex) {
        const card = document.createElement('div');
        card.className = 'color-card';

        const swatch = document.createElement('div');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = hex;

        const details = document.createElement('div');
        details.className = 'color-details';

        const hexSpan = document.createElement('span');
        hexSpan.className = 'color-hex';
        hexSpan.textContent = hex;

        const rgb = ColorUtils.hexToRgb(hex);
        const rgbSpan = document.createElement('span');
        rgbSpan.className = 'color-rgb';
        rgbSpan.textContent = `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        details.appendChild(hexSpan);
        details.appendChild(rgbSpan);

        card.appendChild(swatch);
        card.appendChild(details);

        // Copy to clipboard on click
        card.addEventListener('click', () => {
            this.copyToClipboard(hex);
        });

        return card;
    }

    renderGradients(hex) {
        const container = document.getElementById('gradients');
        container.innerHTML = '';

        const gradients = GradientGenerator.generateVariations(hex);

        gradients.forEach(gradient => {
            const item = document.createElement('div');
            item.className = 'gradient-item';
            item.style.background = gradient.css;

            const label = document.createElement('div');
            label.className = 'gradient-label';
            label.textContent = gradient.name;

            item.appendChild(label);

            // Copy gradient CSS on click
            item.addEventListener('click', () => {
                this.copyToClipboard(gradient.css, 'Gradiente CSS copiado');
            });

            container.appendChild(item);
        });
    }

    copyToClipboard(text, message = 'Color copiado al portapapeles') {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification(message);
        }).catch(err => {
            console.error('Error copying to clipboard:', err);
        });
    }

    showNotification(message, type = 'success') {
        // Remove existing notification
        const existing = document.querySelector('.copy-notification');
        if (existing) {
            existing.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = message;

        if (type === 'error') {
            notification.style.background = '#FF6584';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ColorPaletteApp();
});
