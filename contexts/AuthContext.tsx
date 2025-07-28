"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
// If using Supabase, import the client helper. If not, adapt to your auth provider.
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface User {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error?: string | null;
  signIn?: (email: string, password: string) => Promise<User | null>;
  signOut?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user session state on mount
  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        setIsLoading(true);
        // Get session (adapt this code for your auth solution as needed)
        const { data, error } = await supabase.auth.getSession();
        if (mounted) {
          if (error || !data.session) {
            setUser(null);
          } else {
            const u = data.session.user as any;
            setUser({
              id: u.id,
              email: u.email,
              name: u.user_metadata?.name ?? "",
              avatarUrl: u.user_metadata?.avatar_url ?? "",
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const u = session?.user as any | undefined;
      setUser(
        u
          ? {
              id: u.id,
              email: u.email,
              name: u.user_metadata?.name ?? "",
              avatarUrl: u.user_metadata?.avatar_url ?? "",
            }
          : null
      );
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Optionally add login/logout helpers
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return null;
      }
      // Session event handler will update user state.
      return data.user as User;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await supabase.auth.signOut();
      // Session event handler will update user state.
    } catch (e) {
      setError("Error signing out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
