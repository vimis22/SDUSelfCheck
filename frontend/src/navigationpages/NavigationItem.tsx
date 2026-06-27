import {BarChart2, BookOpen, ClipboardList, CreditCard, HelpCircle, Home, Printer} from "lucide-react";

export const navItems = [
    { text: 'Home',           icon: <Home size={20} />,         to: '/' },
    { text: 'Undervisning',   icon: <BookOpen size={20} />,     to: '/courses' },
    { text: 'Eksamen',        icon: <ClipboardList size={20} />,to: '/exams' },
    { text: 'Resultater',     icon: <BarChart2 size={20} />,    to: '/results' },
    { text: 'Profil & Studiekort', icon: <CreditCard size={20} />, to: '/student-card' },
    { text: 'Udskrifter',     icon: <Printer size={20} />,      to: '/documents' },
    { text: 'Hjælp & Support',icon: <HelpCircle size={20} />,  to: '/help' },
];