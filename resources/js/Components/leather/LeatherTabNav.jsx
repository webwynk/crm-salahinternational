import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Scissors, FileText, Users } from 'lucide-react';

export default function LeatherTabNav() {
    const { url } = usePage();

    const tabs = [
        {
            label: 'Leather Stock',
            href: route('leather.index'),
            icon: Scissors,
            isActive: url === '/leather' || (url.startsWith('/leather') && !url.startsWith('/leather/challan') && !url.startsWith('/leather/cutter')),
        },
        {
            label: 'Cutting Challans',
            href: route('leather.challans.index'),
            icon: FileText,
            isActive: url.startsWith('/leather/challan'),
        },
        {
            label: 'Cutters Directory',
            href: route('leather.cutters.index'),
            icon: Users,
            isActive: url.startsWith('/leather/cutter'),
        },
    ];

    return (
        <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 mb-6 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <Link
                        key={tab.label}
                        href={tab.href}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                            tab.isActive
                                ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400 font-bold'
                                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
