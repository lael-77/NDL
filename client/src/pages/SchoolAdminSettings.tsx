/**
 * School Admin Settings Page
 * Comprehensive settings management for school admin dashboard
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  UsersRound, 
  Handshake, 
  DollarSign, 
  Bell, 
  Palette,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Upload,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { SchoolAdminLayout } from '@/components/SchoolAdminLayout';
import { toast } from '@/hooks/use-toast';
import {
  getSchoolProfile,
  updateSchoolProfile,
  addCoach,
  removeCoachFromSchool,
  getSchoolCoaches,
  getSchoolTeams,
  updateTeamSettings,
  getSchoolSponsorships,
  createSponsorship,
  updateSponsorshipStatus,
  getArenaApplications,
  createArenaApplication,
  getSchoolFinances,
  createFinance,
  updateFinanceStatus,
  getNotificationSettings,
  updateNotificationSettings,
} from '@/api/schoolAdmin';

export default function SchoolAdminSettings() {
  const queryClient = useQueryClient();

  // Fetch all data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['schoolProfile'],
    queryFn: getSchoolProfile,
  });

  const { data: coaches, isLoading: coachesLoading } = useQuery({
    queryKey: ['schoolCoaches'],
    queryFn: getSchoolCoaches,
  });

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['schoolTeams'],
    queryFn: getSchoolTeams,
  });

  const { data: sponsorships, isLoading: sponsorshipsLoading } = useQuery({
    queryKey: ['schoolSponsorships'],
    queryFn: getSchoolSponsorships,
  });

  const { data: arenaApplications, isLoading: arenaLoading } = useQuery({
    queryKey: ['arenaApplications'],
    queryFn: getArenaApplications,
  });

  const { data: finances, isLoading: financesLoading } = useQuery({
    queryKey: ['schoolFinances'],
    queryFn: getSchoolFinances,
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notificationSettings'],
    queryFn: getNotificationSettings,
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: updateSchoolProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolProfile'] });
      toast({ title: 'Profile updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating profile', description: error.response?.data?.error || error.message, variant: 'destructive' });
    },
  });

  const addCoachMutation = useMutation({
    mutationFn: addCoach,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolCoaches'] });
      toast({ title: 'Coach added successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error adding coach', description: error.response?.data?.error || error.message, variant: 'destructive' });
    },
  });

  const removeCoachMutation = useMutation({
    mutationFn: removeCoachFromSchool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolCoaches'] });
      toast({ title: 'Coach removed successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error removing coach', description: error.response?.data?.error || error.message, variant: 'destructive' });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: any }) => updateTeamSettings(teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolTeams'] });
      toast({ title: 'Team settings updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating team', description: error.response?.data?.error || error.message, variant: 'destructive' });
    },
  });

  const createSponsorshipMutation = useMutation({
    mutationFn: createSponsorship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolSponsorships'] });
      toast({ title: 'Sponsorship application created' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating sponsorship', description: error.response?.data?.error || error.message, variant: 'destructive' });
    },
  });

  const updateSponsorshipMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateSponsorshipStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolSponsorships'] });
      toast({ title: 'Sponsorship status updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating sponsorship', description: error.response?.data?.error || error.message, variant: 'destructive' });
    },
  });

  const createArenaMutation = useMutation({
    mutationFn: createArenaApplication,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arenaApplications'] });
      toast({ title: 'Arena application submitted' });
    },
    onError: (error: any) => {
      toast({ title: 'Error submitting application', description: error.response?.data?.error || error.message, variant: 'destructive' });
    },
  });

  const createFinanceMutation = useMutation({
    mutationFn: createFinance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolFinances'] });
      toast({ title: 'Finance record created' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating finance record', description: error.response?.data?.error || error.message, variant: 'destructive' });
    },
  });

  const updateFinanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateFinanceStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schoolFinances'] });
      toast({ title: 'Finance record updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating finance record', description: error.response?.data?.error || error.message, variant: 'destructive' });
    },
  });

  const updateNotificationMutation = useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
      toast({ title: 'Notification settings updated' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating notifications', description: error.response?.data?.error || error.message, variant: 'destructive' });
    },
  });

  if (profileLoading || coachesLoading || teamsLoading) {
    return (
      <SchoolAdminLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </SchoolAdminLayout>
    );
  }

  return (
    <SchoolAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your school's configuration and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="profile">
              <Building2 className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="coaches">
              <Users className="h-4 w-4 mr-2" />
              Coaches
            </TabsTrigger>
            <TabsTrigger value="teams">
              <UsersRound className="h-4 w-4 mr-2" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="sponsorships">
              <Handshake className="h-4 w-4 mr-2" />
              Sponsorships
            </TabsTrigger>
            <TabsTrigger value="finances">
              <DollarSign className="h-4 w-4 mr-2" />
              Finances
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="customization">
              <Palette className="h-4 w-4 mr-2" />
              Customization
            </TabsTrigger>
          </TabsList>

          {/* 1. School Profile Settings */}
          <TabsContent value="profile">
            <SchoolProfileSettings profile={profile} onUpdate={updateProfileMutation.mutate} />
          </TabsContent>

          {/* 2. Coaches & Staff Permissions */}
          <TabsContent value="coaches">
            <CoachesSettings 
              coaches={coaches || []} 
              onAdd={addCoachMutation.mutate}
              onRemove={removeCoachMutation.mutate}
            />
          </TabsContent>

          {/* 3. Team Configuration Settings */}
          <TabsContent value="teams">
            <TeamConfigurationSettings 
              teams={teams || []} 
              onUpdate={updateTeamMutation.mutate}
            />
          </TabsContent>

          {/* 4. Sponsorship & Arena Settings */}
          <TabsContent value="sponsorships">
            <SponsorshipArenaSettings
              sponsorships={sponsorships || []}
              arenaApplications={arenaApplications || []}
              onCreateSponsorship={createSponsorshipMutation.mutate}
              onUpdateSponsorship={updateSponsorshipMutation.mutate}
              onCreateArena={createArenaMutation.mutate}
            />
          </TabsContent>

          {/* 5. Finance & Transactions Settings */}
          <TabsContent value="finances">
            <FinanceSettings
              finances={finances || []}
              teams={teams || []}
              onCreate={createFinanceMutation.mutate}
              onUpdate={updateFinanceMutation.mutate}
            />
          </TabsContent>

          {/* 6. Communication & Notification Settings */}
          <TabsContent value="notifications">
            <NotificationSettings
              notifications={notifications || []}
              onUpdate={updateNotificationMutation.mutate}
            />
          </TabsContent>

          {/* 7. Customization Settings */}
          <TabsContent value="customization">
            <CustomizationSettings profile={profile} onUpdate={updateProfileMutation.mutate} />
          </TabsContent>
        </Tabs>
      </div>
    </SchoolAdminLayout>
  );
}

// Component for School Profile Settings
function SchoolProfileSettings({ profile, onUpdate }: { profile: any; onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    motto: profile?.motto || '',
    logoUrl: profile?.logoUrl || '',
    bannerUrl: profile?.bannerUrl || '',
    address: profile?.address || '',
    contactEmail: profile?.contactEmail || '',
    contactPhone: profile?.contactPhone || '',
    socialMedia: profile?.socialMedia || { facebook: '', twitter: '', instagram: '', linkedin: '' },
    colorTheme: profile?.colorTheme || '#3B82F6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Profile Settings</CardTitle>
        <CardDescription>Configure how your school appears in the league</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">School Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="motto">Motto / Tagline</Label>
              <Input
                id="motto"
                value={formData.motto}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="bannerUrl">Banner URL</Label>
              <Input
                id="bannerUrl"
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Physical Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Social Media Links</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Input
                placeholder="Facebook URL"
                value={formData.socialMedia.facebook || ''}
                onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, facebook: e.target.value } })}
              />
              <Input
                placeholder="Twitter URL"
                value={formData.socialMedia.twitter || ''}
                onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, twitter: e.target.value } })}
              />
              <Input
                placeholder="Instagram URL"
                value={formData.socialMedia.instagram || ''}
                onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, instagram: e.target.value } })}
              />
              <Input
                placeholder="LinkedIn URL"
                value={formData.socialMedia.linkedin || ''}
                onChange={(e) => setFormData({ ...formData, socialMedia: { ...formData.socialMedia, linkedin: e.target.value } })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="colorTheme">School Color Theme</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="colorTheme"
                type="color"
                value={formData.colorTheme}
                onChange={(e) => setFormData({ ...formData, colorTheme: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={formData.colorTheme}
                onChange={(e) => setFormData({ ...formData, colorTheme: e.target.value })}
                placeholder="#3B82F6"
              />
            </div>
          </div>

          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Component for Coaches & Staff Permissions
function CoachesSettings({ coaches, onAdd, onRemove }: { coaches: any[]; onAdd: (data: any) => void; onRemove: (id: string) => void }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setShowAddDialog(false);
    setFormData({ email: '', password: '', fullName: '' });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Coaches & Staff Permissions</CardTitle>
            <CardDescription>Manage coaches and their permissions</CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Coach
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Coach</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <Label htmlFor="coachEmail">Email</Label>
                  <Input
                    id="coachEmail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="coachPassword">Password</Label>
                  <Input
                    id="coachPassword"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="coachFullName">Full Name</Label>
                  <Input
                    id="coachFullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Coach</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {coaches.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No coaches added yet</p>
          ) : (
            coaches.map((coach) => (
              <div key={coach.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">{coach.profile?.fullName || 'Unknown'}</div>
                  <div className="text-sm text-gray-500">{coach.profile?.email}</div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Coach</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove {coach.profile?.fullName}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onRemove(coach.id)}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Component for Team Configuration Settings
function TeamConfigurationSettings({ teams, onUpdate }: { teams: any[]; onUpdate: (data: { teamId: string; data: any }) => void }) {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const selectedTeamData = teams.find((t) => t.id === selectedTeam);

  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    homeArena: '',
    teamColors: { primary: '#3B82F6', secondary: '#1E40AF' },
    category: '',
    coachCanManageLineups: true,
    coachCanEditInfo: true,
    coachCanUploadSubmissions: true,
    coachCanViewAnalytics: true,
    coachCanManageFinances: false,
  });

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId);
    const team = teams.find((t) => t.id === teamId);
    if (team) {
      setFormData({
        name: team.name || '',
        logoUrl: team.logoUrl || '',
        homeArena: team.homeArena || '',
        teamColors: team.teamColors || { primary: '#3B82F6', secondary: '#1E40AF' },
        category: team.category || '',
        coachCanManageLineups: team.coachCanManageLineups ?? true,
        coachCanEditInfo: team.coachCanEditInfo ?? true,
        coachCanUploadSubmissions: team.coachCanUploadSubmissions ?? true,
        coachCanViewAnalytics: team.coachCanViewAnalytics ?? true,
        coachCanManageFinances: team.coachCanManageFinances ?? false,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    onUpdate({ teamId: selectedTeam, data: formData });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Configuration Settings</CardTitle>
        <CardDescription>Manage team information and coach permissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Select Team</Label>
            <Select value={selectedTeam} onValueChange={handleTeamSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTeamData && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="teamLogo">Logo URL</Label>
                  <Input
                    id="teamLogo"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homeArena">Home Arena</Label>
                  <Input
                    id="homeArena"
                    value={formData.homeArena}
                    onChange={(e) => setFormData({ ...formData, homeArena: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Team Colors</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="primaryColor" className="text-xs">Primary</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.teamColors.primary}
                        onChange={(e) => setFormData({ ...formData, teamColors: { ...formData.teamColors, primary: e.target.value } })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.teamColors.primary}
                        onChange={(e) => setFormData({ ...formData, teamColors: { ...formData.teamColors, primary: e.target.value } })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor" className="text-xs">Secondary</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.teamColors.secondary}
                        onChange={(e) => setFormData({ ...formData, teamColors: { ...formData.teamColors, secondary: e.target.value } })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.teamColors.secondary}
                        onChange={(e) => setFormData({ ...formData, teamColors: { ...formData.teamColors, secondary: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-base font-semibold">Coach Permissions</Label>
                <div className="space-y-3 mt-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="manageLineups" className="font-normal">Manage Lineups</Label>
                    <Switch
                      id="manageLineups"
                      checked={formData.coachCanManageLineups}
                      onCheckedChange={(checked) => setFormData({ ...formData, coachCanManageLineups: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="editInfo" className="font-normal">Edit Team Info</Label>
                    <Switch
                      id="editInfo"
                      checked={formData.coachCanEditInfo}
                      onCheckedChange={(checked) => setFormData({ ...formData, coachCanEditInfo: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="uploadSubmissions" className="font-normal">Upload Match Submissions</Label>
                    <Switch
                      id="uploadSubmissions"
                      checked={formData.coachCanUploadSubmissions}
                      onCheckedChange={(checked) => setFormData({ ...formData, coachCanUploadSubmissions: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="viewAnalytics" className="font-normal">View League Analytics</Label>
                    <Switch
                      id="viewAnalytics"
                      checked={formData.coachCanViewAnalytics}
                      onCheckedChange={(checked) => setFormData({ ...formData, coachCanViewAnalytics: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="manageFinances" className="font-normal">Manage Internal Finances</Label>
                    <Switch
                      id="manageFinances"
                      checked={formData.coachCanManageFinances}
                      onCheckedChange={(checked) => setFormData({ ...formData, coachCanManageFinances: checked })}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                Save Team Settings
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Component for Sponsorship & Arena Settings
function SponsorshipArenaSettings({
  sponsorships,
  arenaApplications,
  onCreateSponsorship,
  onUpdateSponsorship,
  onCreateArena,
}: {
  sponsorships: any[];
  arenaApplications: any[];
  onCreateSponsorship: (data: any) => void;
  onUpdateSponsorship: (data: { id: string; status: string }) => void;
  onCreateArena: (data: any) => void;
}) {
  const [showSponsorshipDialog, setShowSponsorshipDialog] = useState(false);
  const [sponsorshipForm, setSponsorshipForm] = useState({
    sponsorName: '',
    sponsorType: 'league_wide',
    proposalUrl: '',
    offerDetails: '',
  });

  const handleCreateSponsorship = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSponsorship(sponsorshipForm);
    setShowSponsorshipDialog(false);
    setSponsorshipForm({ sponsorName: '', sponsorType: 'league_wide', proposalUrl: '', offerDetails: '' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary' as const, icon: Clock },
      approved: { variant: 'default' as const, icon: CheckCircle2 },
      rejected: { variant: 'destructive' as const, icon: XCircle },
      active: { variant: 'default' as const, icon: CheckCircle2 },
    };
    const { variant, icon: Icon } = variants[status] || variants.pending;
    return (
      <Badge variant={variant}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Sponsorships */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sponsorship Settings</CardTitle>
              <CardDescription>Manage sponsorship opportunities and applications</CardDescription>
            </div>
            <Dialog open={showSponsorshipDialog} onOpenChange={setShowSponsorshipDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Apply for Sponsorship
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply for Sponsorship</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSponsorship} className="space-y-4">
                  <div>
                    <Label htmlFor="sponsorName">Sponsor Name</Label>
                    <Input
                      id="sponsorName"
                      value={sponsorshipForm.sponsorName}
                      onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, sponsorName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sponsorType">Sponsor Type</Label>
                    <Select value={sponsorshipForm.sponsorType} onValueChange={(value) => setSponsorshipForm({ ...sponsorshipForm, sponsorType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="league_wide">League-wide Opportunity</SelectItem>
                        <SelectItem value="direct_offer">Direct Offer to School</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="proposalUrl">Proposal URL</Label>
                    <Input
                      id="proposalUrl"
                      value={sponsorshipForm.proposalUrl}
                      onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, proposalUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="offerDetails">Offer Details</Label>
                    <Textarea
                      id="offerDetails"
                      value={sponsorshipForm.offerDetails}
                      onChange={(e) => setSponsorshipForm({ ...sponsorshipForm, offerDetails: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowSponsorshipDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Submit Application</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sponsorships.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No sponsorships yet</p>
            ) : (
              sponsorships.map((sponsorship) => (
                <div key={sponsorship.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">{sponsorship.sponsorName}</div>
                    <div className="text-sm text-gray-500">{sponsorship.sponsorType}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(sponsorship.status)}
                    {sponsorship.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateSponsorship({ id: sponsorship.id, status: 'approved' })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onUpdateSponsorship({ id: sponsorship.id, status: 'rejected' })}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Arena Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Arena Settings</CardTitle>
          <CardDescription>Apply to host matches in your school arena</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {arenaApplications.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No arena applications yet</p>
            ) : (
              arenaApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">{app.arena?.name || 'Arena'}</div>
                    <div className="text-sm text-gray-500">Capacity: {app.arena?.capacity || 'N/A'}</div>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Component for Finance & Transactions Settings
function FinanceSettings({
  finances,
  teams,
  onCreate,
  onUpdate,
}: {
  finances: any[];
  teams: any[];
  onCreate: (data: any) => void;
  onUpdate: (data: { id: string; data: any }) => void;
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: 'registration_fee',
    amount: '',
    description: '',
    status: 'pending',
    dueDate: '',
    teamId: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    setShowCreateDialog(false);
    setFormData({ type: 'registration_fee', amount: '', description: '', status: 'pending', dueDate: '', teamId: '' });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary' as const },
      paid: { variant: 'default' as const },
      due: { variant: 'destructive' as const },
      overdue: { variant: 'destructive' as const },
    };
    return <Badge variant={variants[status]?.variant || 'secondary'}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Finance & Transactions</CardTitle>
            <CardDescription>Track registration fees, payments, and expenses</CardDescription>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Finance Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Finance Record</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="financeType">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="registration_fee">Registration Fee</SelectItem>
                      <SelectItem value="sponsorship_revenue">Sponsorship Revenue</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="teamId">Team (Optional)</Label>
                  <Select value={formData.teamId} onValueChange={(value) => setFormData({ ...formData, teamId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {finances.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No finance records yet</p>
          ) : (
            finances.map((finance) => (
              <div key={finance.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">{finance.type.replace('_', ' ')}</div>
                  <div className="text-sm text-gray-500">
                    ${parseFloat(finance.amount).toFixed(2)} • {finance.team?.name || 'School-wide'}
                  </div>
                  {finance.description && <div className="text-sm text-gray-400 mt-1">{finance.description}</div>}
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(finance.status)}
                  {finance.status !== 'paid' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdate({ id: finance.id, data: { status: 'paid' } })}
                    >
                      Mark Paid
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Component for Notification Settings
function NotificationSettings({
  notifications,
  onUpdate,
}: {
  notifications: any[];
  onUpdate: (data: any) => void;
}) {
  const notificationTypes = [
    { value: 'match_deadline', label: 'Match Lineup Deadlines' },
    { value: 'submission_deadline', label: 'Submission Deadlines' },
    { value: 'sponsorship', label: 'Sponsorship Responses' },
    { value: 'arena', label: 'Arena Application Updates' },
    { value: 'league_announcement', label: 'League Announcements' },
    { value: 'coach_change', label: 'Coach Changes' },
  ];

  const getNotificationSetting = (type: string) => {
    return notifications.find((n) => n.notificationType === type) || {
      notificationType: type,
      channel: 'email',
      enabled: true,
      urgencyLevel: 'medium',
    };
  };

  const handleUpdate = (type: string, field: string, value: any) => {
    const current = getNotificationSetting(type);
    onUpdate({
      notificationType: type,
      channel: field === 'channel' ? value : current.channel,
      enabled: field === 'enabled' ? value : current.enabled,
      urgencyLevel: field === 'urgencyLevel' ? value : current.urgencyLevel,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication & Notification Settings</CardTitle>
        <CardDescription>Configure how you receive alerts and notifications</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {notificationTypes.map((type) => {
            const setting = getNotificationSetting(type.value);
            return (
              <div key={type.value} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">{type.label}</Label>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={(checked) => handleUpdate(type.value, 'enabled', checked)}
                  />
                </div>
                {setting.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Channel</Label>
                      <Select
                        value={setting.channel}
                        onValueChange={(value) => handleUpdate(type.value, 'channel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="in_app">In-App</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Urgency Level</Label>
                      <Select
                        value={setting.urgencyLevel || 'medium'}
                        onValueChange={(value) => handleUpdate(type.value, 'urgencyLevel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Component for Customization Settings
function CustomizationSettings({ profile, onUpdate }: { profile: any; onUpdate: (data: any) => void }) {
  const [formData, setFormData] = useState({
    anthemUrl: profile?.anthemUrl || '',
    description: profile?.description || '',
    achievements: profile?.achievements || [],
  });

  const [newAchievement, setNewAchievement] = useState({ title: '', year: '', description: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleAddAchievement = () => {
    if (newAchievement.title) {
      setFormData({
        ...formData,
        achievements: [...formData.achievements, newAchievement],
      });
      setNewAchievement({ title: '', year: '', description: '' });
    }
  };

  const handleRemoveAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements.filter((_, i) => i !== index),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customization Settings</CardTitle>
        <CardDescription>Add premium features to enhance your school's presence</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="anthemUrl">School Anthem / Intro Clip URL</Label>
            <Input
              id="anthemUrl"
              value={formData.anthemUrl}
              onChange={(e) => setFormData({ ...formData, anthemUrl: e.target.value })}
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500 mt-1">Used for match ceremonies</p>
          </div>

          <div>
            <Label htmlFor="description">School Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Describe your school for league public pages..."
            />
          </div>

          <div>
            <Label>Historical Achievements & Trophies</Label>
            <div className="space-y-3 mt-2">
              {formData.achievements.map((achievement: any, index: number) => (
                <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-semibold">{achievement.title}</div>
                    {achievement.year && <div className="text-sm text-gray-500">{achievement.year}</div>}
                    {achievement.description && <div className="text-sm text-gray-400 mt-1">{achievement.description}</div>}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAchievement(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="border rounded-lg p-3 space-y-2">
                <Input
                  placeholder="Achievement Title"
                  value={newAchievement.title}
                  onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Year"
                    value={newAchievement.year}
                    onChange={(e) => setNewAchievement({ ...newAchievement, year: e.target.value })}
                  />
                  <Button type="button" onClick={handleAddAchievement}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <Textarea
                  placeholder="Description (optional)"
                  value={newAchievement.description}
                  onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>

          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Customization
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

