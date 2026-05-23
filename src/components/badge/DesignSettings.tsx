import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Paintbrush } from 'lucide-react';

interface DesignSettingsProps {
  textColor: string;
  onTextColorChange: (color: string) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  teamTextOpacity?: number;
  onTeamTextOpacityChange?: (opacity: number) => void;
  disabled?: boolean;
}

const fontOptions = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
];

// Helper para determinar se a cor é escura para contraste do texto
function isColorDark(hexColor: string): boolean {
  const color = hexColor.substring(1); // remove #
  const rgb = parseInt(color, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 128;
}

export function DesignSettings({
  textColor,
  onTextColorChange,
  fontFamily,
  onFontFamilyChange,
  teamTextOpacity,
  onTeamTextOpacityChange,
  disabled = false,
}: DesignSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="w-5 h-5" />
          Configurações de Design
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text-color">Cor do texto</Label>
          <div className="relative">
            <input
              id="text-color"
              type="color"
              value={textColor}
              onChange={(e) => onTextColorChange(e.target.value)}
              disabled={disabled}
              className="absolute w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div
              className="w-full h-10 rounded-md border flex items-center px-3"
              style={{ backgroundColor: textColor }}
            >
              <span
                className="text-sm font-mono"
                style={{
                  color: isColorDark(textColor) ? 'white' : 'black',
                }}
              >
                {textColor.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="font-family">Fonte</Label>
          <Select
            value={fontFamily}
            onValueChange={onFontFamilyChange}
            disabled={disabled}
          >
            <SelectTrigger id="font-family">
              <SelectValue placeholder="Selecione uma fonte" />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span style={{ fontFamily: font.value }}>{font.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {teamTextOpacity !== undefined && onTeamTextOpacityChange && (
          <div className="space-y-2 pt-2">
            <Label htmlFor="team-opacity" className="flex items-center justify-between">
              <span>Opacidade da Equipe</span>
              <span className="text-muted-foreground">{Math.round(teamTextOpacity * 100)}%</span>
            </Label>
            <input
              id="team-opacity"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={teamTextOpacity}
              onChange={(e) => onTeamTextOpacityChange(parseFloat(e.target.value))}
              disabled={disabled}
              className="w-full accent-primary cursor-pointer disabled:cursor-not-allowed"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
