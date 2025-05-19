
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TokensInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TokenTierProps {
  iconBgColor: string;
  title: string;
  subtitle: string;
  description: string;
}

const TokenTier: React.FC<TokenTierProps> = ({ iconBgColor, title, subtitle, description }) => (
  <div className="flex flex-col items-center text-center p-4 space-y-2">
    <div className={cn("rounded-full p-3 mb-2", iconBgColor)}>
      <MessageCircle className="h-8 w-8 text-black" />
    </div>
    <h3 className="text-xl font-bold text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{subtitle}</p>
    <p className="text-xs text-muted-foreground max-w-xs">{description}</p>
  </div>
);

export function TokensInfoModal({ isOpen, onClose }: TokensInfoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl p-0 flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4 border-b text-center">
          <DialogTitle className="text-3xl font-bold">About Tokens</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow p-6">
          <div className="space-y-4">
            <p className="text-center text-muted-foreground px-4 sm:px-8">
              When you purchase any of the above packages, you&apos;ll receive a set number of tokens that
              pay for the number of respondents, photos responses, and videos responses.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <TokenTier
                iconBgColor="bg-yellow-300"
                title="1 token"
                subtitle="per conversation"
                description="Includes questions which participants respond to with text only"
              />
              <div className="hidden md:flex items-center justify-center">
                <div className="h-full w-px bg-border"></div>
              </div>
              <TokenTier
                iconBgColor="bg-yellow-300"
                title="3 tokens"
                subtitle="per conversation with photos"
                description="Includes questions which participants respond to by taking a photo."
              />
               <div className="hidden md:flex items-center justify-center md:col-start-2">
                <div className="h-full w-px bg-border"></div>
              </div>
              <TokenTier
                iconBgColor="bg-yellow-300"
                title="5 tokens"
                subtitle="per conversation with videos"
                description="Includes questions which participants respond to by recording a video."
              />
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t sm:justify-center">
          <Button 
            onClick={onClose} 
            className="w-full sm:w-auto bg-[hsl(var(--action-button-bg))] text-[hsl(var(--action-button-fg))] hover:bg-[hsl(var(--action-button-bg))] hover:opacity-90"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
