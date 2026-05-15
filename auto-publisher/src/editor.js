const MarkdownIt = require('markdown-it');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

class Editor {
    constructor() {
        this.md = new MarkdownIt();
        console.log("📐 Módulo Editor iniciado.");
    }

    async formatBookToPDF(markdownContent, outputPath) {
        console.log(`\n📝 Dando formato y convirtiendo a PDF en: ${outputPath}...`);
        const htmlContent = this.md.render(markdownContent);
        
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Libro Auto-Generado</title>
            <style>
                body {
                    font-family: 'Georgia', serif;
                    line-height: 2.5;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px;
                }
                h1 { text-align: center; font-size: 3.5em; margin-bottom: 2em; padding-top: 4em; page-break-after: always; page-break-before: always;}
                h2 { color: #2c3e50; border-bottom: 4px solid #ecf0f1; padding-bottom: 1em; margin-top: 3em; font-size: 2.5em; }
                h3 { font-size: 2em; margin-top: 2em; }
                p { font-size: 1.8em; text-align: justify; margin-bottom: 2em; }
                blockquote { font-size: 2em; font-style: italic; border-left: 5px solid #ccc; padding-left: 20px; page-break-after: always; }
            </style>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>`;

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
        
        // Crear carpeta si no existe
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        await page.pdf({
            path: outputPath,
            format: 'A4',
            margin: { top: '3cm', right: '2cm', bottom: '3cm', left: '2cm' },
            printBackground: true
        });

        await browser.close();
        console.log("✅ PDF Generado con calidad de imprenta.");
    }

    async generateCover(title, author, outputPath) {
        console.log(`\n🎨 Diseñando portada tipográfica para: "${title}"...`);
        
        const htmlTemplate = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    margin: 0; padding: 0;
                    width: 1600px; height: 2560px; /* Tamaño oficial Kindle Cover Premium */
                    background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
                    color: white;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    text-align: center;
                }
                .title { font-size: 150px; font-weight: bold; margin-bottom: 50px; text-transform: uppercase; letter-spacing: 5px; padding: 0 100px; line-height: 1.2; text-shadow: 4px 4px 10px rgba(0,0,0,0.5); }
                .subtitle { font-size: 60px; color: #e94560; font-style: italic; margin-bottom: 300px; }
                .author { font-size: 80px; font-weight: 300; letter-spacing: 15px; border-top: 4px solid #e94560; padding-top: 40px; }
            </style>
        </head>
        <body>
            <div class="title">${title}</div>
            <div class="subtitle">Una guía definitiva</div>
            <div class="author">${author}</div>
        </body>
        </html>`;

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        await page.setViewport({ width: 1600, height: 2560 });
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });
        
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)){ fs.mkdirSync(dir, { recursive: true }); }

        await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90 });
        await browser.close();
        
        console.log("✅ Portada JPG generada exitosamente.");
    }
}

module.exports = Editor;
