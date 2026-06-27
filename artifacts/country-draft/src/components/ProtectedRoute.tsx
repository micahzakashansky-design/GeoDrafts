import { ReactNode, useEffect } from "react";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { useLocation } from "wouter";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { firebaseUser, isLoading } = useFirebaseAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      setLocation("/");
    }
  }, [isLoading, firebaseUser, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!firebaseUser) {
    return null;
  }

  return <>{children}</>;
}
