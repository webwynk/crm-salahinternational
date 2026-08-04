import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Package, Layers, Users, ClipboardList } from 'lucide-react';

/**
 * MobileBottomNav — Fixed bottom tab bar for mobile viewports (<768px).
 * Includes safe-area inset padding for iOS devices.
 */
export default function MobileBottomNav() {
    const { url } = usePage();

    const items = [
        { label: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: url.startsWith('/dashboard') },
        { label: 'Products', href: route('products.index'), icon: Package, active: url.startsWith('/products') },
        { label: 'Materials', href: route('materials.index'), icon: Layers, active: url.startsWith('/materials') },
        { label: 'Artisans', href: route('labour.index'), icon: Users, active: url.startsWith('/labour') },
        { label: 'Orders', href: route('assignments.index'), icon: ClipboardList, active: url.startsWith('/assignments') },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-900 border-t border-neutral-800 px-2 py-1.5 pb-safe flex items-center justify-around shadow-lg">
            {items.map((item) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`flex flex-col items-center py-1 px-2.5 rounded-md text-[10px] font-medium transition-colors ${
                            item.active ? 'text-brand-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
                        }`}
                    >
                        <Icon className={`w-5 h-5 mb-0.5 ${item.active ? 'text-brand-400' : 'text-neutral-400'}`} strokeWidth={1.75} />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
