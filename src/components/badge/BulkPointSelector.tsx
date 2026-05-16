import React, { useRef, useEffect, useState } from 'react';
import { BadgePoints, PointKey } from '@/types/badge';
import { Upload, MousePointer2, Check } from 'lucide-react';

interface BulkPointSelectorProps {
  image: string | null;
  points: BadgePoints;
  activePoint: PointKey | null;
  onImageUpload: (image: string) => void;
  onPointClick: (x: number, y: number) => void;
  onSelectPoint: (key: PointKey) => void;
}

const pointConfig: {
  key: PointKey;
  label: string;
  description: string;
  colorClass: string;
}[] = [
  {
    key: 'topLeft',
    label: '1',
    description: 'Superior Esquerdo',
    colorClass: 'point-1',
  },
  {
    key: 'topRight',
    label: '2',
    description: 'Superior Direito',
    colorClass: 'point-2',
  },
  {
    key: 'bottomLeft',
    label: '3',
    description: 'Inferior Esquerdo',
    colorClass: 'point-3',
  },
  {
    key: 'bottomRight',
    label: '4',
    description: 'Inferior Direito',
    colorClass: 'point-4',
  },
];

export const BulkPointSelector: React.FC<BulkPointSelectorProps> = ({
  image,
  points,
  activePoint,
  onImageUpload,
  onPointClick,
  onSelectPoint,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!image) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const container = containerRef.current;
      if (!container) return;

      const maxWidth = container.clientWidth;
      const maxHeight = 300;

      let newScale = 1;
      if (img.width > maxWidth || img.height > maxHeight) {
        newScale = Math.min(maxWidth / img.width, maxHeight / img.height);
      }

      setScale(newScale);
      setImageSize({ width: img.width, height: img.height });

      canvas.width = img.width * newScale;
      canvas.height = img.height * newScale;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      drawPoints(ctx, newScale);
    };
    img.src = image;
  }, [image, points]);

  const drawPoints = (ctx: CanvasRenderingContext2D, currentScale: number) => {
    const colors = ['#f472b6', '#a78bfa', '#4ade80', '#facc15'];

    Object.entries(points).forEach(([key, point], index) => {
      if (!point) return;

      const x = point.x * currentScale;
      const y = point.y * currentScale;

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fillStyle = colors[index];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), x, y);
    });

    const allPointsSet = Object.values(points).every((p) => p !== null);
    if (allPointsSet) {
      const { topRight, topLeft, bottomRight, bottomLeft } = points;
      if (topRight && topLeft && bottomRight && bottomLeft) {
        ctx.beginPath();
        ctx.moveTo(topLeft.x * currentScale, topLeft.y * currentScale);
        ctx.lineTo(topRight.x * currentScale, topRight.y * currentScale);
        ctx.lineTo(bottomRight.x * currentScale, bottomRight.y * currentScale);
        ctx.lineTo(bottomLeft.x * currentScale, bottomLeft.y * currentScale);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activePoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / scale);
    const y = Math.round((e.clientY - rect.top) / scale);

    onPointClick(x, y);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageUpload(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageUpload(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const allPointsSet = Object.values(points).every((p) => p !== null);

  return (
    <div className="space-y-4">
      {/* Image Upload / Canvas */}
      <div
        ref={containerRef}
        className="relative"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {!image ? (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors bg-secondary/30">
            <Upload className="w-10 h-10 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">
              Carregar modelo do crachá
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        ) : (
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className={`rounded-lg cursor-${activePoint ? 'crosshair' : 'default'} border border-border`}
          />
        )}
      </div>

      {/* Point Selector Buttons */}
      {image && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <MousePointer2 className="w-3 h-3" />
            <span>Selecione um ponto e clique na imagem</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {pointConfig.map(({ key, label, description, colorClass }) => {
              const point = points[key];
              const isActive = activePoint === key;

              return (
                <button
                  key={key}
                  onClick={() => onSelectPoint(key)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all ${
                    isActive
                      ? 'border-primary bg-primary/10'
                      : point
                        ? 'border-success/50 bg-success/10'
                        : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${colorClass}`}
                  >
                    {point ? <Check className="w-3 h-3" /> : label}
                  </div>
                  <span className="text-foreground">{description}</span>
                </button>
              );
            })}
          </div>
          {allPointsSet && (
            <div className="flex items-center gap-2 text-xs text-success mt-2">
              <Check className="w-4 h-4" />
              <span>Todos os pontos definidos!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
