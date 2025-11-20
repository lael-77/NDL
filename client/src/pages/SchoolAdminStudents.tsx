/**
 * School Admin - Students List Page
 * Displays all students with filters, search, and bulk actions
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  Plus,
  Download,
  Filter,
  User
} from 'lucide-react';
import useAuthStore from '@/store/useAuthStore';
import { getSchoolStudents } from '@/api/schoolAdmin';
import { Link } from 'react-router-dom';
import { SchoolAdminLayout } from '@/components/SchoolAdminLayout';

export default function SchoolAdminStudents() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['schoolStudents', page, search, filter],
    queryFn: () => getSchoolStudents({ page, limit: 20, search, filter }),
    enabled: !!user && user.role === 'school_admin',
  });

  const students = data?.students || [];
  const pagination = data?.pagination;

  return (
    <SchoolAdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage all students in your school</p>
        </div>
        <Button asChild>
          <Link to="/school-admin/students/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or student number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="">All Students</option>
              <option value="at_risk">At-Risk Students</option>
            </select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
            </div>
          ) : students.length > 0 ? (
            <div className="space-y-2">
              {students.map((student: any) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {student.fullName || student.user?.profile_data?.fullName || student.user?.fullName || student.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.studentNumber || student.student_number || 'No student number'} • Grade {student.grade || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Progress</div>
                      <div className="font-semibold">{student.progress_percentage || 0}%</div>
                    </div>
                    <Badge
                      variant={
                        (student.progress_percentage || 0) < 50 ? 'destructive' : 'default'
                      }
                    >
                      {student.level || 'beginner'}
                    </Badge>
                    {student.teamMembers && student.teamMembers.length > 0 && (
                      <Badge variant="outline">
                        {student.teamMembers[0]?.team?.name || 'Team Member'}
                      </Badge>
                    )}
                    <Button variant="ghost" asChild>
                      <Link to={`/players/${student.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No students found</p>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </SchoolAdminLayout>
  );
}

