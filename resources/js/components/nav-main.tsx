import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from "lucide-react";
import { useState } from "react";


export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const [open, setOpen] = useState<string | null>(null);

    const toggle = (title: string) => {
        setOpen(open === title ? null : title);
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {item.children ? (
                            <>
                                <SidebarMenuButton onClick={() => toggle(item.title)}>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    <ChevronDown className={`ml-auto transition-transform ${open === item.title ? "rotate-180" : ""}`} />
                                </SidebarMenuButton>
                                {open === item.title && (
                                    <div className="ml-6 mt-1 space-y-1">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.title}
                                                href={child.href || "#"}
                                                className={`flex items-center gap-2 px-2 py-1 text-sm rounded-md hover:bg-accent ${
                                                    child.href === page.url ? "bg-accent font-medium" : ""
                                                }`}
                                            >
                                                {child.icon && <child.icon />}
                                                <span>{child.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <SidebarMenuButton asChild isActive={item.href === page.url} tooltip={{ children: item.title }}>
                                <Link href={item.href || "#"} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
