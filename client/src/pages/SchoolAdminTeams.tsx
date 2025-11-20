/**
 * School Admin - Teams Management Page
 * Enhanced with all team management features:
 * - Create team with tier, coach, and players (max 4)
 * - Delete team
 * - Remove, add, swap players
 * - Add comments/feedback
 * - Remove/swap coach
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  UsersRound, 
  Plus,
  User,
  Crown,
  Settings,
  Trash2,
  MessageSquare,
  UserPlus,
  UserMinus,
  Repeat,
  UserX,
  UserCheck,
  Edit,
  X,
  CheckCircle2,
} from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import { 
  getSchoolTeams, 
  createTeam, 
  addTeamMember,
  deleteTeam,
  removeTeamMember,
  swapTeamMember,
  swapPlayersBetweenTeams,
  assignCoach,
  removeCoach,
  swapCoach,
  addTeamFeedback,
  getTeamFeedback,
  getSchoolCoaches,
  getSchoolStudents,
  getReservePlayers,
} from '@/api/schoolAdmin';
import { useToast } from '@/hooks/use-toast';
import { SchoolAdminLayout } from '@/components/SchoolAdminLayout';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const TIER_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'amateur', label: 'Amateur' },
  { value: 'regular', label: 'Regular' },
  { value: 'professional', label: 'Professional' },
  { value: 'legendary', label: 'Legendary' },
  { value: 'national', label: 'National' },
];

export default function SchoolAdminTeams() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Dialog states
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showSwapMember, setShowSwapMember] = useState(false);
  const [showSwapReserve, setShowSwapReserve] = useState(false);
  const [showSwapBetweenTeams, setShowSwapBetweenTeams] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showDeleteTeam, setShowDeleteTeam] = useState(false);
  const [showRemoveCoach, setShowRemoveCoach] = useState(false);
  const [showAssignCoach, setShowAssignCoach] = useState(false);
  const [showSwapCoach, setShowSwapCoach] = useState(false);
  const [showReservePlayers, setShowReservePlayers] = useState(false);
  
  // Selected team state
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedSourceTeam, setSelectedSourceTeam] = useState<any>(null);
  const [selectedSourceMember, setSelectedSourceMember] = useState<any>(null);
  const [selectedTargetMember, setSelectedTargetMember] = useState<any>(null);
  
  // Form states
  const [teamName, setTeamName] = useState('');
  const [teamTier, setTeamTier] = useState('beginner');
  const [selectedCoachId, setSelectedCoachId] = useState<string>('');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackIsPublic, setFeedbackIsPublic] = useState(true);

  // Fetch teams
  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ['schoolTeams'],
    queryFn: () => getSchoolTeams(),
    enabled: !!user && user.role === 'school_admin',
  });

  // Fetch coaches
  const { data: coaches } = useQuery({
    queryKey: ['schoolCoaches'],
    queryFn: () => getSchoolCoaches(),
    enabled: !!user && user.role === 'school_admin',
  });

  // Fetch students
  const { data: studentsData } = useQuery({
    queryKey: ['schoolStudents', 'all'],
    queryFn: () => getSchoolStudents({ page: 1, limit: 100 }),
    enabled: !!user && user.role === 'school_admin',
  });

  // Fetch reserve players
  const { data: reservePlayers } = useQuery({
    queryKey: ['reservePlayers'],
    queryFn: () => getReservePlayers(),
    enabled: !!user && user.role === 'school_admin',
  });

  // Fetch team feedback
  const { data: teamFeedback } = useQuery({
    queryKey: ['teamFeedback', selectedTeam?.id],
    queryFn: () => getTeamFeedback(selectedTeam?.id),
    enabled: !!selectedTeam && showFeedback,
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: (data: any) => createTeam(data),
    onSuccess: () => {
      toast({
        title: 'Team Created',
        description: 'The team has been successfully created.',
      });
      queryClient.invalidateQueries({ queryKey: ['schoolTeams'] });
      setShowCreateTeam(false);
      resetCreateTeamForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create team',
        variant: 'destructive',
      });
    },
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: (teamId: string) => deleteTeam(teamId),
    onSuccess: () => {
      toast({
        title: 'Team Deleted',
        description: 'The team has been successfully deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['schoolTeams'] });
      setShowDeleteTeam(false);
      setSelectedTeam(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete team',
        variant: 'destructive',
      });
    },
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: any }) => addTeamMember(teamId, data),
    onSuccess: () => {
      toast({
        title: 'Member Added',
        description: 'The student has been added to the team.',
      });
      queryClient.invalidateQueries({ queryKey: ['schoolTeams'] });
      setShowAddMember(false);
      setSelectedTeam(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to add team member',
        variant: 'destructive',
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: ({ teamId, memberId }: { teamId: string; memberId: string }) => removeTeamMember(teamId, memberId),
    onSuccess: () => {
      toast({
        title: 'Member Removed',
        description: 'The student has been removed from the team.',
      });
      queryClient.invalidateQueries({ queryKey: ['schoolTeams'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to remove team member',
        variant: 'destructive',
      });
    },
  });

  // Swap member mutation (with reserve or inter-team)
  const swapMemberMutation = useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: any }) => swapTeamMember(teamId, data),
    onSuccess: () => {
      toast({
        title: 'Member Swapped',
        description: 'The team member has been swapped successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['schoolTeams'] });
      queryClient.invalidateQueries({ queryKey: ['reservePlayers'] });
      setShowSwapMember(false);
      setShowSwapReserve(false);
      setSelectedTeam(null);
      setSelectedMember(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to swap team member',
        variant: 'destructive',
      });
    },
  });

  // Swap between teams mutation
  const swapBetweenTeamsMutation = useMutation({
    mutationFn: (data: any) => swapPlayersBetweenTeams(data),
    onSuccess: () => {
      toast({
        title: 'Players Swapped',
        description: 'Players have been swapped between teams successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['schoolTeams'] });
      setShowSwapBetweenTeams(false);
      setSelectedTeam(null);
      setSelectedSourceTeam(null);
      setSelectedSourceMember(null);
      setSelectedTargetMember(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to swap players between teams',
        variant: 'destructive',
      });
    },
  });

  // Assign coach mutation
  const assignCoachMutation = useMutation({
    mutationFn: ({ teamId, coachId }: { teamId: string; coachId: string }) => assignCoach(teamId, coachId),
    onSuccess: () => {
      toast({
        title: 'Coach Assigned',
        description: 'The coach has been assigned to the team.',
      });
      queryClient.invalidateQueries({ queryKey: ['schoolTeams'] });
      setShowAssignCoach(false);
      setShowSwapCoach(false);
      setSelectedTeam(null);
      setSelectedCoachId('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to assign coach',
        variant: 'destructive',
      });
    },
  });

  // Remove coach mutation
  const removeCoachMutation = useMutation({
    mutationFn: (teamId: string) => removeCoach(teamId),
    onSuccess: () => {
      toast({
        title: 'Coach Removed',
        description: 'The coach has been removed from the team.',
      });
      queryClient.invalidateQueries({ queryKey: ['schoolTeams'] });
      setShowRemoveCoach(false);
      setSelectedTeam(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to remove coach',
        variant: 'destructive',
      });
    },
  });

  // Swap coach mutation
  const swapCoachMutation = useMutation({
    mutationFn: ({ teamId, coachId }: { teamId: string; coachId: string }) => swapCoach(teamId, coachId),
    onSuccess: () => {
      toast({
        title: 'Coach Swapped',
        description: 'The coach has been swapped successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['schoolTeams'] });
      setShowSwapCoach(false);
      setSelectedTeam(null);
      setSelectedCoachId('');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to swap coach',
        variant: 'destructive',
      });
    },
  });

  // Add feedback mutation
  const addFeedbackMutation = useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: any }) => addTeamFeedback(teamId, data),
    onSuccess: () => {
      toast({
        title: 'Feedback Added',
        description: 'Your feedback has been added to the team.',
      });
      queryClient.invalidateQueries({ queryKey: ['teamFeedback', selectedTeam?.id] });
      queryClient.invalidateQueries({ queryKey: ['schoolTeams'] });
      setFeedbackMessage('');
      setFeedbackIsPublic(true);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to add feedback',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const resetCreateTeamForm = () => {
    setTeamName('');
    setTeamTier('beginner');
    setSelectedCoachId('');
    setSelectedPlayerIds([]);
  };

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      toast({
        title: 'Error',
        description: 'Team name is required',
        variant: 'destructive',
      });
      return;
    }

    if (selectedPlayerIds.length > 4) {
      toast({
        title: 'Error',
        description: 'Maximum 4 players allowed per team',
        variant: 'destructive',
      });
      return;
    }

    createTeamMutation.mutate({
      name: teamName.trim(),
      tier: teamTier,
      coachId: selectedCoachId && selectedCoachId !== "none" ? selectedCoachId : undefined,
      playerIds: selectedPlayerIds.length > 0 ? selectedPlayerIds : undefined,
    });
  };

  const handleDeleteTeam = () => {
    if (!selectedTeam) return;
    deleteTeamMutation.mutate(selectedTeam.id);
  };

  const handleAddMember = (studentId: string) => {
    if (!selectedTeam) return;
    addMemberMutation.mutate({
      teamId: selectedTeam.id,
      data: { studentId },
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!selectedTeam) return;
    removeMemberMutation.mutate({
      teamId: selectedTeam.id,
      memberId,
    });
  };

  const handleSwapMember = (addPlayerId: string, isReserve: boolean = false) => {
    if (!selectedTeam || !selectedMember) return;
    swapMemberMutation.mutate({
      teamId: selectedTeam.id,
      data: {
        removeMemberId: selectedMember.id,
        addPlayerId,
        sourceTeamId: isReserve ? undefined : selectedTeam.id, // undefined for reserve swap
      },
    });
  };

  const handleSwapBetweenTeams = () => {
    if (!selectedSourceTeam || !selectedTeam || !selectedSourceMember || !selectedTargetMember) {
      toast({
        title: 'Error',
        description: 'Please select both teams and players to swap',
        variant: 'destructive',
      });
      return;
    }

    if (selectedSourceTeam.id === selectedTeam.id) {
      toast({
        title: 'Error',
        description: 'Source and target teams must be different',
        variant: 'destructive',
      });
      return;
    }

    swapBetweenTeamsMutation.mutate({
      sourceTeamId: selectedSourceTeam.id,
      targetTeamId: selectedTeam.id,
      sourceMemberId: selectedSourceMember.id,
      targetMemberId: selectedTargetMember.id,
    });
  };

  const handleAssignCoach = () => {
    if (!selectedTeam || !selectedCoachId) return;
    assignCoachMutation.mutate({
      teamId: selectedTeam.id,
      coachId: selectedCoachId,
    });
  };

  const handleRemoveCoach = () => {
    if (!selectedTeam) return;
    removeCoachMutation.mutate(selectedTeam.id);
  };

  const handleSwapCoach = () => {
    if (!selectedTeam || !selectedCoachId) return;
    swapCoachMutation.mutate({
      teamId: selectedTeam.id,
      coachId: selectedCoachId,
    });
  };

  const handleAddFeedback = () => {
    if (!selectedTeam || !feedbackMessage.trim()) return;
    addFeedbackMutation.mutate({
      teamId: selectedTeam.id,
      data: {
        message: feedbackMessage.trim(),
        isPublic: feedbackIsPublic,
      },
    });
  };

  // Get available students (not in any team or available for swapping)
  const availableStudents = useMemo(() => {
    if (!studentsData?.students) return [];
    return studentsData.students.filter((student: any) => {
      // Check if student is already in a team
      const inTeam = teams?.some((team: any) =>
        team.members?.some((member: any) => member.playerId === student.id)
      );
      return !inTeam;
    });
  }, [studentsData?.students, teams]);

  // Get students available for swapping (excluding current team members)
  const availableStudentsForSwap = useMemo(() => {
    if (!studentsData?.students || !selectedTeam) return [];
    return studentsData.students.filter((student: any) => {
      // Check if student is in the selected team
      const inSelectedTeam = selectedTeam.members?.some(
        (member: any) => member.playerId === student.id
      );
      // Check if student is in another team
      const inOtherTeam = teams?.some((team: any) =>
        team.id !== selectedTeam.id &&
        team.members?.some((member: any) => member.playerId === student.id)
      );
      return !inSelectedTeam && !inOtherTeam;
    });
  }, [studentsData?.students, teams, selectedTeam]);

  return (
    <SchoolAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teams Management</h1>
            <p className="text-gray-600 mt-1">Manage teams, coaches, and players</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowReservePlayers(true)}
            >
              <User className="h-4 w-4 mr-2" />
              Reserve Players ({reservePlayers?.length || 0})
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowSwapBetweenTeams(true)}
            >
              <Repeat className="h-4 w-4 mr-2" />
              Swap Between Teams
            </Button>
            <Button onClick={() => setShowCreateTeam(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </div>
        </div>

        {/* Teams Grid */}
        {teamsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          </div>
        ) : teams && teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team: any) => (
              <Card key={team.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <UsersRound className="h-5 w-5 text-blue-600" />
                      {team.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{team.tier}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowDeleteTeam(true);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {team.coach && (
                    <div className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold">Coach:</span>{' '}
                      {team.coach.profile?.fullName || 'Unknown'}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Members */}
                    <div>
                      <div className="text-sm text-gray-500 mb-2 flex items-center justify-between">
                        <span>Members ({team.members?.length || 0}/4)</span>
                        {(!team.members || team.members.length < 4) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowAddMember(true);
                            }}
                            className="h-6 text-xs"
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                      <div className="space-y-1">
                        {team.members && team.members.length > 0 ? (
                          team.members.map((member: any) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded group"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {team.captainId === member.playerId && (
                                  <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                )}
                                <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm truncate">
                                  {member.player?.fullName || 'Unknown'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTeam(team);
                                    setSelectedMember(member);
                                    setShowSwapReserve(true);
                                  }}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Swap with reserve"
                                >
                                  <Repeat className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                                  title="Remove player"
                                >
                                  <UserMinus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-400 italic">No members yet</div>
                        )}
                      </div>
                    </div>

                    {/* Coach Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      {team.coach ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowSwapCoach(true);
                            }}
                            className="flex-1"
                          >
                            <Repeat className="h-4 w-4 mr-1" />
                            Swap Coach
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTeam(team);
                              setShowRemoveCoach(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTeam(team);
                            setShowAssignCoach(true);
                          }}
                          className="flex-1"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign Coach
                        </Button>
                      )}
                    </div>

                    {/* Feedback Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowFeedback(true);
                      }}
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Feedback ({team.teamFeedback?.length || 0})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <UsersRound className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 text-lg mb-2">No teams yet</p>
              <p className="text-gray-500 text-sm mb-4">Create your first team to get started</p>
              <Button onClick={() => setShowCreateTeam(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Team Dialog */}
        <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>Create a new team with tier, coach, and players</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="teamTier">Tier *</Label>
                <Select value={teamTier} onValueChange={setTeamTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIER_OPTIONS.map((tier) => (
                      <SelectItem key={tier.value} value={tier.value}>
                        {tier.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coach">Coach (Optional)</Label>
                <Select 
                  value={selectedCoachId || "none"} 
                  onValueChange={(value) => setSelectedCoachId(value === "none" ? "" : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select coach" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {coaches?.map((coach: any) => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.profile?.fullName || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Players (Maximum 4)</Label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                  {availableStudents.length > 0 ? (
                    availableStudents.map((student: any) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-semibold text-sm">{student.fullName || student.email}</div>
                          <div className="text-xs text-gray-500">
                            {student.studentNumber || 'No student number'}
                          </div>
                        </div>
                        <Button
                          variant={selectedPlayerIds.includes(student.id) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            if (selectedPlayerIds.includes(student.id)) {
                              setSelectedPlayerIds(selectedPlayerIds.filter((id) => id !== student.id));
                            } else {
                              if (selectedPlayerIds.length < 4) {
                                setSelectedPlayerIds([...selectedPlayerIds, student.id]);
                              } else {
                                toast({
                                  title: 'Maximum reached',
                                  description: 'Maximum 4 players allowed per team',
                                  variant: 'destructive',
                                });
                              }
                            }
                          }}
                          disabled={!selectedPlayerIds.includes(student.id) && selectedPlayerIds.length >= 4}
                        >
                          {selectedPlayerIds.includes(student.id) ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Selected
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No available students</p>
                      <p className="text-sm mt-1">All students are already in teams</p>
                    </div>
                  )}
                </div>
                {selectedPlayerIds.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Selected: {selectedPlayerIds.length}/4 players
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCreateTeam(false);
                resetCreateTeamForm();
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam} disabled={createTeamMutation.isPending}>
                {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Select a student to add to {selectedTeam?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {availableStudents.length > 0 ? (
                <div className="space-y-2">
                  {availableStudents.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-semibold">{student.fullName || student.email}</div>
                        <div className="text-sm text-gray-500">
                          {student.studentNumber || 'No student number'}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddMember(student.id)}
                        disabled={addMemberMutation.isPending}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No available students to add</p>
                  <p className="text-sm mt-1">All students are already in teams</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddMember(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Swap with Reserve Player Dialog */}
        <Dialog open={showSwapReserve} onOpenChange={setShowSwapReserve}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Swap Team Member with Reserve Player</DialogTitle>
              <DialogDescription>
                Replace {selectedMember?.player?.fullName || 'this member'} from {selectedTeam?.name} with a reserve player
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reservePlayers && reservePlayers.length > 0 ? (
                <div className="space-y-2">
                  {reservePlayers
                    .filter((player: any) => {
                      // Check if player qualifies for team tier
                      const playerTier = player.qualifiedTier;
                      const teamTier = selectedTeam?.tier;
                      const tierOrder = ['beginner', 'amateur', 'regular', 'professional', 'legendary', 'national'];
                      const playerTierIndex = tierOrder.indexOf(playerTier);
                      const teamTierIndex = tierOrder.indexOf(teamTier);
                      return teamTier === 'beginner' || playerTierIndex >= teamTierIndex;
                    })
                    .map((player: any) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{player.fullName || player.email}</div>
                          <div className="text-sm text-gray-500">
                            XP: {player.xp || 0} • Tier: <Badge variant="outline">{player.qualifiedTier}</Badge>
                            {player.studentRole && ` • Role: ${player.studentRole}`}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSwapMember(player.id, true)}
                          disabled={swapMemberMutation.isPending}
                        >
                          <Repeat className="h-4 w-4 mr-1" />
                          Swap
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No reserve players available</p>
                  <p className="text-sm mt-1">All students are already in teams</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowSwapReserve(false);
                setSelectedMember(null);
              }}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reserve Players Dialog */}
        <Dialog open={showReservePlayers} onOpenChange={setShowReservePlayers}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Reserve Players</DialogTitle>
              <DialogDescription>
                Students not currently assigned to any team ({reservePlayers?.length || 0} available)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {reservePlayers && reservePlayers.length > 0 ? (
                <div className="space-y-2">
                  {reservePlayers.map((player: any) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{player.fullName || player.email}</div>
                        <div className="text-sm text-gray-500">
                          XP: {player.xp || 0} • Tier: <Badge variant="outline">{player.qualifiedTier}</Badge>
                          {player.studentRole && ` • Role: ${player.studentRole}`}
                          {player.age && ` • Age: ${player.age}`}
                          {player.grade && ` • Grade: ${player.grade}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No reserve players</p>
                  <p className="text-sm mt-1">All students are currently in teams</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReservePlayers(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Swap Between Teams Dialog */}
        <Dialog open={showSwapBetweenTeams} onOpenChange={setShowSwapBetweenTeams}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Swap Players Between Teams</DialogTitle>
              <DialogDescription>
                Select a player from each team to swap them
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {/* Source Team */}
              <div className="space-y-3">
                <Label>Source Team</Label>
                <Select
                  value={selectedSourceTeam?.id || ''}
                  onValueChange={(value) => {
                    const team = teams?.find((t: any) => t.id === value);
                    setSelectedSourceTeam(team || null);
                    setSelectedSourceMember(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.map((team: any) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.tier})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedSourceTeam && (
                  <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
                    <Label className="text-sm font-semibold">Select Player from {selectedSourceTeam.name}</Label>
                    {selectedSourceTeam.members && selectedSourceTeam.members.length > 0 ? (
                      <div className="space-y-2">
                        {selectedSourceTeam.members.map((member: any) => (
                          <div
                            key={member.id}
                            className={`flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-100 ${
                              selectedSourceMember?.id === member.id ? 'bg-blue-50 border-blue-500' : ''
                            }`}
                            onClick={() => setSelectedSourceMember(member)}
                          >
                            <div>
                              <div className="font-medium">{member.player?.fullName || 'Unknown'}</div>
                              {selectedSourceTeam.captainId === member.playerId && (
                                <Badge variant="outline" className="text-xs">Captain</Badge>
                              )}
                            </div>
                            {selectedSourceMember?.id === member.id && (
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No members in this team</p>
                    )}
                  </div>
                )}
              </div>

              {/* Target Team */}
              <div className="space-y-3">
                <Label>Target Team</Label>
                <Select
                  value={selectedTeam?.id || ''}
                  onValueChange={(value) => {
                    const team = teams?.find((t: any) => t.id === value);
                    setSelectedTeam(team || null);
                    setSelectedTargetMember(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.filter((t: any) => t.id !== selectedSourceTeam?.id).map((team: any) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} ({team.tier})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedTeam && selectedTeam.id !== selectedSourceTeam?.id && (
                  <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
                    <Label className="text-sm font-semibold">Select Player from {selectedTeam.name}</Label>
                    {selectedTeam.members && selectedTeam.members.length > 0 ? (
                      <div className="space-y-2">
                        {selectedTeam.members.map((member: any) => (
                          <div
                            key={member.id}
                            className={`flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-100 ${
                              selectedTargetMember?.id === member.id ? 'bg-blue-50 border-blue-500' : ''
                            }`}
                            onClick={() => setSelectedTargetMember(member)}
                          >
                            <div>
                              <div className="font-medium">{member.player?.fullName || 'Unknown'}</div>
                              {selectedTeam.captainId === member.playerId && (
                                <Badge variant="outline" className="text-xs">Captain</Badge>
                              )}
                            </div>
                            {selectedTargetMember?.id === member.id && (
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No members in this team</p>
                    )}
                  </div>
                )}
              </div>

              {selectedSourceTeam && selectedTeam && selectedSourceTeam.id === selectedTeam.id && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Please select different teams for swapping
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowSwapBetweenTeams(false);
                // Don't clear selectedTeam here, it might be used elsewhere
                setSelectedSourceTeam(null);
                setSelectedSourceMember(null);
                setSelectedTargetMember(null);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSwapBetweenTeams}
                disabled={
                  !selectedSourceTeam || 
                  !selectedTeam || 
                  !selectedSourceMember || 
                  !selectedTargetMember ||
                  selectedSourceTeam.id === selectedTeam.id ||
                  swapBetweenTeamsMutation.isPending
                }
              >
                <Repeat className="h-4 w-4 mr-2" />
                {swapBetweenTeamsMutation.isPending ? 'Swapping...' : 'Swap Players'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Coach Dialog */}
        <Dialog open={showAssignCoach} onOpenChange={setShowAssignCoach}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Coach</DialogTitle>
              <DialogDescription>
                Assign a coach to {selectedTeam?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Coach</Label>
                <Select 
                  value={selectedCoachId || undefined} 
                  onValueChange={setSelectedCoachId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select coach" />
                  </SelectTrigger>
                  <SelectContent>
                    {coaches?.map((coach: any) => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.profile?.fullName || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowAssignCoach(false);
                setSelectedCoachId('');
              }}>
                Cancel
              </Button>
              <Button onClick={handleAssignCoach} disabled={!selectedCoachId || assignCoachMutation.isPending}>
                {assignCoachMutation.isPending ? 'Assigning...' : 'Assign Coach'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Swap Coach Dialog */}
        <Dialog open={showSwapCoach} onOpenChange={setShowSwapCoach}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Swap Coach</DialogTitle>
              <DialogDescription>
                Replace current coach with a new coach for {selectedTeam?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTeam?.coach && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Current Coach:</div>
                  <div className="font-semibold">{selectedTeam.coach.profile?.fullName || 'Unknown'}</div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Select New Coach</Label>
                <Select 
                  value={selectedCoachId || undefined} 
                  onValueChange={setSelectedCoachId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select coach" />
                  </SelectTrigger>
                  <SelectContent>
                    {coaches?.filter((coach: any) => coach.id !== selectedTeam?.coachId).map((coach: any) => (
                      <SelectItem key={coach.id} value={coach.id}>
                        {coach.profile?.fullName || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowSwapCoach(false);
                setSelectedCoachId('');
              }}>
                Cancel
              </Button>
              <Button onClick={handleSwapCoach} disabled={!selectedCoachId || swapCoachMutation.isPending}>
                {swapCoachMutation.isPending ? 'Swapping...' : 'Swap Coach'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Feedback Dialog */}
        <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Team Feedback</DialogTitle>
              <DialogDescription>
                View and add feedback for {selectedTeam?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Add Feedback Form */}
              <div className="space-y-2 border-b pb-4">
                <Label>Add Feedback</Label>
                <Textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Enter your feedback or comment..."
                  rows={3}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={feedbackIsPublic}
                    onChange={(e) => setFeedbackIsPublic(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="isPublic" className="text-sm font-normal">
                    Public (visible to team members)
                  </Label>
                </div>
                <Button onClick={handleAddFeedback} disabled={!feedbackMessage.trim() || addFeedbackMutation.isPending}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {addFeedbackMutation.isPending ? 'Adding...' : 'Add Feedback'}
                </Button>
              </div>

              {/* Feedback List */}
              <div className="space-y-3">
                <Label>Previous Feedback</Label>
                {teamFeedback && teamFeedback.length > 0 ? (
                  teamFeedback.map((feedback: any) => (
                    <Card key={feedback.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-semibold text-sm">{feedback.author?.fullName || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(feedback.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          {feedback.isPublic && (
                            <Badge variant="outline" className="text-xs">Public</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{feedback.message}</p>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No feedback yet</p>
                    <p className="text-sm mt-1">Be the first to add feedback</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFeedback(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Team Confirmation */}
        <AlertDialog open={showDeleteTeam} onOpenChange={setShowDeleteTeam}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Team</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedTeam?.name}"? This action cannot be undone.
                All team members and feedback will be removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTeam}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Remove Coach Confirmation */}
        <AlertDialog open={showRemoveCoach} onOpenChange={setShowRemoveCoach}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Coach</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove the coach from "{selectedTeam?.name}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveCoach}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SchoolAdminLayout>
  );
}
