import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface SolutionCardProps {
  id: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  href: string;
  bgColor?: string;
  iconColor?: string;
  titleColor?: string;
  isPopular?: boolean;
}

export function SolutionCard({ 
  id, 
  title, 
  description, 
  Icon, 
  href,
  bgColor = 'bg-card', 
  iconColor = 'text-primary', 
  titleColor = 'text-card-foreground',
  isPopular,
}: SolutionCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex flex-col items-center text-center p-6 sm:p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        bgColor
      )}
    >
      {isPopular && (
        <Badge
          variant="default"
          className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full shadow-sm hover:bg-amber-400/90 z-10"
        >
          Popular
        </Badge>
      )}
      <div className={cn(
          "mb-4 p-3 rounded-lg inline-block", 
          bgColor === 'bg-[hsl(var(--pulse-bg))]' ? 'bg-orange-100' : 
          bgColor === 'bg-[hsl(var(--explore-bg))]' ? 'bg-green-100' : 
          bgColor === 'bg-[hsl(var(--test-bg))]' ? 'bg-pink-100' : 
          'bg-secondary' 
        )}
      >
        <Icon className={cn("h-8 w-8 sm:h-10 sm:w-10", iconColor)} />
      </div>
      <h3 className={cn("text-xl sm:text-2xl font-semibold mb-2", titleColor)}>
        {title}
      </h3>
      <p className="text-sm text-foreground/80 leading-relaxed">
        {description}
      </p>
    </Link>
  );
}
