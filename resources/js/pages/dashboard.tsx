import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Bell, BookOpen, Library, Archive, Undo2, BookX } from 'lucide-react';
import axios from 'axios';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
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
  notifications: {
    id: string;
    data: {
      message: string;
      due_date: string;
    };
  }[];
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard({ stats }: StatsProps) {
  const { mostBorrowed = [], leastBorrowed = [], notifications = [] } =
    usePage<Props>().props;

  const [open, setOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(notifications);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const markAsRead = async (id: string) => {
    try {
      setLoadingIds((prev) => [...prev, id]);
      await axios.post(`/notifications/${id}/read`);
      setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    } finally {
      setLoadingIds((prev) => prev.filter((x) => x !== id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dashboard" />

      <div className="flex min-h-screen overflow-x-hidden">
        <div className="flex-1 p-6 space-y-6">
          {/* Bell beside breadcrumb title */}
          <div className="absolute top-3 left-30 flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Bell className="w-6 h-6 text-gray-700 dark:text-white" />
              {localNotifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-600 text-white text-xs px-1 rounded-full">
                  {localNotifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Notification Drawer */}
          {open && (
            <>
              <div
                onClick={() => setOpen(false)}
                className="fixed inset-0 bg-black/50 z-40"
              ></div>
              <div className="fixed top-0 right-0 w-150 h-screen bg-white dark:bg-gray-800 shadow-xl z-50 transition-transform">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="font-bold text-lg">Notifications</h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
                  {localNotifications.length === 0 ? (
                    <p className="text-gray-500">No notifications</p>
                  ) : (
                    localNotifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        disabled={loadingIds.includes(n.id)}
                        className="w-full text-left p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <p className="text-sm text-gray-800 dark:text-white">
                          {n.data.message}
                        </p>
                        <span className="text-xs text-gray-500">
                          Due date: {n.data.due_date}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/books">
              <div className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                <div className="w-12 h-12 bg-gray-300 rounded-sm flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-black dark:text-white" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total Books
                  </p>
                  <p className="text-2xl font-bold">{stats.total_books}</p>
                </div>
              </div>
            </a>

            <a href="/section">
              <div className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                <div className="w-12 h-12 bg-gray-300 rounded-sm flex items-center justify-center">
                  <Library className="w-6 h-6 text-black dark:text-white" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total Sections
                  </p>
                  <p className="text-2xl font-bold">{stats.total_sections}</p>
                </div>
              </div>
            </a>

            <a href="/deweys">
              <div className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                <div className="w-12 h-12 bg-gray-300 rounded-sm flex items-center justify-center">
                  <Archive className="w-6 h-6 text-black dark:text-white" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total Books Dewey
                  </p>
                  <p className="text-2xl font-bold">{stats.deweys}</p>
                </div>
              </div>
            </a>

            <a href="/issuedbooks">
              <div className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white p-4 rounded-lg shadow-md flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer">
                <div className="w-12 h-12 bg-gray-300 rounded-sm flex items-center justify-center">
                  <Undo2 className="w-6 h-6 text-black dark:text-white" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Issued Books
                  </p>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Most Borrowed */}
              <div className="flex flex-col justify-between p-4 bg-green-100 dark:bg-green-800 rounded-lg h-[400px]">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-8 h-8 text-green-700 dark:text-green-300" />
                    <h3 className="text-md font-bold text-gray-800 dark:text-white">
                      Most Borrowed Books
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={mostBorrowed.filter((b) => b.borrow_count > 1)}
                      margin={{ top: 30, right: 20, left: 10, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="title"
                        tick={{ fontSize: 12, fill: "#374151" }}
                        interval={0}
                        tickFormatter={(value) =>
                          value.length > 12
                            ? value.slice(0, 12) + '…'
                            : value
                        }
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="borrow_count"
                        fill="#16a34a"
                        radius={[6, 6, 0, 0]}
                      >
                        <LabelList
                          dataKey="borrow_count"
                          position="top"
                          fill="#111827"
                          fontSize={12}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Least Borrowed */}
              <div className="flex flex-col justify-between p-4 bg-red-100 dark:bg-red-800 rounded-lg h-[400px]">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookX className="w-8 h-8 text-red-700 dark:text-red-300" />
                    <h3 className="text-md font-bold text-gray-800 dark:text-white">
                      Least Borrowed Books
                    </h3>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={leastBorrowed.filter((b) => b.borrow_count <= 2)}
                      margin={{ top: 30, right: 20, left: 10, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="title"
                        tick={{ fontSize: 12, fill: '#374151' }}
                        interval={0}
                        tickFormatter={(value) =>
                          value.length > 12
                            ? value.slice(0, 12) + '…'
                            : value
                        }
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar
                        dataKey="borrow_count"
                        fill="#dc2626"
                        radius={[6, 6, 0, 0]}
                      >
                        <LabelList
                          dataKey="borrow_count"
                          position="top"
                          fill="#111827"
                          fontSize={12}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
