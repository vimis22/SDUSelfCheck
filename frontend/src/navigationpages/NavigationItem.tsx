import React from 'react';
import {
    BarChart2,
    BookOpen,
    BookMarked,
    ClipboardList,
    CreditCard,
    FileText,
    GraduationCap,
    HelpCircle,
    Home,
    PenLine,
    Printer,
    Settings,
    UserCheck,
    Users,
} from 'lucide-react';
import type { UserRole } from '../auth/AuthContext.tsx';

export type NavItem = {
    text: string;
    icon: React.ReactNode;
    to: string;
};

const studentNavItems: NavItem[] = [
    { text: 'Home',                icon: <Home size={20} />,         to: '/student-dashboard' },
    { text: 'Undervisning',        icon: <BookOpen size={20} />,     to: '/courses' },
    { text: 'Eksamen',             icon: <ClipboardList size={20} />,to: '/exams' },
    { text: 'Resultater',          icon: <BarChart2 size={20} />,    to: '/results' },
    { text: 'Profil & Studiekort', icon: <CreditCard size={20} />,   to: '/student-card' },
    { text: 'Udskrifter',          icon: <Printer size={20} />,      to: '/documents' },
    { text: 'Hjælp & Support',     icon: <HelpCircle size={20} />,   to: '/help' },
];

const teacherNavItems: NavItem[] = [
    { text: 'Home',               icon: <Home size={20} />,         to: '/teacher-dashboard' },
    { text: 'Mine fag',           icon: <BookMarked size={20} />,   to: '/teacher-dashboard' },
    { text: 'Indtast karakterer', icon: <PenLine size={20} />,      to: '/teacher-dashboard' },
    { text: 'Eksamen',            icon: <ClipboardList size={20} />,to: '/exams' },
    { text: 'Hjælp & Support',    icon: <HelpCircle size={20} />,   to: '/help' },
];

const adminNavItems: NavItem[] = [
    { text: 'Home',                 icon: <Home size={20} />,          to: '/admin-dashboard' },
    { text: 'Brugere',              icon: <Users size={20} />,         to: '/admin-dashboard' },
    { text: 'Studerende',           icon: <GraduationCap size={20} />, to: '/admin-dashboard' },
    { text: 'Undervisere',          icon: <UserCheck size={20} />,     to: '/admin-dashboard' },
    { text: 'Fag',                  icon: <BookOpen size={20} />,      to: '/admin-dashboard' },
    { text: 'Eksamen',              icon: <ClipboardList size={20} />, to: '/admin-dashboard' },
    { text: 'Tilmeldinger',         icon: <FileText size={20} />,      to: '/admin-dashboard' },
    { text: 'Systemadministration', icon: <Settings size={20} />,      to: '/admin-dashboard' },
];

export function getNavItemsByRole(role: UserRole): NavItem[] {
    switch (role) {
        case 'STUDENT': return studentNavItems;
        case 'TEACHER': return teacherNavItems;
        case 'ADMIN':   return adminNavItems;
        default:        return studentNavItems;
    }
}
