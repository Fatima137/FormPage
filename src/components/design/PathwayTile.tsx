
'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PathwayTileProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  onClick: () => void;
}

export function PathwayTile({ title, description, Icon, onClick }: PathwayTileProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-200 ease-in-out",
        "bg-card rounded-[16px] p-4", // card-padding
        "shadow-sm hover:shadow-lg" // Retaining some elevation for interactivity
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <CardContent className="p-0 flex items-start space-x-3">
        <div className={cn(
          "p-2 rounded-lg", // Adjusted for visual balance
          "bg-[hsl(var(--primary)/0.1)]" // Soft tint of primary
        )}>
          <Icon className="h-7 w-7 text-[hsl(var(--primary))]" />
        </div>
        <div className="flex-grow">
          <h4 className="text-base font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-3">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
