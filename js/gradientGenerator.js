/**
 * Gradient Generator Module
 * Creates various gradient combinations
 */

import { ColorUtils } from './colorUtils.js';

export class GradientGenerator {
    /**
     * Interpolate between two colors
     * @param {string} color1 - Starting hex color
     * @param {string} color2 - Ending hex color
     * @param {number} steps - Number of steps
     * @returns {array} Array of interpolated colors
     */
    static interpolate(color1, color2, steps = 10) {
        const rgb1 = ColorUtils.hexToRgb(color1);
        const rgb2 = ColorUtils.hexToRgb(color2);
        const colors = [];

        for (let i = 0; i <= steps; i++) {
            const ratio = i / steps;
            const r = Math.round(rgb1.r + (rgb2.r - rgb1.r) * ratio);
            const g = Math.round(rgb1.g + (rgb2.g - rgb1.g) * ratio);
            const b = Math.round(rgb1.b + (rgb2.b - rgb1.b) * ratio);
            colors.push(ColorUtils.rgbToHex(r, g, b));
        }

        return colors;
    }

    /**
     * Generate linear gradient CSS
     * @param {string} color1 - Starting hex color
     * @param {string} color2 - Ending hex color
     * @param {number} angle - Gradient angle in degrees
     * @returns {string} CSS gradient string
     */
    static linear(color1, color2, angle = 90) {
        return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    }

    /**
     * Generate radial gradient CSS
     * @param {string} color1 - Center hex color
     * @param {string} color2 - Edge hex color
     * @returns {string} CSS gradient string
     */
    static radial(color1, color2) {
        return `radial-gradient(circle, ${color1}, ${color2})`;
    }

    /**
     * Generate multi-stop gradient
     * @param {array} colors - Array of hex colors
     * @param {number} angle - Gradient angle
     * @returns {string} CSS gradient string
     */
    static multiStop(colors, angle = 90) {
        return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
    }

    /**
     * Generate gradient variations for a base color
     * @param {string} hex - Base hex color
     * @returns {array} Array of gradient objects
     */
    static generateVariations(hex) {
        const hsl = ColorUtils.hexToHsl(hex);

        // Complementary gradient
        const complement = ColorUtils.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l);

        // Analogous colors
        const analogous1 = ColorUtils.hslToHex((hsl.h - 30) % 360, hsl.s, hsl.l);
        const analogous2 = ColorUtils.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l);

        // Light and dark versions
        const lighter = ColorUtils.lighten(hex, 20);
        const darker = ColorUtils.darken(hex, 20);

        // Triadic colors
        const triadic1 = ColorUtils.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l);
        const triadic2 = ColorUtils.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l);

        // Additional colors for variations
        const color60 = ColorUtils.hslToHex((hsl.h + 60) % 360, hsl.s, hsl.l);
        const color120 = ColorUtils.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l);
        const satLow = ColorUtils.adjustSaturation(hex, -30);
        const satHigh = ColorUtils.adjustSaturation(hex, 30);

        return [
            {
                name: 'Complementario',
                colors: [hex, complement, lighter, darker]
            },
            {
                name: 'Análogo',
                colors: [analogous1, hex, analogous2, lighter]
            },
            {
                name: 'Triádico',
                colors: [hex, triadic1, triadic2, lighter]
            },
            {
                name: 'Claro a Oscuro',
                colors: [lighter, hex, darker, ColorUtils.darken(hex, 40)]
            },
            {
                name: 'Arcoíris',
                colors: [hex, color60, color120, complement]
            },
            {
                name: 'Saturación',
                colors: [satLow, hex, satHigh, lighter]
            },
            {
                name: 'Monocromático',
                colors: [
                    ColorUtils.lighten(hex, 30),
                    ColorUtils.lighten(hex, 15),
                    ColorUtils.darken(hex, 15),
                    ColorUtils.darken(hex, 30)
                ]
            },
            {
                name: 'Tetrádico',
                colors: [
                    hex,
                    ColorUtils.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
                    complement,
                    ColorUtils.hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l)
                ]
            }
        ];
    }

    /**
     * Generate CSS gradient from multiple colors
     * @param {array} colors - Array of hex colors
     * @param {string} type - 'linear' or 'radial'
     * @param {number} angle - Angle for linear gradients
     * @returns {string} CSS gradient string
     */
    static create(colors, type = 'linear', angle = 90) {
        if (colors.length < 2) {
            throw new Error('At least 2 colors are required for a gradient');
        }

        if (type === 'radial') {
            return `radial-gradient(circle, ${colors.join(', ')})`;
        }

        return `linear-gradient(${angle}deg, ${colors.join(', ')})`;
    }

    /**
     * Generate gradient with custom color stops
     * @param {array} colorStops - Array of {color, position} objects
     * @param {string} type - 'linear' or 'radial'
     * @param {number} angle - Angle for linear gradients
     * @returns {string} CSS gradient string
     */
    static createWithStops(colorStops, type = 'linear', angle = 90) {
        const stops = colorStops.map(stop => {
            return `${stop.color} ${stop.position}%`;
        }).join(', ');

        if (type === 'radial') {
            return `radial-gradient(circle, ${stops})`;
        }

        return `linear-gradient(${angle}deg, ${stops})`;
    }
}
