
'use client';

import * as React from 'react';
import { SolutionCard } from '@/components/solutions/SolutionCard';
import { Chatbot } from '@/components/chatbot/Chatbot';
import { ProfileWidget } from '@/components/profile/ProfileWidget';
import { Zap, Search, FlaskConical, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // For file input styling if needed

const solutions = [
  {
    id: 'pulse',
    title: 'Pulse',
    description: 'Quickly gauge consumer reactions with just seven powerful questions.',
    Icon: Zap,
    href: '/design/pulse',
    bgColor: 'bg-[hsl(var(--pulse-bg))]',
    iconColor: 'text-[hsl(var(--pulse-icon-fg))]',
    titleColor: 'text-[hsl(var(--pulse-title-fg))]',
    isPopular: false,
  },
  {
    id: 'explore',
    title: 'Explore',
    description: 'Uncover unknowns. Gain deeper insights into a consumer behaviour.',
    Icon: Search,
    href: '/design/explore',
    bgColor: 'bg-[hsl(var(--explore-bg))]',
    iconColor: 'text-[hsl(var(--explore-icon-fg))]',
    titleColor: 'text-[hsl(var(--explore-title-fg))]',
    isPopular: true,
  },
  {
    id: 'test',
    title: 'Test',
    description: 'Validate the effectiveness of ideas or concepts.',
    Icon: FlaskConical,
    href: '/design/test',
    bgColor: 'bg-[hsl(var(--test-bg))]',
    iconColor: 'text-[hsl(var(--test-icon-fg))]',
    titleColor: 'text-[hsl(var(--test-title-fg))]',
    isPopular: false,
  },
];

export default function HomePage() {
  // Ref for the hidden file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handler to trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Handler for file selection (optional, can be expanded)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('Selected file:', files[0].name);
      // Process the file here
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 sm:p-6 relative">
      <ProfileWidget />
      <Chatbot />

      <main className="flex flex-col items-center w-full max-w-4xl mt-10 sm:mt-16">
        <section className="text-center mb-10 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-semibold mb-2 text-foreground">
            What type of project is this?
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
            Start by selecting a project type.
            <br />
            You can refine the details later.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full mb-10 sm:mb-12 px-4 sm:px-0">
          {solutions.map((solution) => (
            <SolutionCard
              key={solution.id}
              id={solution.id}
              title={solution.title}
              description={solution.description}
              Icon={solution.Icon}
              href={solution.href}
              bgColor={solution.bgColor}
              iconColor={solution.iconColor}
              titleColor={solution.titleColor}
              isPopular={solution.isPopular}
            />
          ))}
        </div>

        <section className="w-full max-w-xl p-6 bg-card rounded-lg border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UploadCloud className="h-7 w-7 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-medium text-foreground">Upload documents</h2>
                <p className="text-sm text-muted-foreground">Optionally add context docs.</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleBrowseClick}
              className="bg-[hsl(var(--secondary-bg-subtle))] text-[hsl(var(--secondary-fg-subtle))] border-[hsl(var(--border))] hover:bg-[hsl(var(--secondary-bg-subtle))] hover:opacity-90 w-full sm:w-auto"
            >
              Browse
            </Button>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden" // Hidden file input
              // Add accept attribute if specific file types are needed
              // e.g., accept=".pdf,.doc,.docx,.txt"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
