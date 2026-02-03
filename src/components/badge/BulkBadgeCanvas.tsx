import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { BadgePoints, BadgeData } from '@/types/badge';

interface BulkBadgeCanvasProps {
  image: string;
  points: BadgePoints;
  badgeData: BadgeData;
}

export interface BulkBadgeCanvasRef {
  getDataURL: () => string | null;
}

export const BulkBadgeCanvas = forwardRef<BulkBadgeCanvasRef, BulkBadgeCanvasProps>(
  ({ image, points, badgeData }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);

    useImperativeHandle(ref, () => ({
      getDataURL: () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        return canvas.toDataURL('image/png');
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        canvas.width = img.width;
        canvas.height = img.height;
        drawCanvas(ctx, img);
      };
      img.src = image;
    }, [image, points, badgeData]);

    const drawCanvas = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(img, 0, 0);

      const allPointsSet = Object.values(points).every((p) => p !== null);
      if (!allPointsSet || !badgeData) return;

      const { topRight, topLeft, bottomRight, bottomLeft } = points;
      if (!topRight || !topLeft || !bottomRight || !bottomLeft) return;

      const minX = Math.min(topLeft.x, bottomLeft.x);
      const maxX = Math.max(topRight.x, bottomRight.x);
      const minY = Math.min(topLeft.y, topRight.y);
      const maxY = Math.max(bottomLeft.y, bottomRight.y);

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const maxTextWidth = maxX - minX - 20;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const findOptimalFontSize = (text: string, maxWidth: number, startSize: number): number => {
        let fontSize = startSize;
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        
        while (ctx.measureText(text).width > maxWidth && fontSize > 10) {
          fontSize -= 2;
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        }
        
        return fontSize;
      };

      const nameFontSize = findOptimalFontSize(badgeData.name, maxTextWidth, 48);
      const teamFontSize = Math.max(10, nameFontSize - 10);

      const totalTextHeight = nameFontSize + 8 + teamFontSize;
      const nameY = centerY - (totalTextHeight / 2) + (nameFontSize / 2);
      const teamY = nameY + (nameFontSize / 2) + 8 + (teamFontSize / 2);

      ctx.fillStyle = '#000000';
      ctx.font = `bold ${nameFontSize}px Inter, sans-serif`;
      ctx.fillText(badgeData.name, centerX, nameY);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.font = `${teamFontSize}px Inter, sans-serif`;
      ctx.fillText(badgeData.team, centerX, teamY);
    };

    return (
      <canvas
        ref={canvasRef}
        className="max-w-full h-auto rounded-lg shadow-lg"
      />
    );
  }
);

BulkBadgeCanvas.displayName = 'BulkBadgeCanvas';
