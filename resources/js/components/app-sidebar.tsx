import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, CornerDownLeft, Book, Layers } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },

    {
        title: 'Issued Book',
        href: '/issuedbooks',
        icon: BookOpen,
    },

    {
        title: 'Not Returned Books',
        href: '/returnedbooks',
        icon: CornerDownLeft,
    },

    {
        title: 'Manage Books',
        href: '/books',
        icon: Book,
    },

    {
        title: 'Section',
        href: '/section',
        icon: Folder,
    },

    {
        title: 'Dewey',
        href: '/deweys',
        icon: Layers,
    },
    {
        title: 'Manage E-Books',
        href: '/ebooks/manage',
        icon: Book,
    },

    {
        title: 'Report',
        icon: Layers,
        href: '/report',
        children: [
            {
                title: 'Most Borrowed Books',
                href: '/reports/most-borrowed',
            },
            {
                title: 'Least Borrowed Books',
                href: '/reports/least-borrowed',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits',
    //     icon: BookOpen,
    // },
];



export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="floating">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
