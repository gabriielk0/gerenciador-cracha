import React, { useState } from 'react';
import { InputMode, BadgeData } from '@/types/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, Users, PenLine, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface DataInputProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  onSingleSubmit: (data: BadgeData) => void;
  onBulkSubmit: (data: BadgeData[]) => void;
  onClearBulk: () => void;
  bulkCount: number;
  isReady: boolean;
}

export const DataInput: React.FC<DataInputProps> = ({
  mode,
  onModeChange,
  onSingleSubmit,
  onBulkSubmit,
  onClearBulk,
  bulkCount,
  isReady,
}) => {
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const exampleJson = `[\n  { "name": "João Silva", "team": "Equipe Alpha" },\n  { "name": "Maria Santos", "team": "Equipe Beta" }\n]`;

  const handleManualSubmit = () => {
    if (name.trim() && team.trim()) {
      onSingleSubmit({ name: name.trim(), team: team.trim() });
    }
  };

  const handleBulkSubmit = () => {
    try {
      const parsed = JSON.parse(jsonInput);

      if (!Array.isArray(parsed)) {
        setJsonError('O JSON deve ser um array de objetos');
        return;
      }

      const validData: BadgeData[] = [];
      for (let i = 0; i < parsed.length; i++) {
        const item = parsed[i];
        if (typeof item.name != 'string' || typeof item.team != 'string') {
          setJsonError(`Item ${i + 1}: deve conter "name" e "team" como strings`);
          return;
        }

        validData.push({
          name: item.name.trim(),
          team: item.team.trim(),
        });
      }

      if (validData.length === 0) {
        setJsonError('Adicione pelo menos um item ao JSON');
        return;
      }

      onBulkSubmit(validData);
      setJsonError(null);
    } catch {
      setJsonError('JSON invÃ¡lido');
    }
  };

  

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-secondary/30 rounded-xl">
        <button
          onClick={() => onModeChange('manual')}
          className={`mode-tab flex items-center justify-center gap-2 ${mode === 'manual' ? 'active' : ''}`}
        >
          <PenLine className="w-4 h-4" />
          Manual
        </button>
        <button
          onClick={() => onModeChange('bulk')}
          className={`mode-tab flex items-center justify-center gap-2 ${mode === 'bulk' ? 'active' : ''}`}
        >
          <Users className="w-4 h-4" />
          Em massa
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
            <span>Gerar PrÃ©via</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              JSON de entrada
            </label>
            <div className="text-xs text-muted-foreground">
              <p className="mb-1">Formato esperado:</p>
              <pre className="bg-secondary/50 p-2 rounded text-[10px] overflow-x-auto">
                {exampleJson}
              </pre>
            </div>
            <Textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setJsonError(null);
              }}
              placeholder='[{"name": "Nome", "team": "Equipe"}]'
              disabled={!isReady}
              className="bg-secondary/50 border-border/50 focus:border-primary min-h-[120px] font-mono text-sm"
            />
            {jsonError && (
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{jsonError}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleBulkSubmit}
              disabled={!isReady || !jsonInput.trim()}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <span>Gerar Lista</span>
              <Check className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
