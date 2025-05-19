
'use client';

import * as React from 'react';
import {
  Settings, LogOut, Edit3, User, Search, Megaphone, Lightbulb, Package, Smile, Briefcase,
  CookingPot, GlassWater, Wine, Sparkles, Handshake, Cpu, Shirt, Store, Palette
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area'; // Added ScrollArea

interface ProfileOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

const roleOptions: ProfileOption[] = [
  { value: 'brand_marketing_comms', label: 'Brand, Marketing and/or Comms', icon: Megaphone },
  { value: 'c_suite', label: 'C-Suite Executive', icon: Briefcase },
  { value: 'customer_experience', label: 'Customer Experience', icon: Smile },
  { value: 'innovation', label: 'Innovation', icon: Lightbulb },
  { value: 'product', label: 'Product', icon: Package },
  { value: 'researcher_insights', label: 'Researcher or Insights Specialist', icon: Search },
  { value: 'something_else', label: 'Something else', icon: Edit3 },
].sort((a, b) => a.label.localeCompare(b.label));

const industryOptions: ProfileOption[] = [
  { value: 'agency_consultancy', label: 'Agency & Consultancy', icon: Handshake },
  { value: 'alcohol', label: 'Alcohol', icon: Wine },
  { value: 'beauty_personal_care', label: 'Beauty & Personal Care', icon: Sparkles },
  { value: 'beverages', label: 'Beverages', icon: GlassWater },
  { value: 'fashion', label: 'Fashion', icon: Shirt },
  { value: 'food', label: 'Food', icon: CookingPot },
  { value: 'retail', label: 'Retail', icon: Store },
  { value: 'something_else', label: 'Something else', icon: Edit3 },
  { value: 'technology', label: 'Technology', icon: Cpu },
].sort((a, b) => a.label.localeCompare(b.label));

export interface ProfileData {
  name: string;
  email: string;
  organisation: string;
  role: string;
  customRole?: string;
  industry: string;
  customIndustry?: string;
}

interface ProfileSetupModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (profileData: ProfileData) => void;
  saveButtonText?: string;
  initialData?: Partial<ProfileData>;
}

export function ProfileSetupModal({
  isOpen,
  onOpenChange,
  onSave,
  saveButtonText = "Save Profile",
  initialData = {},
}: ProfileSetupModalProps) {
  const [userName, setUserName] = React.useState(initialData.name || '');
  const [userEmail, setUserEmail] = React.useState(initialData.email || '');
  const [userOrg, setUserOrg] = React.useState(initialData.organisation || '');
  const [userRole, setUserRole] = React.useState(initialData.role || '');
  const [customRoleText, setCustomRoleText] = React.useState(initialData.customRole || '');
  const [userIndustry, setUserIndustry] = React.useState(initialData.industry || '');
  const [customIndustryText, setCustomIndustryText] = React.useState(initialData.customIndustry || '');

  React.useEffect(() => {
    if (isOpen) {
      setUserName(initialData.name || '');
      setUserEmail(initialData.email || '');
      setUserOrg(initialData.organisation || '');
      setUserRole(initialData.role || '');
      setCustomRoleText(initialData.customRole || '');
      setUserIndustry(initialData.industry || '');
      setCustomIndustryText(initialData.customIndustry || '');
    }
  }, [isOpen, initialData]);

  const handleSaveProfile = () => {
    const finalRole = userRole === 'something_else' ? customRoleText : userRole;
    const finalIndustry = userIndustry === 'something_else' ? customIndustryText : userIndustry;
    
    onSave({
      name: userName,
      email: userEmail,
      organisation: userOrg,
      role: finalRole,
      customRole: userRole === 'something_else' ? customRoleText : undefined,
      industry: finalIndustry,
      customIndustry: userIndustry === 'something_else' ? customIndustryText : undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] flex flex-col max-h-[85vh]">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2 text-[hsl(var(--lavender-accent))]"/>
            Let’s get to know you
          </DialogTitle>
          <DialogDescription>
            Fill in a few quick details to personalize your experience.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow">
          <div className="grid gap-6 p-6"> 
            <div className="space-y-2">
              <Label htmlFor="profile-name">
                Name
              </Label>
              <Input id="profile-name" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g., Alex Smith 👋" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">
                Email
              </Label>
              <Input id="profile-email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="e.g., alex.smith@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-organisation">
                Organisation
              </Label>
              <Input id="profile-organisation" value={userOrg} onChange={(e) => setUserOrg(e.target.value)} placeholder="e.g., Lunar Industries 🚀" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profile-role">
                Role
              </Label>
              <Select value={userRole} onValueChange={(value) => { setUserRole(value); if (value !== 'something_else') setCustomRoleText(''); }}>
                <SelectTrigger id="profile-role">
                  <SelectValue placeholder="Select your role 🎯" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map(option => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            {userRole === 'something_else' && (
              <div className="space-y-2 pl-4 border-l-2 border-muted ml-2">
                <Label htmlFor="profile-customRole">
                  Your Role
                </Label>
                <Input 
                  id="profile-customRole" 
                  value={customRoleText} 
                  onChange={(e) => setCustomRoleText(e.target.value)} 
                  placeholder="e.g., Chief Idea Officer ✨" 
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="profile-industry">
                Industry
              </Label>
              <Select value={userIndustry} onValueChange={(value) => { setUserIndustry(value); if (value !== 'something_else') setCustomIndustryText(''); }}>
                <SelectTrigger id="profile-industry">
                  <SelectValue placeholder="Select your industry 🏭" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map(option => {
                    const IconComponent = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            {userIndustry === 'something_else' && (
              <div className="space-y-2 pl-4 border-l-2 border-muted ml-2">
                <Label htmlFor="profile-customIndustry">
                  Your Industry
                </Label>
                <Input 
                  id="profile-customIndustry" 
                  value={customIndustryText} 
                  onChange={(e) => setCustomIndustryText(e.target.value)} 
                  placeholder="e.g., Space Tourism 🌌"
                />
              </div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t">
          <Button 
            type="button" 
            onClick={handleSaveProfile}
            className="bg-[hsl(var(--action-button-bg))] text-[hsl(var(--action-button-fg))] hover:bg-[hsl(var(--action-button-bg))] hover:opacity-90"
          >
            {saveButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
