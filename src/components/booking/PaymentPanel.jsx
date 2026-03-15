'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { X, CreditCard, CheckCircle, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';

const STATUS_COLORS = {
    SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    NO_SHOW: 'bg-red-100 text-red-800 border-red-200',
};

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'eft', label: 'EFT' },
    { value: 'other', label: 'Other' },
];

function formatCurrency(val) {
    if (val === null || val === undefined || isNaN(val)) return 'R0';
    return `R${new Intl.NumberFormat('en-ZA').format(Number(val))}`;
}

function formatDate(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr.endsWith('Z') ? isoStr : isoStr + 'Z');
    return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(isoStr) {
    if (!isoStr) return null;
    const d = new Date(isoStr.endsWith('Z') ? isoStr : isoStr + 'Z');
    return d.toLocaleString('en-ZA', {
        weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false,
    });
}

function PaymentSkeleton() {
    return (
        <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="space-y-1.5">
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                        <div className="h-3 w-14 bg-gray-100 rounded" />
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
            ))}
        </div>
    );
}

/**
 * PaymentPanel — right-side slide-in panel for recording and viewing payments.
 *
 * Props:
 *   booking            — the booking object
 *   onClose            — () => void
 *   onPaymentRecorded  — optional () => void — called after a payment is successfully recorded
 */
export default function PaymentPanel({ booking, onClose, onPaymentRecorded }) {
    const [payments, setPayments] = useState([]);
    const [loadingPayments, setLoadingPayments] = useState(false);
    const [paymentsError, setPaymentsError] = useState(null);

    // Slide-in animation — triggers on the next frame after mount
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const t = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(t);
    }, []);

    // Record payment form
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('cash');
    const [reference, setReference] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Void a specific payment
    const [voidingId, setVoidingId] = useState(null);

    const fetchPayments = async () => {
        if (!booking?.id) return;
        setLoadingPayments(true);
        setPaymentsError(null);
        try {
            const { data, status } = await ApiProxy.get(`/api/payments/booking/${booking.id}`);
            if (status === 200) {
                setPayments(Array.isArray(data) ? data : []);
            } else {
                setPaymentsError('Could not load payment records.');
            }
        } catch {
            setPaymentsError('Unable to reach the service.');
        } finally {
            setLoadingPayments(false);
        }
    };

    // Disable body scroll while panel is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    useEffect(() => {
        setPayments([]);
        setSubmitError(null);
        setSubmitSuccess(false);
        setAmount('');
        setMethod('cash');
        setReference('');
        setNotes('');
        fetchPayments();
    }, [booking?.id]);

    if (!booking) return null;

    const learnerName =
        booking.learner_name ||
        `${booking.temp_learner_name || ''} ${booking.temp_learner_surname || ''}`.trim() ||
        `Booking #${booking.id}`;

    const statusKey = booking.status?.toUpperCase();
    const statusColorClass = STATUS_COLORS[statusKey] || STATUS_COLORS.PENDING;

    // Payment summary — use booking.amount_paid immediately (no loading wait);
    // once the fetch resolves, switch to the sum of live payment records.
    const totalAmount = Number(booking.total_amount) || 0;
    const activePayments = payments.filter(p => !p.voided);
    const summaryPaid = loadingPayments
        ? (Number(booking.amount_paid) || 0)
        : activePayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const outstanding = Math.max(0, totalAmount - summaryPaid);
    const progressPct = totalAmount > 0 ? Math.min(100, (summaryPaid / totalAmount) * 100) : 0;
    const isFullyPaid = totalAmount > 0 && summaryPaid >= totalAmount;

    const paymentStatusLabel = totalAmount === 0
        ? 'No amount set'
        : isFullyPaid ? 'Paid'
        : summaryPaid > 0 ? 'Partial'
        : 'Unpaid';

    const paymentStatusColor = totalAmount === 0
        ? 'bg-gray-100 text-gray-600 border-gray-200'
        : isFullyPaid
            ? 'bg-green-100 text-green-800 border-green-200'
            : summaryPaid > 0
                ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                : 'bg-red-100 text-red-800 border-red-200';

    const handleSubmit = async (e) => {
        e.preventDefault();
        const parsedAmount = parseFloat(amount);
        if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
            setSubmitError('Please enter a valid amount greater than zero.');
            return;
        }
        setSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);
        try {
            const body = {
                booking_id: booking.id,
                amount: parsedAmount,
                payment_method: method || null,
                reference: reference.trim() || null,
                notes: notes.trim() || null,
            };
            if (booking.learner_id) body.learner_id = booking.learner_id;

            const { status } = await ApiProxy.post('/api/payments', body);
            if (status === 200 || status === 201) {
                setSubmitSuccess(true);
                setAmount('');
                setReference('');
                setNotes('');
                setMethod('cash');
                await fetchPayments();
                if (onPaymentRecorded) onPaymentRecorded();
                setTimeout(() => setSubmitSuccess(false), 3000);
            } else {
                setSubmitError('Failed to record payment. Please try again.');
            }
        } catch {
            setSubmitError('Unable to reach the service. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVoid = async (paymentId) => {
        if (!window.confirm('Void this payment record? This cannot be undone.')) return;
        setVoidingId(paymentId);
        try {
            const { status } = await ApiProxy.delete(`/api/payments/${paymentId}`);
            if (status === 200 || status === 204) {
                await fetchPayments();
                if (onPaymentRecorded) onPaymentRecorded();
            }
        } finally {
            setVoidingId(null);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                className={`fixed right-0 top-0 h-full w-full sm:w-[480px] z-50 bg-background shadow-2xl flex flex-col overflow-y-auto transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-label={`Payments for ${learnerName}`}
            >
                {/* Header */}
                <div className="px-6 pt-5 pb-4 pr-12 bg-emerald-50 border-b border-emerald-100 shrink-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                <CreditCard className="h-3 w-3" />
                                Payments · Booking #{booking.id}
                            </p>
                            <h2 className="text-lg font-bold leading-tight truncate">{learnerName}</h2>
                        </div>
                        <Badge variant="secondary" className={`${statusColorClass} shrink-0 border`}>
                            {booking.status?.charAt(0).toUpperCase() + (booking.status?.slice(1).toLowerCase() || '')}
                        </Badge>
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:bg-black/10 transition-colors z-10"
                    aria-label="Close panel"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Body */}
                <div className="p-4 space-y-4 flex-1">

                    {/* Booking summary */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm border rounded-lg p-3 bg-muted/30">
                        {booking.scheduled_start && (
                            <>
                                <span className="text-muted-foreground">Date</span>
                                <span className="font-medium">{formatDateTime(booking.scheduled_start)}</span>
                            </>
                        )}
                        {booking.instructor_name && (
                            <>
                                <span className="text-muted-foreground">Instructor</span>
                                <span className="font-medium">{booking.instructor_name}</span>
                            </>
                        )}
                        {booking.duration_minutes && (
                            <>
                                <span className="text-muted-foreground">Duration</span>
                                <span className="font-medium">{booking.duration_minutes} min</span>
                            </>
                        )}
                    </div>

                    {/* Payment summary — rendered immediately from booking.amount_paid */}
                    <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Summary</p>
                            <Badge variant="secondary" className={`${paymentStatusColor} border text-xs`}>
                                {paymentStatusLabel}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                            <span className="text-muted-foreground">Total Due</span>
                            <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                            <span className="text-muted-foreground">Total Paid</span>
                            <span className="font-semibold text-green-700">{formatCurrency(summaryPaid)}</span>
                            <span className="text-muted-foreground">Outstanding</span>
                            <span className={`font-semibold ${outstanding > 0 ? 'text-red-600' : 'text-green-700'}`}>
                                {formatCurrency(outstanding)}
                            </span>
                        </div>

                        {totalAmount > 0 && (
                            <div className="space-y-1">
                                <Progress value={progressPct} className="h-2" />
                                <p className="text-xs text-muted-foreground text-right">{progressPct.toFixed(0)}% paid</p>
                            </div>
                        )}
                    </div>

                    {/* Payment records */}
                    <div className="rounded-lg border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Records</p>
                            <button
                                onClick={fetchPayments}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Refresh payments"
                            >
                                ↻ Refresh
                            </button>
                        </div>

                        {loadingPayments ? (
                            <PaymentSkeleton />
                        ) : paymentsError ? (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{paymentsError}</span>
                            </div>
                        ) : payments.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-2">No payment records yet.</p>
                        ) : (
                            <div className="overflow-x-auto -mx-1">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-1.5 px-1 font-medium text-muted-foreground">Date</th>
                                            <th className="text-right py-1.5 px-1 font-medium text-muted-foreground">Amount</th>
                                            <th className="text-left py-1.5 px-1 font-medium text-muted-foreground">Method</th>
                                            <th className="text-left py-1.5 px-1 font-medium text-muted-foreground hidden sm:table-cell">Ref</th>
                                            <th className="py-1.5 px-1" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((p) => (
                                            <tr key={p.id} className={`border-b last:border-0 ${p.voided ? 'opacity-40 line-through' : ''}`}>
                                                <td className="py-2 px-1 whitespace-nowrap text-muted-foreground">
                                                    {p.payment_date ? formatDate(p.payment_date) : formatDate(p.created_at)}
                                                </td>
                                                <td className="py-2 px-1 text-right font-medium">
                                                    {formatCurrency(p.amount)}
                                                </td>
                                                <td className="py-2 px-1 capitalize">
                                                    {p.payment_method || '—'}
                                                </td>
                                                <td className="py-2 px-1 text-muted-foreground hidden sm:table-cell truncate max-w-[80px]">
                                                    {p.reference || '—'}
                                                </td>
                                                <td className="py-2 px-1 text-right">
                                                    {!p.voided && (
                                                        <button
                                                            onClick={() => handleVoid(p.id)}
                                                            disabled={voidingId === p.id}
                                                            className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                                                            title="Void this payment"
                                                            aria-label="Void payment"
                                                        >
                                                            {voidingId === p.id
                                                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                                : <Trash2 className="h-3.5 w-3.5" />}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Fully-paid banner */}
                    {isFullyPaid && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-2 text-green-700">
                            <CheckCircle className="h-5 w-5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold">Payment settled in full</p>
                                <p className="text-xs text-green-600 mt-0.5">
                                    {formatCurrency(summaryPaid)} received. To refund, void a payment record above.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Record payment form — shown when not fully paid */}
                    {!isFullyPaid && (
                        <div className="rounded-lg border p-4 space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Record Payment</p>

                            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <Label htmlFor="payment-amount" className="text-xs">
                                            Amount (R) <span className="text-red-500">*</span>
                                        </Label>
                                        <input
                                            id="payment-amount"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            placeholder={outstanding > 0 ? outstanding.toFixed(2) : '0.00'}
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="payment-method" className="text-xs">Method</Label>
                                        <select
                                            id="payment-method"
                                            value={method}
                                            onChange={(e) => setMethod(e.target.value)}
                                            className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        >
                                            {PAYMENT_METHODS.map((m) => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="payment-reference" className="text-xs">Reference (optional)</Label>
                                    <input
                                        id="payment-reference"
                                        type="text"
                                        placeholder="e.g. receipt number, EFT ref"
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="payment-notes" className="text-xs">Notes (optional)</Label>
                                    <textarea
                                        id="payment-notes"
                                        rows={2}
                                        placeholder="Any additional notes..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                {submitError && (
                                    <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                        <span>{submitError}</span>
                                    </div>
                                )}
                                {submitSuccess && (
                                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">
                                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                                        <span>Payment recorded successfully.</span>
                                    </div>
                                )}

                                <Button type="submit" disabled={submitting} className="w-full" size="sm">
                                    {submitting ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Recording...</>
                                    ) : (
                                        outstanding > 0
                                            ? `Record Payment (${formatCurrency(outstanding)} outstanding)`
                                            : 'Record Payment'
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
