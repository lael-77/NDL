/**
 * School Admin Dashboard - Main Page
 * Displays overview stats, upcoming matches, at-risk students, and quick actions
 */

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UsersRound, 
  AlertTriangle, 
  Calendar, 
  Plus,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import { getSchoolDashboard } from '@/api/schoolAdmin';
import { Link } from 'react-router-dom';
import { SchoolAdminLayout } from '@/components/SchoolAdminLayout';

export default function SchoolAdminDashboard() {
  const { user } = useAuthStore();

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['schoolDashboard'],
    queryFn: () => getSchoolDashboard(),
    enabled: !!user && user.role === 'school_admin',
  });

  if (isLoading) {
    return (
      <SchoolAdminLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      </SchoolAdminLayout>
    );
  }

  if (error) {
    return (
      <SchoolAdminLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600">
              {(error as any)?.response?.data?.error || 'Failed to load dashboard data'}
            </p>
          </div>
        </div>
      </SchoolAdminLayout>
    );
  }

  const { stats, upcomingMatches, recentSubmissions } = dashboard || {};

  return (
    <SchoolAdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">School Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your school's performance</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/school-admin/students/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/school-admin/teams">
              <UsersRound className="h-4 w-4 mr-2" />
              Manage Teams
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/school-admin/students">
              <Users className="h-4 w-4 mr-2" />
              View Students
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.studentCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">total students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Teams</CardTitle>
            <UsersRound className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.teamCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">teams formed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">At-Risk Students</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats?.atRiskStudents || 0}</div>
            <p className="text-xs text-gray-500 mt-1">progress &lt; 50%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming Matches</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMatches?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingMatches && upcomingMatches.length > 0 ? (
              <div className="space-y-3">
                {upcomingMatches.map((match: any) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-semibold">
                        {match.homeTeam?.name || 'Team A'} vs {match.awayTeam?.name || 'Team B'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(match.scheduledAt || match.scheduled_at).toLocaleDateString()} at{' '}
                        {new Date(match.scheduledAt || match.scheduled_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <Badge variant="outline">{match.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No upcoming matches</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentSubmissions && recentSubmissions.length > 0 ? (
              <div className="space-y-3">
                {recentSubmissions.map((submission: any) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <div className="font-semibold">
                        {submission.student?.fullName || submission.player?.fullName || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {submission.challenge?.title || 'Challenge'}
                        {' • '}
                        {new Date(submission.submittedAt || submission.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      {submission.finalScore !== null || submission.final_score !== null ? (
                        <div className="font-bold text-blue-600">
                          {(submission.finalScore || submission.final_score || submission.score || 0).toFixed(1)}
                        </div>
                      ) : null}
                      <Badge variant="outline" className="text-xs">
                        {submission.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No recent submissions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </SchoolAdminLayout>
  );
}
