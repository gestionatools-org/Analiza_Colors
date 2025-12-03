/**
 * Color Utilities Module
 * Handles color conversions and manipulations
 */

export class ColorUtils {
    /**
     * Convert HEX to RGB
     * @param {string} hex - Hex color code (with or without #)
     * @returns {object} RGB object {r, g, b}
     */
    static hexToRgb(hex) {
        hex = hex.replace('#', '');

        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return { r, g, b };
    }

    /**
     * Convert RGB to HEX
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {string} Hex color code
     */
    static rgbToHex(r, g, b) {
        const toHex = (n) => {
            const hex = Math.round(n).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
    }

    /**
     * Convert RGB to HSL
     * @param {number} r - Red (0-255)
     * @param {number} g - Green (0-255)
     * @param {number} b - Blue (0-255)
     * @returns {object} HSL object {h, s, l}
     */
    static rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    /**
     * Convert HSL to RGB
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {object} RGB object {r, g, b}
     */
    static hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    /**
     * Convert HEX to HSL
     * @param {string} hex - Hex color code
     * @returns {object} HSL object {h, s, l}
     */
    static hexToHsl(hex) {
        const { r, g, b } = this.hexToRgb(hex);
        return this.rgbToHsl(r, g, b);
    }

    /**
     * Convert HSL to HEX
     * @param {number} h - Hue (0-360)
     * @param {number} s - Saturation (0-100)
     * @param {number} l - Lightness (0-100)
     * @returns {string} Hex color code
     */
    static hslToHex(h, s, l) {
        const { r, g, b } = this.hslToRgb(h, s, l);
        return this.rgbToHex(r, g, b);
    }

    /**
     * Validate hex color
     * @param {string} hex - Hex color code
     * @returns {boolean} Is valid
     */
    static isValidHex(hex) {
        return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    /**
     * Normalize hex color (ensure # prefix and 6 digits)
     * @param {string} hex - Hex color code
     * @returns {string} Normalized hex
     */
    static normalizeHex(hex) {
        if (!hex.startsWith('#')) {
            hex = '#' + hex;
        }
        if (hex.length === 4) {
            hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
        }
        return hex.toUpperCase();
    }

    /**
     * Get contrasting text color (black or white) for a background
     * @param {string} hex - Background hex color
     * @returns {string} '#000000' or '#FFFFFF'
     */
    static getContrastColor(hex) {
        const { r, g, b } = this.hexToRgb(hex);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    /**
     * Lighten a color
     * @param {string} hex - Hex color code
     * @param {number} amount - Amount to lighten (0-100)
     * @returns {string} Lightened hex color
     */
    static lighten(hex, amount) {
        const hsl = this.hexToHsl(hex);
        hsl.l = Math.min(100, hsl.l + amount);
        return this.hslToHex(hsl.h, hsl.s, hsl.l);
    }

    /**
     * Darken a color
     * @param {string} hex - Hex color code
     * @param {number} amount - Amount to darken (0-100)
     * @returns {string} Darkened hex color
     */
    static darken(hex, amount) {
        const hsl = this.hexToHsl(hex);
        hsl.l = Math.max(0, hsl.l - amount);
        return this.hslToHex(hsl.h, hsl.s, hsl.l);
    }

    /**
     * Adjust saturation
     * @param {string} hex - Hex color code
     * @param {number} amount - Amount to adjust (-100 to 100)
     * @returns {string} Adjusted hex color
     */
    static adjustSaturation(hex, amount) {
        const hsl = this.hexToHsl(hex);
        hsl.s = Math.max(0, Math.min(100, hsl.s + amount));
        return this.hslToHex(hsl.h, hsl.s, hsl.l);
    }

    /**
     * Rotate hue
     * @param {string} hex - Hex color code
     * @param {number} degrees - Degrees to rotate (0-360)
     * @returns {string} Rotated hex color
     */
    static rotateHue(hex, degrees) {
        const hsl = this.hexToHsl(hex);
        hsl.h = (hsl.h + degrees) % 360;
        if (hsl.h < 0) hsl.h += 360;
        return this.hslToHex(hsl.h, hsl.s, hsl.l);
    }
}
