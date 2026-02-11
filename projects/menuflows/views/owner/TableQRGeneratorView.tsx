import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';

interface TableQRGeneratorViewProps {
  onBack: () => void;
  restaurantSlug: string;
}

interface QRCodeData {
  tableNumber: number;
  dataUrl: string;
}

const TableQRGeneratorView: React.FC<TableQRGeneratorViewProps> = ({ onBack, restaurantSlug }) => {
  const [startTable, setStartTable] = useState(1);
  const [endTable, setEndTable] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [isGeneratingQrs, setIsGeneratingQrs] = useState(false);

  const getTableUrl = (tableNumber: number): string => {
    const origin = window.location.origin;
    return `${origin}/${restaurantSlug}?table=${tableNumber}`;
  };

  // Generate QR codes as PNG data URLs when range changes
  useEffect(() => {
    const generateQRCodes = async () => {
      setIsGeneratingQrs(true);
      console.log(`[QR PDF] Generating ${endTable - startTable + 1} QR codes...`);

      try {
        const qrData: QRCodeData[] = [];

        for (let table = startTable; table <= endTable; table++) {
          const url = getTableUrl(table);

          // Generate QR code as data URL
          const dataUrl = await new Promise<string>((resolve, reject) => {
            QRCode.toDataURL(url, {
              width: 200,
              margin: 1,
              errorCorrectionLevel: 'M'
            }, (error, url) => {
              if (error) reject(error);
              else resolve(url);
            });
          });

          qrData.push({ tableNumber: table, dataUrl });
        }

        console.log(`[QR PDF] ✅ Generated ${qrData.length} QR codes`);
        setQrCodes(qrData);
      } catch (error) {
        console.error('[QR PDF] ❌ Failed to generate QR codes:', error);
      } finally {
        setIsGeneratingQrs(false);
      }
    };

    // Debounce QR generation
    const timeoutId = setTimeout(() => {
      generateQRCodes();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [startTable, endTable, restaurantSlug]);

  const handleGeneratePDF = () => {
    setIsGenerating(true);

    try {
      console.log(`[QR PDF] Starting PDF generation for tables ${startTable}-${endTable}`);
      console.log(`[QR PDF] QR codes available: ${qrCodes.length}`);

      if (qrCodes.length === 0) {
        console.warn('[QR PDF] No QR codes available, waiting...');
        return;
      }

      if (qrCodes.length !== (endTable - startTable + 1)) {
        console.warn(`[QR PDF] QR count mismatch: expected ${endTable - startTable + 1}, got ${qrCodes.length}`);
        return;
      }

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const qrSize = 50;
      const spacingX = (pageWidth - 2 * margin - qrSize) / 2;
      const spacingY = 30;
      const labelHeight = 20;

      let x = margin;
      let y = margin;
      let tablesPerRow = 0;
      const maxTablesPerRow = 2;

      qrCodes.forEach((qrData, index) => {
        // Add QR code to PDF using pre-generated data URL
        pdf.addImage(qrData.dataUrl, 'PNG', x, y, qrSize, qrSize);

        // Add table number label
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Table ${qrData.tableNumber}`, x, y + qrSize + 8, { align: 'center' });

        // Add URL label
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        const url = getTableUrl(qrData.tableNumber);
        pdf.text(url, x, y + qrSize + 14, { align: 'center', maxWidth: qrSize });

        // Move to next position
        x += spacingX + qrSize;
        tablesPerRow++;

        if (tablesPerRow >= maxTablesPerRow) {
          // Move to next row
          x = margin;
          y += qrSize + labelHeight + spacingY;
          tablesPerRow = 0;

          // Add new page if needed
          if (y + qrSize + labelHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
        }
      });

      // Save PDF
      const fileName = `table-qr-codes-${startTable}-${endTable}.pdf`;
      pdf.save(fileName);

      console.log(`[QR PDF] ✅ PDF generated and saved: ${fileName}`);
    } catch (error) {
      console.error('[QR PDF] ❌ Failed to generate PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const tableRange = Array.from(
    { length: endTable - startTable + 1 },
    (_, i) => startTable + i
  );

  return (
    <div className="flex flex-col h-full bg-[#170e10] text-white">
      <header className="pt-12 pb-6 px-6 flex items-center justify-between border-b border-white/5">
        <button onClick={onBack} className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-all">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">Table QR Generator</span>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Settings */}
          <div className="mb-8 bg-[#241619] rounded-[2rem] p-6 border border-white/5">
            <h2 className="text-xl font-black mb-6">QR Code Settings</h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-black text-text-secondary mb-2 uppercase tracking-wider">
                  Start Table
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={startTable}
                  onChange={(e) => setStartTable(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-black focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-black text-text-secondary mb-2 uppercase tracking-wider">
                  End Table
                </label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={endTable}
                  onChange={(e) => setEndTable(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-black focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleGeneratePDF}
                disabled={isGenerating || isGeneratingQrs || startTable > endTable || qrCodes.length === 0}
                className="flex-1 px-6 py-3 rounded-full bg-primary text-white font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating || isGeneratingQrs ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    {isGeneratingQrs ? 'Generating QRs...' : 'Generating PDF...'}
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Download PDF ({qrCodes.length} tables)
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-8">
            <h2 className="text-xl font-black mb-4">Preview ({tableRange.length} tables)</h2>

            {isGeneratingQrs ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-[48px] text-primary animate-spin block mx-auto mb-4" style={{ fontSize: '48px' }}>sync</span>
                <p className="text-text-secondary font-medium">Generating QR codes...</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {qrCodes.map((qrData) => (
                  <div key={qrData.tableNumber} className="bg-[#241619] rounded-xl p-4 border border-white/5 flex flex-col items-center">
                    <div className="size-20 mb-2">
                      <img
                        src={qrData.dataUrl}
                        alt={`Table ${qrData.tableNumber} QR Code`}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-black text-white">Table {qrData.tableNumber}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-[#241619] rounded-[2rem] p-6 border border-white/5">
            <h2 className="text-lg font-black mb-4">Instructions</h2>
            <ol className="text-sm text-text-secondary space-y-2 list-decimal list-inside">
              <li>Set the table range (e.g., 1-30 for 30 tables)</li>
              <li>Click "Download PDF" to generate a printable PDF</li>
              <li>Print the PDF and cut out the QR codes</li>
              <li>Place each QR code on its corresponding table</li>
              <li>Customers scan the QR code to open the menu with auto-selected table</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TableQRGeneratorView;
