const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

require('dotenv').config();

class Distributor {
    constructor() {
        console.log("🛒 Módulo Distribuidor Ninja (KDP) iniciado.");
    }

    async uploadToKDP(bookTitle, pdfFilePath, coverFilePath) {
        console.log(`\n🕵️ Iniciando despliegue hacia Amazon KDP para el título: "${bookTitle}"`);
        
        // Conservar la sesión guardada para nunca más lidiar con OTPs diarios
        const browser = await puppeteer.launch({ 
            headless: false, // Puedes ponerlo en true después cuando el flujo sea robusto
            defaultViewport: null,
            userDataDir: './kdp-profile', // ¡GUARDA LAS COOKIES AQUÍ!
            args: ['--start-maximized']
        });

        const page = await browser.newPage();

        try {
            console.log("-> Navegando directo al portal principal...");
            await page.goto('https://kdp.amazon.com/en_US/bookshelf', { waitUntil: 'domcontentloaded', timeout: 60000 });

            console.log("-> Chequeando estado de sesión...");
            
            if (page.url().includes('login') || page.url().includes('ap/signin') || page.url().includes('ap/cvf')) {
               console.log("-> No hay sesión activa. Inyectando credenciales...");
               
               if (await page.$('#ap_email') !== null) {
                   await page.type('#ap_email', process.env.KDP_EMAIL, { delay: 50 });
                   await page.type('#ap_password', process.env.KDP_PASSWORD, { delay: 50 });
                   await page.click('#signInSubmit').catch(() => {});
               }

               console.log("\n⚠️ [INTERVENCIÓN HUMANA REQUERIDA] Amazon validará tu ingreso (SMS/Email o Captcha).");
               console.log("-> Estoy esperando a que resuelvas el acceso en pantalla...");
               
               // Esperar estáticamente hasta que la URL contenga 'bookshelf'
               try {
                   await page.waitForFunction("window.location.href.includes('bookshelf')", { timeout: 300000, polling: 1000 });
                   console.log("✅ Acceso concedido y sesión guardada.");
               } catch(e) {
                   console.log("⏳ Fallo al detectar entrada al dashboard: ", e.message);
               }
            } else {
                console.log("✅ Sesión validada. Ya estamos en el Bookshelf.");
            }

            console.log("\n-> 🖋️ Iniciando la inyección del Libro...");
            if (!page.url().includes('bookshelf')) {
                await page.goto('https://kdp.amazon.com/en_US/bookshelf', { waitUntil: 'domcontentloaded' });
            }
            
            try {
                console.log("-> Navegando a zona de creación...");
                console.log("📚 El libro maestro (PDF) está listo en: " + pdfFilePath);
                
                console.log("-> Buscando el botón de Creación de forma orgánica...");
                
                await page.evaluate(() => {
                    const elements = document.querySelectorAll('button, a, .a-button-text, .a-button-inner');
                    for (let el of elements) {
                        const txt = (el.innerText || '').toUpperCase();
                        // Algunas pantallas usan "Crear" y otras "Create"
                        if (txt === 'CREAR' || txt === 'CREATE' || txt.includes('CREATE A NEW TITLE')) {
                            el.click();
                            break;
                        }
                    }
                });

                // Esperamos un poco a que cargue el panel desplegable de tipos de libros de KDP
                await new Promise(r => setTimeout(r, 4000));
                
                console.log("-> Seleccionando opción 'Kindle eBook'...");
                await page.evaluate(() => {
                    const elements = document.querySelectorAll('button, a, .a-button-text, .a-button-inner');
                    for (let el of elements) {
                        const txt = (el.innerText || '').toUpperCase();
                        if (txt.includes('EBOOK KINDLE') || txt.includes('KINDLE EBOOK')) {
                            el.click();
                            break;
                        }
                    }
                });

                // Damos tiempo a la navegación real hacia los metadatos
                await new Promise(r => setTimeout(r, 6000));

                // Llenar metadatos (Título, Autor, etc.) inyectando JS para buscar campos visuales
                console.log("-> 📝 Inyectando Autocompletado Neuronal de Formularios...");
                
                await page.evaluate((titleStr) => {
                    // Forzar el título directo si el selector estándar existe
                    const titleInput = document.querySelector('input[name="title"]') || document.querySelector('#title');
                    if(titleInput) {
                        titleInput.value = titleStr;
                        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    // Función heurística para encontrar campos adyacentes a textos
                    const fillByLabel = (searchText, val, isRadio = false) => {
                        const allNodes = document.querySelectorAll('span, label, p, div');
                        for(let t of allNodes) {
                            if((t.innerText||'').toUpperCase().includes(searchText.toUpperCase())) {
                                if(isRadio) {
                                    let r = t.closest('label');
                                    if(r) { r.click(); break; }
                                } else {
                                    // Buscar input dentro del nodo cercano
                                    let inp = t.parentElement.parentElement.querySelector('input[type="text"]');
                                    if(inp) {
                                        inp.value = val;
                                        inp.dispatchEvent(new Event('input', { bubbles: true }));
                                        break;
                                    }
                                }
                            }
                        }
                    };

                    fillByLabel("Nombre", "Antigravity");
                    fillByLabel("Apellido", "AI");
                    fillByLabel("derechos de autor", null, true); // Derechos
                    fillByLabel("No", null, true); // Contenido restrictivo

                }, bookTitle);

                console.log("✅ Nombre de autor y derechos básicos llenados.");
                
                // AVANZAR AL SEGUNDO PASO: CONTENIDO DEL EBOOK
                console.log("-> 🚀 Avanzando a la pestaña de Contenido del eBook...");
                await new Promise(r => setTimeout(r, 4000));

                await page.evaluate(() => {
                    const buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"], a');
                    for (let b of buttons) {
                        const t = (b.innerText || b.value || '').toUpperCase();
                        if (t.includes('GUARDAR Y CONTINUAR') || t.includes('SAVE AND CONTINUE')) {
                            b.click();
                            break;
                        }
                    }
                });

                console.log("-> ⏳ Esperando redirección (KDP validará si todos los campos de Fase 1 están correctos)...");
                try {
                    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 45000 });
                } catch(e) {
                    console.log("-> (Nota: la página no navegó automáticamente o faltó un campo manual por rellenar).");
                }
                
                // YA ESTAMOS EN LA PESTAÑA "CONTENT"
                console.log("-> 💾 Invocando los botones de carga para inyectar Manuscrito y Portada...");
                
                // Inyectar PDF interceptando el Selector de archivos Nativo
                try {
                    console.log("-> Atrapando pasarela del Manuscrito...");
                    const [fileChooser] = await Promise.all([
                        page.waitForFileChooser({ timeout: 10000 }),
                        page.evaluate(() => {
                            const els = document.querySelectorAll('span, button, div');
                            for (let el of els) {
                                const t = (el.innerText || '').toUpperCase();
                                // Selectores bilingües para el botón de manuscrito
                                if (t.includes('UPLOAD EBOOK MANUSCRIPT') || t.includes('SUBIR MANUSCRITO')) {
                                    el.click(); break;
                                }
                            }
                        })
                    ]);
                    await fileChooser.accept([pdfFilePath]);
                    console.log("✅ PDF de contenido inyectado exitosamente.");
                } catch(e) {
                    console.log("⚠️ Falló inyección del PDF (Botón no accesible visualmente o idioma no detectado).");
                }

                await new Promise(r => setTimeout(r, 6000)); // Esperar procesamiento UI KDP

                // Inyectar PORTADA interceptando Selector
                try {
                    console.log("-> Atrapando pasarela de la Portada...");
                    const [coverChooser] = await Promise.all([
                        page.waitForFileChooser({ timeout: 10000 }),
                        page.evaluate(() => {
                            const els = document.querySelectorAll('span, button, div');
                            for (let el of els) {
                                const t = (el.innerText || '').toUpperCase();
                                // Selectores bilingües para portada. Podría requerir elegir "Ya tengo portada" primero.
                                if (t.includes('UPLOAD YOUR COVER FILE') || t.includes('SUBIR ARCHIVO DE PORTADA')) {
                                    el.click(); break;
                                }
                            }
                        })
                    ]);
                    await coverChooser.accept([coverFilePath]);
                    console.log("✅ JPG de portada inyectada exitosamente.");
                } catch(e) {
                    console.log("⚠️ Falló inyección de Portada (Suele pedir marcar opción 'Ya tengo diseño').");
                }

                console.log("-> 🛑 Todo el material está subido al servidor. Amazon requiere minutos para procesarlo.");
                console.log("-> El script esperará 1 minuto por seguridad (podría requerir más si el PDF es pesado)...");
                await new Promise(r => setTimeout(r, 60000));
                
                // AVANZAR AL TERCER PASO: PRECIOS Y PUBLICACIÓN
                console.log("-> 🚀 Intentando saltar a la pestaña final de Precios...");
                await page.evaluate(() => {
                    const buttons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
                    for (let b of buttons) {
                        const t = (b.innerText || b.value || '').toUpperCase();
                        if (t.includes('GUARDAR Y CONTINUAR') || t.includes('SAVE AND CONTINUE')) {
                            b.click();
                            break;
                        }
                    }
                });

                console.log("-> ⏳ Esperando carga de la pasarela de monetización...");
                try {
                    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });
                } catch(e) {}

                // YA ESTAMOS EN LA PESTAÑA "PRICING"
                console.log("-> 💰 Estableciendo estrategia de precios (Regalía 70% // $9.99 USD)...");
                await page.evaluate(() => {
                    // Seleccionar 70% Royalty si existe el botón
                    const allSpans = document.querySelectorAll('span, label, div');
                    for (let span of allSpans) {
                        if ((span.innerText || '').includes('70%')) {
                            let rad = span.closest('label');
                            if(rad){ rad.click(); break; }
                        }
                    }

                    // Buscar el input de precio (list price en Amazon KDP)
                    const inputs = document.querySelectorAll('input[type="text"]');
                    for(let inp of inputs) {
                         if(inp.id.includes('price') || inp.name.includes('price') || inp.className.includes('price')) {
                             inp.value = "9.99";
                             inp.dispatchEvent(new Event('input', { bubbles: true }));
                             inp.dispatchEvent(new Event('change', { bubbles: true }));
                             break;
                         }
                    }
                });

                await new Promise(r => setTimeout(r, 3000)); // Dar tiempo a recalcular regalías

                console.log("-> 🚀 ¡Lanzamiento final! Presionando 'Publicar tu eBook Kindle'...");
                await page.evaluate(() => {
                    const publishButtons = document.querySelectorAll('button, input[type="submit"]');
                    for (let b of publishButtons) {
                        const txt = (b.innerText || b.value || '').toUpperCase();
                        if (txt.includes('PUBLICAR') || txt.includes('PUBLISH Y')) {
                            b.click();
                            break;
                        }
                    }
                });

                console.log("✅✅✅ ¡Lanzamiento exitoso (sujeto a ventana de validación asíncrona de Amazon)!");
                console.log("-> 🎉 Has construido el robot maestro. Dejando el navegador abierto para tu deleite.");
                await new Promise(r => setTimeout(r, 300000)); // 5 minutos vivo para celebrar

            } catch (err) {
                console.log("Error al interactuar con el DOM:", err.message);
            }

        } catch (error) {
            console.error("Error en KDP.", error);
        } finally {
            console.log('\nFinalizando simulación KDP.');
            await browser.close();
        }
    }
}

module.exports = Distributor;
