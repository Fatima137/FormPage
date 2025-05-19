
'use client';

import * as React from 'react';
import { MessageCircle, Send, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { customerSupportChatbot, type CustomerSupportChatbotOutput } from '@/ai/flows/customer-support-chatbot';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const [initialMessageSent, setInitialMessageSent] = React.useState(false);

  const sendInitialMessage = () => {
    if (messages.length === 0 && !initialMessageSent) {
       const botMessage: Message = {
        id: Date.now().toString() + 'bot-initial',
        text: "Hi there! How can I help you with SBX today?",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setInitialMessageSent(true);
    }
  };

  React.useEffect(() => {
    if (isOpen && !initialMessageSent) {
      sendInitialMessage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialMessageSent]);


  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString() + 'user',
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response: CustomerSupportChatbotOutput = await customerSupportChatbot({ question: userMessage.text });
      const botMessage: Message = {
        id: Date.now().toString() + 'bot',
        text: response.answer,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + 'error',
        text: "Sorry, I couldn't process your request. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 rounded-full shadow-lg z-50 h-12 w-12 sm:h-14 sm:w-14 p-0 bg-[hsl(var(--chatbot-bg))] text-[hsl(var(--chatbot-fg))] hover:bg-[hsl(var(--chatbot-bg))] hover:opacity-90"
        onClick={() => setIsOpen(true)}
        aria-label="Open Chatbot"
      >
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 flex flex-col h-[70vh] max-h-[600px] shadow-xl">
          <DialogHeader className="p-6 pb-4 border-b bg-[hsl(var(--lavender-accent))]/10">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-6 w-6 text-[hsl(var(--lavender-accent))]" />
              Support
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              We’re here to help you get the most from SBX.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-end gap-2',
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[hsl(var(--lavender-accent))] text-[hsl(var(--lavender-accent-foreground))]">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                      message.sender === 'user'
                        ? 'bg-[hsl(var(--lavender-accent))] text-[hsl(var(--lavender-accent-foreground))] rounded-br-none shadow'
                        : 'bg-card text-card-foreground border border-[hsl(var(--lavender-accent))]/20 rounded-bl-none shadow-sm rounded-xl' 
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <p className={cn(
                        "text-xs mt-1",
                        message.sender === 'user' ? 'text-[hsl(var(--lavender-accent-foreground))]/70 text-right' : 'text-muted-foreground/70 text-left'
                      )}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                   {message.sender === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                   <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-[hsl(var(--lavender-accent))] text-[hsl(var(--lavender-accent-foreground))]">
                         <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm bg-card text-card-foreground border border-[hsl(var(--lavender-accent))]/20 rounded-bl-none rounded-xl">
                    <p className="animate-pulse">Typing...</p>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <DialogFooter className="p-4 border-t bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex w-full items-center space-x-2"
            >
              <Input
                id="message"
                placeholder="Type your message…"
                className="flex-1 rounded-full"
                autoComplete="off"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || inputValue.trim() === ''} className="bg-[hsl(var(--lavender-accent))] text-[hsl(var(--lavender-accent-foreground))] hover:bg-[hsl(var(--lavender-accent))]/90">
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
