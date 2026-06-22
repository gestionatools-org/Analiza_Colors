/**
 * PDF Exporter Module
 * Exports color palettes to a professionally formatted PDF
 */

import { ColorUtils } from './colorUtils.js';
import { LogoResizer } from './logoResizer.js';

export class PDFExporter {
    /**
     * Generate and download a PDF with the color palette
     * @param {object} data - Data object containing all color information
     */
    static async generatePDF(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Set default font to Helvetica (similar to Roboto)
        doc.setFont('helvetica');

        let yPosition = 20;

        // Title
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Paleta de Colores Corporativos', 105, yPosition, { align: 'center' });

        yPosition += 12;
        doc.setFontSize(18);
        doc.text(data.entityName, 105, yPosition, { align: 'center' });

        yPosition += 20; // Más espaciado

        // Add logo if exists
        if (data.logoDataURL) {
            try {
                const maxLogoWidth = 100;
                const maxLogoHeight = 32;
                const logoAspectRatio = data.logoWidth && data.logoHeight
                    ? data.logoWidth / data.logoHeight
                    : maxLogoWidth / maxLogoHeight;

                let imgWidth = maxLogoWidth;
                let imgHeight = imgWidth / logoAspectRatio;

                if (imgHeight > maxLogoHeight) {
                    imgHeight = maxLogoHeight;
                    imgWidth = imgHeight * logoAspectRatio;
                }

                const xPosition = (210 - imgWidth) / 2; // Center in A4 width
                doc.addImage(data.logoDataURL, 'PNG', xPosition, yPosition, imgWidth, imgHeight);

                if (data.logoPublicUrl) {
                    const urlY = yPosition + imgHeight + 8;
                    this.drawCenteredWrappedText(doc, data.logoPublicUrl, 105, urlY, 170);
                    yPosition = urlY + (this.getWrappedLineCount(doc, data.logoPublicUrl, 170) * 5) + 10;
                } else {
                    yPosition += imgHeight + 15; // Más espaciado
                }
            } catch (error) {
                console.error('Error adding logo to PDF:', error);
            }
        } else if (data.logoPublicUrl) {
            this.drawSectionTitle(doc, 'URL del Logo', 20, yPosition);
            yPosition += 12;
            yPosition = this.drawWrappedText(doc, data.logoPublicUrl, 20, yPosition, 170);
            yPosition += 12;
        }

        // Main Color Section
        this.drawSectionTitle(doc, 'Color Principal', 20, yPosition);
        yPosition += 12;

        this.drawColorBox(doc, data.mainColor, 20, yPosition);
        yPosition += 35; // Más espaciado entre secciones

        // Monochromatic Variations
        this.drawSectionTitle(doc, 'Variaciones Monocromáticas', 20, yPosition);
        yPosition += 12;

        this.drawColorRow(doc, data.monochromatic, 20, yPosition);
        yPosition += 35; // Más espaciado entre secciones

        // Saturation palette (moved here)
        if (data.saturation) {
            this.drawSectionTitle(doc, 'Saturación', 20, yPosition);
            yPosition += 12;

            this.drawColorRow(doc, data.saturation, 20, yPosition);
            yPosition += 35; // Más espaciado entre secciones
        }

        // Complementary Colors
        this.drawSectionTitle(doc, 'Complementarios/Secundarios', 20, yPosition);
        yPosition += 12;

        this.drawColorRow(doc, data.complementary, 20, yPosition);
        yPosition += 25;

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(128, 128, 128);
            doc.text(
                `Generado con Color Palette Generator - Página ${i} de ${pageCount}`,
                105,
                287,
                { align: 'center' }
            );
        }

        // Save the PDF
        const filename = `${data.entityName.replace(/\s+/g, '_')}_Paleta_Colores.pdf`;
        doc.save(filename);
    }

    /**
     * Draw a section title with gray underline
     * @param {jsPDF} doc - jsPDF instance
     * @param {string} title - Section title
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    static drawSectionTitle(doc, title, x, y) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(title, x, y);

        // Draw gray line below title (full width of content area)
        const lineY = y + 2;
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(20, lineY, 190, lineY); // From margin to margin
    }

    /**
     * Draw a single color box with info
     * @param {jsPDF} doc - jsPDF instance
     * @param {string} hex - Hex color
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    static drawColorBox(doc, hex, x, y) {
        const rgb = ColorUtils.hexToRgb(hex);

        // Draw color rectangle
        doc.setFillColor(rgb.r, rgb.g, rgb.b);
        doc.rect(x, y, 40, 15, 'F');

        // Draw border
        doc.setDrawColor(200, 200, 200);
        doc.rect(x, y, 40, 15, 'S');

        // Draw text info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(hex, x + 50, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.text(`RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`, x + 50, y + 12);
    }

    /**
     * Draw a row of colors
     * @param {jsPDF} doc - jsPDF instance
     * @param {array} colors - Array of hex colors
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    static drawColorRow(doc, colors, x, y) {
        const boxWidth = 30;
        const boxHeight = 15;
        const spacing = 5;

        colors.forEach((hex, index) => {
            const rgb = ColorUtils.hexToRgb(hex);
            const xPos = x + (index * (boxWidth + spacing));

            // Draw color rectangle
            doc.setFillColor(rgb.r, rgb.g, rgb.b);
            doc.rect(xPos, y, boxWidth, boxHeight, 'F');

            // Draw border
            doc.setDrawColor(200, 200, 200);
            doc.rect(xPos, y, boxWidth, boxHeight, 'S');

            // Draw hex text below
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(hex, xPos + boxWidth / 2, y + boxHeight + 5, { align: 'center' });

            // Draw RGB text below hex
            doc.setFontSize(6);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(`RGB(${rgb.r},${rgb.g},${rgb.b})`, xPos + boxWidth / 2, y + boxHeight + 9, { align: 'center' });
        });
    }

    /**
     * Draw wrapped text and return the next Y position
     * @param {jsPDF} doc - jsPDF instance
     * @param {string} text - Text content
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} maxWidth - Maximum text width
     * @returns {number} Next Y position
     */
    static drawWrappedText(doc, text, x, y, maxWidth) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);

        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);

        return y + (lines.length * 5);
    }

    /**
     * Draw centered wrapped text
     * @param {jsPDF} doc - jsPDF instance
     * @param {string} text - Text content
     * @param {number} centerX - Center X position
     * @param {number} y - Y position
     * @param {number} maxWidth - Maximum text width
     */
    static drawCenteredWrappedText(doc, text, centerX, y, maxWidth) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);

        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, centerX, y, { align: 'center' });
    }

    /**
     * Get wrapped line count for a text block
     * @param {jsPDF} doc - jsPDF instance
     * @param {string} text - Text content
     * @param {number} maxWidth - Maximum text width
     * @returns {number} Number of wrapped lines
     */
    static getWrappedLineCount(doc, text, maxWidth) {
        return doc.splitTextToSize(text, maxWidth).length;
    }

    /**
     * Prepare data for PDF export
     * @param {string} entityName - Name of the entity
     * @param {string} mainColor - Main hex color
     * @param {object} harmonies - Color harmonies object
     * @param {array} gradients - Gradient variations
     * @param {string} logoDataURL - Optional logo data URL
     * @returns {object} Prepared data object
     */
    static prepareData(
        entityName,
        mainColor,
        harmonies,
        gradients,
        logoPublicUrl = '',
        logoDataURL = null,
        logoDimensions = null
    ) {
        // Find the Saturación palette from gradients
        const saturationPalette = gradients.find(g => g.name === 'Saturación');

        return {
            entityName,
            mainColor,
            logoPublicUrl,
            logoDataURL,
            logoWidth: logoDimensions?.width || null,
            logoHeight: logoDimensions?.height || null,
            monochromatic: harmonies.monochromatic,
            saturation: saturationPalette ? saturationPalette.colors : null,
            complementary: harmonies.splitComplementary
        };
    }

    /**
     * Prompt user for entity name and generate PDF
     * @param {string} mainColor - Main hex color
     * @param {object} harmonies - Color harmonies object
     * @param {array} gradients - Gradient variations
     * @param {string} logoPublicUrl - Optional public logo URL
     * @param {File|null} logoFile - Optional original logo file
     * @param {HTMLCanvasElement} logoCanvas - Optional resized logo canvas fallback
     */
    static async exportWithPrompt(
        mainColor,
        harmonies,
        gradients,
        logoPublicUrl = '',
        logoFile = null,
        logoCanvas = null
    ) {
        // Prompt for entity name
        const entityName = prompt('Ingrese el nombre de la entidad:', 'Mi Empresa');

        if (!entityName) {
            return; // User cancelled
        }

        // Get logo data URL if canvas exists and has content
        let logoDataURL = null;
        let logoDimensions = null;

        if (logoFile) {
            try {
                const renderedLogo = await LogoResizer.generateDataUrl(logoFile);
                logoDataURL = renderedLogo.dataURL;
                logoDimensions = {
                    width: renderedLogo.width,
                    height: renderedLogo.height
                };
            } catch (error) {
                console.error('Error getting logo data:', error);
            }
        } else if (logoCanvas && logoCanvas.width > 0 && logoCanvas.height > 0) {
            try {
                logoDataURL = logoCanvas.toDataURL('image/png');
                logoDimensions = {
                    width: logoCanvas.width,
                    height: logoCanvas.height
                };
            } catch (error) {
                console.error('Error getting logo data:', error);
            }
        }

        // Prepare data
        const data = this.prepareData(
            entityName,
            mainColor,
            harmonies,
            gradients,
            logoPublicUrl,
            logoDataURL,
            logoDimensions
        );

        // Generate PDF
        await this.generatePDF(data);
    }
}
