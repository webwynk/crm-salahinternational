import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    Layers,
    Users,
    ClipboardList,
    Gem,
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

    return (
        <>
            {/* Scrim Backdrop — Mobile & Tablet off-canvas drawer (<1024px) */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-neutral-950/70 backdrop-blur-xs lg:hidden transition-opacity"
                    onClick={onCloseMobile}
                />
            )}

            <aside
                className={`fixed top-0 left-0 bottom-0 z-40 bg-neutral-900 text-white flex flex-col transition-all duration-200 ${
                    isCollapsed ? 'w-[72px]' : 'w-60'
                } ${
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
            >
                {/* Brand Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-800 shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden min-w-0" onClick={onCloseMobile}>
                        <div className="w-9 h-9 rounded-md bg-brand-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                            <Gem className="w-5 h-5" strokeWidth={1.75} />
                        </div>
                        {!isCollapsed && (
                            <div className="truncate min-w-0">
                                <h1 className="font-bold text-sm text-white leading-tight tracking-tight truncate">
                                    Salah Intl.
                                </h1>
                                <span className="text-[10px] text-neutral-400 block tracking-widest uppercase font-mono">
                                    Manufacturing CRM
                                </span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Nav Items — 44px Row Height with Left Accent Bar */}
                <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-thin">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={onCloseMobile}
                                title={isCollapsed ? item.label : undefined}
                                className={`flex items-center gap-3 px-3 h-11 rounded-md text-sm font-medium transition-all group ${
                                    item.active
                                        ? 'border-l-4 border-brand-500 bg-brand-500/10 text-brand-300 font-semibold pl-2.5'
                                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                }`}
                            >
                                <Icon
                                    className={`w-5 h-5 shrink-0 ${item.active ? 'text-brand-400' : 'text-neutral-400 group-hover:text-white'}`}
                                    strokeWidth={1.75}
                                />
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Pinned User Section */}
                <div className="px-2 pb-3 pt-2 border-t border-neutral-800 space-y-1 shrink-0">
                    <Link
                        href={route('profile.edit')}
                        onClick={onCloseMobile}
                        title={isCollapsed ? `Profile: ${user?.name}` : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                            url.startsWith('/profile')
                                ? 'bg-neutral-800 text-white'
                                : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                        }`}
                    >
                        <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {!isCollapsed && user && (
                            <div className="truncate min-w-0 flex-1">
                                <p className="text-xs font-semibold text-white truncate leading-tight">{user.name}</p>
                                <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">
                                    {user.role}
                                </span>
                            </div>
                        )}
                    </Link>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        title="Sign out"
                        className="flex items-center gap-3 px-3 py-2 rounded-md w-full text-neutral-400 hover:bg-neutral-800 hover:text-danger-400 transition-colors text-sm"
                    >
                        <LogOut className="w-4.5 h-4.5 shrink-0" strokeWidth={1.75} />
                        {!isCollapsed && <span className="text-xs font-medium">Sign out</span>}
                    </Link>

                    <button
                        onClick={onToggleCollapse}
                        className="hidden lg:flex w-full items-center justify-center py-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        {isCollapsed
                            ? <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
                            : <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
                        }
                    </button>
                </div>
            </aside>
        </>
    );
}
