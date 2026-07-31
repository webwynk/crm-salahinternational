import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, LogOut, Shield } from 'lucide-react';
import Badge from '@/Components/ui/Badge';

export default function Topbar({ onOpenMobile }) {
    const { props } = usePage();
    const user = props.auth?.user;

    return (
        <header className="h-16 bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-3">
                <button
                    onClick={onOpenMobile}
                    className="p-2 rounded-md text-neutral-600 hover:bg-neutral-100 lg:hidden"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="text-xs text-neutral-500 font-medium">
                    Leather Goods Manufacturing System
                </div>
            </div>

            {user && (
                <div className="flex items-center gap-4">
                    <Badge variant="brand">
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role} ROLE
                    </Badge>

                    <div className="flex items-center gap-3 pl-3 border-l border-neutral-200">
                        <div className="w-8 h-8 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            {user.name.charAt(0)}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-xs font-semibold text-neutral-900 leading-tight">{user.name}</p>
                            <p className="text-[10px] text-neutral-500 truncate max-w-[120px]">{user.email}</p>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="p-1.5 text-neutral-400 hover:text-danger-500 hover:bg-neutral-100 rounded-md transition-colors ml-1"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
