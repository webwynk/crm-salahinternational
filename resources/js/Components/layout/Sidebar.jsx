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
                <div className="h-16 flex items-center justify-between px-3.5 pt-[10px] pb-1 border-b border-neutral-800 shrink-0">
                    <Link
                        href="/dashboard"
                        className={`flex items-center gap-3 overflow-hidden min-w-0 ${isCollapsed ? 'justify-center w-full' : ''}`}
                        onClick={onCloseMobile}
                        title="Salah International CRM"
                    >
                        {isCollapsed ? (
                            <img
                                src="/images/favicon.png"
                                alt="Salah International"
                                className="w-7 h-7 object-contain shrink-0 transition-transform hover:scale-105"
                            />
                        ) : (
                            <img
                                src="/images/logo.png"
                                alt="Salah International"
                                className="h-7 w-auto max-w-[160px] object-contain shrink-0 transition-all"
                            />
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
                                className={`flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium transition-all group ${
                                    item.active
                                        ? 'bg-brand-500/15 text-brand-400 font-bold border border-brand-500/20 shadow-xs'
                                        : 'text-neutral-400 hover:bg-neutral-800/80 hover:text-white'
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

                {/* Bottom Pinned User Card & Collapse Control */}
                <div className="p-2 border-t border-neutral-800/90 space-y-2 shrink-0 bg-neutral-900/95">
                    {/* Unified User Card Container */}
                    <div className="relative group p-2 rounded-xl bg-neutral-800/70 hover:bg-neutral-800 border border-neutral-700/60 transition-all shadow-xs flex items-center justify-between gap-2">
                        <Link
                            href={route('profile.edit')}
                            onClick={onCloseMobile}
                            title={isCollapsed ? `Profile: ${user?.name}` : undefined}
                            className="flex items-center gap-2.5 min-w-0 flex-1 group/user"
                        >
                            {/* Avatar Badge */}
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs border border-brand-400/30 group-hover/user:scale-105 transition-transform">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>

                            {!isCollapsed && user && (
                                <div className="truncate min-w-0 flex-1">
                                    <p className="text-xs font-bold text-neutral-100 truncate leading-snug group-hover/user:text-white transition-colors">
                                        {user.name}
                                    </p>
                                    <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[9px] font-mono font-bold tracking-wider uppercase rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                                        {user.role}
                                    </span>
                                </div>
                            )}
                        </Link>

                        {/* Quick Sign Out Action Button */}
                        {!isCollapsed && (
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                title="Sign out"
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-danger-400 hover:bg-danger-500/15 transition-all shrink-0 touch-manipulation"
                            >
                                <LogOut className="w-4 h-4" strokeWidth={2} />
                            </Link>
                        )}
                    </div>

                    {/* Collapsed Rail Signout Link fallback */}
                    {isCollapsed && (
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            title="Sign out"
                            className="flex items-center justify-center w-full py-2 rounded-xl text-neutral-400 hover:text-danger-400 hover:bg-danger-500/15 transition-all"
                        >
                            <LogOut className="w-4 h-4" strokeWidth={2} />
                        </Link>
                    )}

                    {/* Desktop Collapse / Expand Toggle Bar */}
                    <button
                        onClick={onToggleCollapse}
                        className="hidden lg:flex w-full items-center justify-between px-3 py-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/80 transition-all text-[11px] font-medium group"
                        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                    >
                        {!isCollapsed && <span className="text-neutral-400 group-hover:text-neutral-200">Collapse rail</span>}
                        <div className={`p-1 rounded-md bg-neutral-800 group-hover:bg-neutral-700 transition-colors ${isCollapsed ? 'mx-auto' : ''}`}>
                            {isCollapsed ? (
                                <ChevronRight className="w-3.5 h-3.5 text-neutral-300" strokeWidth={2} />
                            ) : (
                                <ChevronLeft className="w-3.5 h-3.5 text-neutral-300" strokeWidth={2} />
                            )}
                        </div>
                    </button>
                </div>
            </aside>
        </>
    );
}
