import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{t.unauthorized.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            {t.unauthorized.message}
          </p>
          <p className="text-center text-sm text-muted-foreground">
            {t.unauthorized.contactAdmin}
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.unauthorized.goHome}
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
              {t.unauthorized.goBack}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
