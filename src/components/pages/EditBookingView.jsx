'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft, Save, Loader2, AlertCircle, CheckCircle,
    Calendar, Clock, User, Car, MapPin, FileText, CreditCard, BookOpen,
} from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';

const LICENCE_CODES = [
    { value: 'A1', label: 'Code A1' },
    { value: 'A',  label: 'Code A' },
    { value: 'B',  label: 'Code B (Code 8)' },
    { value: 'EB', label: 'Code EB (Code 8 + Trailer)' },
    { value: 'C1', label: 'Code C1' },
    { value: 'EC1',label: 'Code EC1' },
    { value: 'C',  label: 'Code C (Code 10)' },
    { value: 'EC', label: 'Code EC (Code 14)' },
];

const LESSON_TYPES = [
    'general', 'parking', 'highway', 'road_test_prep', 'yard', 'night_driving', 'other'
];

const STATUS_OPTIONS = [
    { value: 'PENDING',   label: 'Pending' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'NO_SHOW',   label: 'No Show' },
];

const STATUS_COLORS = {
    PENDING:   'bg-yellow-100 text-yellow-800 border-yellow-200',
    SCHEDULED: 'bg-blue-100 text-blue-800 border-blue-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-gray-100 text-gray-600 border-gray-200',
    NO_SHOW:   'bg-red-100 text-red-800 border-red-200',
};

function toLocalDateTimeInput(isoStr) {
    if (!isoStr) return '';
    const d = new Date(isoStr.endsWith('Z') ? isoStr : isoStr + 'Z');
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toISOFromInput(localStr) {
    if (!localStr) return null;
    return new Date(localStr).toISOString();
}

function inputClass() {
    return 'w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring';
}

export default function EditBookingView({ bookingId, onNavigate }) {
    const [booking, setBooking] = useState(null);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [form, setForm] = useState({
        scheduled_start: '',
        scheduled_end: '',
        duration_minutes: '',
        instructor_id: '',
        status: '',
        licence_code: '',
        vehicle_transmission: '',
        lesson_type: '',
        is_pickup_required: false,
        pickup_location: '',
        dropoff_location: '',
        total_amount: '',
        notes: '',
        feedback: '',
    });

    useEffect(() => {
        if (!bookingId) {
            setLoadError('No booking ID provided.');
            setLoading(false);
            return;
        }
        const load = async () => {
            setLoading(true);
            setLoadError(null);
            try {
                const [bookingRes, instructorsRes] = await Promise.all([
                    ApiProxy.get(`/api/bookings/${bookingId}`),
                    ApiProxy.get('/api/users/instructors/available'),
                ]);

                if (bookingRes.status !== 200) {
                    setLoadError('Could not load booking details.');
                    return;
                }

                const b = bookingRes.data;
                setBooking(b);
                setForm({
                    scheduled_start: toLocalDateTimeInput(b.scheduled_start || b.scheduled_start_local),
                    scheduled_end: toLocalDateTimeInput(b.scheduled_end || b.scheduled_end_local),
                    duration_minutes: b.duration_minutes ?? '',
                    instructor_id: b.instructor_id ?? '',
                    status: b.status?.toUpperCase() || 'PENDING',
                    licence_code: b.licence_code || '',
                    vehicle_transmission: b.vehicle_transmission || '',
                    lesson_type: b.lesson_type || '',
                    is_pickup_required: !!b.is_pickup_required,
                    pickup_location: b.pickup_location || '',
                    dropoff_location: b.dropoff_location || '',
                    total_amount: b.total_amount ?? '',
                    notes: b.notes || '',
                    feedback: b.feedback || '',
                });

                if (instructorsRes.status === 200) {
                    setInstructors(Array.isArray(instructorsRes.data) ? instructorsRes.data : []);
                }
            } catch {
                setLoadError('Unable to reach the service.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [bookingId]);

    const set = useCallback((field) => (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm((prev) => ({ ...prev, [field]: val }));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        const payload = {
            status: form.status || null,
            instructor_id: form.instructor_id ? Number(form.instructor_id) : null,
            scheduled_start: toISOFromInput(form.scheduled_start),
            scheduled_end: form.scheduled_end ? toISOFromInput(form.scheduled_end) : null,
            duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
            licence_code: form.licence_code || null,
            vehicle_transmission: form.vehicle_transmission || null,
            lesson_type: form.lesson_type || null,
            is_pickup_required: form.is_pickup_required,
            pickup_location: form.is_pickup_required ? (form.pickup_location || null) : null,
            dropoff_location: form.is_pickup_required ? (form.dropoff_location || null) : null,
            total_amount: form.total_amount !== '' ? Number(form.total_amount) : 0,
            notes: form.notes || null,
            feedback: form.feedback || null,
        };

        try {
            const { data, status } = await ApiProxy.patch(`/api/bookings/${bookingId}`, payload);
            if (status === 200) {
                setSaveSuccess(true);
                setBooking(data);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                setSaveError(data?.detail || data?.message || 'Failed to save changes.');
            }
        } catch {
            setSaveError('Unable to reach the service. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-1 flex-col gap-6 p-4 pt-0 w-full">
                <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="space-y-6">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[1, 2, 3].map(j => (
                                    <div key={j} className="space-y-1.5">
                                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-9 bg-gray-100 rounded animate-pulse" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="flex flex-1 flex-col gap-6 p-4 pt-0 w-full">
                <Button variant="ghost" size="sm" className="w-fit" onClick={() => onNavigate?.('bookings')}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Bookings
                </Button>
                <div className="flex items-center gap-3 p-6 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-sm">{loadError}</p>
                </div>
            </div>
        );
    }

    const learnerName = booking?.learner_name ||
        `${booking?.temp_learner_name || ''} ${booking?.temp_learner_surname || ''}`.trim() ||
        `Booking #${bookingId}`;

    const statusKey = form.status?.toUpperCase();
    const statusColor = STATUS_COLORS[statusKey] || STATUS_COLORS.PENDING;

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 w-full">

            {/* ── Header ── */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => onNavigate?.('bookings')}>
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">Edit Booking</h2>
                        <p className="text-muted-foreground text-sm">
                            #{bookingId} · {learnerName}
                            {booking?.instructor_name && ` · ${booking.instructor_name}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {saveSuccess && (
                        <span className="flex items-center gap-1.5 text-sm text-green-700">
                            <CheckCircle className="h-4 w-4" /> Saved
                        </span>
                    )}
                    <Badge variant="secondary" className={`${statusColor} border`}>
                        {STATUS_OPTIONS.find(o => o.value === statusKey)?.label || statusKey}
                    </Badge>
                </div>
            </div>

            {saveError && (
                <div className="flex items-start gap-3 p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="text-sm">{saveError}</p>
                </div>
            )}

            {/* ── Schedule ── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Schedule</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="start-dt">Start Date & Time</Label>
                            <input
                                id="start-dt"
                                type="datetime-local"
                                value={form.scheduled_start}
                                onChange={set('scheduled_start')}
                                className={inputClass()}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-dt">End Date & Time <span className="text-muted-foreground font-normal">(optional)</span></Label>
                            <input
                                id="end-dt"
                                type="datetime-local"
                                value={form.scheduled_end}
                                onChange={set('scheduled_end')}
                                className={inputClass()}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration (minutes)</Label>
                            <input
                                id="duration"
                                type="number"
                                min="15"
                                step="15"
                                placeholder="e.g. 60"
                                value={form.duration_minutes}
                                onChange={set('duration_minutes')}
                                className={inputClass()}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select id="status" value={form.status} onChange={set('status')} className={inputClass()}>
                                {STATUS_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Instructor & Vehicle ── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Instructor & Vehicle</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="instructor">Instructor</Label>
                            <select id="instructor" value={form.instructor_id} onChange={set('instructor_id')} className={inputClass()}>
                                <option value="">Auto-assign</option>
                                {instructors.map(i => (
                                    <option key={i.id} value={i.id}>
                                        {i.first_name} {i.last_name}
                                    </option>
                                ))}
                                {booking?.instructor_id && !instructors.find(i => i.id === booking.instructor_id) && (
                                    <option value={booking.instructor_id}>{booking.instructor_name}</option>
                                )}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lesson-type">Lesson Type</Label>
                            <select id="lesson-type" value={form.lesson_type} onChange={set('lesson_type')} className={inputClass()}>
                                <option value="">— not specified —</option>
                                {LESSON_TYPES.map(t => (
                                    <option key={t} value={t}>
                                        {t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="licence">Licence Code</Label>
                            <select id="licence" value={form.licence_code} onChange={set('licence_code')} className={inputClass()}>
                                <option value="">— not specified —</option>
                                {LICENCE_CODES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="transmission">Transmission</Label>
                            <select id="transmission" value={form.vehicle_transmission} onChange={set('vehicle_transmission')} className={inputClass()}>
                                <option value="">— not specified —</option>
                                <option value="manual">Manual</option>
                                <option value="automatic">Automatic</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Location ── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span>Location</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="pickup-required"
                            checked={form.is_pickup_required}
                            onChange={set('is_pickup_required')}
                            className="h-4 w-4 rounded border-input accent-primary"
                        />
                        <Label htmlFor="pickup-required" className="cursor-pointer">
                            Pickup / dropoff required
                        </Label>
                    </div>
                    {form.is_pickup_required && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="pickup">Pickup Address</Label>
                                <input
                                    id="pickup"
                                    type="text"
                                    placeholder="Street address or landmark"
                                    value={form.pickup_location}
                                    onChange={set('pickup_location')}
                                    className={inputClass()}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dropoff">Dropoff Address <span className="text-muted-foreground font-normal">(optional)</span></Label>
                                <input
                                    id="dropoff"
                                    type="text"
                                    placeholder="Leave blank if same as pickup"
                                    value={form.dropoff_location}
                                    onChange={set('dropoff_location')}
                                    className={inputClass()}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ── Notes & Finance ── */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Notes & Finance</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="total-amount">Total Amount Due (R)</Label>
                        <input
                            id="total-amount"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={form.total_amount}
                            onChange={set('total_amount')}
                            className={inputClass()}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Internal Notes</Label>
                        <textarea
                            id="notes"
                            rows={3}
                            placeholder="Internal notes or special instructions..."
                            value={form.notes}
                            onChange={set('notes')}
                            className={`${inputClass()} resize-none`}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="feedback">Post-Session Feedback</Label>
                        <textarea
                            id="feedback"
                            rows={2}
                            placeholder="Feedback after the session..."
                            value={form.feedback}
                            onChange={set('feedback')}
                            className={`${inputClass()} resize-none`}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* ── Actions bar ── */}
            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border">
                <p className="text-sm text-muted-foreground">
                    {booking?.updated_at
                        ? `Last modified: ${new Date(booking.updated_at).toLocaleString('en-ZA')}`
                        : 'Unsaved changes'}
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onNavigate?.('bookings')}>
                        Discard
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving
                            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                            : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
