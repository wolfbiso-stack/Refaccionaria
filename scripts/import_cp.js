import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

/**
 * CONFIGURATION
 * Replace these values with your actual Supabase URL and SERVICE ROLE KEY (not the anon key)
 * for the script to have permissions to insert data.
 */
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY') {
    console.error('Error: Por favor configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const FILE_PATH = path.join(process.cwd(), 'codigos_postales.xlsx');

async function importZipCodes() {
    console.log('🚀 Iniciando proceso de importación...');

    if (!fs.existsSync(FILE_PATH)) {
        console.error(`❌ Error: El archivo "${FILE_PATH}" no existe.`);
        return;
    }

    try {
        // 1. Leer el archivo Excel
        console.log('📂 Leyendo archivo Excel...');
        const workbook = XLSX.readFile(FILE_PATH);
        const sheetNames = workbook.SheetNames;
        console.log(`✅ Archivo leído. Se encontraron ${sheetNames.length} hojas (Estados).`);

        let totalProcessed = 0;
        let totalInserted = 0;

        // 2. Procesar cada hoja (Estado)
        for (const sheetName of sheetNames) {
            console.log(`\n\n🔹 Procesando estado: ${sheetName}...`);
            const worksheet = workbook.Sheets[sheetName];
            
            // Convertir hoja a JSON
            const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
            console.log(`   🔸 Filas detectadas en esta hoja: ${rawData.length}`);

            const batchToInsert = [];

            for (const row of rawData) {
                totalProcessed++;
                
                // Mapeo inteligente de columnas (variantes comunes)
                const cp = row["Codigo Postal"] || row["CP"] || row["d_codigo"] || row["codigo_postal"];
                const municipio = row["Municipio"] || row["D_mnpio"] || row["municipio"];
                const colonia = row["Colonia"] || row["Asentamiento"] || row["d_asenta"] || row["colonia"];

                if (!cp) continue; // Ignorar filas sin código postal

                batchToInsert.push({
                    codigo_postal: String(cp).trim(),
                    estado: sheetName.trim(), // Nombre de la hoja es el estado
                    municipio: municipio ? String(municipio).trim() : null,
                    colonia: colonia ? String(colonia).trim() : null
                });

                // Inserción por lotes para evitar saturación (500 registros por lote)
                if (batchToInsert.length >= 500) {
                    const { error } = await supabase.from('codigos_postales').insert(batchToInsert);
                    if (error) {
                        console.error(`   ❌ Error insertando lote: ${error.message}`);
                    } else {
                        totalInserted += batchToInsert.length;
                        process.stdout.write(`   🟢 Progreso: ${totalInserted} registros insertados... \r`);
                    }
                    batchToInsert.length = 0; // Limpiar lote
                }
            }

            // Insertar remanente de la hoja actual
            if (batchToInsert.length > 0) {
                const { error } = await supabase.from('codigos_postales').insert(batchToInsert);
                if (error) {
                    console.error(`   ❌ Error al insertar remanentes: ${error.message}`);
                } else {
                    totalInserted += batchToInsert.length;
                    console.log(`   ✅ Estado finalizado. Total insertado : ${totalInserted}`);
                }
            }
        }

        console.log('\n\n' + '='.repeat(50));
        console.log('🏁 ¡PROCESO DE IMPORTACIÓN COMPLETADO!');
        console.log(`Total registros procesados: ${totalProcessed}`);
        console.log(`Total registros insertados exitosamente: ${totalInserted}`);
        console.log('='.repeat(50));

    } catch (err) {
        console.error('\n❌ ERROR CRÍTICO durante la importación:');
        console.error(err);
    }
}

// Ejecutar
importZipCodes();
