
'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card'; 
import { Badge } from '@/components/ui/badge';

interface ExploreTemplateCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  onClick: () => void;
  isSelected: boolean;
  variant: 'explore' | 'test' | 'pulse';
  isPopular?: boolean;
}

export function ExploreTemplateCard({
  title,
  description,
  Icon,
  onClick,
  isSelected,
  variant,
  isPopular,
}: ExploreTemplateCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 ease-in-out relative', // Added relative for badge positioning
        'text-foreground',
        'border-transparent', 

        variant === 'explore' ? 'bg-[hsl(var(--explore-template-bg))]' :
        variant === 'test' ? 'bg-[hsl(var(--test-template-card-bg))]' :
        'bg-[hsl(var(--explore-template-bg))]',

        isSelected
          ? 'ring-2 ring-[hsl(var(--lavender-accent))] shadow-lg' 
          : [ 
              'shadow-sm hover:shadow-md', 
              variant === 'explore' && 'hover:bg-[hsl(var(--explore-template-bg-hover))]',
              variant === 'test' && 'hover:bg-[hsl(var(--test-template-card-bg-hover))]',
              variant === 'pulse' && 'hover:bg-[hsl(var(--explore-template-bg-hover))]',
            ]
      )}
      onClick={onClick}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <CardContent className="p-2"> 
        <div className="flex items-start space-x-3"> 
          <Icon 
            className={cn(
              "h-4 w-4 shrink-0 mt-1", 
              variant === 'explore' ? 'text-[hsl(var(--explore-template-icon-fg))]' :
              variant === 'test' ? 'text-[hsl(var(--test-template-card-icon-fg))]' :
              'text-muted-foreground', 

              isSelected ? "opacity-100" : "opacity-70 group-hover:opacity-100"
            )} 
          />
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3> 
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
      {isPopular && (
        <Badge
          variant="default"
          className="absolute top-1.5 right-1.5 bg-amber-400 text-amber-900 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full shadow-sm hover:bg-amber-400/90"
        >
          Popular
        </Badge>
      )}
    </Card>
  );
}
