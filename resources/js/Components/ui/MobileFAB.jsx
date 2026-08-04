import React from 'react';
import { Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

export default function MobileFAB({ href, label = 'New Item', icon: Icon = Plus }) {
    return (
        <Link
            href={href}
            aria-label={label}
            className="md:hidden fixed right-4 bottom-20 z-40 w-12 h-12 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg flex items-center justify-center transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
            <Icon className="w-6 h-6" strokeWidth={2} />
        </Link>
    );
}
