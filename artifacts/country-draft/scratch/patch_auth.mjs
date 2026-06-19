import fs from 'fs';
import path from 'path';

const authFile = path.resolve('src/lib/use-firebase-auth.ts');
let authContent = fs.readFileSync(authFile, 'utf-8');

authContent = authContent.replace(
  'import { useState, useEffect, useCallback } from "react";',
  'import { useState, useEffect, useCallback, createContext, useContext } from "react";\n\nconst AuthContext = createContext<FirebaseAuthState | null>(null);'
);

authContent = authContent.replace(
  'export function useFirebaseAuth(): FirebaseAuthState {',
  'export function AuthProvider({ children }: { children: React.ReactNode }) {'
);

authContent = authContent.replace(
  '  return {\n    firebaseUser,\n    profile,\n    isLoading,\n    isAuthenticated: !!firebaseUser && !!profile,\n    needsUsername: !!firebaseUser && !profile && !isLoading,\n    signInWithGoogle,\n    signInWithEmail,\n    logout,\n    refreshProfile,\n  };\n}',
  '  const value = {\n    firebaseUser,\n    profile,\n    isLoading,\n    isAuthenticated: !!firebaseUser && !!profile,\n    needsUsername: !!firebaseUser && !profile && !isLoading,\n    signInWithGoogle,\n    signInWithEmail,\n    logout,\n    refreshProfile,\n  };\n  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;\n}\n\nexport function useFirebaseAuth(): FirebaseAuthState {\n  const context = useContext(AuthContext);\n  if (!context) {\n    throw new Error("useFirebaseAuth must be used within an AuthProvider");\n  }\n  return context;\n}'
);

fs.writeFileSync(authFile, authContent);

const appFile = path.resolve('src/App.tsx');
let appContent = fs.readFileSync(appFile, 'utf-8');

appContent = appContent.replace(
  'import { ThemeProvider } from "@/lib/theme-context";',
  'import { ThemeProvider } from "@/lib/theme-context";\nimport { AuthProvider } from "@/lib/use-firebase-auth";'
);

appContent = appContent.replace(
  '        <ThemeProvider>',
  '        <ThemeProvider>\n          <AuthProvider>'
);

appContent = appContent.replace(
  '        </ThemeProvider>',
  '          </AuthProvider>\n        </ThemeProvider>'
);

fs.writeFileSync(appFile, appContent);

console.log('Done auth patch');
