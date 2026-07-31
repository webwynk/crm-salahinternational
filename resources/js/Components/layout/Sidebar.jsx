import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    Layers,
    Users,
    ClipboardList,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    LogOut,
} from 'lucide-react';

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
    const { url, props } = usePage();
    const user = props.auth?.user;

    const navItems = [
        {
            label: 'Dashboard',
            href: route('dashboard'),
            icon: LayoutDashboard,
            active: url.startsWith('/dashboard'),
        },
        {
            label: 'Products & BOM',
            href: route('products.index'),
            icon: Package,
            active: url.startsWith('/products'),
        },
        {
            label: 'Materials Master',
            href: route('materials.index'),
            icon: Layers,
            active: url.startsWith('/materials'),
        },
        {
            label: 'Labour Artisans',
            href: route('labour.index'),
            icon: Users,
            active: url.startsWith('/labour'),
        },
        {
            label: 'Work Assignments',
            href: route('assignments.index'),
            icon: ClipboardList,
            active: url.startsWith('/assignments'),
        },
    ];

    const filteredNav = navItems;

    return (
        <>
            {/* Mobile backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-neutral-900/50 lg:hidden"
                    onClick={onCloseMobile}
                />
            )}

            <aside
                className={`fixed top-0 left-0 bottom-0 z-40 bg-neutral-900 text-white flex flex-col transition-all duration-200 ${
                    isCollapsed ? 'w-18' : 'w-60'
                } ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Logo Brand Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-800">
                    <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        {!isCollapsed && (
                            <div className="truncate">
                                <h1 className="font-bold text-sm text-white leading-tight">Leather CRM</h1>
                                <span className="text-[10px] text-neutral-400 block tracking-wider">MANUFACTURING</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {filteredNav.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={onCloseMobile}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                                    item.active
                                        ? 'bg-brand-500 text-white shadow-xs'
                                        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                }`}
                                title={isCollapsed ? item.label : undefined}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile & Collapse Toggle */}
                <div className="p-3 border-t border-neutral-800 space-y-2">
                    {!isCollapsed && user && (
                        <div className="px-3 py-2 rounded-md bg-neutral-800/60 flex items-center justify-between">
                            <div className="truncate pr-2">
                                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                                <span className="text-[10px] text-brand-300 font-semibold uppercase">
                                    {user.role}
                                </span>
                            </div>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-neutral-400 hover:text-danger-500 transition-colors p-1"
                                title="Sign out"
                            >
                                <LogOut className="w-4 h-4" />
                            </Link>
                        </div>
                    )}

                    <button
                        onClick={onToggleCollapse}
                        className="hidden lg:flex w-full items-center justify-center py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>
            </aside>
        </>
    );
}
