'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, RefreshCw, DollarSign } from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';

/**
 * Returns a Badge variant + label for a payment record.
 * Payments only have an `amount` — we treat any non-voided record as "paid"
 * and voided as "voided".
 */
function PaymentBadge({ voided }) {
    if (voided) {
        return (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
                Voided
            </Badge>
        );
    }
    return (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
            Paid
        </Badge>
    );
}

/**
 * FinanceView — lists all school payments with export.
 *
 * Props:
 *   onNavigate    (view: string) => void
 *   formatCurrency (val: number) => string
 */
export default function FinanceView({ onNavigate, formatCurrency }) {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPayments = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, status } = await ApiProxy.get('/api/payments?limit=200&offset=0');
            if (status === 200) {
                setPayments(Array.isArray(data) ? data : []);
            } else {
                setError(data?.message || 'Failed to load payments.');
            }
        } catch {
            setError('Unable to reach the payments service. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const handleExport = () => {
        const json = JSON.stringify(payments, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payments-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const totalRevenue = payments
        .filter((p) => !p.voided)
        .reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-[1600px] mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onNavigate('dashboard')}
                        className="flex items-center gap-1"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">Finance</h2>
                        <p className="text-sm text-muted-foreground">
                            Payment records for your school
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchPayments}
                        disabled={loading}
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={payments.length === 0}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export JSON
                    </Button>
                </div>
            </div>

            {/* Summary card */}
            {!loading && !error && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total received</p>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(totalRevenue)}
                                </p>
                            </div>
                            <div className="ml-auto text-right">
                                <p className="text-sm text-muted-foreground">
                                    {payments.filter((p) => !p.voided).length} payments
                                </p>
                                <p className="text-sm text-red-500">
                                    {payments.filter((p) => p.voided).length} voided
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Error state */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <Card>
                    <CardContent className="p-6 space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div
                                key={i}
                                className="h-10 bg-gray-100 rounded animate-pulse"
                            />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Payments table */}
            {!loading && !error && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Payment Records</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {payments.length === 0 ? (
                            <div className="py-16 text-center text-muted-foreground">
                                <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-30" />
                                <p>No payments recorded yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-gray-50 text-left">
                                            <th className="px-4 py-3 font-medium text-muted-foreground">
                                                ID
                                            </th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">
                                                Booking
                                            </th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">
                                                Amount
                                            </th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">
                                                Method
                                            </th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">
                                                Reference
                                            </th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">
                                                Payment Date
                                            </th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((payment) => (
                                            <tr
                                                key={payment.id}
                                                className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    #{payment.id}
                                                </td>
                                                <td className="px-4 py-3">
                                                    #{payment.booking_id}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {formatCurrency(payment.amount)}
                                                </td>
                                                <td className="px-4 py-3 capitalize text-muted-foreground">
                                                    {payment.payment_method || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                                                    {payment.reference || '—'}
                                                </td>
                                                <td className="px-4 py-3 text-muted-foreground">
                                                    {payment.payment_date
                                                        ? new Date(
                                                              payment.payment_date
                                                          ).toLocaleDateString('en-ZA')
                                                        : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <PaymentBadge voided={payment.voided} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
