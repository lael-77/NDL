import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useAuthStore from "@/store/useAuthStore";
import useMatchesStore from "@/store/useMatchesStore";
import { teamsApi } from "@/api/teams";
import { leaderboardApi } from "@/api/leaderboard";
import { dashboardApi } from "@/api/dashboard";
import { adminApi } from "@/api/admin";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Home, Users, Building2, Calendar, Gavel, DollarSign, 
  GraduationCap, Settings, Search, Plus, CheckCircle, 
  XCircle, TrendingUp, Trophy, BarChart3, Bell, 
  FileText, Target, ArrowUp, ArrowDown, Eye, EyeOff,
  Edit, Trash2, UserX, School, Send, MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axios from "@/api/axios";

// Create Admin Form Component
const CreateAdminForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/auth/create-admin', {
        email,
        password,
        fullName,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Success",
        description: response.data.message || "Admin account created successfully",
      });

      // Reset form
      setEmail("");
      setPassword("");
      setFullName("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create admin account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreateAdmin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="adminEmail">Email</Label>
        <Input
          id="adminEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="admin@ndl.rw"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminFullName">Full Name</Label>
        <Input
          id="adminFullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="League Administrator"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="adminPassword">Password</Label>
        <div className="relative">
          <Input
            id="adminPassword"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
            minLength={6}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create Admin Account"}
      </Button>
    </form>
  );
};

// Create User Form Component
const CreateUserForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("player");
  const [schoolId, setSchoolId] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [studentRole, setStudentRole] = useState("Developer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: dashboardData } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const response = await dashboardApi.getAdminDashboard();
      return response.data;
    },
  });

  const schools = dashboardData?.schools || [];

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminApi.createUser({
        email,
        password,
        fullName,
        role,
        schoolId: role === 'school_admin' || role === 'coach' ? schoolId : undefined,
        age: role === 'player' ? parseInt(age) : undefined,
        grade: role === 'player' ? parseInt(grade) : undefined,
        studentRole: role === 'player' ? studentRole : undefined,
      });

      toast({
        title: "Success",
        description: "User created successfully",
      });

      // Reset form
      setEmail("");
      setPassword("");
      setFullName("");
      setRole("player");
      setSchoolId("");
      setAge("");
      setGrade("");
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreateUser} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="userEmail">Email</Label>
        <Input
          id="userEmail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="user@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="userFullName">Full Name</Label>
        <Input
          id="userFullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          placeholder="Full Name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="userRole">Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="player">Player</SelectItem>
            <SelectItem value="coach">Coach</SelectItem>
            <SelectItem value="judge">Judge</SelectItem>
            <SelectItem value="sponsor">Sponsor</SelectItem>
            <SelectItem value="school_admin">School Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(role === 'school_admin' || role === 'coach') && (
        <div className="space-y-2">
          <Label htmlFor="userSchool">School</Label>
          <Select value={schoolId} onValueChange={setSchoolId}>
            <SelectTrigger>
              <SelectValue placeholder="Select school" />
            </SelectTrigger>
            <SelectContent>
              {schools.map((school: any) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {role === 'player' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="userAge">Age</Label>
            <Input
              id="userAge"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userGrade">Grade</Label>
            <Input
              id="userGrade"
              type="number"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="Grade"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userStudentRole">Student Role</Label>
            <Select value={studentRole} onValueChange={setStudentRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Developer">Developer</SelectItem>
                <SelectItem value="Designer">Designer</SelectItem>
                <SelectItem value="Strategist">Strategist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor="userPassword">Password</Label>
        <div className="relative">
          <Input
            id="userPassword"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter password"
            minLength={6}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
};

// Create School Form Component
const CreateSchoolForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [tier, setTier] = useState("beginner");
  const [motto, setMotto] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminApi.createSchool({
        name,
        location: location || undefined,
        tier,
        motto: motto || undefined,
        sponsor: sponsor || undefined,
      });

      toast({
        title: "Success",
        description: "School created successfully",
      });

      setName("");
      setLocation("");
      setTier("beginner");
      setMotto("");
      setSponsor("");
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create school",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreateSchool} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="schoolName">School Name *</Label>
        <Input
          id="schoolName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="School name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="schoolLocation">Location</Label>
        <Input
          id="schoolLocation"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, Country"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="schoolTier">Tier</Label>
        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="amateur">Amateur</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
            <SelectItem value="national">National</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="schoolMotto">Motto</Label>
        <Input
          id="schoolMotto"
          type="text"
          value={motto}
          onChange={(e) => setMotto(e.target.value)}
          placeholder="School motto"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="schoolSponsor">Sponsor</Label>
        <Input
          id="schoolSponsor"
          type="text"
          value={sponsor}
          onChange={(e) => setSponsor(e.target.value)}
          placeholder="Sponsor name"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creating..." : "Create School"}
      </Button>
    </form>
  );
};

// Change School Form Component
const ChangeSchoolForm = ({ user, onSuccess }: { user: any; onSuccess: () => void }) => {
  const [schoolId, setSchoolId] = useState(user.studentSchoolId || user.schoolId || user.coachProfile?.schoolId || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: dashboardData } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const response = await dashboardApi.getAdminDashboard();
      return response.data;
    },
  });

  const schools = dashboardData?.schools || [];

  const handleChangeSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user.role === 'player') {
        await adminApi.changeUserSchool(user.id, undefined, schoolId);
      } else if (user.role === 'school_admin' || user.role === 'coach') {
        await adminApi.changeUserSchool(user.id, schoolId, undefined);
      }
      toast({
        title: "Success",
        description: "User school updated successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to change user school",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleChangeSchool} className="space-y-4">
      <div className="space-y-2">
        <Label>Current School: {user.studentSchool?.name || user.school?.name || user.coachProfile?.school?.name || "None"}</Label>
        <Select value={schoolId} onValueChange={setSchoolId}>
          <SelectTrigger>
            <SelectValue placeholder="Select school" />
          </SelectTrigger>
          <SelectContent>
            {schools.map((school: any) => (
              <SelectItem key={school.id} value={school.id}>
                {school.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update School"}
      </Button>
    </form>
  );
};

// Change Role Form Component
const ChangeRoleForm = ({ user, onSuccess }: { user: any; onSuccess: () => void }) => {
  const [role, setRole] = useState(user.role);
  const [schoolId, setSchoolId] = useState(user.schoolId || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const { data: dashboardData } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const response = await dashboardApi.getAdminDashboard();
      return response.data;
    },
  });

  const schools = dashboardData?.schools || [];

  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminApi.changeUserRole(user.id, role, role === 'school_admin' || role === 'coach' ? schoolId : undefined);
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to change user role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleChangeRole} className="space-y-4">
      <div className="space-y-2">
        <Label>Current Role: {user.role}</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="player">Player</SelectItem>
            <SelectItem value="coach">Coach</SelectItem>
            <SelectItem value="judge">Judge</SelectItem>
            <SelectItem value="sponsor">Sponsor</SelectItem>
            <SelectItem value="school_admin">School Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {(role === 'school_admin' || role === 'coach') && (
        <div className="space-y-2">
          <Label htmlFor="changeSchool">School</Label>
          <Select value={schoolId} onValueChange={setSchoolId}>
            <SelectTrigger>
              <SelectValue placeholder="Select school" />
            </SelectTrigger>
            <SelectContent>
              {schools.map((school: any) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update Role"}
      </Button>
    </form>
  );
};

// Bulk Promotions/Relegations Form Component
const BulkPromotionsRelegationsForm = ({ initialAction, onSuccess }: { initialAction?: "promote" | "relegate"; onSuccess: () => void }) => {
  const [action, setAction] = useState<"promote" | "relegate">(initialAction || "promote");
  const [tier, setTier] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminApi.processBulkPromotionsRelegations(action, tier || undefined);
      toast({
        title: "Success",
        description: `${response.data.summary.processed} schools ${action === 'promote' ? 'promoted' : 'relegated'} successfully`,
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || `Failed to process ${action}s`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleProcess} className="space-y-4">
      <div className="space-y-2">
        <Label>Action *</Label>
        <Select value={action} onValueChange={(value: "promote" | "relegate") => setAction(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="promote">Promote</SelectItem>
            <SelectItem value="relegate">Relegate</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tierFilter">Filter by Tier (Optional)</Label>
        <Select value={tier} onValueChange={setTier}>
          <SelectTrigger>
            <SelectValue placeholder="All tiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Tiers</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="amateur">Amateur</SelectItem>
            <SelectItem value="regular">Regular</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
            <SelectItem value="national">National</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          ⚠️ This will {action} all eligible schools{tier ? ` in ${tier} tier` : ''}. This action cannot be undone.
        </p>
      </div>
      <Button type="submit" disabled={loading} className="w-full" variant={action === "promote" ? "default" : "destructive"}>
        {loading ? "Processing..." : `${action === 'promote' ? 'Promote' : 'Relegate'} Schools`}
      </Button>
    </form>
  );
};

// Approve Matches Component
const ApproveMatchesComponent = ({ matches, onSuccess }: { matches: any[]; onSuccess: () => void }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleApprove = async (matchId: string) => {
    setLoading(matchId);
    try {
      await adminApi.approveMatch(matchId);
      toast({
        title: "Success",
        description: "Match approved successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to approve match",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const pendingMatches = matches.filter((m: any) => m.status === "scheduled");

  return (
    <div className="space-y-4">
      {pendingMatches.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No pending matches to approve</p>
      ) : (
        pendingMatches.slice(0, 10).map((match: any) => (
          <Card key={match.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{match.homeTeam?.name} vs {match.awayTeam?.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(match.scheduledAt), "MMM dd, yyyy HH:mm")}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleApprove(match.id)}
                  disabled={loading === match.id}
                >
                  {loading === match.id ? "Approving..." : "Approve"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

// Edit Match Results Form Component
const EditMatchResultsForm = ({ match, onSuccess }: { match: any; onSuccess: () => void }) => {
  const [homeScore, setHomeScore] = useState(match?.homeScore?.toString() || "");
  const [awayScore, setAwayScore] = useState(match?.awayScore?.toString() || "");
  const [status, setStatus] = useState(match?.status || "scheduled");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminApi.editMatchResults(match.id, {
        homeScore: homeScore ? parseInt(homeScore) : undefined,
        awayScore: awayScore ? parseInt(awayScore) : undefined,
        status,
      });
      toast({
        title: "Success",
        description: "Match results updated successfully",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update match results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="homeScore">{match?.homeTeam?.name} Score</Label>
          <Input
            id="homeScore"
            type="number"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="awayScore">{match?.awayTeam?.name} Score</Label>
          <Input
            id="awayScore"
            type="number"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="matchStatus">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update Match Results"}
      </Button>
    </form>
  );
};

// Announce Challenge Form Component
const AnnounceChallengeForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("beginner");
  const [points, setPoints] = useState("100");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAnnounce = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminApi.announceChallenge({
        title,
        description,
        difficulty,
        points: parseInt(points) || 100,
        deadline: deadline || undefined,
      });
      toast({
        title: "Success",
        description: `Challenge announced! ${response.data.notificationsSent} notifications sent.`,
      });
      setTitle("");
      setDescription("");
      setDifficulty("beginner");
      setPoints("100");
      setDeadline("");
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to announce challenge",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAnnounce} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="challengeTitle">Title *</Label>
        <Input
          id="challengeTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Challenge title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="challengeDescription">Description *</Label>
        <Textarea
          id="challengeDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Challenge description and requirements"
          rows={4}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="challengeDifficulty">Difficulty *</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="amateur">Amateur</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
              <SelectItem value="national">National</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="challengePoints">Points</Label>
          <Input
            id="challengePoints"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="100"
            min="1"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="challengeDeadline">Deadline (Optional)</Label>
        <Input
          id="challengeDeadline"
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Announcing..." : "Announce Challenge"}
      </Button>
    </form>
  );
};

// Broadcast Message Form Component
const BroadcastMessageForm = ({ allUsers, onSuccess }: { allUsers: any[]; onSuccess: () => void }) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [recipientType, setRecipientType] = useState("all");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const messageData: any = {
        title,
        message,
      };

      if (recipientType === "specific") {
        messageData.recipients = selectedRecipients;
      } else {
        messageData.recipientType = recipientType;
      }

      const response = await adminApi.broadcastMessage(messageData);
      toast({
        title: "Success",
        description: `Message sent to ${response.data.recipientsCount} recipients!`,
      });
      setTitle("");
      setMessage("");
      setRecipientType("all");
      setSelectedRecipients([]);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to broadcast message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleBroadcast} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="messageTitle">Title *</Label>
        <Input
          id="messageTitle"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Message title"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="messageContent">Message *</Label>
        <Textarea
          id="messageContent"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Your message content"
          rows={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="recipientType">Recipients *</Label>
        <Select value={recipientType} onValueChange={setRecipientType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="player">All Players</SelectItem>
            <SelectItem value="coach">All Coaches</SelectItem>
            <SelectItem value="school_admin">All School Admins</SelectItem>
            <SelectItem value="judge">All Judges</SelectItem>
            <SelectItem value="sponsor">All Sponsors</SelectItem>
            <SelectItem value="specific">Select Specific Users</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {recipientType === "specific" && (
        <div className="space-y-2">
          <Label>Select Recipients</Label>
          <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-2">
            {allUsers.map((user: any) => (
              <div key={user.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`user-${user.id}`}
                  checked={selectedRecipients.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRecipients([...selectedRecipients, user.id]);
                    } else {
                      setSelectedRecipients(selectedRecipients.filter(id => id !== user.id));
                    }
                  }}
                />
                <label htmlFor={`user-${user.id}`} className="text-sm cursor-pointer">
                  {user.fullName} ({user.email}) - {user.role}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
      <Button type="submit" disabled={loading || (recipientType === "specific" && selectedRecipients.length === 0)} className="w-full">
        {loading ? "Sending..." : <><Send className="mr-2 h-4 w-4" />Broadcast Message</>}
      </Button>
    </form>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { fetchMatches } = useMatchesStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError, refetch: refetchDashboard } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const response = await dashboardApi.getAdminDashboard();
      return response.data;
    },
    enabled: isAuthenticated && user?.role === "admin",
    refetchInterval: 30000,
    retry: 1,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const response = await leaderboardApi.getGlobal();
      return response.data;
    },
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Fetch all users for management - always call the hook, but enable conditionally
  const { data: allUsersData, refetch: refetchUsers } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const response = await adminApi.getAllUsers();
      return response.data;
    },
    enabled: isAuthenticated && user?.role === "admin" && activeMenu === "users",
  });

  // Fetch users by role for specific sections
  const { data: playersData, refetch: refetchPlayers } = useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const response = await adminApi.getUsersByRole("player");
      return response.data;
    },
    enabled: isAuthenticated && user?.role === "admin" && activeMenu === "players",
  });

  const { data: judgesData, refetch: refetchJudges } = useQuery({
    queryKey: ["judges"],
    queryFn: async () => {
      const response = await adminApi.getUsersByRole("judge");
      return response.data;
    },
    enabled: isAuthenticated && user?.role === "admin" && activeMenu === "judges",
  });

  const { data: coachesData, refetch: refetchCoaches } = useQuery({
    queryKey: ["coaches"],
    queryFn: async () => {
      const response = await adminApi.getUsersByRole("coach");
      return response.data;
    },
    enabled: isAuthenticated && user?.role === "admin" && activeMenu === "coaches",
  });

  const { data: schoolAdminsData, refetch: refetchSchoolAdmins } = useQuery({
    queryKey: ["schoolAdmins"],
    queryFn: async () => {
      const response = await adminApi.getUsersByRole("school_admin");
      return response.data;
    },
    enabled: isAuthenticated && user?.role === "admin" && activeMenu === "school_admins",
  });

  const { data: sponsorsData, refetch: refetchSponsors } = useQuery({
    queryKey: ["sponsors"],
    queryFn: async () => {
      const response = await adminApi.getUsersByRole("sponsor");
      return response.data;
    },
    enabled: isAuthenticated && user?.role === "admin" && activeMenu === "sponsors",
  });

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      navigate("/auth");
    } else {
      fetchMatches();
    }
  }, [isAuthenticated, user, navigate, fetchMatches]);

  // Early return checks - must be after all hooks are called
  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  if (dashboardLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Extract comprehensive data from dashboard
  const stats = dashboardData?.stats || {};
  const schools = dashboardData?.schools || [];
  const teams = dashboardData?.teams || [];
  const players = dashboardData?.players || [];
  const coaches = dashboardData?.coaches || [];
  const judges = dashboardData?.judges || [];
  const sponsors = dashboardData?.sponsors || [];
  const schoolAdmins = dashboardData?.schoolAdmins || [];
  const matches = dashboardData?.matches || [];
  const recentMatches = dashboardData?.recentMatches || [];
  const challenges = dashboardData?.challenges || [];
  const arenas = dashboardData?.arenas || [];

  const refetchTeams = refetchDashboard;
  const allUsers = allUsersData?.users || [];

  // Use comprehensive stats from backend
  const globalStats = {
    totalSchools: stats.totalSchools || 0,
    totalTeams: stats.totalTeams || 0,
    totalPlayers: stats.totalPlayers || 0,
    totalCoaches: stats.totalCoaches || 0,
    totalJudges: stats.totalJudges || 0,
    totalSponsors: stats.totalSponsors || 0,
    totalSchoolAdmins: stats.totalSchoolAdmins || 0,
    totalMatches: stats.totalMatches || 0,
    totalChallenges: stats.totalChallenges || 0,
    totalArenas: stats.totalArenas || 0,
    activeMatches: stats.activeMatches || 0,
    scheduledMatches: stats.scheduledMatches || 0,
    completedMatches: stats.completedMatches || 0,
    totalPoints: stats.totalPoints || 0,
    tierBreakdown: stats.tierBreakdown || {},
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "schools", label: "Schools", icon: Building2 },
    { id: "teams", label: "Teams", icon: Users },
    { id: "players", label: "Players", icon: Users },
    { id: "coaches", label: "Coaches", icon: Users },
    { id: "judges", label: "Judges", icon: Gavel },
    { id: "school_admins", label: "School Admins", icon: Building2 },
    { id: "sponsors", label: "Sponsors", icon: DollarSign },
    { id: "matches", label: "Matches", icon: Calendar },
    { id: "users", label: "All Users", icon: Users },
    { id: "messaging", label: "Messaging", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Extract role-specific data
  // For coaches, we need to map from coach records to profile format
  const coachesFromDashboard = coaches || [];
  const coachesAsProfiles = coachesFromDashboard.map((coach: any) => ({
    ...coach.profile,
    coachProfile: {
      school: coach.school,
    },
  }));
  
  const allPlayers = playersData?.users || players || [];
  const allJudges = judgesData?.users || judges || [];
  const allCoaches = coachesData?.users || coachesAsProfiles || [];
  const allSchoolAdmins = schoolAdminsData?.users || schoolAdmins || [];
  const allSponsors = sponsorsData?.users || sponsors || [];

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#1A1A1A]">
      <Navbar />
      
      {/* Top Bar */}
      <div className="border-b bg-white/95 backdrop-blur-sm sticky top-16 z-30 mt-16">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-[#1A1A1A]">
                {user?.fullName?.charAt(0) || "A"}
              </div>
              <div>
                <div className="font-semibold text-[#1A1A1A]">League Admin</div>
                <div className="text-sm text-[#4A4A4A]">Master Control Room</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4A4A4A]" />
                <Input
                  placeholder="Quick search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Menu */}
        <aside className="w-64 border-r bg-card/50 min-h-[calc(100vh-8rem)]">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeMenu === item.id
                      ? "bg-primary/20 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeMenu === "dashboard" && (
            <>
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">League Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage the entire NDL ecosystem</p>
              </div>

              {/* Overview Panel */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{globalStats.totalTeams}</div>
                    <p className="text-xs text-muted-foreground">Registered teams</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{globalStats.totalPlayers}</div>
                    <p className="text-xs text-muted-foreground">Active students</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                    <Building2 className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{globalStats.totalSchools}</div>
                    <p className="text-xs text-muted-foreground">Participating schools</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
                    <Calendar className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{globalStats.activeMatches}</div>
                    <p className="text-xs text-muted-foreground">Scheduled/In progress</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tier Activity Heatmap */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Tier Activity</CardTitle>
                  <CardDescription>Distribution of teams across tiers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {['beginner', 'amateur', 'regular', 'professional', 'legendary', 'national'].map((tier) => {
                      const tierTeams = teams?.filter((team: any) => team.tier?.toLowerCase() === tier) || [];
                      return (
                        <div key={tier} className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-primary">{tierTeams.length}</div>
                          <div className="text-sm text-muted-foreground capitalize">{tier}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Management Tools */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add School
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Add New School</DialogTitle>
                            <DialogDescription>Register a new school in the league</DialogDescription>
                          </DialogHeader>
                          <CreateSchoolForm onSuccess={() => {
                            refetchDashboard();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          }} />
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Add User
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>Create a new user account with a specific role</DialogDescription>
                          </DialogHeader>
                          <CreateUserForm onSuccess={() => {
                            refetchUsers();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          }} />
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <ArrowUp className="mr-2 h-4 w-4" />
                            Process Promotions
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Process Bulk Promotions</DialogTitle>
                            <DialogDescription>Promote eligible schools to the next tier</DialogDescription>
                          </DialogHeader>
                          <BulkPromotionsRelegationsForm initialAction="promote" onSuccess={() => {
                            refetchDashboard();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          }} />
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <ArrowDown className="mr-2 h-4 w-4" />
                            Process Relegations
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Process Bulk Relegations</DialogTitle>
                            <DialogDescription>Relegate eligible schools to the previous tier</DialogDescription>
                          </DialogHeader>
                          <BulkPromotionsRelegationsForm initialAction="relegate" onSuccess={() => {
                            refetchDashboard();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          }} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Event Control</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve Matches
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Approve Pending Matches</DialogTitle>
                            <DialogDescription>Review and approve scheduled matches</DialogDescription>
                          </DialogHeader>
                          <ApproveMatchesComponent matches={matches} onSuccess={() => {
                            refetchDashboard();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          }} />
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Edit Match Results
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Select Match to Edit</DialogTitle>
                            <DialogDescription>Choose a match to edit its results</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {matches.slice(0, 20).map((match: any) => (
                              <Dialog key={match.id}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start">
                                    {match.homeTeam?.name} vs {match.awayTeam?.name} - {format(new Date(match.scheduledAt), "MMM dd, yyyy")}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Match Results</DialogTitle>
                                    <DialogDescription>{match.homeTeam?.name} vs {match.awayTeam?.name}</DialogDescription>
                                  </DialogHeader>
                                  <EditMatchResultsForm match={match} onSuccess={() => {
                                    refetchDashboard();
                                    queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                                  }} />
                                </DialogContent>
                              </Dialog>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <Target className="mr-2 h-4 w-4" />
                            Announce Challenge
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Announce New Challenge</DialogTitle>
                            <DialogDescription>Create and announce a new coding challenge to all players</DialogDescription>
                          </DialogHeader>
                          <AnnounceChallengeForm onSuccess={() => {
                            refetchDashboard();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          }} />
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <Bell className="mr-2 h-4 w-4" />
                            Broadcast Announcement
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Broadcast Message</DialogTitle>
                            <DialogDescription>Send a message to selected users or all users in the system</DialogDescription>
                          </DialogHeader>
                          <BroadcastMessageForm allUsers={allUsers} onSuccess={() => {
                            refetchDashboard();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          }} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeMenu === "schools" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Schools Management</h2>
              <div className="flex justify-between mb-6">
                <Input placeholder="Search schools..." className="max-w-sm" />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add School
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New School</DialogTitle>
                      <DialogDescription>Register a new school in the league</DialogDescription>
                    </DialogHeader>
                    <CreateSchoolForm onSuccess={() => {
                      refetchDashboard();
                      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                    }} />
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-4">
                {schools?.slice(0, 20).map((school: any) => (
                  <Card key={school.id} className="cursor-pointer hover:border-primary" onClick={() => navigate(`/schools/${school.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg">{school.name}</div>
                          <div className="text-sm text-muted-foreground">{school.location}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">{school.totalPoints || 0}</div>
                            <div className="text-xs text-muted-foreground">Points</div>
                          </div>
                          <Badge>{school.tier}</Badge>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await adminApi.promoteRelegateSchool(school.id, undefined, 'promote');
                                  toast({
                                    title: "Success",
                                    description: "School promoted successfully",
                                  });
                                  queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                                } catch (error: any) {
                                  toast({
                                    title: "Error",
                                    description: error.response?.data?.error || "Failed to promote school",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  await adminApi.promoteRelegateSchool(school.id, undefined, 'relegate');
                                  toast({
                                    title: "Success",
                                    description: "School relegated successfully",
                                  });
                                  queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                                } catch (error: any) {
                                  toast({
                                    title: "Error",
                                    description: error.response?.data?.error || "Failed to relegate school",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "teams" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Teams Management</h2>
              <div className="space-y-4">
                {teams?.slice(0, 20).map((team: any) => (
                  <Card key={team.id} className="cursor-pointer hover:border-primary" onClick={() => navigate(`/teams/${team.id}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-lg">{team.name}</div>
                          <div className="text-sm text-muted-foreground">{team.school?.name}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">{team.points || 0}</div>
                            <div className="text-xs text-muted-foreground">Points</div>
                          </div>
                          <Badge>{team.tier}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "matches" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">Matches Management</h2>
              <Tabs defaultValue="pending">
                <TabsList>
                  <TabsTrigger value="pending">Pending Approval</TabsTrigger>
                  <TabsTrigger value="all">All Matches</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-6">
                  <div className="space-y-4">
                    {matches
                      .filter((m: any) => m.status === "scheduled")
                      .slice(0, 10)
                      .map((match: any) => (
                        <Card key={match.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-lg">
                                  {match.homeTeam?.name} vs {match.awayTeam?.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {format(new Date(match.scheduledAt), "MMM dd, yyyy HH:mm")}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline">
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
                <TabsContent value="all" className="mt-6">
                  <div className="space-y-4">
                    {matches.slice(0, 20).map((match: any) => (
                      <Card key={match.id} className="cursor-pointer hover:border-primary" onClick={() => navigate(`/matches/${match.id}`)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-lg">
                                {match.homeTeam?.name} {match.homeScore || 0} - {match.awayScore || 0} {match.awayTeam?.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {format(new Date(match.scheduledAt), "MMM dd, yyyy HH:mm")}
                              </div>
                            </div>
                            <Badge>{match.status}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {activeMenu === "users" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">User Management</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                      <DialogDescription>
                        Create a new user account with a specific role.
                      </DialogDescription>
                    </DialogHeader>
                    <CreateUserForm onSuccess={() => {
                      refetchUsers();
                      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                    }} />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="mb-4">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="space-y-4">
                {allUsers
                  .filter((u: any) => 
                    u.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((user: any) => (
                    <Card key={user.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold">{user.fullName}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge>{user.role}</Badge>
                              {user.school && (
                                <Badge variant="outline">{user.school.name}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
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
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {activeMenu === "players" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold">Players Management</h2>
                  <p className="text-muted-foreground mt-1">Manage all players in the league ({allPlayers.length} total)</p>
                </div>
                <Input
                  placeholder="Search players..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <div className="space-y-4">
                {allPlayers
                  .filter((p: any) => 
                    p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.studentSchool?.name?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((player: any) => (
                    <Card key={player.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-lg">{player.fullName}</div>
                            <div className="text-sm text-muted-foreground">{player.email}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge>{player.role}</Badge>
                              {player.studentSchool && <Badge variant="outline">{player.studentSchool.name}</Badge>}
                              {player.studentRole && <Badge variant="secondary">{player.studentRole}</Badge>}
                              {player.teamMembers?.[0]?.team && <Badge variant="outline">{player.teamMembers[0].team.name}</Badge>}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                              XP: {player.xp || 0} • Age: {player.age || "N/A"} • Grade: {player.grade || "N/A"}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline"><Edit className="mr-2 h-4 w-4" />Change Role</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader><DialogTitle>Change User Role</DialogTitle></DialogHeader>
                                <ChangeRoleForm user={player} onSuccess={() => { refetchPlayers(); queryClient.invalidateQueries({ queryKey: ["adminDashboard"] }); }} />
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline"><School className="mr-2 h-4 w-4" />Change School</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader><DialogTitle>Change User School</DialogTitle></DialogHeader>
                                <ChangeSchoolForm user={player} onSuccess={() => { refetchPlayers(); queryClient.invalidateQueries({ queryKey: ["adminDashboard"] }); }} />
                              </DialogContent>
                            </Dialog>
                            <Button size="sm" variant="outline" onClick={async () => {
                              if (confirm(`Remove ${player.fullName} from their role?`)) {
                                try {
                                  await adminApi.removeFromRole(player.id);
                                  toast({ title: "Success", description: "User removed from role successfully" });
                                  refetchPlayers();
                                  queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                                } catch (error: any) {
                                  toast({ title: "Error", description: error.response?.data?.error || "Failed to remove user from role", variant: "destructive" });
                                }
                              }
                            }}><UserX className="mr-2 h-4 w-4" />Remove Role</Button>
                            <Button size="sm" variant="destructive" onClick={async () => {
                              if (confirm(`Are you sure you want to delete ${player.fullName}?`)) {
                                try {
                                  await adminApi.deleteUser(player.id);
                                  toast({ title: "Success", description: "User deleted successfully" });
                                  refetchPlayers();
                                  queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                                } catch (error: any) {
                                  toast({ title: "Error", description: error.response?.data?.error || "Failed to delete user", variant: "destructive" });
                                }
                              }
                            }}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {activeMenu === "judges" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold">Judges Management</h2>
                  <p className="text-muted-foreground mt-1">Manage all judges in the league ({allJudges.length} total)</p>
                </div>
                <Input placeholder="Search judges..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-sm" />
              </div>
              <div className="space-y-4">
                {allJudges.filter((j: any) => j.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || j.email?.toLowerCase().includes(searchQuery.toLowerCase())).map((judge: any) => (
                  <Card key={judge.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{judge.fullName}</div>
                          <div className="text-sm text-muted-foreground">{judge.email}</div>
                          <div className="flex items-center gap-2 mt-2"><Badge>{judge.role}</Badge></div>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild><Button size="sm" variant="outline"><Edit className="mr-2 h-4 w-4" />Change Role</Button></DialogTrigger>
                            <DialogContent><DialogHeader><DialogTitle>Change User Role</DialogTitle></DialogHeader>
                            <ChangeRoleForm user={judge} onSuccess={() => { refetchJudges(); queryClient.invalidateQueries({ queryKey: ["adminDashboard"] }); }} /></DialogContent>
                          </Dialog>
                          <Button size="sm" variant="outline" onClick={async () => {
                            if (confirm(`Remove ${judge.fullName} from judge role?`)) {
                              try {
                                await adminApi.removeFromRole(judge.id);
                                toast({ title: "Success", description: "User removed from role successfully" });
                                refetchJudges();
                                queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                              } catch (error: any) {
                                toast({ title: "Error", description: error.response?.data?.error || "Failed to remove user from role", variant: "destructive" });
                              }
                            }
                          }}><UserX className="mr-2 h-4 w-4" />Remove Role</Button>
                          <Button size="sm" variant="destructive" onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${judge.fullName}?`)) {
                              try {
                                await adminApi.deleteUser(judge.id);
                                toast({ title: "Success", description: "User deleted successfully" });
                                refetchJudges();
                                queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                              } catch (error: any) {
                                toast({ title: "Error", description: error.response?.data?.error || "Failed to delete user", variant: "destructive" });
                              }
                            }
                          }}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "coaches" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold">Coaches Management</h2>
                  <p className="text-muted-foreground mt-1">Manage all coaches in the league ({allCoaches.length} total)</p>
                </div>
                <Input placeholder="Search coaches..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-sm" />
              </div>
              <div className="space-y-4">
                {allCoaches.filter((c: any) => c.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || c.email?.toLowerCase().includes(searchQuery.toLowerCase()) || c.coachProfile?.school?.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((coach: any) => (
                  <Card key={coach.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{coach.fullName}</div>
                          <div className="text-sm text-muted-foreground">{coach.email}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge>{coach.role}</Badge>
                            {coach.coachProfile?.school && <Badge variant="outline">{coach.coachProfile.school.name}</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild><Button size="sm" variant="outline"><Edit className="mr-2 h-4 w-4" />Change Role</Button></DialogTrigger>
                            <DialogContent><DialogHeader><DialogTitle>Change User Role</DialogTitle></DialogHeader>
                            <ChangeRoleForm user={coach} onSuccess={() => { refetchCoaches(); queryClient.invalidateQueries({ queryKey: ["adminDashboard"] }); }} /></DialogContent>
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild><Button size="sm" variant="outline"><School className="mr-2 h-4 w-4" />Change School</Button></DialogTrigger>
                            <DialogContent><DialogHeader><DialogTitle>Change Coach School</DialogTitle></DialogHeader>
                            <ChangeSchoolForm user={coach} onSuccess={() => { refetchCoaches(); queryClient.invalidateQueries({ queryKey: ["adminDashboard"] }); }} /></DialogContent>
                          </Dialog>
                          <Button size="sm" variant="outline" onClick={async () => {
                            if (confirm(`Remove ${coach.fullName} from coach role?`)) {
                              try {
                                await adminApi.removeFromRole(coach.id);
                                toast({ title: "Success", description: "User removed from role successfully" });
                                refetchCoaches();
                                queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                              } catch (error: any) {
                                toast({ title: "Error", description: error.response?.data?.error || "Failed to remove user from role", variant: "destructive" });
                              }
                            }
                          }}><UserX className="mr-2 h-4 w-4" />Remove Role</Button>
                          <Button size="sm" variant="destructive" onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${coach.fullName}?`)) {
                              try {
                                await adminApi.deleteUser(coach.id);
                                toast({ title: "Success", description: "User deleted successfully" });
                                refetchCoaches();
                                queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                              } catch (error: any) {
                                toast({ title: "Error", description: error.response?.data?.error || "Failed to delete user", variant: "destructive" });
                              }
                            }
                          }}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "school_admins" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold">School Admins Management</h2>
                  <p className="text-muted-foreground mt-1">Manage all school admins in the league ({allSchoolAdmins.length} total)</p>
                </div>
                <Input placeholder="Search school admins..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-sm" />
              </div>
              <div className="space-y-4">
                {allSchoolAdmins.filter((sa: any) => sa.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || sa.email?.toLowerCase().includes(searchQuery.toLowerCase()) || sa.school?.name?.toLowerCase().includes(searchQuery.toLowerCase())).map((schoolAdmin: any) => (
                  <Card key={schoolAdmin.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{schoolAdmin.fullName}</div>
                          <div className="text-sm text-muted-foreground">{schoolAdmin.email}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge>{schoolAdmin.role}</Badge>
                            {schoolAdmin.school && <Badge variant="outline">{schoolAdmin.school.name}</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild><Button size="sm" variant="outline"><Edit className="mr-2 h-4 w-4" />Change Role</Button></DialogTrigger>
                            <DialogContent><DialogHeader><DialogTitle>Change User Role</DialogTitle></DialogHeader>
                            <ChangeRoleForm user={schoolAdmin} onSuccess={() => { refetchSchoolAdmins(); queryClient.invalidateQueries({ queryKey: ["adminDashboard"] }); }} /></DialogContent>
                          </Dialog>
                          <Dialog>
                            <DialogTrigger asChild><Button size="sm" variant="outline"><School className="mr-2 h-4 w-4" />Change School</Button></DialogTrigger>
                            <DialogContent><DialogHeader><DialogTitle>Change School Admin School</DialogTitle></DialogHeader>
                            <ChangeSchoolForm user={schoolAdmin} onSuccess={() => { refetchSchoolAdmins(); queryClient.invalidateQueries({ queryKey: ["adminDashboard"] }); }} /></DialogContent>
                          </Dialog>
                          <Button size="sm" variant="outline" onClick={async () => {
                            if (confirm(`Remove ${schoolAdmin.fullName} from school admin role?`)) {
                              try {
                                await adminApi.removeFromRole(schoolAdmin.id);
                                toast({ title: "Success", description: "User removed from role successfully" });
                                refetchSchoolAdmins();
                                queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                              } catch (error: any) {
                                toast({ title: "Error", description: error.response?.data?.error || "Failed to remove user from role", variant: "destructive" });
                              }
                            }
                          }}><UserX className="mr-2 h-4 w-4" />Remove Role</Button>
                          <Button size="sm" variant="destructive" onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${schoolAdmin.fullName}?`)) {
                              try {
                                await adminApi.deleteUser(schoolAdmin.id);
                                toast({ title: "Success", description: "User deleted successfully" });
                                refetchSchoolAdmins();
                                queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                              } catch (error: any) {
                                toast({ title: "Error", description: error.response?.data?.error || "Failed to delete user", variant: "destructive" });
                              }
                            }
                          }}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "sponsors" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold">Sponsors Management</h2>
                  <p className="text-muted-foreground mt-1">Manage all sponsors in the league ({allSponsors.length} total)</p>
                </div>
                <Input placeholder="Search sponsors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="max-w-sm" />
              </div>
              <div className="space-y-4">
                {allSponsors.filter((s: any) => s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || s.email?.toLowerCase().includes(searchQuery.toLowerCase())).map((sponsor: any) => (
                  <Card key={sponsor.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{sponsor.fullName}</div>
                          <div className="text-sm text-muted-foreground">{sponsor.email}</div>
                          <div className="flex items-center gap-2 mt-2"><Badge>{sponsor.role}</Badge></div>
                        </div>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild><Button size="sm" variant="outline"><Edit className="mr-2 h-4 w-4" />Change Role</Button></DialogTrigger>
                            <DialogContent><DialogHeader><DialogTitle>Change User Role</DialogTitle></DialogHeader>
                            <ChangeRoleForm user={sponsor} onSuccess={() => { refetchSponsors(); queryClient.invalidateQueries({ queryKey: ["adminDashboard"] }); }} /></DialogContent>
                          </Dialog>
                          <Button size="sm" variant="outline" onClick={async () => {
                            if (confirm(`Remove ${sponsor.fullName} from sponsor role?`)) {
                              try {
                                await adminApi.removeFromRole(sponsor.id);
                                toast({ title: "Success", description: "User removed from role successfully" });
                                refetchSponsors();
                                queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                              } catch (error: any) {
                                toast({ title: "Error", description: error.response?.data?.error || "Failed to remove user from role", variant: "destructive" });
                              }
                            }
                          }}><UserX className="mr-2 h-4 w-4" />Remove Role</Button>
                          <Button size="sm" variant="destructive" onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${sponsor.fullName}?`)) {
                              try {
                                await adminApi.deleteUser(sponsor.id);
                                toast({ title: "Success", description: "User deleted successfully" });
                                refetchSponsors();
                                queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                              } catch (error: any) {
                                toast({ title: "Error", description: error.response?.data?.error || "Failed to delete user", variant: "destructive" });
                              }
                            }
                          }}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeMenu === "messaging" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold">Messaging Center</h2>
                  <p className="text-muted-foreground mt-1">Send messages and announcements to users</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Send className="mr-2 h-4 w-4" />
                      Broadcast Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Broadcast Message</DialogTitle>
                      <DialogDescription>Send a message to selected users or all users in the system</DialogDescription>
                    </DialogHeader>
                    <BroadcastMessageForm allUsers={allUsers} onSuccess={() => {
                      refetchUsers();
                      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                    }} />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Broadcast</CardTitle>
                    <CardDescription>Send messages to specific user groups</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message All Players
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Broadcast to All Players</DialogTitle>
                            <DialogDescription>Send a message to all players in the system</DialogDescription>
                          </DialogHeader>
                          <BroadcastMessageForm allUsers={allUsers.filter((u: any) => u.role === 'player')} onSuccess={() => {
                            refetchUsers();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          }} />
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message All Coaches
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Broadcast to All Coaches</DialogTitle>
                            <DialogDescription>Send a message to all coaches in the system</DialogDescription>
                          </DialogHeader>
                          <BroadcastMessageForm allUsers={allUsers.filter((u: any) => u.role === 'coach')} onSuccess={() => {
                            refetchUsers();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          }} />
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message All Schools
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Broadcast to All School Admins</DialogTitle>
                            <DialogDescription>Send a message to all school administrators</DialogDescription>
                          </DialogHeader>
                          <BroadcastMessageForm allUsers={allUsers.filter((u: any) => u.role === 'school_admin')} onSuccess={() => {
                            refetchUsers();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          }} />
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full justify-start" variant="outline">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message Everyone
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Broadcast to Everyone</DialogTitle>
                            <DialogDescription>Send a message to all users in the system</DialogDescription>
                          </DialogHeader>
                          <BroadcastMessageForm allUsers={allUsers} onSuccess={() => {
                            refetchUsers();
                            queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                          }} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Message Statistics</CardTitle>
                    <CardDescription>Recent messaging activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Users</span>
                        <span className="font-bold">{allUsers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Players</span>
                        <span className="font-bold">{allUsers.filter((u: any) => u.role === 'player').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Coaches</span>
                        <span className="font-bold">{allUsers.filter((u: any) => u.role === 'coach').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">School Admins</span>
                        <span className="font-bold">{allUsers.filter((u: any) => u.role === 'school_admin').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Judges</span>
                        <span className="font-bold">{allUsers.filter((u: any) => u.role === 'judge').length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sponsors</span>
                        <span className="font-bold">{allUsers.filter((u: any) => u.role === 'sponsor').length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Send Custom Message</CardTitle>
                  <CardDescription>Select specific recipients or user groups</CardDescription>
                </CardHeader>
                <CardContent>
                  <BroadcastMessageForm allUsers={allUsers} onSuccess={() => {
                    refetchUsers();
                    queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
                  }} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeMenu === "settings" && (
            <div>
              <h2 className="text-3xl font-bold mb-6">System Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>User Permissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button className="w-full justify-start" variant="outline">
                        Manage Roles
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        Permission Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button className="w-full justify-start" variant="outline">
                        Database Sync
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        Generate Reports
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Create Admin Account */}
              <Card>
                <CardHeader>
                  <CardTitle>Create League Admin Account</CardTitle>
                  <CardDescription>
                    Create a new admin account. Only existing admins can create new admin accounts.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreateAdminForm />
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
