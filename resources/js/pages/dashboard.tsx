import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
  BookOpen,
  Layers,
  Library,
  Archive,
  Undo2,
  BookX
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface StatsProps {
  stats: {
    total_books: number;
    available_books: number;
    total_sections: number;
    deweys: number;
    issued_books: number;
    not_returned_books: number;
    returned_books: number;
  };
}

type Props = {
  mostBorrowed: {
    id: number;
    title: string;
    author: string;
    borrow_count: number;
  }[];
  leastBorrowed: {
    id: number;
    title: string;
    author: string;
    borrow_count: number;
  }[];
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard({ stats }: StatsProps) {
  const { mostBorrowed = [], leastBorrowed = [] } = usePage<Props>().props;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />
      <div className="flex h-screen">
        <div className="flex-1 p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Books */}
            <a href="/books">
              <div className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                <div className="w-12 h-12 bg-gray-300 rounded-sm flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-black dark:text-white" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Books</p>
                  <p className="text-2xl font-bold">{stats.total_books}</p>
                </div>
              </div>
            </a>

            {/* Total Sections */}
            <a href="/section">
              <div className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                <div className="w-12 h-12 bg-gray-300 rounded-sm flex items-center justify-center">
                  <Library className="w-6 h-6 text-black dark:text-white" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Sections</p>
                  <p className="text-2xl font-bold">{stats.total_sections}</p>
                </div>
              </div>
            </a>

            {/* Total Books Dewey */}
            <a href="/deweys">
              <div className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                <div className="w-12 h-12 bg-gray-300 rounded-sm flex items-center justify-center">
                  <Archive className="w-6 h-6 text-black dark:text-white" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Books Dewey</p>
                  <p className="text-2xl font-bold">{stats.deweys}</p>
                </div>
              </div>
            </a>

            {/* Issued Books */}
            <a href="/issuedbooks">
              <div className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                <div className="w-12 h-12 bg-gray-300 rounded-sm flex items-center justify-center">
                  <Undo2 className="w-6 h-6 text-black dark:text-white" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Issued Books</p>
                  <p className="text-2xl font-bold">{stats.issued_books}</p>
                </div>
              </div>
            </a>
          </div>

          {/* Borrowing Report */}
          <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">
              Borrowing Report
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Most Borrowed */}
              <div className="p-4 bg-green-100 dark:bg-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-8 h-8 text-green-700 dark:text-green-300" />
                  <h3 className="text-md font-bold text-gray-800 dark:text-white">
                    Most Borrowed Books
                  </h3>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={mostBorrowed.slice(0, 5)} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="borrow_count" fill="#16a34a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Least Borrowed */}
              <div className="p-4 bg-red-100 dark:bg-red-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <BookX className="w-8 h-8 text-red-700 dark:text-red-300" />
                  <h3 className="text-md font-bold text-gray-800 dark:text-white">
                    Least Borrowed Books
                  </h3>
                </div>

                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={leastBorrowed.slice(0, 5)} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="title" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="borrow_count" fill="#dc2626" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
