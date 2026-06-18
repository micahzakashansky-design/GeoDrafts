import { useState, useEffect, useCallback, createContext, useContext } from "react";

const AuthContext = createContext<FirebaseAuthState | null>(null);
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";
import { getUserProfile, type UserProfile } from "./firestore";

export type FirebaseAuthState = {
  firebaseUser: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsUsername: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, create?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (user: User) => {
    const p = await getUserProfile(user.uid);
    setProfile(p);
    return p;
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchProfile(user);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });
    return unsub;
  }, [fetchProfile]);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, password: string, create = false) => {
      if (create) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (firebaseUser) await fetchProfile(firebaseUser);
  }, [firebaseUser, fetchProfile]);

  const value = {
    firebaseUser,
    profile,
    isLoading,
    isAuthenticated: !!firebaseUser && !!profile,
    needsUsername: !!firebaseUser && !profile && !isLoading,
    signInWithGoogle,
    signInWithEmail,
    logout,
    refreshProfile,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useFirebaseAuth(): FirebaseAuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useFirebaseAuth must be used within an AuthProvider");
  }
  return context;
}
