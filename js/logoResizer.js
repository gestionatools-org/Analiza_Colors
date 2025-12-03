/**
 * Logo Resizer Module
 * Resizes logos to 214x70 px while maintaining aspect ratio
 */

export class LogoResizer {
    /**
     * Resize an image to fit within 214x70 px while maintaining aspect ratio
     * @param {File} file - Image file
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @returns {Promise<void>}
     */
    static async resizeLogoToCanvas(file, canvas) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    this.drawResizedLogo(img, canvas);
                    resolve();
                };
                img.onerror = reject;
                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Draw resized logo on canvas - EXACT 214x70 px output
     * Image is centered and scaled to fit without deforming
     * @param {HTMLImageElement} img - Source image
     * @param {HTMLCanvasElement} canvas - Target canvas
     */
    static drawResizedLogo(img, canvas) {
        const targetWidth = 214;
        const targetHeight = 70;

        // Canvas is ALWAYS 214x70
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');

        // Draw white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Calculate how to fit image within 214x70 without deforming
        const imgAspectRatio = img.width / img.height;
        const targetAspectRatio = targetWidth / targetHeight;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspectRatio > targetAspectRatio) {
            // Image is wider - fit by width
            drawWidth = targetWidth;
            drawHeight = targetWidth / imgAspectRatio;
            offsetX = 0;
            offsetY = (targetHeight - drawHeight) / 2; // Center vertically
        } else {
            // Image is taller - fit by height
            drawHeight = targetHeight;
            drawWidth = targetHeight * imgAspectRatio;
            offsetX = (targetWidth - drawWidth) / 2; // Center horizontally
            offsetY = 0;
        }

        // Draw image centered in canvas
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    /**
     * Download canvas as PNG
     * @param {HTMLCanvasElement} canvas - Canvas to download
     * @param {string} filename - Output filename
     */
    static downloadCanvas(canvas, filename = 'logo_214x70.png') {
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        }, 'image/png');
    }

    /**
     * Get canvas dimensions info
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @returns {object} Dimensions info
     */
    static getCanvasInfo(canvas) {
        return {
            width: canvas.width,
            height: canvas.height,
            aspectRatio: (canvas.width / canvas.height).toFixed(2)
        };
    }
}
