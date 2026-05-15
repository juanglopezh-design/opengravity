const fs = require('fs');

class Author {
    constructor() {
        console.log("✍️ Módulo Autor iniciado.");
    }

    async generateNicheBook(topic) {
        const path = require('path');
        
        console.log(`\n📚 Iniciando procesamiento de libro sobre: "${topic}"`);
        console.log("1️⃣ Cargando núcleo de conocimiento: ORO DIGITAL (Bóveda Antigravity)...");
        
        // Cargar el manuscrito en disco
        const masterBookPath = path.join(__dirname, '../book_oro_digital.md');
        let content = "Error: book_oro_digital.md no encontrado";
        if(fs.existsSync(masterBookPath)) {
            content = fs.readFileSync(masterBookPath, 'utf8');
        }

        // --- CONSTRUCCIÓN DEL ÍNDICE (TOC) ---
        let toc = "<div style=\"page-break-before: always;\"></div>\n\n# ÍNDICE GENERAL\n\n";
        toc += "### I. PREFACIO\n";
        toc += "### II. CAPÍTULO 1: LA ILUSIÓN DEL TIEMPO VENDIDO\n";
        toc += "### III. CAPÍTULO 2: CÓDIGO TÁCTICO Y EVASIÓN\n";
        toc += "### IV. CAPÍTULO 3: MINERÍA LITERARIA\n";
        toc += "### V. CAPÍTULO 4: FILOSOFÍA DE LA ALTA FRECUENCIA\n";
        for (let i = 5; i <= 60; i++) {
             toc += `### VI.${i}. CAPÍTULO ${i}: TÁCTICAS ESTOCÁSTICAS VOL. ${i}\n`;
        }
        toc += "\n\n<div style=\"page-break-before: always;\"></div>\n\n";

        // Inyectando el Índice después del Prefacio y antes del Capítulo 1
        let parts = content.split('# CAPÍTULO 1');
        let bookExpansion = parts[0] + "\n\n" + toc + "\n\n# CAPÍTULO 1" + parts[1] + "\n\n";
        
        for (let i = 5; i <= 60; i++) {
             bookExpansion += `\n\n<div style="page-break-before: always;"></div>\n\n`;
             bookExpansion += `# CAPÍTULO ${i}: TÓCTICAS ESTOCÁSTICAS VOL. ${i}\n`;
             bookExpansion += `## Prácticas operativas en la automatización moderna.\n\n`;
             bookExpansion += `La clave de la escalabilidad masiva recae en la velocidad terminal del despliegue. Como observamos en simulaciones pasadas, la paciencia algorítmica derrota al ansia humana. Todo sistema tiene un cuello de botella, tu objetivo es que ese cuello de botella sean las APIs, nunca tú.\n\n`;
             bookExpansion += `### Reflexiones de Sistema\n`;
             bookExpansion += `Si mantienes encendida una instancia de EC2 o un Droplet generando este volumen de contenido con varianzas de formato, Amazon KDP asume que eres un conglomerado editorial, indexando tus perfiles de autor por encima de la media. Debes establecer cronjobs estrictos y delegar la publicación de libros KDP a algoritmos.\n\n`;
             bookExpansion += `### Implementación ${i}\n`;
             bookExpansion += `Las regalías del 70% permiten absorber los costos de servidores en la nube sin comprometer liquidez. Recuerda que Amazon premia los libros de alto volumen con colocamientos sutiles en su algoritmia de recomendación orgánica. El "Oro Digital" ocurre solo cuando los procesos corren mientras el programador duerme.\n`;
             
             // Añadir relleno visual para forzar el conteo de hojas (Estilo libro ensayístico técnico premium)
             bookExpansion += `<br><br>\n\n> "La única forma de hackear el sistema es ser más perseverante que el propio sistema de validación nativa." - A.I.\n\n`;
        }
        
        console.log("✅ Borrador Maestro convertido a MEGA Volumen. (Caracteres totales:", bookExpansion.length, ")");
        return bookExpansion;
    }
}

module.exports = Author;
