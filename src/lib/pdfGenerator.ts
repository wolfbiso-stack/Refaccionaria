import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFItem {
    sku: string;
    name: string;
    quantity: number;
}

interface UserProfile {
    first_name?: string;
    last_name?: string;
    rfc?: string;
    phone?: string;
    is_corporate?: boolean;
    corporate_name?: string;
}

export const generateQuotationPDF = async (
    folio: string,
    items: PDFItem[],
    profile: UserProfile | null,
    dateStr?: string
) => {
    const doc = new jsPDF();
    const primaryColor = [253, 196, 1]; // #fdc401
    const date = dateStr || new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // --- Header / Brand ---
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 45, 'F');
    
    // Logo loading
    let logoAdded = false;
    try {
        const logoImg = new Image();
        logoImg.src = '/logo.png';
        await new Promise((resolve, reject) => {
            logoImg.onload = resolve;
            logoImg.onerror = reject;
        });
        doc.addImage(logoImg, 'PNG', 15, 10, 25, 25);
        logoAdded = true;
    } catch (err) {
        console.error('Error loading logo for PDF:', err);
    }

    // Company Name & Info
    const textX = logoAdded ? 45 : 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('CORDOBESA REFACCIONES', textX, 25);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('C. Altamirano, Zapotal, 96039 Acayucan, Veracruz.', textX, 32);
    doc.text('ventas@refaccionariacordobesa.com | Tel: 924 688 6220', textX, 37);

    // --- Quote Info ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('COTIZACIÓN', 15, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const rightMargin = 155;
    doc.text(`Fecha: ${date}`, rightMargin, 55);
    doc.text(`Folio: ${folio}`, rightMargin, 60);

    // Client Info
    doc.setDrawColor(230, 230, 230);
    doc.line(15, 65, 195, 65);
    
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL CLIENTE:', 15, 75);
    doc.setFont('helvetica', 'normal');
    
    const clientName = profile?.is_corporate 
        ? profile.corporate_name 
        : `${profile?.first_name || 'Publico en General'} ${profile?.last_name || ''}`;

    doc.text(`Nombre: ${clientName}`, 15, 82);
    doc.text(`RFC: ${profile?.rfc || 'N/A'}`, 15, 87);
    doc.text(`Tel: ${profile?.phone || 'N/A'}`, 15, 92);
    
    if (profile?.is_corporate) {
        doc.text(`RFC Corp: ${profile.rfc}`, 110, 87);
    }

    // Table
    const tableData = items.map((item, index) => [
        index + 1,
        item.sku || 'N/A',
        item.name,
        item.quantity,
        'A COTIZAR'
    ]);

    autoTable(doc, {
        startY: 100,
        head: [['#', 'SKU / PARTE', 'DESCRIPCIÓN DEL PRODUCTO', 'CANT', 'PRECIO UNIT.']],
        body: tableData,
        headStyles: { fillColor: primaryColor as any, textColor: [0, 0, 0], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 250, 250] },
        margin: { left: 15, right: 15 }
    });

    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('NOTAS IMPORTANTES:', 15, finalY);
    doc.text('1. Esta cotización tiene una vigencia de 5 días hábiles.', 15, finalY + 5);
    doc.text('2. Precios sujetos a cambio sin previo aviso.', 15, finalY + 10);
    doc.text('3. Tiempo de entrega aproximado de 1 a 3 días hábiles.', 15, finalY + 15);

    // Download
    const fileName = `Cotizacion_${folio.replace('#', '')}_${date.replace(/[\/]/g, '-')}.pdf`;
    doc.save(fileName);
};
