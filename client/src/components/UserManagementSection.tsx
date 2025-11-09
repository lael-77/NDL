import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { dashboardApi } from "@/api/dashboard";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, UserX, School } from "lucide-react";

interface UserManagementSectionProps {
  title: string;
  users: any[];
  role: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  refetchUsers: () => void;
  ChangeRoleForm: any;
  ChangeSchoolForm: any;
}

export const UserManagementSection = ({
  title,
  users,
  role,
  searchQuery,
  onSearchChange,
  refetchUsers,
  ChangeRoleForm,
  ChangeSchoolForm,
}: UserManagementSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getSchoolName = (user: any) => {
    if (user.role === 'player') return user.studentSchool?.name;
    if (user.role === 'school_admin') return user.school?.name;
    if (user.role === 'coach') return user.coachProfile?.school?.name;
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="text-muted-foreground mt-1">Manage all {role}s in the league ({users.length} total)</p>
        </div>
        <Input
          placeholder={`Search ${role}s...`}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="space-y-4">
        {users
          .filter((u: any) => {
            const schoolName = getSchoolName(u);
            return (
              u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              schoolName?.toLowerCase().includes(searchQuery.toLowerCase())
            );
          })
          .map((user: any) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{user.fullName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge>{user.role}</Badge>
                      {getSchoolName(user) && (
                        <Badge variant="outline">{getSchoolName(user)}</Badge>
                      )}
                      {user.studentRole && (
                        <Badge variant="secondary">{user.studentRole}</Badge>
                      )}
                      {user.teamMembers?.[0]?.team && (
                        <Badge variant="outline">{user.teamMembers[0].team.name}</Badge>
                      )}
                    </div>
                    {user.role === 'player' && (
                      <div className="text-xs text-muted-foreground mt-2">
                        XP: {user.xp || 0} • Age: {user.age || "N/A"} • Grade: {user.grade || "N/A"}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Edit className="mr-2 h-4 w-4" />
                          Change Role
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Change User Role</DialogTitle>
                        </DialogHeader>
                        <ChangeRoleForm 
                          user={user} 
                          onSuccess={() => {
                            refetchUsers();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          }} 
                        />
                      </DialogContent>
                    </Dialog>
                    {(user.role === 'player' || user.role === 'coach' || user.role === 'school_admin') && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <School className="mr-2 h-4 w-4" />
                            Change School
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Change User School</DialogTitle>
                          </DialogHeader>
                          <ChangeSchoolForm 
                            user={user} 
                            onSuccess={() => {
                              refetchUsers();
                              queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                            }} 
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (confirm(`Remove ${user.fullName} from ${user.role} role?`)) {
                          try {
                            await adminApi.removeFromRole(user.id);
                            toast({
                              title: "Success",
                              description: "User removed from role successfully",
                            });
                            refetchUsers();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          } catch (error: any) {
                            toast({
                              title: "Error",
                              description: error.response?.data?.error || "Failed to remove user from role",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Remove Role
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (confirm(`Are you sure you want to delete ${user.fullName}?`)) {
                          try {
                            await adminApi.deleteUser(user.id);
                            toast({
                              title: "Success",
                              description: "User deleted successfully",
                            });
                            refetchUsers();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          } catch (error: any) {
                            toast({
                              title: "Error",
                              description: error.response?.data?.error || "Failed to delete user",
                              variant: "destructive",
                            });
                          }
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};

