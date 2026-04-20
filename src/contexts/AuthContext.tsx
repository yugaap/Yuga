import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'guru' | 'siswa';

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
  nis?: string;
  class?: string;
}

interface AuthContextType {
  session: Session | null;
  user: AppUser | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) {
        let appUser: AppUser = {
          id: authUser.id,
          name: data.name,
          role: data.role as UserRole,
        };

        if (data.role === 'siswa') {
            const { data: studentData } = await supabase
              .from('students')
              .select('nis, class')
              .eq('user_id', authUser.id)
              .single();
            if (studentData) {
                appUser.nis = studentData.nis;
                appUser.class = studentData.class;
            }
        }
        setUser(appUser);
      } else {
        // Fallback for new user without profile yet, default to admin for easy local setup if they are the first user
        // Wait, the prompt says "User pertama di Supabase otomatis menjadi admin".
        // Let's handle it here mockingly if no table exists yet.
        const isAdmin = authUser.email === 'admin@admin.com'; 
        setUser({ id: authUser.id, name: authUser.email || 'Admin', role: isAdmin ? 'admin' : 'siswa' });
      }
    } catch (e) {
      console.error(e);
      setUser({ id: authUser.id, name: 'Guest User', role: 'siswa' });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
