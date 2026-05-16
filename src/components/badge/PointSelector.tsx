import React from 'react';
import { BadgePoints, PointKey } from '@/types/badge';
import { MousePointer2 } from 'lucide-react';

interface PointSelectorProps {
  points: BadgePoints;
  activePoint: PointKey | null;
  onSelectPoint: (key: PointKey) => void;
  hasImage: boolean;
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

export const PointSelector: React.FC<PointSelectorProps> = ({
  points,
  activePoint,
  onSelectPoint,
  hasImage,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <MousePointer2 className="w-4 h-4" />
        <span>
          Use Alt+1..Alt+4 para selecionar o ponto, depois clique na imagem
        </span>
      </div>

      {pointConfig.map(({ key, label, description, colorClass }) => {
        const point = points[key];
        const isActive = activePoint === key;

        return (
          <button
            key={key}
            onClick={() => hasImage && onSelectPoint(key)}
            disabled={!hasImage}
            className={`input-group w-full text-left ${isActive ? 'active' : ''} ${!hasImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${colorClass}`}
            >
              {label}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {description}
              </p>
              {point ? (
                <p className="text-xs text-muted-foreground">
                  X: {point.x} | Y: {point.y}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Não definido</p>
              )}
            </div>
            {isActive && (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
};
