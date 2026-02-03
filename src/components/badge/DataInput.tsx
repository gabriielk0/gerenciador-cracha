import React, { useState } from 'react';
import { InputMode, BadgeData } from '@/types/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, Users, Code, PenLine, ArrowRight, Check } from 'lucide-react';

interface DataInputProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  onDataSubmit: (data: BadgeData) => void;
  isReady: boolean;
}

export const DataInput: React.FC<DataInputProps> = ({
  mode,
  onModeChange,
  onDataSubmit,
  isReady,
}) => {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleManualSubmit = () => {
    if (name.trim() && team.trim()) {
      onDataSubmit({ name: name.trim(), team: team.trim() });
    }
  };

  const handleJsonSubmit = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (data.name && data.team) {
        onDataSubmit({ name: data.name, team: data.team });
        setJsonError(null);
      } else {
        setJsonError('JSON deve conter "name" e "team"');
      }
    } catch {
      setJsonError('JSON inválido');
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div className="flex gap-2 p-1 bg-secondary/30 rounded-xl">
        <button
          onClick={() => onModeChange('manual')}
          className={`mode-tab flex items-center justify-center gap-2 ${mode === 'manual' ? 'active' : ''}`}
        >
          <PenLine className="w-4 h-4" />
          Manual
        </button>
        <button
          onClick={() => onModeChange('api')}
          className={`mode-tab flex items-center justify-center gap-2 ${mode === 'api' ? 'active' : ''}`}
        >
          <Code className="w-4 h-4" />
          API
        </button>
      </div>

      {!isReady && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
          Defina todos os 4 pontos antes de inserir os dados
        </div>
      )}

      {mode === 'manual' ? (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="w-4 h-4" />
              Nome
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome completo"
              disabled={!isReady}
              className="bg-secondary/50 border-border/50 focus:border-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Equipe
            </label>
            <Input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="Digite o nome da equipe"
              disabled={!isReady}
              className="bg-secondary/50 border-border/50 focus:border-primary"
            />
          </div>

          <Button
            onClick={handleManualSubmit}
            disabled={!isReady || !name.trim() || !team.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <span>Gerar Prévia</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              JSON de entrada
            </label>
            <Textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setJsonError(null);
              }}
              placeholder={'{\n  "name": "João Silva",\n  "team": "Desenvolvimento"\n}'}
              disabled={!isReady}
              className="bg-secondary/50 border-border/50 focus:border-primary min-h-[120px] font-mono text-sm"
            />
            {jsonError && (
              <p className="text-sm text-destructive">{jsonError}</p>
            )}
          </div>

          <Button
            onClick={handleJsonSubmit}
            disabled={!isReady || !jsonInput.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <span>Processar JSON</span>
            <Check className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
