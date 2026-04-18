import React, { useState, useRef, useCallback } from 'react';
import { BadgePoints, PointKey, InputMode, BadgeData } from '@/types/badge';
import { BadgeCanvas } from './BadgeCanvas';
import { BulkBadgeCanvas, BulkBadgeCanvasRef } from './BulkBadgeCanvas';
import { PointSelector } from './PointSelector';
import { DataInput } from './DataInput';
import { Download, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface BadgeEditorProps {
  hideHeader?: boolean;
}

export const BadgeEditor: React.FC<BadgeEditorProps> = ({
  hideHeader = false,
}) => {
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
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRefs = useRef<Map<number, BulkBadgeCanvasRef>>(new Map());
  const allPointsSet = Object.values(points).every((p) => p != null);

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
    setSingleData(null);
    setShowPreview(false);
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

    bulkData.forEach((badge, index) => {
      const canvasRef = canvasRefs.current.get(index);
      if (canvasRef) {
        const dataUrl = canvasRef.getDataURL();
        if (dataUrl) {
          const base64Data = dataUrl.split(',')[1];
          const fileName = `cracha-${badge.name.replace(/\s+/g, '-').toLowerCase()}-${index + 1}.png`;
          zip.file(fileName, base64Data, { base64: true });
        }
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `crachas-${new Date().toISOString().split('T')[0]}.zip`);
    setIsDownloading(false);
  };

  const setCanvasRef = useCallback(
    (index: number, ref: BulkBadgeCanvasRef | null) => {
      if (ref) {
        canvasRefs.current.set(index, ref);
      } else {
        canvasRefs.current.delete(index);
      }
    },
    [],
  );

  const handleReset = () => {
    setShowPreview(false);
    setSingleData(null);
    setBulkData([])
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Gerador de Crachás
            </h1>
          </div>
          <p className="text-muted-foreground">
            Carregue seu modelo, defina a área de preenchimento e gere crachás personalizados
          </p>
        </header>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <aside className="space-y-6">
            <div className="glass-panel rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  1
                </span>
                Definir Pontos
              </h2>
              <PointSelector
                points={points}
                activePoint={activePoint}
                onSelectPoint={handleSelectPoint}
                hasImage={!!image}
              />
            </div>

            <div className="glass-panel rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  2
                </span>
                Inserir Dados
              </h2>
              <DataInput
                mode={inputMode}
                onModeChange={handleModeChange}
                onSingleSubmit={handleSingleSubmit}
                onBulkSubmit={handleBulkSubmit}
                isReady={allPointsSet} onClearBulk={function (): void {
                  throw new Error('Function not implemented.');
                } } bulkCount={0}              />
            </div>

            {showPreview && (
              <div className="space-y-3 animate-scale-in">
                {inputMode === 'manual' && singleData && (
                  <button onClick={handleDownloadSingle} className="download-btn flex items-center justify-center gap-2 w-full">
                    <Download className="w-5 h-5" />
                    Baixar Crachá
                  </button>
                )}

                {inputMode === 'bulk' && bulkData.length > 0 && (
                  <button onClick={handleDownloadBulk} disabled={isDownloading} className="download-btn flex items-center justify-center gap-2 w-full disabled:opacity-50">
                    <Download className="w-5 h-5" />
                    {isDownloading ? 'Gerando ZIP...' : `Baixar Todos (${bulkData.length})`}
                  </button>
                )}
                
                <Button variant="outline" onClick={handleReset} className="w-full border-border/50 hover:bg-secondary">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Nova Geração
                </Button>
              </div>
            )}

            {image && (
              <Button variant="ghost" onClick={handleFullReset} className="w-full text-muted-foreground hover:text-destructive">
                Recomeçar do Zero
              </Button>
            )}
          </aside>

          <main className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {!showPreview ? 'Modelo do Crachá' : inputMode === 'manual' ? 'Prévia do Crachá' : 'Prévia dos Crachás'}
              </h2>
              {showPreview && inputMode === 'manual' && singleData && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="px-2 py-1 rounded bg-success/20 text-success">{singleData.name}</span>
                  <span className="text-border">|</span>
                  <span>{singleData.team}</span>
                </div>
              )}
              {showPreview && inputMode === 'bulk' && bulkData.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{bulkData.length} crachás gerados</span>
                </div>
              )}
            </div>

            {/* Alterna dinamicamente a área principal */}
            {!showPreview || inputMode === 'manual' ? (
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
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {bulkData.map((badge, index) => (
                  <div key={index} className="border border-border rounded-xl p-4 bg-secondary/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {index + 1}
                        </span>
                        <span className="font-medium text-foreground">{badge.name}</span>
                        <span className="text-muted-foreground">|</span>
                        <span className="text-sm text-muted-foreground">{badge.team}</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <BulkBadgeCanvas
                        ref={(ref) => setCanvasRef(index, ref)}
                        image={image!}
                        points={points}
                        badgeData={badge}
                      />
                    </div>
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
