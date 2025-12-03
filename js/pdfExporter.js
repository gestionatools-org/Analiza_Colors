/**
 * PDF Exporter Module
 * Exports color palettes to a professionally formatted PDF
 */

import { ColorUtils } from './colorUtils.js';

export class PDFExporter {
    /**
     * Generate and download a PDF with the color palette
     * @param {object} data - Data object containing all color information
     */
    static async generatePDF(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let yPosition = 20;

        // Title
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text('Paleta de Colores Corporativos', 105, yPosition, { align: 'center' });

        yPosition += 10;
        doc.setFontSize(18);
        doc.text(data.entityName, 105, yPosition, { align: 'center' });

        yPosition += 15;

        // Add logo if exists
        if (data.logoDataURL) {
            try {
                const imgWidth = 60;
                const imgHeight = 20;
                const xPosition = (210 - imgWidth) / 2; // Center in A4 width
                doc.addImage(data.logoDataURL, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
                yPosition += imgHeight + 10;
            } catch (error) {
                console.error('Error adding logo to PDF:', error);
            }
        }

        // Main Color Section
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Color Principal', 20, yPosition);
        yPosition += 10;

        this.drawColorBox(doc, data.mainColor, 20, yPosition);
        yPosition += 25;

        // Monochromatic Variations
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Variaciones Monocromáticas', 20, yPosition);
        yPosition += 10;

        this.drawColorRow(doc, data.monochromatic, 20, yPosition);
        yPosition += 25;

        // Complementary Colors
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Colores Complementarios', 20, yPosition);
        yPosition += 10;

        this.drawColorRow(doc, data.complementary, 20, yPosition);
        yPosition += 25;

        // Check if we need a new page
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        // Color Palettes
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Paletas de Colores', 20, yPosition);
        yPosition += 10;

        // Draw each palette
        for (const palette of data.palettes) {
            if (yPosition > 240) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(palette.name, 20, yPosition);
            yPosition += 8;

            this.drawColorRow(doc, palette.colors, 20, yPosition);
            yPosition += 25;
        }

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
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
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(hex, x + 50, y + 5);

        doc.setFont(undefined, 'normal');
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
            doc.setFont(undefined, 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(hex, xPos + boxWidth / 2, y + boxHeight + 5, { align: 'center' });
        });
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
    static prepareData(entityName, mainColor, harmonies, gradients, logoDataURL = null) {
        return {
            entityName,
            mainColor,
            logoDataURL,
            monochromatic: harmonies.monochromatic,
            complementary: harmonies.splitComplementary,
            palettes: gradients.map(g => ({
                name: g.name,
                colors: g.colors
            }))
        };
    }

    /**
     * Prompt user for entity name and generate PDF
     * @param {string} mainColor - Main hex color
     * @param {object} harmonies - Color harmonies object
     * @param {array} gradients - Gradient variations
     * @param {HTMLCanvasElement} logoCanvas - Optional logo canvas
     */
    static async exportWithPrompt(mainColor, harmonies, gradients, logoCanvas = null) {
        // Prompt for entity name
        const entityName = prompt('Ingrese el nombre de la entidad:', 'Mi Empresa');

        if (!entityName) {
            return; // User cancelled
        }

        // Get logo data URL if canvas exists and has content
        let logoDataURL = null;
        if (logoCanvas && logoCanvas.width > 0 && logoCanvas.height > 0) {
            try {
                logoDataURL = logoCanvas.toDataURL('image/png');
            } catch (error) {
                console.error('Error getting logo data:', error);
            }
        }

        // Prepare data
        const data = this.prepareData(entityName, mainColor, harmonies, gradients, logoDataURL);

        // Generate PDF
        await this.generatePDF(data);
    }
}
