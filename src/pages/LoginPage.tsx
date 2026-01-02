import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Shield, UserCog, User, Info } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithUsername, signUpWithUsername } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as { from?: string })?.from || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: t.common.error,
        description: t.auth.enterCredentials,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signInWithUsername(username, password);
    setLoading(false);

    if (error) {
      toast({
        title: t.auth.loginFailed,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t.common.success,
        description: t.auth.loginSuccess,
      });
      navigate(from, { replace: true });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: t.common.error,
        description: t.auth.enterCredentials,
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t.common.error,
        description: t.auth.passwordTooShort,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await signUpWithUsername(username, password);
    setLoading(false);

    if (error) {
      toast({
        title: t.auth.signupFailed,
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t.common.success,
        description: t.auth.signupSuccess,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{t.auth.loginTitle}</CardTitle>
          <CardDescription>{t.auth.loginDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{t.roles.admin}:</span>
                  <span className="text-xs">{t.roles.adminDesc}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-secondary" />
                  <span className="font-semibold">{t.roles.manager}:</span>
                  <span className="text-xs">{t.roles.managerDesc}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{t.roles.cashier}:</span>
                  <span className="text-xs">{t.roles.cashierDesc}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                  {t.roles.firstUserNote}
                </p>
              </div>
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t.auth.login}</TabsTrigger>
              <TabsTrigger value="signup">{t.auth.signup}</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">{t.auth.username}</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder={t.auth.enterUsername}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t.auth.password}</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder={t.auth.enterPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.auth.loggingIn : t.auth.login}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">{t.auth.username}</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder={t.auth.chooseUsername}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t.auth.password}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder={t.auth.choosePassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {t.roles.roleAssignmentNote}
                  </AlertDescription>
                </Alert>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.auth.creatingAccount : t.auth.signup}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
