/**
 * Main Application Controller
 * Handles UI interactions and coordinates modules
 */

import { ColorUtils } from './colorUtils.js';
import { ColorHarmony } from './colorHarmony.js';
import { GradientGenerator } from './gradientGenerator.js';
import { ImageColorExtractor } from './imageColorExtractor.js';
import { LogoResizer } from './logoResizer.js';
import { PDFExporter } from './pdfExporter.js';

class ColorPaletteApp {
    constructor() {
        this.currentColor = '#FF5733';
        this.currentTab = 'hex';
        this.currentHarmonies = null;
        this.currentGradients = null;
        this.currentLogoFile = null;
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

        // Paste image button
        const pasteImageBtn = document.getElementById('paste-image-btn');
        pasteImageBtn.addEventListener('click', async () => {
            await this.handleImagePaste();
        });

        // Logo upload
        const logoInput = document.getElementById('logo-input');
        logoInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.handleLogoUpload(file);
            }
        });

        // Download logo button
        const downloadLogoBtn = document.getElementById('download-logo-btn');
        downloadLogoBtn.addEventListener('click', () => {
            const canvas = document.getElementById('logo-canvas');
            LogoResizer.downloadCanvas(canvas, 'logo_214x70.png');
            this.showNotification('Logo descargado correctamente');
        });

        // Generate button
        const generateBtn = document.getElementById('generate-btn');
        generateBtn.addEventListener('click', () => {
            this.generatePalette(this.currentColor);
        });

        // Export PDF button
        const exportPdfBtn = document.getElementById('export-pdf-btn');
        exportPdfBtn.addEventListener('click', async () => {
            const logoCanvas = document.getElementById('logo-canvas');
            await PDFExporter.exportWithPrompt(
                this.currentColor,
                this.currentHarmonies,
                this.currentGradients,
                this.currentLogoFile,
                logoCanvas.width > 0 ? logoCanvas : null
            );
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

    async handleImagePaste() {
        try {
            // Check if clipboard API is available
            if (!navigator.clipboard || !navigator.clipboard.read) {
                this.showNotification('Tu navegador no soporta pegar imágenes', 'error');
                return;
            }

            // Read from clipboard
            const clipboardItems = await navigator.clipboard.read();

            for (const clipboardItem of clipboardItems) {
                // Look for image types
                for (const type of clipboardItem.types) {
                    if (type.startsWith('image/')) {
                        const blob = await clipboardItem.getType(type);

                        // Convert blob to file
                        const file = new File([blob], 'pasted-image.png', { type: blob.type });

                        // Process the image
                        await this.handleImageUpload(file);
                        return;
                    }
                }
            }

            // No image found in clipboard
            this.showNotification('No hay imagen en el portapapeles', 'error');
        } catch (error) {
            console.error('Error pasting image:', error);
            if (error.name === 'NotAllowedError') {
                this.showNotification('Permiso denegado para acceder al portapapeles', 'error');
            } else {
                this.showNotification('Error al pegar imagen', 'error');
            }
        }
    }

    async handleLogoUpload(file) {
        const canvas = document.getElementById('logo-canvas');
        const container = document.getElementById('logo-preview-container');

        try {
            this.currentLogoFile = file;
            await LogoResizer.resizeLogoToCanvas(file, canvas);

            // Show preview container
            container.style.display = 'block';

            const info = LogoResizer.getCanvasInfo(canvas);
            this.showNotification(`Logo redimensionado: ${info.width}x${info.height}px`);
        } catch (error) {
            console.error('Error resizing logo:', error);
            this.showNotification('Error al procesar el logo', 'error');
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

        // Store harmonies for PDF export
        this.currentHarmonies = harmonies;

        // Update complementary colors
        this.renderColorGrid('complementary-colors', harmonies.splitComplementary, {
            editable: true,
            onEdit: (index, newColor) => {
                this.updateHarmonyColor('splitComplementary', index, newColor);
            }
        });

        // Update analogous colors
        this.renderColorGrid('analogous-colors', harmonies.analogous);

        // Update triadic colors
        this.renderColorGrid('triadic-colors', harmonies.triadic);

        // Update tetradic colors
        this.renderColorGrid('tetradic-colors', harmonies.tetradic);

        // Update monochromatic colors
        this.renderColorGrid('monochromatic-colors', harmonies.monochromatic);

        // Generate gradients
        const gradients = GradientGenerator.generateVariations(hex);
        this.currentGradients = gradients;
        this.renderGradients();

        // Show export PDF button
        document.getElementById('export-pdf-btn').style.display = 'block';
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

    renderColorGrid(containerId, colors, options = {}) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';

        colors.forEach((color, index) => {
            const card = this.createColorCard(color, options, index);
            container.appendChild(card);
        });
    }

    createColorCard(hex, options = {}, index = 0) {
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

        if (options.editable) {
            const actions = document.createElement('div');
            actions.className = 'color-card-actions';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'color-card-action-btn';
            copyBtn.type = 'button';
            copyBtn.textContent = 'Copiar';
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.copyToClipboard(hex);
            });

            const editBtn = document.createElement('button');
            editBtn.className = 'color-card-action-btn color-card-edit-btn';
            editBtn.type = 'button';
            editBtn.textContent = 'Editar';

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.className = 'color-card-input';
            colorInput.value = hex;

            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                colorInput.click();
            });

            colorInput.addEventListener('input', (e) => {
                options.onEdit?.(index, e.target.value.toUpperCase());
            });

            actions.appendChild(copyBtn);
            actions.appendChild(editBtn);
            card.appendChild(actions);
            card.appendChild(colorInput);
        } else {
            // Copy to clipboard on click
            card.addEventListener('click', () => {
                this.copyToClipboard(hex);
            });
        }

        return card;
    }

    updateHarmonyColor(harmonyKey, colorIndex, newColor) {
        if (!this.currentHarmonies?.[harmonyKey]?.[colorIndex]) {
            return;
        }

        this.currentHarmonies[harmonyKey][colorIndex] = newColor;
        this.renderColorGrid('complementary-colors', this.currentHarmonies[harmonyKey], {
            editable: true,
            onEdit: (index, updatedColor) => {
                this.updateHarmonyColor(harmonyKey, index, updatedColor);
            }
        });
        this.showNotification(`Color actualizado a ${newColor}`);
    }

    renderGradients() {
        const container = document.getElementById('gradients');
        container.innerHTML = '';

        const gradients = this.currentGradients || [];

        gradients.forEach((gradient, gradientIndex) => {
            const item = document.createElement('div');
            item.className = 'gradient-item';

            const label = document.createElement('div');
            label.className = 'gradient-label';
            label.textContent = gradient.name;

            const colorsContainer = document.createElement('div');
            colorsContainer.className = 'gradient-colors';

            // Render each of the 4 colors
            gradient.colors.forEach((color, colorIndex) => {
                const colorItem = document.createElement('div');
                colorItem.className = 'gradient-color-item';

                const swatch = document.createElement('div');
                swatch.className = 'gradient-color-swatch';
                swatch.style.backgroundColor = color;

                const hexLabel = document.createElement('div');
                hexLabel.className = 'gradient-color-hex';
                hexLabel.textContent = color;

                const actions = document.createElement('div');
                actions.className = 'gradient-color-actions';

                const copyBtn = document.createElement('button');
                copyBtn.className = 'gradient-action-btn';
                copyBtn.type = 'button';
                copyBtn.textContent = 'Copiar';
                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.copyToClipboard(color);
                });

                const editBtn = document.createElement('button');
                editBtn.className = 'gradient-action-btn gradient-edit-btn';
                editBtn.type = 'button';
                editBtn.textContent = 'Editar';

                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.className = 'gradient-color-input';
                colorInput.value = color;

                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    colorInput.click();
                });

                colorInput.addEventListener('input', (e) => {
                    this.updateGradientColor(gradientIndex, colorIndex, e.target.value.toUpperCase());
                });

                actions.appendChild(copyBtn);
                actions.appendChild(editBtn);

                colorItem.appendChild(swatch);
                colorItem.appendChild(hexLabel);
                colorItem.appendChild(actions);
                colorItem.appendChild(colorInput);
                colorsContainer.appendChild(colorItem);
            });

            item.appendChild(label);
            item.appendChild(colorsContainer);
            container.appendChild(item);
        });
    }

    updateGradientColor(gradientIndex, colorIndex, newColor) {
        if (!this.currentGradients?.[gradientIndex]?.colors?.[colorIndex]) {
            return;
        }

        this.currentGradients[gradientIndex].colors[colorIndex] = newColor;
        this.renderGradients();
        this.showNotification(`Color actualizado a ${newColor}`);
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
