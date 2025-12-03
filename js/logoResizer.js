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
     * Draw resized logo on canvas maintaining aspect ratio
     * Target is 214x70 px, but one dimension may be larger to avoid deformation
     * @param {HTMLImageElement} img - Source image
     * @param {HTMLCanvasElement} canvas - Target canvas
     */
    static drawResizedLogo(img, canvas) {
        const targetWidth = 214;
        const targetHeight = 70;

        const imgAspectRatio = img.width / img.height;
        const targetAspectRatio = targetWidth / targetHeight; // 3.057

        let canvasWidth, canvasHeight;

        // Calculate dimensions to maintain aspect ratio
        if (imgAspectRatio > targetAspectRatio) {
            // Image is wider relative to target
            // Fix height to 70px, calculate width proportionally
            canvasHeight = targetHeight;
            canvasWidth = Math.round(canvasHeight * imgAspectRatio);
        } else {
            // Image is taller relative to target
            // Fix width to 214px, calculate height proportionally
            canvasWidth = targetWidth;
            canvasHeight = Math.round(canvasWidth / imgAspectRatio);
        }

        // Set canvas size
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Draw white background
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw image filling entire canvas
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
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
