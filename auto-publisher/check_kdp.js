const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const path = require('path');

(async () => {
    console.log("🕵️ Iniciando escaneo de la estantería de KDP...");
    
    const browser = await puppeteer.launch({
        headless: "new",
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        userDataDir: path.join(__dirname, 'kdp-profile'),
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const page = await browser.newPage();
    
    try {
        console.log("-> 🌐 Navegando a Amazon KDP...");
        await page.goto("https://kdp.amazon.com/es_ES/bookshelf", { waitUntil: 'networkidle2', timeout: 60000 });
        
        console.log("-> 🔍 Buscando datos de libros...");
        
        // Esperemos un poco para que cargue react
        await new Promise(r => setTimeout(r, 5000));
        
        // Amazon KDP carga la biblioteca en una tabla o lista
        const books = await page.evaluate(() => {
            const results = [];
            // Normalmente los titulos están en h3, h4 o divs con clases específicas, trataremos de buscar "span" o "div" con clases de título
            // Este selector buscará filas en el contenedor principal de Kindle
            const rows = document.querySelectorAll('.bookshelf-row, .a-row.a-spacing-small, div[data-test-id="book-title"], .a-size-medium');
            
            for(let row of rows) {
                if(row.innerText && row.innerText.trim() !== '') {
                    results.push(row.innerText.trim());
                }
            }
            return results;
        });
        
        if (books.length > 0) {
            console.log("\n===== 📚 LIBROS ENCONTRADOS =====");
            books.slice(0, 15).forEach(b => {
                // Filtramos un poco para que no imprima basuras de UI
                if(b.length > 3 && !b.includes('Bookshelf') && !b.includes('Condiciones')) {
                    console.log(`- ${b}`);
                }
            });
            console.log("=================================\n");
        } else {
            console.log("\n⚠️ No se pudieron extraer títulos textualmente o la sesión expiró.");
            
            // Tomemos un pantallazo por si las dudas
            await page.screenshot({ path: "bookshelf_debug.png", fullPage: true });
            console.log("-> 📸 Captura de pantalla guardada en bookshelf_debug.png");
        }
        
    } catch(err) {
        console.log("Error:", err.message);
    } finally {
        await browser.close();
    }
})();
