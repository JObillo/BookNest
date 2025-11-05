import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from "@/components/ui/sidebar";

import { type NavItem } from "@/types";
import { Link, usePage, useRemember } from "@inertiajs/react";
import { ChevronDown } from "lucide-react";
import { useEffect } from "react";

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    const [open, setOpen] = useRemember<string | null>(null, "sidebar-open");

    const toggle = (title: string) => {
        setOpen(open === title ? null : title);
    };

    // Keep dropdown open when inside child page
    useEffect(() => {
        const activeParent = items.find(item =>
            item.children?.some(child => page.url.startsWith(child.href ?? ""))
        );

        if (activeParent && open !== activeParent.title) {
            setOpen(activeParent.title);
        }
    }, [page.url]);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map(item => {
                    const isActive = page.url.startsWith(item.href ?? "");

                    return (
                        <SidebarMenuItem key={item.title}>
                            {item.children ? (
                                <>
                                    <SidebarMenuButton
                                        onClick={() => toggle(item.title)}
                                        className={`transition ${
                                            isActive
                                                ? "bg-primary/15 text-primary font-semibold hover:bg-primary/15"
                                                : "hover:bg-accent"
                                        }`}
                                    >
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                        <ChevronDown
                                            className={`ml-auto transition-transform ${
                                                open === item.title ? "rotate-180" : ""
                                            }`}
                                        />
                                    </SidebarMenuButton>

                                    {open === item.title && (
                                        <div className="ml-6 mt-1 space-y-1">
                                            {item.children.map(child => {
                                                const childActive = page.url.startsWith(child.href ?? "");

                                                return (
                                                    <Link
                                                        key={child.title}
                                                        href={child.href || "#"}
                                                        className={`flex items-center gap-2 px-2 py-1 text-sm rounded-md transition ${
                                                            childActive
                                                                ? "bg-primary/15 text-primary font-semibold hover:bg-primary/15"
                                                                : "hover:bg-accent"
                                                        }`}
                                                    >
                                                        {child.icon && <child.icon />}
                                                        <span>{child.title}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <SidebarMenuButton
                                    asChild
                                    tooltip={{ children: item.title }}
                                    className={`transition ${
                                        isActive
                                            ? "bg-primary/15 text-primary font-semibold hover:bg-primary/15"
                                            : "hover:bg-accent"
                                    }`}
                                >
                                    <Link href={item.href || "#"} prefetch>
                                        {item.icon && <item.icon className="w-4 h-4" />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
