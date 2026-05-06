import React, { useState, useRef, useCallback } from 'react';
import { BadgePoints, PointKey, InputMode, BadgeData } from '@/types/badge';
import { BadgeCanvas, BadgeCanvasRef } from './BadgeCanvas';
import { PointSelector } from './PointSelector';
import { DataInput } from './DataInput';
import { Download, RotateCcw, IdCard, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';

interface BadgeEditorProps {
  hideHeader?: boolean;
}

export const BadgeEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [points, setPoints] = useState<BadgePoints>({
    topRight: null,
    topLeft: null,
    bottomRight: null,
    bottomLeft: null,
  });
  const [activePoint, setActivePoint] = useState<PointKey | null>(null);

  // Controle de modo
  const [inputMode, setInputMode] = useState<InputMode>('manual');

  // Dados salvo
  const [singleData, setSingleData] = useState<BadgeData | null>(null);
  const [bulkData, setBulkData] = useState<BadgeData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRefs = useRef<Map<number, BadgeCanvasRef>>(new Map());
  const allPointsSet = Object.values(points).every((p) => p !== null);

  const handlePointClick = (x: number, y: number) => {
    if (!activePoint) return;
    setPoints((prev) => ({
      ...prev,
      [activePoint]: { x, y },
    }));
    setActivePoint(null);
  };

  const handleSelectPoint = (key: PointKey) => {
    setActivePoint(activePoint === key ? null : key);
  };

  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    setShowPreview(false);
  };

  const handleSingleSubmit = (data: BadgeData) => {
    setSingleData(data);
    setShowPreview(true);
  };

  const handleBulkSubmit = (data: BadgeData[]) => {
    setBulkData(data);
    setSingleData(null);
    setShowPreview(true);
  };

  const handleDownloadSingle = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas || !singleData) return;

    const link = document.createElement('a');
    link.download = `cracha-${singleData?.name.replace(/\s+/g, '-').toLowerCase() || 'badge'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadBulk = async () => {
    if (bulkData.length === 0) return;
    setIsDownloading(true);

    const zip = new JSZip();
    await new Promise((resolve) => setTimeout(resolve, 500));

    bulkData.forEach((_, index) => {
      const canvasRef = canvasRefs.current.get(index);
      const dataUrl = canvasRef?.getDataURL();
      if (dataUrl) {
        const base64Data = dataUrl.split(',')[1];
        zip.file(`cracha-${index + 1}.png`, base64Data, { base64: true });
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `crachas-${new Date().toISOString().split('T')[0]}.zip`);
    setIsDownloading(false);
  };

  const handleFullReset = () => {
    setImage(null);
    setPoints({
      topRight: null,
      topLeft: null,
      bottomRight: null,
      bottomLeft: null,
    });
    setActivePoint(null);
    setSingleData(null);
    setBulkData([]);
    setShowPreview(false);
  };

  const exportToPdf = async (items: BadgeData[]) => {
    if (items.length === 0) return;
    setIsDownloading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const pdf = new jsPDF({
      orientation: 'portrait',
      // orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // const pageWidth = 210;
    // const pageHeight = 297;
    // const badgeWidth = 100;
    // const badgeHeight = 150;
    // const margin = 2;
    // const gap = 1;

    const pageWidth = 210;
    const pageHeight = 297;
    const badgeWidth = 100;
    const badgeHeight = 70;
    const margin = 4;
    const gap = 2;

    const cols = Math.floor(
      (pageWidth - margin * 2 + gap) / (badgeWidth + gap),
    );
    const rowsPerPage = Math.floor(
      (pageHeight - margin * 2 + gap) / (badgeHeight + gap),
    );

    let positionIndex = 0;

    items.forEach((item, index) => {
      let dataUrl: string | null = null;

      if (inputMode === 'manual') {
        const canvas = document.querySelector('canvas');
        dataUrl = canvas ? canvas.toDataURL('image/png') : null;
      } else {
        const canvasRef = canvasRefs.current.get(index);
        dataUrl = canvasRef?.getDataURL() || null;
      }

      if (!dataUrl) return;

      const col = positionIndex % cols;
      const row = Math.floor(positionIndex / cols) % rowsPerPage;
      const x = margin + col * (badgeWidth + gap);
      const y = margin + row * (badgeHeight + gap);

      pdf.addImage(dataUrl, 'PNG', x, y, badgeWidth, badgeHeight);
      positionIndex++;

      if (positionIndex >= cols * rowsPerPage && index < items.length - 1) {
        pdf.addPage();
        positionIndex = 0;
      }
    });

    const fileName =
      items.length === 1
        ? `cracha-${items[0].name.replace(/\s+/g, '-').toLowerCase() || 'badge'}.pdf`
        : `crachas-impressao-a4.pdf`;
    pdf.save(fileName);
    setIsDownloading(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
            <IdCard />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gerador de Crachás</h1>
            <p className="text-muted-foreground text-sm">Manual e Lista</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <aside className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl border">
              <PointSelector
                points={points}
                activePoint={activePoint}
                onSelectPoint={(k) =>
                  setActivePoint(activePoint === k ? null : k)
                }
                hasImage={!!image}
              />
            </div>

            <div className="glass-panel p-5 rounded-2xl border">
              <DataInput
                mode={inputMode}
                onModeChange={(m) => {
                  setInputMode(m);
                  setShowPreview(false);
                }}
                isReady={allPointsSet}
                onSingleSubmit={(d) => {
                  setSingleData(d);
                  setShowPreview(true);
                }}
                onBulkSubmit={(d) => {
                  setBulkData(d);
                  setShowPreview(true);
                }}
              />
            </div>

            {showPreview && (
              <div className="space-y-2">
                {/* Divide a exibição dependendo do modo atual */}
                {inputMode === 'manual' ? (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleDownloadSingle}
                      disabled={isDownloading}
                    >
                      <Image className="w-4 h-4 mr-2" />
                      {isDownloading ? 'Aguarde...' : 'Baixar PNG'}
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => exportToPdf([singleData!])}
                      disabled={isDownloading}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {isDownloading ? 'Aguarde...' : 'Baixar PDF'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={handleDownloadBulk}
                      disabled={isDownloading}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {isDownloading ? 'Gerando...' : 'Baixar ZIP'}
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => exportToPdf(bulkData)}
                      disabled={isDownloading}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {isDownloading ? 'Gerando...' : 'PDF (A4)'}
                    </Button>
                  </div>
                )}

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowPreview(false)}
                  disabled={isDownloading}
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Editar Dados
                </Button>
              </div>
            )}

            {image && (
              <Button
                variant="link"
                className="w-full text-destructive text-xs"
                onClick={handleFullReset}
              >
                Remover Imagem e Resetar tudo
              </Button>
            )}
          </aside>

          <main className="glass-panel p-5 rounded-2xl border min-h-[500px] bg-secondary/10">
            {/* Se não for prévia bulk, mostra o canvas interativo normal */}
            {!(showPreview && inputMode === 'bulk') ? (
              <BadgeCanvas
                image={image}
                points={points}
                activePoint={activePoint}
                onImageUpload={setImage}
                onPointClick={handlePointClick}
                badgeData={singleData}
                showPreview={showPreview && inputMode === 'manual'}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[700px] overflow-y-auto p-2">
                {bulkData.map((data, i) => (
                  <div
                    key={i}
                    className="bg-background border rounded-lg p-2 shadow-sm"
                  >
                    <p className="text-[10px] font-mono mb-2 text-muted-foreground">
                      #{i + 1} - {data.name}
                    </p>
                    <BadgeCanvas
                      ref={(el) => {
                        if (el) canvasRefs.current.set(i, el);
                      }}
                      image={image!}
                      points={points}
                      badgeData={data}
                      showPreview={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>Arraste e solte uma imagem ou clique para fazer upload</p>
        </footer>
      </div>
    </div>
  );
};
