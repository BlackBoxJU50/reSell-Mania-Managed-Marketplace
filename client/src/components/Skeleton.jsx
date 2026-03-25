import React from 'react';

export const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export const ProductCardSkeleton = () => (
    <div className="border border-gray-100 rounded-2xl p-4 space-y-4 shadow-sm">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-15" />
        </div>
    </div>
);

export const AdminStatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-3 w-full mt-4" />
            </div>
        ))}
    </div>
);
