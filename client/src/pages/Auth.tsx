import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth";
import useAuthStore from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "@/api/axios";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("player");
  const [schoolId, setSchoolId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register, isAuthenticated, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, initialize]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result.success) {
          toast({
            title: "Welcome back!",
            description: "Successfully signed in.",
          });
          navigate("/dashboard");
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to sign in",
            variant: "destructive",
          });
        }
      } else {
        const result = await register(email, password, fullName, role, schoolId);
        if (result.success) {
          toast({
            title: "Account created!",
            description: "Welcome to NDL. You can now sign in.",
          });
          setIsLogin(true);
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create account",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);

    try {
      const response = await axios.post('/auth/forgot-password', {
        email: forgotPasswordEmail,
      });

      toast({
        title: "Reset link sent",
        description: response.data.message || "If an account exists, a password reset link has been sent.",
      });

      // In development, show the reset link
      if (response.data.resetLink) {
        console.log('Reset link:', response.data.resetLink);
        toast({
          title: "Development Mode",
          description: `Reset link: ${response.data.resetLink}`,
          variant: "default",
        });
      }

      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to send reset link",
        variant: "destructive",
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA] p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="rounded-lg bg-[#0077CC] p-2 shadow-lg">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-[#002B5C]">NDL</span>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>{isLogin ? "Sign In" : "Create Account"}</CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access your account"
                : "Join the competition and start climbing the ranks"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    >
                      <option value="player">Player</option>
                      <option value="coach">Coach</option>
                      <option value="judge">Judge</option>
                      <option value="school_admin">School Admin</option>
                      <option value="sponsor">Sponsor</option>
                    </select>
                  </div>
                  {role === "coach" && (
                    <div className="space-y-2">
                      <Label htmlFor="schoolId">School ID (Optional)</Label>
                      <Input
                        id="schoolId"
                        type="text"
                        value={schoolId}
                        onChange={(e) => setSchoolId(e.target.value)}
                        placeholder="Enter school ID to assign as coach"
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty if you don't have a school ID yet
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@school.edu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
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

              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full bg-[#0077CC] hover:bg-[#005FA3] text-white border-0">
                {isLogin ? "Sign In" : "Create Account"}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgotEmail">Email</Label>
              <Input
                id="forgotEmail"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
                placeholder="your.email@school.edu"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={forgotPasswordLoading} className="flex-1">
                {forgotPasswordLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
