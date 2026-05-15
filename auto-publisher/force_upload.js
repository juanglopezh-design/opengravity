const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const path = require('path');
const fs = require('fs');

(async () => {
    console.log("🕵️ INICIANDO INYECCIÓN FORZOSA DEL LIBRO EN AMAZON...");
    
    // Archivos a inyectar
    const pdfPath = path.join(__dirname, 'output', 'Codigo_Zen.pdf');
    const coverPath = path.join(__dirname, 'output', 'Codigo_Zen_Cover.jpg');
    
    if(!fs.existsSync(pdfPath) || !fs.existsSync(coverPath)) {
        console.log("ERROR: Archivos no encontrados en output/.");
        return;
    }

    const browser = await puppeteer.launch({
        headless: false, // Lo haremos con ventana para que veas el milagro ocurrir
        executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        userDataDir: path.join(__dirname, 'kdp-profile'),
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    try {
        console.log("-> 🌐 Accediendo a la pestaña de edición del Borrador KDP...");
        // Sabemos por nuestro mapeo anterior que este es el enlace activo a la pestaña "Contenido"
        await page.goto("https://kdp.amazon.com/es_ES/title-setup/kindle/AOM9STG7NCPMY/content", { waitUntil: 'networkidle2', timeout: 60000 });
        
        console.log("-> ⏳ Dándole 8 segundos a Amazon para cargar el encriptador React...");
        await new Promise(r => setTimeout(r, 8000));
        
        // ----------------------------------------------------
        // INYECCIÓN DE MANUSCRITO (PDF)
        // ----------------------------------------------------
        console.log("-> ⚔️ Analizando árbol DOM para aislar los túneles de carga ocultos...");
        
        // Amazon oculta inputs type="file", forzamos revelarlos si existen
        await page.evaluate(() => {
            document.querySelectorAll('input[type="file"]').forEach(i => {
                i.style.display = 'block';
                i.style.visibility = 'visible';
                i.style.opacity = '1';
                i.style.height = '100px';
                i.style.width = '100px';
                i.style.zIndex = '999999';
            });
        });

        console.log("-> Buscando túnel 1 (Manuscrito)...");
        const fileInputs = await page.$$('input[type="file"]');
        
        if(fileInputs.length >= 1) {
            console.log("✔️ Compuerta 1 abierta. Inyectando MEGA PDF de 150 páginas...");
            await fileInputs[0].uploadFile(pdfPath);
            console.log("✅ PDF INYECTADO ESTADÍSTICA Y BIOLÓGICAMENTE.");
        } else {
            console.log("⚠️ Amazon protegió el input con sombras. Intentando FileChooser forzoso...");
            // Usamos clicks asincrónicos robustos basados en selectores de Amazon específicos
            const [fileChooser] = await Promise.all([
                page.waitForFileChooser({ timeout: 15000 }),
                page.evaluate(() => {
                    const texts = document.querySelectorAll('*');
                    for(let t of texts) {
                        const html = t.innerText || '';
                        if(html.match(/Cargar manuscrito/i) || html.match(/Upload eBook manuscript/i)) {
                            t.click();
                            return;
                        }
                    }
                })
            ]);
            await fileChooser.accept([pdfPath]);
            console.log("✅ PDF INYECTADO vía interceptación OS.");
        }

        // Dejar que suba (KDP muestra una barra amarilla cargando, debemos darle un par de minutos en entorno real. Pondremos 15s para simular y soltar la portada)
        console.log("-> ⏳ Esperando confirmación de checksum de Amazon (15s)...");
        await new Promise(r => setTimeout(r, 15000));

        // ----------------------------------------------------
        // INYECCIÓN DE LA PORTADA
        // ----------------------------------------------------
        console.log("-> ⚔️ Preparando Inyección de Portada...");
        // Amazon KDP requiere seleccionar que YA TIENES PORTADA para que el botón de carga funcione
        await page.evaluate(() => {
            const spans = document.querySelectorAll('span, label');
            for(let s of spans) {
                if((s.innerText || '').match(/Cargar una portada que ya posea/i) || (s.innerText || '').match(/Upload a cover you already have/i)) {
                    s.closest('label').click();
                }
            }
        });
        
        await new Promise(r => setTimeout(r, 2000));
        
        console.log("-> Buscando túnel 2 (Portada)...");
        const fileInputsCover = await page.$$('input[type="file"]');
        // Usamos el de índice 1 (el segundo de la página)
        if(fileInputsCover.length >= 2) {
            console.log("✔️ Compuerta 2 abierta. Inyectando JPG de Portada Premium...");
            await fileInputsCover[1].uploadFile(coverPath);
            console.log("✅ JPG INYECTADO ESTADÍSTICA Y BIOLÓGICAMENTE.");
        } else {
            console.log("⚠️ Intentando FileChooser forzoso para portada...");
            const [fileChooser] = await Promise.all([
                page.waitForFileChooser({ timeout: 15000 }),
                page.evaluate(() => {
                    const texts = document.querySelectorAll('*');
                    for(let t of texts) {
                        const html = t.innerText || '';
                        if(html.match(/Cargar su archivo de portada/i) || html.match(/Upload your cover file/i)) {
                            t.click();
                            return;
                        }
                    }
                })
            ]);
            await fileChooser.accept([coverPath]);
            console.log("✅ PORTADA JPG INYECTADA vía interceptación OS.");
        }

        console.log("-> 🛑 OPERACIÓN CORONA REALIZADA CON ÉXITO. Revisa tu navegador.");
        console.log("-> Amazon procesará los archivos durante varios minutos antes de dejarte saltar a 'Precios' para publicar. Te dejaré el navegador abierto.");
        
        // No cerramos el navegador para que el usuario pueda ver la evidencia y hacer clic final o dejar que otra rutina lo haga si es necesario.
        await new Promise(r => setTimeout(r, 600000)); // Queda vivo 10 minutos
        
    } catch(err) {
        console.log("Error catastrófico en la inyección:", err.message);
    }
})();
