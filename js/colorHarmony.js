/**
 * Color Harmony Module
 * Generates color harmonies based on color theory
 */

import { ColorUtils } from './colorUtils.js';

export class ColorHarmony {
    /**
     * Generate complementary color (opposite on color wheel)
     * @param {string} hex - Base hex color
     * @returns {array} Array with base color and complementary color
     */
    static complementary(hex) {
        const hsl = ColorUtils.hexToHsl(hex);
        const complement = ColorUtils.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);
        return [hex, complement];
    }

    /**
     * Generate split-complementary colors
     * @param {string} hex - Base hex color
     * @returns {array} Array with base color and two split-complementary colors
     */
    static splitComplementary(hex) {
        const hsl = ColorUtils.hexToHsl(hex);
        const color1 = ColorUtils.hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l);
        const color2 = ColorUtils.hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l);
        return [hex, color1, color2];
    }

    /**
     * Generate analogous colors (adjacent on color wheel)
     * @param {string} hex - Base hex color
     * @returns {array} Array with 5 analogous colors
     */
    static analogous(hex) {
        const hsl = ColorUtils.hexToHsl(hex);
        return [
            ColorUtils.hslToHex((hsl.h - 60) % 360, hsl.s, hsl.l),
            ColorUtils.hslToHex((hsl.h - 30) % 360, hsl.s, hsl.l),
            hex,
            ColorUtils.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
            ColorUtils.hslToHex((hsl.h + 60) % 360, hsl.s, hsl.l)
        ];
    }

    /**
     * Generate triadic colors (evenly spaced on color wheel)
     * @param {string} hex - Base hex color
     * @returns {array} Array with 3 triadic colors
     */
    static triadic(hex) {
        const hsl = ColorUtils.hexToHsl(hex);
        return [
            hex,
            ColorUtils.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
            ColorUtils.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
        ];
    }

    /**
     * Generate tetradic (rectangle) colors
     * @param {string} hex - Base hex color
     * @returns {array} Array with 4 tetradic colors
     */
    static tetradic(hex) {
        const hsl = ColorUtils.hexToHsl(hex);
        return [
            hex,
            ColorUtils.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
            ColorUtils.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
            ColorUtils.hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l)
        ];
    }

    /**
     * Generate square colors (special case of tetradic)
     * @param {string} hex - Base hex color
     * @returns {array} Array with 4 square colors
     */
    static square(hex) {
        return this.tetradic(hex);
    }

    /**
     * Generate monochromatic colors (same hue, different lightness/saturation)
     * @param {string} hex - Base hex color
     * @returns {array} Array with 5 monochromatic variations
     */
    static monochromatic(hex) {
        const hsl = ColorUtils.hexToHsl(hex);
        return [
            ColorUtils.hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 30)),
            ColorUtils.hslToHex(hsl.h, hsl.s, Math.max(20, hsl.l - 15)),
            hex,
            ColorUtils.hslToHex(hsl.h, hsl.s, Math.min(80, hsl.l + 15)),
            ColorUtils.hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 30))
        ];
    }

    /**
     * Generate shades (darker variations)
     * @param {string} hex - Base hex color
     * @param {number} count - Number of shades to generate
     * @returns {array} Array with shade variations
     */
    static shades(hex, count = 5) {
        const colors = [];
        const step = 100 / (count + 1);

        for (let i = 0; i < count; i++) {
            colors.push(ColorUtils.darken(hex, step * (i + 1)));
        }

        return colors;
    }

    /**
     * Generate tints (lighter variations)
     * @param {string} hex - Base hex color
     * @param {number} count - Number of tints to generate
     * @returns {array} Array with tint variations
     */
    static tints(hex, count = 5) {
        const colors = [];
        const step = 100 / (count + 1);

        for (let i = 0; i < count; i++) {
            colors.push(ColorUtils.lighten(hex, step * (i + 1)));
        }

        return colors;
    }

    /**
     * Generate tones (variations with gray)
     * @param {string} hex - Base hex color
     * @param {number} count - Number of tones to generate
     * @returns {array} Array with tone variations
     */
    static tones(hex, count = 5) {
        const colors = [];
        const step = 100 / (count + 1);

        for (let i = 0; i < count; i++) {
            colors.push(ColorUtils.adjustSaturation(hex, -(step * (i + 1))));
        }

        return colors;
    }

    /**
     * Generate all harmonies for a color
     * @param {string} hex - Base hex color
     * @returns {object} Object containing all harmony types
     */
    static all(hex) {
        return {
            complementary: this.complementary(hex),
            splitComplementary: this.splitComplementary(hex),
            analogous: this.analogous(hex),
            triadic: this.triadic(hex),
            tetradic: this.tetradic(hex),
            monochromatic: this.monochromatic(hex),
            shades: this.shades(hex),
            tints: this.tints(hex),
            tones: this.tones(hex)
        };
    }
}
