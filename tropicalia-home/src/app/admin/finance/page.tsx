'use client';

import { useEffect, useState } from 'react';

interface FinanceData {
    id: string;
    week_label: string;
    revenue_total: number;
    costs_total: number;
}

export default function AdminFinance() {
    const [financeData, setFinanceData] = useState<FinanceData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFinance() {
            try {
                const res = await fetch('/api/admin/finance');
                if (res.ok) {
                    const data = await res.json();
                    setFinanceData(data);
                }
            } catch (error) {
                console.error("Failed to fetch finance data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchFinance();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Weekly Finance</h1>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Week Label</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costs</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                                </tr>
                            ) : financeData.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No finance data available.</td>
                                </tr>
                            ) : (
                                financeData.map((item) => {
                                    const profit = item.revenue_total - item.costs_total;
                                    const margin = item.revenue_total > 0 ? (profit / item.revenue_total) * 100 : 0;

                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.week_label}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                                                ${item.revenue_total}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                                ${item.costs_total}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                                ${profit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {margin.toFixed(1)}%
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
