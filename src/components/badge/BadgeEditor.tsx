import React, { useState, useRef } from 'react';
import { BadgePoints, PointKey, InputMode, BadgeData } from '@/types/badge';
import { BadgeCanvas } from './BadgeCanvas';
import { PointSelector } from './PointSelector';
import { DataInput } from './DataInput';
import { Download, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BadgeEditorProps {
  hideHeader?: boolean;
}

export const BadgeEditor: React.FC<BadgeEditorProps> = ({ hideHeader = false }) => {
  const [image, setImage] = useState<string | null>(null);
  const [points, setPoints] = useState<BadgePoints>({
    topRight: null,
    topLeft: null,
    bottomRight: null,
    bottomLeft: null,
  });
  const [activePoint, setActivePoint] = useState<PointKey | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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

  const handleDataSubmit = (data: BadgeData) => {
    setBadgeData(data);
    setShowPreview(true);
  };

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `cracha-${badgeData?.name.replace(/\s+/g, '-').toLowerCase() || 'badge'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleReset = () => {
    setShowPreview(false);
    setBadgeData(null);
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
    setBadgeData(null);
    setShowPreview(false);
  };

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-background p-4 md:p-8"}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {!hideHeader && (
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
        )}

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Point Selector Card */}
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

            {/* Data Input Card */}
            <div className="glass-panel rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  2
                </span>
                Inserir Dados
              </h2>
              <DataInput
                mode={inputMode}
                onModeChange={setInputMode}
                onDataSubmit={handleDataSubmit}
                isReady={allPointsSet}
              />
            </div>

            {/* Download Button */}
            {showPreview && badgeData && (
              <div className="space-y-3 animate-scale-in">
                <button onClick={handleDownload} className="download-btn flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Baixar Crachá
                </button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="w-full border-border/50 hover:bg-secondary"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Novo Crachá
                </Button>
              </div>
            )}

            {/* Reset All */}
            {image && (
              <Button
                variant="ghost"
                onClick={handleFullReset}
                className="w-full text-muted-foreground hover:text-destructive"
              >
                Recomeçar do Zero
              </Button>
            )}
          </aside>

          {/* Main Canvas Area */}
          <main className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                {showPreview ? 'Prévia do Crachá' : 'Modelo do Crachá'}
              </h2>
              {showPreview && badgeData && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="px-2 py-1 rounded bg-success/20 text-success">
                    {badgeData.name}
                  </span>
                  <span className="text-border">|</span>
                  <span>{badgeData.team}</span>
                </div>
              )}
            </div>
            <BadgeCanvas
              image={image}
              points={points}
              activePoint={activePoint}
              onImageUpload={setImage}
              onPointClick={handlePointClick}
              badgeData={badgeData}
              showPreview={showPreview}
            />
          </main>
        </div>

        {/* Footer */}
        {!hideHeader && (
          <footer className="mt-8 text-center text-sm text-muted-foreground">
            <p>Arraste e solte uma imagem ou clique para fazer upload</p>
          </footer>
        )}
      </div>
    </div>
  );
};
