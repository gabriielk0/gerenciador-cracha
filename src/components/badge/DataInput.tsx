import React, { useState } from 'react';
import { InputMode, BadgeData } from '@/types/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  PenLine,
  Users,
  ArrowRight,
  Check,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react';

interface DataInputProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  onSingleSubmit: (data: BadgeData) => void;
  onBulkSubmit: (data: BadgeData[]) => void;
  isReady: boolean;
}

export const DataInput: React.FC<DataInputProps> = ({
  mode,
  onModeChange,
  onSingleSubmit,
  onBulkSubmit,
  isReady,
}) => {
  // --- Estados Gerais ---
  const [showTeam, setShowTeam] = useState(true);

  // --- Estados do Modo Manual ---
  const [name, setName] = useState('');
  const [team, setTeam] = useState('');

  // --- Estados do Modo em Massa (Lista) ---
  const [currentBulkName, setCurrentBulkName] = useState('');
  const [currentBulkTeam, setCurrentBulkTeam] = useState('');
  const [namesList, setNamesList] = useState<BadgeData[]>([]); // Variável que estava faltando!
  const [editingIndex, setEditingIndex] = useState<number | null>(null); // Para controlar qual item está sendo editado

  const handleAddOrUpdateToList = () => {
    if (currentBulkName.trim() && (!showTeam || currentBulkTeam.trim())) {
      if (editingIndex !== null) {
        const updatedList = [...namesList];
        updatedList[editingIndex] = {
          name: currentBulkName.trim(),
          team: showTeam ? currentBulkTeam.trim() : '',
        };
        setNamesList(updatedList);
        setEditingIndex(null);
      } else {
        setNamesList([
          ...namesList,
          {
            name: currentBulkName.trim(),
            team: showTeam ? currentBulkTeam.trim() : '',
          },
        ]);
      }
      setCurrentBulkName('');
    }
  };

  const handleEdit = (index: number) => {
    setCurrentBulkName(namesList[index].name);
    setCurrentBulkTeam(namesList[index].team);
    setEditingIndex(index);
  };

  const removeFromList = (index: number) => {
    setNamesList(namesList.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setCurrentBulkName('');
      setCurrentBulkTeam('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOrUpdateToList();
    }
  };

  const handleClearList = () => {
    if (window.confirm('Tem certeza que deseja limpar a lista?')) {
      setNamesList([]);
      setEditingIndex(null);
      setCurrentBulkName('');
      setCurrentBulkTeam('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs de Modo */}
      <div className="flex gap-2 p-1 bg-secondary/30 rounded-xl">
        <button
          onClick={() => onModeChange('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <PenLine className="w-4 h-4" />
          Individual
        </button>
        <button
          onClick={() => onModeChange('bulk')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'bulk' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Users className="w-4 h-4" />
          Lista
        </button>
      </div>

      {!isReady && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-xs">
          Marque os 4 cantos no modelo antes de prosseguir.
        </div>
      )}

      {mode === 'manual' ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-2">
            <div className="space-y-2">
              <Input
                placeholder="Nome no Crachá"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isReady}
              />
              <Input
                placeholder="Equipe/Cargo"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                disabled={!isReady || !showTeam}
              />

              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer pt-1 pl-1">
                <input
                  type="checkbox"
                  checked={showTeam}
                  onChange={(e) => setShowTeam(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer"
                />
                Incluir Equipe/Cargo no crachá
              </label>
            </div>
          </div>
          <Button
            onClick={() =>
              onSingleSubmit({
                name,
                team: showTeam ? team : '',
              })
            }
            disabled={!isReady || !name || (showTeam && !team)}
            className="w-full"
          >
            Gerar Prévia <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Input
                  placeholder="Nome"
                  value={currentBulkName}
                  onChange={(e) => setCurrentBulkName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!isReady}
                />
                <Input
                  placeholder="Equipe"
                  value={currentBulkTeam}
                  onChange={(e) => setCurrentBulkTeam(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={!isReady || !showTeam}
                />
              </div>
              <Button
                size="icon"
                onClick={handleAddOrUpdateToList}
                disabled={
                  !isReady || !currentBulkName || (showTeam && !currentBulkTeam)
                }
                className="h-auto"
                variant={editingIndex !== null ? 'secondary' : 'default'}
              >
                {editingIndex !== null ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </Button>
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer pt-1 pl-1">
              <input
                type="checkbox"
                checked={showTeam}
                onChange={(e) => setShowTeam(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
              />
              Incluir Equipe/Cargo no crachá
            </label>
          </div>

          {/* Lista de Nomes Adicionados */}
          <div className="max-h-40 overflow-y-auto border rounded-lg bg-secondary/20 p-2 space-y-1">
            {namesList.length === 0 ? (
              <p className="text-[10px] text-center text-muted-foreground py-4">
                Nenhum nome na lista
              </p>
            ) : (
              namesList.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2 rounded border text-xs transition-colors ${editingIndex === i ? 'bg-secondary border-primary/50' : 'bg-background'}`}
                >
                  <span className="truncate flex-1">
                    <strong>{item.name}</strong> - {item.team}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(i)}
                      className="text-primary hover:bg-primary/10 p-1 rounded"
                      title="Editar"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromList(i)}
                      className="text-destructive hover:bg-destructive/10 p-1 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <Button
            onClick={() => onBulkSubmit(namesList)}
            disabled={!isReady || namesList.length === 0}
            className="w-full"
            variant="default"
          >
            Gerar {namesList.length} Crachás <Check className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};
