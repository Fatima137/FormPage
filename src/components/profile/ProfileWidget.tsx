
'use client';

import * as React from 'react';
import {
  Settings, LogOut, Edit3, User, Search, Megaphone, Lightbulb, Package, Smile, Briefcase,
  CookingPot, GlassWater, Wine, Sparkles, Handshake, Cpu, Shirt, Store, Palette
} from 'lucide-react'; 
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
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


export function ProfileWidget() {
  const [isProfileDialogOpen, setIsProfileDialogOpen] = React.useState(false);
  const [userName, setUserName] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [userOrg, setUserOrg] = React.useState('');
  const [userRole, setUserRole] = React.useState('');
  const [customRoleText, setCustomRoleText] = React.useState('');
  const [userIndustry, setUserIndustry] = React.useState('');
  const [customIndustryText, setCustomIndustryText] = React.useState('');

  React.useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
        try {
            const parsed = JSON.parse(storedProfile);
            setUserName(parsed.name || '');
            setUserEmail(parsed.email || '');
            setUserOrg(parsed.organisation || '');
            
            const foundRole = roleOptions.find(r => r.value === parsed.role || r.label === parsed.role);
            if (foundRole) {
                setUserRole(foundRole.value);
                setCustomRoleText('');
            } else if (parsed.role) { 
                setUserRole('something_else');
                setCustomRoleText(parsed.customRole || parsed.role); 
            }

            const foundIndustry = industryOptions.find(i => i.value === parsed.industry || i.label === parsed.industry);
            if (foundIndustry) {
                setUserIndustry(foundIndustry.value);
                setCustomIndustryText('');
            } else if (parsed.industry) { 
                setUserIndustry('something_else');
                setCustomIndustryText(parsed.customIndustry || parsed.industry); 
            }
        } catch (e) {
            console.error("Error parsing stored profile for widget dialog", e);
        }
    }
  }, [isProfileDialogOpen]);


  const handleSaveProfile = () => {
    const finalRole = userRole === 'something_else' ? customRoleText : userRole;
    const finalIndustry = userIndustry === 'something_else' ? customIndustryText : userIndustry;
    
    const profileDataToSave = { 
      name: userName, 
      email: userEmail, 
      organisation: userOrg,
      role: finalRole,
      customRole: userRole === 'something_else' ? customRoleText : undefined,
      industry: finalIndustry,
      customIndustry: userIndustry === 'something_else' ? customIndustryText : undefined,
    };
    localStorage.setItem('userProfile', JSON.stringify(profileDataToSave));
    console.log("Profile saved via widget:", profileDataToSave);
    setIsProfileDialogOpen(false);
  };

  return (
    <>
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="rounded-full h-10 w-10 sm:h-12 sm:w-12 p-0 bg-[hsl(var(--profile-avatar-bg))] hover:bg-[hsl(var(--profile-avatar-hover-bg))] shadow-sm border border-border group"
              aria-label="Open user menu"
            >
              <Avatar className="h-full w-full">
                <AvatarFallback className="bg-transparent">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(var(--profile-avatar-icon-fg))]" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => setIsProfileDialogOpen(true)}
                className={cn(
                  "group",
                  "focus:bg-[hsl(var(--soft-lavender-hover-bg))] focus:text-primary-foreground",
                  "hover:bg-[hsl(var(--soft-lavender-hover-bg))] hover:text-primary-foreground"
                )}
              >
                <Edit3 className="mr-2 h-4 w-4 text-[hsl(var(--dropdown-item-icon-default-fg))] group-focus:text-primary-foreground group-hover:text-primary-foreground" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(
                  "group",
                  "focus:bg-[hsl(var(--soft-lavender-hover-bg))] focus:text-primary-foreground",
                  "hover:bg-[hsl(var(--soft-lavender-hover-bg))] hover:text-primary-foreground"
                )}
              >
                <Settings className="mr-2 h-4 w-4 text-[hsl(var(--dropdown-item-icon-default-fg))] group-focus:text-primary-foreground group-hover:text-primary-foreground" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className={cn(
                "group",
                "focus:bg-[hsl(var(--soft-lavender-hover-bg))] focus:text-primary-foreground",
                "hover:bg-[hsl(var(--soft-lavender-hover-bg))] hover:text-primary-foreground"
              )}
            >
              <LogOut className="mr-2 h-4 w-4 text-[hsl(var(--dropdown-item-icon-default-fg))] group-focus:text-primary-foreground group-hover:text-primary-foreground" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
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
                <Label htmlFor="widget-profile-name">
                  Name
                </Label>
                <Input id="widget-profile-name" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="e.g., Alex Smith 👋" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="widget-profile-email">
                  Email
                </Label>
                <Input id="widget-profile-email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="e.g., alex.smith@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="widget-profile-organisation">
                  Organisation
                </Label>
                <Input id="widget-profile-organisation" value={userOrg} onChange={(e) => setUserOrg(e.target.value)} placeholder="e.g., Lunar Industries 🚀" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="widget-profile-role">
                  Role
                </Label>
                <Select value={userRole} onValueChange={(value) => {setUserRole(value); if(value !== 'something_else') setCustomRoleText('');}}>
                  <SelectTrigger id="widget-profile-role">
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
                  <Label htmlFor="widget-profile-customRole">
                    Your Role
                  </Label>
                  <Input 
                    id="widget-profile-customRole" 
                    value={customRoleText} 
                    onChange={(e) => setCustomRoleText(e.target.value)} 
                    placeholder="e.g., Chief Idea Officer ✨" 
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="widget-profile-industry">
                  Industry
                </Label>
                <Select value={userIndustry} onValueChange={(value) => {setUserIndustry(value); if(value !== 'something_else') setCustomIndustryText('');}}>
                  <SelectTrigger id="widget-profile-industry">
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
                  <Label htmlFor="widget-profile-customIndustry">
                    Your Industry
                  </Label>
                  <Input 
                    id="widget-profile-customIndustry" 
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
                Save Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
