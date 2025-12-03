/**
 * Image Color Extractor Module
 * Extracts dominant colors from images
 */

import { ColorUtils } from './colorUtils.js';

export class ImageColorExtractor {
    /**
     * Extract dominant color from an image file
     * @param {File} file - Image file
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @returns {Promise<string>} Dominant color hex
     */
    static async extractFromFile(file, canvas) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const color = this.extractFromImage(img, canvas);
                    resolve(color);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Extract dominant color from an image element
     * @param {HTMLImageElement} img - Image element
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @returns {string} Dominant color hex
     */
    static extractFromImage(img, canvas) {
        const ctx = canvas.getContext('2d');

        // Resize canvas to image dimensions (max 200x200 for performance)
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Extract colors using color quantization
        const colors = this.quantizeColors(data, 5);

        // Return the most dominant color
        return colors[0];
    }

    /**
     * Quantize colors from image data
     * @param {Uint8ClampedArray} data - Image pixel data
     * @param {number} colorCount - Number of colors to extract
     * @returns {array} Array of hex colors ordered by abundance (most abundant first)
     */
    static quantizeColors(data, colorCount = 5) {
        const colorMap = {};

        // Count all pixel color occurrences (with RGB binning for similar colors)
        // Using a bin size of 5 for better precision while still grouping similar colors
        for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];

            // Skip transparent pixels
            if (a < 128) continue;

            // Bin colors to group similar shades (bin size = 5 for better precision)
            const r = Math.round(data[i] / 5) * 5;
            const g = Math.round(data[i + 1] / 5) * 5;
            const b = Math.round(data[i + 2] / 5) * 5;

            const key = `${r},${g},${b}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
        }

        // Sort by frequency (most abundant first)
        const sortedColors = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, colorCount);

        // Convert to hex (returns array with most abundant color first)
        return sortedColors.map(([rgb, count]) => {
            const [r, g, b] = rgb.split(',').map(Number);
            return ColorUtils.rgbToHex(r, g, b);
        });
    }

    /**
     * Extract color palette from image (multiple dominant colors)
     * @param {File} file - Image file
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {number} colorCount - Number of colors to extract
     * @returns {Promise<array>} Array of hex colors
     */
    static async extractPalette(file, canvas, colorCount = 5) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const ctx = canvas.getContext('2d');

                    // Resize and draw
                    const maxSize = 200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    const imageData = ctx.getImageData(0, 0, width, height);
                    const colors = this.quantizeColors(imageData.data, colorCount);

                    resolve(colors);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Get average color from image
     * @param {HTMLImageElement} img - Image element
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @returns {string} Average color hex
     */
    static getAverageColor(img, canvas) {
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha < 128) continue; // Skip transparent pixels

            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        return ColorUtils.rgbToHex(r, g, b);
    }

    /**
     * K-means clustering for better color extraction
     * @param {Uint8ClampedArray} data - Image pixel data
     * @param {number} k - Number of clusters
     * @param {number} maxIterations - Maximum iterations
     * @returns {array} Array of hex colors
     */
    static kMeansClustering(data, k = 5, maxIterations = 10) {
        // Initialize random centroids
        const centroids = [];
        for (let i = 0; i < k; i++) {
            const randomIndex = Math.floor(Math.random() * (data.length / 4)) * 4;
            centroids.push([
                data[randomIndex],
                data[randomIndex + 1],
                data[randomIndex + 2]
            ]);
        }

        for (let iteration = 0; iteration < maxIterations; iteration++) {
            const clusters = Array(k).fill(0).map(() => []);

            // Assign pixels to nearest centroid
            for (let i = 0; i < data.length; i += 4) {
                const alpha = data[i + 3];
                if (alpha < 128) continue;

                const pixel = [data[i], data[i + 1], data[i + 2]];
                let minDist = Infinity;
                let clusterIndex = 0;

                for (let j = 0; j < k; j++) {
                    const dist = this.colorDistance(pixel, centroids[j]);
                    if (dist < minDist) {
                        minDist = dist;
                        clusterIndex = j;
                    }
                }

                clusters[clusterIndex].push(pixel);
            }

            // Update centroids
            for (let i = 0; i < k; i++) {
                if (clusters[i].length === 0) continue;

                const sum = clusters[i].reduce((acc, pixel) => {
                    return [acc[0] + pixel[0], acc[1] + pixel[1], acc[2] + pixel[2]];
                }, [0, 0, 0]);

                centroids[i] = [
                    Math.round(sum[0] / clusters[i].length),
                    Math.round(sum[1] / clusters[i].length),
                    Math.round(sum[2] / clusters[i].length)
                ];
            }
        }

        // Convert centroids to hex
        return centroids.map(([r, g, b]) => ColorUtils.rgbToHex(r, g, b));
    }

    /**
     * Calculate Euclidean distance between two colors
     * @param {array} color1 - RGB array
     * @param {array} color2 - RGB array
     * @returns {number} Distance
     */
    static colorDistance(color1, color2) {
        return Math.sqrt(
            Math.pow(color1[0] - color2[0], 2) +
            Math.pow(color1[1] - color2[1], 2) +
            Math.pow(color1[2] - color2[2], 2)
        );
    }
}
