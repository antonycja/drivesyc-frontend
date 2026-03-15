'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    RefreshCw,
    Users,
    Search,
    Star,
    Mail,
    Phone,
    UserPlus,
    Send,
    Check,
    X,
    Pencil,
    Copy,
    Link,
    CheckCircle,
} from 'lucide-react';
import ApiProxy from '@/app/api/lib/proxy';

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusBadge(isActive, approvalStatus) {
    if (!isActive) {
        return <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">Inactive</Badge>;
    }
    switch (approvalStatus?.toUpperCase()) {
        case 'APPROVED':
            return <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Active</Badge>;
        case 'PENDING':
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>;
        case 'REJECTED':
            return <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">Rejected</Badge>;
        default:
            return <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">{approvalStatus || 'Unknown'}</Badge>;
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(pw) {
    return pw && pw.length >= 8;
}

/**
 * Formats a future Date as a human-readable string.
 * e.g. "Sunday, 22 March 2026 at 14:30"
 */
function formatExpiry(date) {
    return date.toLocaleString('en-ZA', { dateStyle: 'full', timeStyle: 'short' });
}

/**
 * Converts a custom expiry selection to milliseconds.
 */
function expiryToMs(preset, customValue, customUnit) {
    const HOUR = 60 * 60 * 1000;
    const DAY = 24 * HOUR;
    switch (preset) {
        case '24h':  return 24 * HOUR;
        case '3d':   return 3 * DAY;
        case '7d':   return 7 * DAY;
        case '30d':  return 30 * DAY;
        case 'custom': {
            const n = parseInt(customValue, 10) || 1;
            return customUnit === 'hours' ? n * HOUR : n * DAY;
        }
        default: return 24 * HOUR;
    }
}

// ── Priority Weight Editor ─────────────────────────────────────────────────────
function PriorityEditor({ instructor, onSaved }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(
        instructor.priority_weight != null ? String(Number(instructor.priority_weight).toFixed(1)) : '5.0'
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSave = async () => {
        const num = parseFloat(value);
        if (isNaN(num) || num < 1 || num > 10) {
            setError('Enter a value between 1 and 10.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const { data, status } = await ApiProxy.patch(
                `/api/users/${instructor.id}/priority`,
                { priority_weight: num }
            );
            if (status === 200) {
                onSaved(instructor.id, num);
                setEditing(false);
            } else {
                setError(data?.message || 'Failed to update priority.');
            }
        } catch {
            setError('Unable to reach the service.');
        } finally {
            setSaving(false);
        }
    };

    if (!editing) {
        return (
            <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 text-sm group"
                title="Click to edit priority weight"
            >
                <Star className="h-3.5 w-3.5 text-yellow-500" />
                <span className="font-medium">
                    {instructor.priority_weight != null
                        ? Number(instructor.priority_weight).toFixed(1)
                        : '—'}
                </span>
                <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
        );
    }

    return (
        <div className="flex items-center gap-1.5">
            <Input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-7 w-20 text-xs px-2"
                autoFocus
            />
            <button
                onClick={handleSave}
                disabled={saving}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                aria-label="Save"
            >
                <Check className="h-3.5 w-3.5" />
            </button>
            <button
                onClick={() => { setEditing(false); setError(null); }}
                className="p-1 text-red-500 hover:bg-red-50 rounded"
                aria-label="Cancel"
            >
                <X className="h-3.5 w-3.5" />
            </button>
            {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
    );
}

// ── Instructors List Tab ───────────────────────────────────────────────────────
function InstructorsList({ onNavigate }) {
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    const fetchInstructors = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ role: 'instructor', page_size: '100' });
            if (search.trim()) params.set('search', search.trim());
            const { data, status } = await ApiProxy.get(`/api/school-users?${params.toString()}`);
            if (status === 200) {
                setInstructors(Array.isArray(data?.users) ? data.users : []);
            } else {
                setError(data?.message || 'Failed to load instructors.');
            }
        } catch {
            setError('Unable to reach the service. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchInstructors();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInstructors();
    };

    const handlePrioritySaved = (instructorId, newWeight) => {
        setInstructors((prev) =>
            prev.map((inst) =>
                inst.id === instructorId ? { ...inst, priority_weight: newWeight } : inst
            )
        );
    };

    return (
        <div className="space-y-4">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
                <div className="relative flex-1">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button type="submit" size="sm" variant="outline" disabled={loading}>
                    <Search className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={fetchInstructors}
                    disabled={loading}
                    aria-label="Refresh"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </form>

            {/* Error */}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Loading skeleton */}
            {loading && (
                <Card>
                    <CardContent className="p-6 space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {!loading && !error && instructors.length === 0 && (
                <div className="text-center py-16 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium mb-1">No instructors found</p>
                    <p className="text-sm">
                        {search ? 'Try a different search term.' : 'Invite instructors to join your school using the "Add Instructor" tab.'}
                    </p>
                </div>
            )}

            {/* Table */}
            {!loading && !error && instructors.length > 0 && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            {instructors.length} instructor{instructors.length !== 1 ? 's' : ''}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50 text-left">
                                        <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Contact</th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                                            Priority
                                            <span className="ml-1 text-xs font-normal opacity-60">(1–10)</span>
                                        </th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                                        <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Hours</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {instructors.map((inst) => (
                                        <tr
                                            key={inst.id}
                                            className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium">
                                                    {inst.first_name} {inst.last_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground sm:hidden">
                                                    {inst.email || inst.phone_number || '—'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <div className="space-y-0.5">
                                                    {inst.email && (
                                                        <a
                                                            href={`mailto:${inst.email}`}
                                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Mail className="h-3 w-3" />
                                                            <span className="truncate max-w-[160px]">{inst.email}</span>
                                                        </a>
                                                    )}
                                                    {inst.phone_number && (
                                                        <a
                                                            href={`tel:${inst.phone_number}`}
                                                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                                        >
                                                            <Phone className="h-3 w-3" />
                                                            {inst.phone_number}
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <PriorityEditor
                                                    instructor={inst}
                                                    onSaved={handlePrioritySaved}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                {statusBadge(inst.is_active, inst.approval_status)}
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                                                {inst.total_hours_completed_instructor > 0
                                                    ? `${inst.total_hours_completed_instructor}h done`
                                                    : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// ── Generate Invite Link Form ──────────────────────────────────────────────────
//
// NOTE: The backend's InviteUserRequest schema does not include an expiry field.
// The invite token has no server-side TTL. The expiry shown here is informational
// only — it is not enforced by the backend. If backend expiry support is added,
// wire expiry_hours into the proxy payload.
//
// NOTE: The backend requires `email` (EmailStr, non-optional). Email is therefore
// required in this form. The UX spec describes it as optional, but that would
// require a backend schema change to InviteUserRequest.
//
// NOTE: No GET /api/v1/users/invitations endpoint exists on the backend.
// The "Pending Invites" section is omitted until the backend exposes this endpoint.
//
function GenerateInviteForm() {
    const EXPIRY_PRESETS = [
        { value: '24h', label: '24 hours' },
        { value: '3d',  label: '3 days' },
        { value: '7d',  label: '7 days' },
        { value: '30d', label: '30 days' },
        { value: 'custom', label: 'Custom' },
    ];

    const [email, setEmail] = useState('');
    const [expiryPreset, setExpiryPreset] = useState('24h');
    const [customValue, setCustomValue] = useState('1');
    const [customUnit, setCustomUnit] = useState('days');

    const [submitting, setSubmitting] = useState(false);
    const [fieldError, setFieldError] = useState('');
    const [serverError, setServerError] = useState('');

    // Result state after a successful generation
    const [generated, setGenerated] = useState(null); // { url, expiresAt }
    const [copied, setCopied] = useState(false);
    const [emailTo, setEmailTo] = useState('');

    const handleGenerate = async (e) => {
        e.preventDefault();
        setFieldError('');
        setServerError('');
        setGenerated(null);

        const trimmedEmail = email.trim();
        if (!trimmedEmail || !validateEmail(trimmedEmail)) {
            setFieldError('Please enter a valid email address.');
            return;
        }

        setSubmitting(true);
        try {
            const { data, status } = await ApiProxy.post('/api/users/invite', {
                email: trimmedEmail,
                role: 'instructor',
            });

            if (status === 200 || status === 201) {
                const token = data?.invite_token;
                if (!token) {
                    setServerError('Server returned a response but no invite token was found.');
                    return;
                }

                const origin = typeof window !== 'undefined' ? window.location.origin : '';
                const url = `${origin}/auth/register?token=${token}`;
                const expiryMs = expiryToMs(expiryPreset, customValue, customUnit);
                const expiresAt = new Date(Date.now() + expiryMs);

                setGenerated({ url, expiresAt, emailUsed: trimmedEmail });
                setEmailTo(trimmedEmail);
            } else {
                setServerError(data?.message || 'Failed to generate invite link. Please try again.');
            }
        } catch {
            setServerError('Unable to reach the service. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCopy = () => {
        if (!generated?.url) return;
        navigator.clipboard.writeText(generated.url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleSendEmail = () => {
        if (!generated?.url || !emailTo.trim()) return;
        const subject = encodeURIComponent("You've been invited to DriveSync");
        const body = encodeURIComponent(
            `You've been invited to join DriveSync as an instructor.\n\nClick the link below to set up your account:\n\n${generated.url}\n\nThis link expires: ${formatExpiry(generated.expiresAt)}`
        );
        window.location.href = `mailto:${emailTo.trim()}?subject=${subject}&body=${body}`;
    };

    const handleReset = () => {
        setGenerated(null);
        setCopied(false);
        setEmail('');
        setEmailTo('');
        setFieldError('');
        setServerError('');
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Generate Invite Link
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Generate a registration link for a new instructor. Share the link directly or send it by email.
                </p>
            </CardHeader>
            <CardContent>
                {!generated ? (
                    // ── Generation form ──
                    <form onSubmit={handleGenerate} className="space-y-4 max-w-md">
                        {/* Email */}
                        <div className="space-y-1.5">
                            <Label htmlFor="inv-email">
                                Email address <span className="text-muted-foreground font-normal text-xs">(required — pre-fills registration form)</span>
                            </Label>
                            <Input
                                id="inv-email"
                                type="email"
                                placeholder="instructor@example.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setFieldError(''); }}
                                className={fieldError ? 'border-red-400' : ''}
                            />
                            {fieldError && <p className="text-xs text-red-600">{fieldError}</p>}
                        </div>

                        {/* Expiry */}
                        <div className="space-y-1.5">
                            <Label htmlFor="inv-expiry">
                                Link expires after
                                <span className="ml-1 text-xs text-muted-foreground font-normal">(informational — not enforced server-side)</span>
                            </Label>
                            <select
                                id="inv-expiry"
                                value={expiryPreset}
                                onChange={(e) => setExpiryPreset(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                {EXPIRY_PRESETS.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                ))}
                            </select>

                            {/* Custom expiry inputs */}
                            {expiryPreset === 'custom' && (
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={customValue}
                                        onChange={(e) => setCustomValue(e.target.value)}
                                        className="w-24"
                                        placeholder="1"
                                    />
                                    <select
                                        value={customUnit}
                                        onChange={(e) => setCustomUnit(e.target.value)}
                                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    >
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Role info */}
                        <div className="text-xs text-muted-foreground bg-blue-50 border border-blue-100 rounded p-2">
                            Role will be set to <strong>Instructor</strong>. The invited user will complete registration using the generated link.
                        </div>

                        {/* Server error */}
                        {serverError && (
                            <div className="text-sm rounded p-3 border bg-red-50 border-red-200 text-red-800">
                                {serverError}
                            </div>
                        )}

                        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                            {submitting ? (
                                <>Generating...</>
                            ) : (
                                <>
                                    <Link className="mr-2 h-4 w-4" />
                                    Generate Link
                                </>
                            )}
                        </Button>
                    </form>
                ) : (
                    // ── Success: show generated link ──
                    <div className="space-y-4 max-w-lg">
                        {/* Success banner */}
                        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                            <CheckCircle className="h-4 w-4 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Invite link generated!</p>
                                <p className="text-xs mt-0.5 text-green-600">
                                    Expires: {formatExpiry(generated.expiresAt)}
                                </p>
                            </div>
                        </div>

                        {/* Link row */}
                        <div className="space-y-1.5">
                            <Label>Invite link</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={generated.url}
                                    className="font-mono text-xs bg-gray-50"
                                    onFocus={(e) => e.target.select()}
                                />
                                <Button
                                    type="button"
                                    variant={copied ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={handleCopy}
                                    className={`flex-shrink-0 gap-1.5 ${copied ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                                    title="Copy link to clipboard"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Optional: email this link */}
                        <div className="space-y-1.5 pt-1 border-t">
                            <Label htmlFor="email-link-to" className="text-sm text-muted-foreground">
                                Optional: email this link
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="email-link-to"
                                    type="email"
                                    placeholder={generated.emailUsed || 'recipient@example.com'}
                                    value={emailTo}
                                    onChange={(e) => setEmailTo(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSendEmail}
                                    disabled={!emailTo.trim() || !validateEmail(emailTo.trim())}
                                    className="flex-shrink-0 gap-1.5"
                                >
                                    <Send className="h-4 w-4" />
                                    Send Email
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Opens your email client with the link pre-filled.
                            </p>
                        </div>

                        {/* Generate another */}
                        <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                            Generate another link
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ── Add Manually Form ──────────────────────────────────────────────────────────
function AddManuallyForm() {
    const emptyForm = {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
    };
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    const set = (field, val) => {
        setForm((f) => ({ ...f, [field]: val }));
        setErrors((e) => ({ ...e, [field]: undefined }));
    };

    const validate = () => {
        const errs = {};
        if (!form.first_name.trim()) errs.first_name = 'First name is required.';
        if (!form.last_name.trim()) errs.last_name = 'Last name is required.';
        if (!form.email.trim() && !form.phone_number.trim()) {
            errs.email = 'Email or phone is required.';
        }
        if (form.email && !validateEmail(form.email)) {
            errs.email = 'Enter a valid email address.';
        }
        if (!validatePassword(form.password)) {
            errs.password = 'Password must be at least 8 characters.';
        }
        if (form.password !== form.confirm_password) {
            errs.confirm_password = 'Passwords do not match.';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResult(null);
        if (!validate()) return;
        setSubmitting(true);
        try {
            const payload = {
                first_name: form.first_name.trim(),
                last_name: form.last_name.trim(),
                password: form.password,
                confirm_password: form.confirm_password,
                role: 'instructor',
            };
            if (form.email.trim()) payload.email = form.email.trim();
            if (form.phone_number.trim()) payload.phone_number = form.phone_number.trim();

            const { data, status } = await ApiProxy.post('/api/auth/register', payload);
            if (status === 200 || status === 201) {
                setResult({ success: true, message: 'Instructor account created. They can now log in after approval.' });
                setForm(emptyForm);
                setErrors({});
            } else {
                setResult({ success: false, message: data?.message || 'Failed to create account.' });
            }
        } catch {
            setResult({ success: false, message: 'Unable to reach the service.' });
        } finally {
            setSubmitting(false);
        }
    };

    const field = (id, label, type = 'text', placeholder = '') => (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                placeholder={placeholder}
                value={form[id]}
                onChange={(e) => set(id, e.target.value)}
                className={errors[id] ? 'border-red-400' : ''}
            />
            {errors[id] && <p className="text-xs text-red-600">{errors[id]}</p>}
        </div>
    );

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Manually
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Create an instructor account directly. The account starts as PENDING and requires admin approval.
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <div className="grid grid-cols-2 gap-3">
                        {field('first_name', 'First name *', 'text', 'Jane')}
                        {field('last_name', 'Last name *', 'text', 'Smith')}
                    </div>
                    {field('email', 'Email', 'email', 'jane.smith@example.com')}
                    {field('phone_number', 'Phone number', 'tel', '+27 80 000 0000')}
                    {field('password', 'Password *', 'password', 'Min 8 characters')}
                    {field('confirm_password', 'Confirm password *', 'password', '')}

                    {result && (
                        <div
                            className={`text-sm rounded p-3 border ${
                                result.success
                                    ? 'bg-green-50 border-green-200 text-green-800'
                                    : 'bg-red-50 border-red-200 text-red-800'
                            }`}
                        >
                            {result.message}
                        </div>
                    )}
                    <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                        {submitting ? 'Creating...' : 'Create Instructor'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

// ── Add Instructor Tab ─────────────────────────────────────────────────────────
function AddInstructorTab() {
    const [subTab, setSubTab] = useState('invite');

    return (
        <div className="space-y-4">
            {/* Sub-tab toggle */}
            <div className="flex gap-2 border-b pb-2">
                <button
                    onClick={() => setSubTab('invite')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        subTab === 'invite'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                >
                    Generate Invite Link
                </button>
                <button
                    onClick={() => setSubTab('manual')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        subTab === 'manual'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                >
                    Add Manually
                </button>
            </div>

            {subTab === 'invite' ? <GenerateInviteForm /> : <AddManuallyForm />}
        </div>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * InstructorsView — full instructor management page with two tabs.
 *
 * Props:
 *   onNavigate (view: string) => void
 */
export default function InstructorsView({ onNavigate }) {
    const [tab, setTab] = useState('list');

    const tabs = [
        { key: 'list', label: 'Instructor List', icon: Users },
        { key: 'add', label: 'Add Instructor', icon: UserPlus },
    ];

    return (
        <div className="flex flex-1 flex-col gap-6 p-4 pt-0 max-w-[1600px] mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold">Instructors</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your school's instructors
                    </p>
                </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-1 border-b">
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={[
                            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                            tab === key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground',
                        ].join(' ')}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            {tab === 'list' && <InstructorsList onNavigate={onNavigate} />}
            {tab === 'add' && <AddInstructorTab />}
        </div>
    );
}
