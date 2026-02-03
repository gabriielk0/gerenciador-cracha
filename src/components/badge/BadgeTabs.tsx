import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BadgeEditor } from './BadgeEditor';
import { BulkBadgeEditor } from './BulkBadgeEditor';
import { Sparkles, Users, FileText } from 'lucide-react';

export const BadgeTabs: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-4 md:p-8 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Gerador de Crachás
            </h1>
          </div>
          <p className="text-muted-foreground text-center md:text-left">
            Carregue seu modelo, defina a área de preenchimento e gere crachás personalizados
          </p>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="single" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Crachá Individual
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Em Massa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="mt-0">
            <SingleBadgeContent />
          </TabsContent>

          <TabsContent value="bulk" className="mt-0">
            <BulkBadgeEditor />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="p-8 text-center text-sm text-muted-foreground">
        <p>Arraste e solte uma imagem ou clique para fazer upload</p>
      </footer>
    </div>
  );
};

// Extracted single badge content without header/footer
const SingleBadgeContent: React.FC = () => {
  return <BadgeEditor hideHeader />;
};
