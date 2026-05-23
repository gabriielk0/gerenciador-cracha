import { useState, useRef, useEffect } from 'react';
import { BadgeCanvas, BadgeCanvasRef } from '@/components/badge/BadgeCanvas';
import { DataInput } from '@/components/badge/DataInput';
import { PointSelector } from '@/components/badge/PointSelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BadgeData, BadgePoints, InputMode, PointKey } from '@/types/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Download, FileText, ArrowLeft } from 'lucide-react';
import { DesignSettings } from './DesignSettings';
import { jsPDF } from 'jspdf';

const pointSteps: PointKey[] = [
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
];

export function BadgeEditorCustom() {
  const canvasRef = useRef<BadgeCanvasRef>(null);
  const [image, setImage] = useState<string | null>(null);
  const [points, setPoints] = useState<BadgePoints>({
    topLeft: null,
    topRight: null,
    bottomLeft: null,
    bottomRight: null,
  });
  const [activePoint, setActivePoint] = useState<PointKey | null>('topLeft');
  const [mode, setMode] = useState<InputMode>('manual');
  const [badgeData, setBadgeData] = useState<BadgeData | null>(null);
  const [bulkData, setBulkData] = useState<BadgeData[]>([]);
  const canvasRefs = useRef<Map<number, BadgeCanvasRef>>(new Map());
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Estados do Tamanho Customizado ---
  const [badgeWidth, setBadgeWidth] = useState<number>(100);
  const [badgeHeight, setBadgeHeight] = useState<number>(70);

  // --- Novos estados para as configurações de design ---
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif');

  const isReady = Object.values(points).every((p) => p !== null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey) return;

      const pointMap: Record<string, PointKey> = {
        '1': 'topLeft',
        '2': 'topRight',
        '3': 'bottomLeft',
        '4': 'bottomRight',
      };

      const pointKey = pointMap[e.key];
      if (!pointKey || !image) return;

      e.preventDefault();
      setActivePoint((current) => (current === pointKey ? null : pointKey));
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image]);

  const handlePointClick = (x: number, y: number) => {
    if (!activePoint) return;

    setPoints((prev) => ({ ...prev, [activePoint]: { x, y } }));

    const currentIndex = pointSteps.indexOf(activePoint);
    const nextPoint = pointSteps[currentIndex + 1] || null;
    setActivePoint(nextPoint);

    if (currentIndex === pointSteps.length - 1) {
      toast({
        title: 'Pronto!',
        description: 'Área do crachá definida. Agora insira os dados.',
      });
    }
  };

  const handleResetPoints = () => {
    setPoints({
      topLeft: null,
      topRight: null,
      bottomLeft: null,
      bottomRight: null,
    });
    setActivePoint('topLeft');
    setShowPreview(false);
    setBadgeData(null);
    setBulkData([]);
  };

  const handleSingleSubmit = (data: BadgeData) => {
    setBadgeData(data);
    setShowPreview(true);
  };

  const generateSingleBadge = () => {
    const dataURL = canvasRef.current?.getDataURL();
    if (dataURL && badgeData) {
      saveAs(dataURL, `cracha-${badgeData.name.replace(/ /g, '_')}.png`);
    }
  };

  const handleBulkSubmit = async (data: BadgeData[]) => {
    setBulkData(data);
    setBadgeData(null);
    setShowPreview(true);
  };

  const generateBulkZip = async () => {
    if (bulkData.length === 0) return;
    setIsGenerating(true);

    const zip = new JSZip();
    await new Promise((resolve) => setTimeout(resolve, 500));

    bulkData.forEach((_, index) => {
      const canvasRefEl = canvasRefs.current.get(index);
      const dataUrl = canvasRefEl?.getDataURL();
      if (dataUrl) {
        const base64Data = dataUrl.split(',')[1];
        zip.file(`cracha-${index + 1}.png`, base64Data, { base64: true });
      }
    });

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `crachas-${new Date().toISOString().split('T')[0]}.zip`);
    setIsGenerating(false);
  };

  const exportToPdf = async (items: BadgeData[]) => {
    if (items.length === 0) return;
    setIsGenerating(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
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

      if (mode === 'manual') {
        const canvas = document.querySelector('canvas');
        dataUrl = canvas ? canvas.toDataURL('image/jpeg', 1.0) : null;
      } else {
        const canvasRefEl = canvasRefs.current.get(index);
        dataUrl = canvasRefEl?.getDataURL('image/jpeg', 1.0) || null;
      }

      if (!dataUrl) return;

      const col = positionIndex % cols;
      const row = Math.floor(positionIndex / cols) % rowsPerPage;
      const x = margin + col * (badgeWidth + gap);
      const y = margin + row * (badgeHeight + gap);

      pdf.addImage(
        dataUrl,
        'JPEG',
        x,
        y,
        badgeWidth,
        badgeHeight,
        undefined,
        'FAST',
      );
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
    setIsGenerating(false);
  };

  const getStepClassName = (step: PointKey) => {
    if (activePoint === step) return 'border-primary text-primary';
    if (points[step]) return 'border-green-500 text-green-500';
    return 'border-border text-muted-foreground';
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1.5">
                <CardTitle>Editor de Crachá Personalizado</CardTitle>
                <CardDescription>
                  Siga os passos para criar seus crachás.
                </CardDescription>
              </div>
              <a href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Padrão
                </Button>
              </a>
            </CardHeader>
            <CardContent>
              {!(showPreview && mode === 'bulk') ? (
                <BadgeCanvas
                  ref={canvasRef}
                  image={image}
                  points={points}
                  activePoint={activePoint}
                  onImageUpload={(img) => {
                    setImage(img);
                    handleResetPoints();
                  }}
                  onPointClick={handlePointClick}
                  badgeData={badgeData}
                  showPreview={showPreview && mode === 'manual'}
                  textColor={textColor}
                  fontFamily={fontFamily}
                  teamTextOpacity={0.75}
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
                        textColor={textColor}
                        fontFamily={fontFamily}
                        teamTextOpacity={0.75}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {showPreview && badgeData && mode === 'manual' && (
            <Card className="animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle>Download</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    onClick={generateSingleBadge}
                    className="flex-1"
                    disabled={isGenerating}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Aguarde...' : 'Baixar PNG'}
                  </Button>
                  <Button
                    onClick={() => exportToPdf([badgeData])}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    disabled={isGenerating}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Aguarde...' : 'Baixar PDF'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showPreview && mode === 'bulk' && bulkData.length > 0 && (
            <Card className="animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle>Download em Massa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button
                    onClick={generateBulkZip}
                    className="flex-1"
                    disabled={isGenerating}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Gerando...' : 'Baixar ZIP'}
                  </Button>
                  <Button
                    onClick={() => exportToPdf(bulkData)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    disabled={isGenerating}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Gerando...' : 'PDF (A4)'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8 lg:sticky lg:top-8">
          <Card>
            <CardHeader>
              <CardTitle>Tamanho Personalizado</CardTitle>
              <CardDescription>
                Defina as dimensões do crachá para impressão (em mm).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Largura (mm)</Label>
                  <Input
                    type="number"
                    value={badgeWidth}
                    onChange={(e) => setBadgeWidth(Number(e.target.value))}
                    min={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Altura (mm)</Label>
                  <Input
                    type="number"
                    value={badgeHeight}
                    onChange={(e) => setBadgeHeight(Number(e.target.value))}
                    min={10}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <DesignSettings
            textColor={textColor}
            onTextColorChange={setTextColor}
            fontFamily={fontFamily}
            onFontFamilyChange={setFontFamily}
            disabled={!image}
          />

          <Card>
            <CardHeader>
              <CardTitle>1. Área de Impressão</CardTitle>
              <CardDescription>
                {isReady
                  ? 'Área definida. Você pode redefinir os pontos se necessário.'
                  : `Clique na imagem para marcar o ${activePoint ? pointSteps.indexOf(activePoint) + 1 : 1}º canto.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PointSelector
                points={points}
                activePoint={activePoint}
                onSelectPoint={(k) =>
                  setActivePoint(activePoint === k ? null : k)
                }
                hasImage={!!image}
              />
              <Button
                onClick={handleResetPoints}
                variant="outline"
                className="w-full mt-4"
              >
                Redefinir Pontos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Dados do Crachá</CardTitle>
            </CardHeader>
            <CardContent>
              <DataInput
                mode={mode}
                onModeChange={setMode}
                onSingleSubmit={handleSingleSubmit}
                onBulkSubmit={handleBulkSubmit}
                isReady={isReady}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
