import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export type AuthUser = {
    userId: number;
    email: string;
    role: UserRole;
    studentId?: number;
    teacherId?: number;
};

type AuthContextType = {
    user: AuthUser | null;
    login: (user: AuthUser) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'sdu_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? (JSON.parse(stored) as AuthUser) : null;
        } catch {
            return null;
        }
    });

    const login = (authUser: AuthUser) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        setUser(authUser);
    };

    const logout = () => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
