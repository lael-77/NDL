/**
 * Create Student Form
 * Allows school admin to add new students to their school
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import useAuthStore from '@/store/useAuthStore';
import { createStudent } from '@/api/schoolAdmin';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SchoolAdminLayout } from '@/components/SchoolAdminLayout';

export default function CreateStudent() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    age: '',
    grade: '',
    studentNumber: '',
  });

  const createStudentMutation = useMutation({
    mutationFn: (data: any) => createStudent(data),
    onSuccess: () => {
      toast({
        title: 'Student Created',
        description: 'The student has been successfully added to your school.',
      });
      queryClient.invalidateQueries({ queryKey: ['schoolStudents'] });
      queryClient.invalidateQueries({ queryKey: ['schoolDashboard'] });
      navigate('/school-admin/students');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create student',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createStudentMutation.mutate({
      email: formData.email,
      password: formData.password || 'defaultPassword123',
      fullName: formData.fullName,
      age: parseInt(formData.age) || null,
      grade: parseInt(formData.grade) || null,
      studentNumber: formData.studentNumber,
    });
  };

  return (
    <SchoolAdminLayout>
      <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <Link
          to="/school-admin/students"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Student</h1>
        <p className="text-gray-600 mt-1">Register a new student for your school</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="student@school.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentNumber">Student Number *</Label>
                <Input
                  id="studentNumber"
                  value={formData.studentNumber}
                  onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                  required
                  placeholder="STU001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty for default password"
                />
                <p className="text-xs text-gray-500">
                  Default password will be set if left empty
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min="10"
                  max="25"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="16"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/school-admin/students')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createStudentMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createStudentMutation.isPending ? 'Creating...' : 'Create Student'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </SchoolAdminLayout>
  );
}

