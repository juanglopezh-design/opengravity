const Author = require('./src/author');
const Editor = require('./src/editor');
const Distributor = require('./src/distributor');
const Marketer = require('./src/marketer');
const fs = require('fs');

async function runAutoPublisher() {
    console.log("=========================================");
    console.log("🚀 STARTING AUTOPUBLISHER 📖 (KDP Edition)");
    console.log("=========================================\n");

    const author = new Author();
    const editor = new Editor();
    const distributor = new Distributor();
    const marketer = new Marketer();

    const niche = "Salud mental y productividad para developers";

    try {
        // PASO 1: Generar el libro
        const rawContent = await author.generateNicheBook(niche);
        const pdfPath = './output/Codigo_Zen.pdf';
        const coverPath = './output/Codigo_Zen_Cover.jpg';

        // PASO 2: Maquetar y formatear a PDF
        await editor.formatBookToPDF(rawContent, pdfPath);
        
        // PASO 2.5: Generar Portada Autónoma
        await editor.generateCover("Mindfulness para Programadores", "Antigravity AI", coverPath);

        // PASO 3: Publicarlo en Amazon KDP
        // Ejecutamos TODO el ciclo completo sin pausas
        await distributor.uploadToKDP("Mindfulness para Programadores", pdfPath, coverPath);

        // PASO 4: Lanzar campaña de Marketing Orgánico
        const promo = await marketer.generateMarketingCampaign("Mindfulness para Programadores", rawContent);

        console.log("\n✅ ECOSISTEMA FINALIZADO: Libro, Plataforma y Ventas alineados.");

    } catch (error) {
        console.error("❌ Ocurrió un error catastrófico en la línea de montaje:", error);
    }
}

runAutoPublisher();
