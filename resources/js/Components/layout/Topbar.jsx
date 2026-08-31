import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, Clock } from 'lucide-react';
import Badge from '@/Components/ui/Badge';

/**
 * Topbar — sticky top header with hamburger (mobile), breadcrumb, live IST clock, and user profile.
 */
export default function Topbar({ onOpenMobile }) {
    const { url, props } = usePage();
    const user = props.auth?.user;
    const [istTime, setIstTime] = useState('');

    useEffect(() => {
        const updateTime = () => {
            try {
                const formatter = new Intl.DateTimeFormat('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                });
                setIstTime(formatter.format(new Date()));
            } catch (e) {
                setIstTime(new Date().toLocaleTimeString());
            }
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Derive a simple breadcrumb label from the current URL
    const breadcrumb = (() => {
        if (url.startsWith('/dashboard'))   return 'Dashboard';
        if (url.startsWith('/products/create')) return 'Products → New';
        if (url.startsWith('/products') && url.includes('/edit')) return 'Products → Edit';
        if (url.startsWith('/products'))    return 'Products & BOM';
        if (url.startsWith('/materials'))   return 'Materials & Stock';
        if (url.startsWith('/labour'))      return 'Labour Artisans';
        if (url.startsWith('/assignments/create')) return 'Assignments → New';
        if (url.startsWith('/assignments') && url.length > '/assignments'.length + 2) return 'Assignments → Detail';
        if (url.startsWith('/assignments')) return 'Work Assignments';
        if (url.startsWith('/profile'))     return 'Profile & Settings';
        return 'Leather CRM';
    })();

    const roleVariant = user?.role === 'ADMIN' ? 'warning' : 'neutral';

    return (
        <header className="h-14 bg-neutral-0 border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
            <div className="flex items-center gap-3">
                {/* Hamburger — mobile only */}
                <button
                    onClick={onOpenMobile}
                    className="p-1.5 rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 lg:hidden transition-colors"
                    aria-label="Open navigation"
                >
                    <Menu className="w-5 h-5" strokeWidth={1.75} />
                </button>

                {/* Breadcrumb / page context */}
                <span className="text-sm font-semibold text-neutral-800 hidden sm:block">
                    {breadcrumb}
                </span>

                {/* Live Indian Standard Time (IST) Clock Badge */}
                {istTime && (
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-50 border border-neutral-200 text-xs font-medium text-neutral-600 tabular-nums shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        <span>{istTime}</span>
                        <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-neutral-200/80 text-neutral-700">IST</span>
                    </div>
                )}
            </div>

            {/* Right section — role badge + profile link */}
            {user && (
                <div className="flex items-center gap-3">
                    <Badge variant={roleVariant} className="hidden sm:inline-flex">
                        {user.role}
                    </Badge>

                    <Link
                        href={route('profile.edit')}
                        className="flex items-center gap-2 pl-3 border-l border-neutral-200 hover:opacity-80 transition-opacity"
                        title="Your profile"
                    >
                        <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shadow-xs select-none">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="hidden md:block text-left leading-tight">
                            <p className="text-xs font-semibold text-neutral-800 truncate max-w-[100px]">{user.name}</p>
                            <p className="text-[11px] text-neutral-400 truncate max-w-[100px]">{user.email}</p>
                        </div>
                    </Link>
                </div>
            )}
        </header>
    );
}
