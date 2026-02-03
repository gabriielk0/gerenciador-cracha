import React, { useRef, useEffect, useState } from 'react';
import { BadgePoints, PointKey, BadgeData } from '@/types/badge';
import { Upload, ImageIcon } from 'lucide-react';

interface BadgeCanvasProps {
  image: string | null;
  points: BadgePoints;
  activePoint: PointKey | null;
  onImageUpload: (image: string) => void;
  onPointClick: (x: number, y: number) => void;
  badgeData: BadgeData | null;
  showPreview: boolean;
}

const pointColors: Record<PointKey, string> = {
  topRight: 'point-1',
  topLeft: 'point-2',
  bottomRight: 'point-3',
  bottomLeft: 'point-4',
};

const pointLabels: Record<PointKey, string> = {
  topRight: '1',
  topLeft: '2',
  bottomRight: '3',
  bottomLeft: '4',
};

export const BadgeCanvas: React.FC<BadgeCanvasProps> = ({
  image,
  points,
  activePoint,
  onImageUpload,
  onPointClick,
  badgeData,
  showPreview,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImageUpload(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activePoint || !containerRef.current || !image) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * imageSize.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * imageSize.height);

    onPointClick(x, y);
  };

  useEffect(() => {
    if (image) {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
      img.src = image;
    }
  }, [image]);

  useEffect(() => {
    if (!canvasRef.current || !image || !showPreview || !badgeData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (points.topLeft && points.topRight && points.bottomLeft && points.bottomRight) {
        // Calculate bounding box from the 4 points
        const minX = Math.min(points.topLeft.x, points.topRight.x, points.bottomLeft.x, points.bottomRight.x);
        const maxX = Math.max(points.topLeft.x, points.topRight.x, points.bottomLeft.x, points.bottomRight.x);
        const minY = Math.min(points.topLeft.y, points.topRight.y, points.bottomLeft.y, points.bottomRight.y);
        const maxY = Math.max(points.topLeft.y, points.topRight.y, points.bottomLeft.y, points.bottomRight.y);

        const areaWidth = maxX - minX;
        const areaHeight = maxY - minY;
        const centerX = minX + areaWidth / 2;
        const centerY = minY + areaHeight / 2;

        // Padding inside the area
        const padding = areaWidth * 0.05;
        const maxTextWidth = areaWidth - padding * 2;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Function to find optimal font size that fits
        const findOptimalFontSize = (text: string, maxWidth: number, startSize: number, minSize: number = 12) => {
          let fontSize = startSize;
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          
          while (ctx.measureText(text).width > maxWidth && fontSize > minSize) {
            fontSize -= 1;
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          }
          
          return fontSize;
        };

        // Calculate name font size (start with size based on area, min 16px)
        const initialNameSize = Math.max(24, Math.min(areaHeight * 0.25, areaWidth * 0.1));
        const nameFontSize = findOptimalFontSize(badgeData.name, maxTextWidth, initialNameSize, 14);
        
        // Team font size is 10px smaller than name
        const teamFontSize = Math.max(10, nameFontSize - 10);

        // Calculate vertical positions
        const totalTextHeight = nameFontSize + teamFontSize + 8; // 8px gap between name and team
        const nameY = centerY - (totalTextHeight / 2) + (nameFontSize / 2);
        const teamY = nameY + (nameFontSize / 2) + 8 + (teamFontSize / 2);

        // Draw name
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${nameFontSize}px Inter, sans-serif`;
        ctx.fillText(badgeData.name, centerX, nameY);

        // Draw team
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.font = `${teamFontSize}px Inter, sans-serif`;
        ctx.fillText(badgeData.team, centerX, teamY);
      }
    };
    img.src = image;
  }, [image, points, badgeData, showPreview]);

  const getPointPosition = (point: { x: number; y: number } | null) => {
    if (!point || imageSize.width === 0) return null;
    return {
      left: `${(point.x / imageSize.width) * 100}%`,
      top: `${(point.y / imageSize.height) * 100}%`,
    };
  };

  if (!image) {
    return (
      <label className="canvas-container flex flex-col items-center justify-center min-h-[400px] cursor-pointer hover:border-primary/50 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
            <Upload className="w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Carregar modelo do crachá</p>
            <p className="text-sm mt-1">PNG, JPG ou WEBP</p>
          </div>
        </div>
      </label>
    );
  }

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className={`canvas-container has-image relative ${activePoint ? 'cursor-crosshair' : ''}`}
        onClick={handleCanvasClick}
      >
        {showPreview && badgeData ? (
          <canvas ref={canvasRef} className="w-full h-auto" />
        ) : (
          <>
            <img src={image} alt="Badge template" className="w-full h-auto" />
            
            {/* Point markers */}
            {(Object.keys(points) as PointKey[]).map((key) => {
              const position = getPointPosition(points[key]);
              if (!position) return null;

              return (
                <div
                  key={key}
                  className={`point-marker ${pointColors[key]} flex items-center justify-center text-xs font-bold`}
                  style={position}
                >
                  {pointLabels[key]}
                </div>
              );
            })}

            {/* Area overlay when all points are set */}
            {points.topLeft && points.topRight && points.bottomLeft && points.bottomRight && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
                preserveAspectRatio="none"
              >
                <polygon
                  points={`${points.topLeft.x},${points.topLeft.y} ${points.topRight.x},${points.topRight.y} ${points.bottomRight.x},${points.bottomRight.y} ${points.bottomLeft.x},${points.bottomLeft.y}`}
                  fill="rgba(14, 165, 233, 0.1)"
                  stroke="hsl(199, 89%, 48%)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />
              </svg>
            )}
          </>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
        <ImageIcon className="w-4 h-4" />
        <span>Trocar imagem</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );
};
