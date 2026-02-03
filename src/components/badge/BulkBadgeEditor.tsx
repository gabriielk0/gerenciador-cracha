import React, { useState, useRef, useCallback } from 'react';
import { BadgePoints, PointKey, BadgeData } from '@/types/badge';
import { BulkPointSelector } from './BulkPointSelector';
import { BulkBadgeCanvas, BulkBadgeCanvasRef } from './BulkBadgeCanvas';
import { Download, FileJson, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const BulkBadgeEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [points, setPoints] = useState<BadgePoints>({
    topRight: null,
    topLeft: null,
    bottomRight: null,
    bottomLeft: null,
  });
  const [activePoint, setActivePoint] = useState<PointKey | null>(null);
  const [jsonInput, setJsonInput] = useState('');
  const [badgeList, setBadgeList] = useState<BadgeData[]>([]);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRefs = useRef<Map<number, BulkBadgeCanvasRef>>(new Map());

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

  const handleJsonParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      
      if (!Array.isArray(parsed)) {
        setJsonError('O JSON deve ser um array de objetos');
        return;
      }

      const validData: BadgeData[] = [];
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (typeof item.name !== 'string' || typeof item.team !== 'string') {
          setJsonError(`Item ${i + 1}: deve conter "name" e "team" como strings`);
          return;
        }
        validData.push({ name: item.name, team: item.team });
      }

      setBadgeList(validData);
      setJsonError(null);
    } catch (e) {
      setJsonError('JSON inválido. Verifique a formatação.');
    }
  };

  const handleClearList = () => {
    setBadgeList([]);
    setJsonInput('');
    setJsonError(null);
  };

  const setCanvasRef = useCallback((index: number, ref: BulkBadgeCanvasRef | null) => {
    if (ref) {
      canvasRefs.current.set(index, ref);
    } else {
      canvasRefs.current.delete(index);
    }
  }, []);

  const handleDownloadAll = async () => {
    if (badgeList.length === 0) return;

    setIsDownloading(true);
    const zip = new JSZip();

    // Wait a bit for all canvases to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    badgeList.forEach((badge, index) => {
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

  const exampleJson = `[
  { "name": "João Silva", "team": "Equipe Alpha" },
  { "name": "Maria Santos", "team": "Equipe Beta" },
  { "name": "Pedro Oliveira", "team": "Equipe Gamma" }
]`;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-[350px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Point Selector Card */}
            <div className="glass-panel rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  1
                </span>
                Modelo e Pontos
              </h2>
              <BulkPointSelector
                image={image}
                points={points}
                activePoint={activePoint}
                onImageUpload={setImage}
                onPointClick={handlePointClick}
                onSelectPoint={handleSelectPoint}
              />
            </div>

            {/* JSON Input Card */}
            <div className="glass-panel rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  2
                </span>
                Dados em JSON
              </h2>

              <div className="space-y-3">
                <div className="text-xs text-muted-foreground mb-2">
                  <p className="mb-1">Formato esperado:</p>
                  <pre className="bg-secondary/50 p-2 rounded text-[10px] overflow-x-auto">
                    {exampleJson}
                  </pre>
                </div>

                <Textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='[{"name": "Nome", "team": "Equipe"}, ...]'
                  className="min-h-[120px] font-mono text-xs"
                  disabled={!allPointsSet}
                />

                {jsonError && (
                  <div className="flex items-start gap-2 text-xs text-destructive">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{jsonError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleJsonParse}
                    disabled={!allPointsSet || !jsonInput.trim()}
                    className="flex-1"
                    size="sm"
                  >
                    <FileJson className="w-4 h-4 mr-1" />
                    Processar JSON
                  </Button>
                  {badgeList.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={handleClearList}
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {!allPointsSet && (
                  <p className="text-xs text-muted-foreground">
                    Defina todos os 4 pontos no modelo primeiro
                  </p>
                )}
              </div>
            </div>

            {/* Download All Button */}
            {badgeList.length > 0 && (
              <div className="animate-scale-in">
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading}
                  className="download-btn flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  {isDownloading ? 'Gerando ZIP...' : `Baixar Todos (${badgeList.length} crachás)`}
                </button>
              </div>
            )}
          </aside>

          {/* Main Preview Area */}
          <main className="glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Prévia dos Crachás
              </h2>
              {badgeList.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{badgeList.length} crachás gerados</span>
                </div>
              )}
            </div>

            {badgeList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <FileJson className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-center">
                  {!image
                    ? 'Carregue um modelo de crachá para começar'
                    : !allPointsSet
                    ? 'Defina os 4 pontos de limite na imagem'
                    : 'Insira os dados em JSON para gerar os crachás'}
                </p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {badgeList.map((badge, index) => (
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
      </div>
    </div>
  );
};
