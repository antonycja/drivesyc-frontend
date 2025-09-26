import { Mail, Phone, Check, Calendar, Shield, BookOpen } from "lucide-react";

export default function StudentCard({
    student,
    isSelected,
    isHighlighted,
    onClick
}) {
    return (
        <div
            onClick={() => onClick(student)}
            className={`p-4 cursor-pointer border-b last:border-b-0 transition-colors ${isHighlighted
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                } ${isSelected ? 'bg-green-50' : ''}`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    {/* Header with name and selection indicator */}
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-sm text-gray-900 truncate">
                            {student.first_name} {student.last_name}
                        </span>
                        {student.role && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                {student.role}
                            </span>
                        )}
                        {isSelected && (
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                        )}
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-600">
                            <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="truncate">{student.email}</span>
                        </div>
                        {student.phone_number && (
                            <div className="flex items-center text-xs text-gray-600">
                                <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                                <span>{student.phone_number}</span>
                            </div>
                        )}
                    </div>

                    {/* Hours and Status Information */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {student.total_hours_booked > 0 && (
                                <span className="flex items-center">
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    <span>{student.total_hours_booked}h booked</span>
                                </span>
                            )}
                            {student.total_hours_completed > 0 && (
                                <span className="flex items-center">
                                    <Check className="h-3 w-3 mr-1 text-green-600" />
                                    <span>{student.total_hours_completed}h completed</span>
                                </span>
                            )}
                            {student.total_hours_remaining > 0 && (
                                <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>{student.total_hours_remaining}h remaining</span>
                                </span>
                            )}
                        </div>

                        {/* Status indicators */}
                        <div className="flex items-center space-x-2">
                            {!student.is_active && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Inactive
                                </span>
                            )}
                            {student.is_email_verified && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Verified
                                </span>
                            )}
                            {student.approval_status && student.approval_status !== 'approved' && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${student.approval_status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : student.approval_status === 'rejected'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {student.approval_status}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Additional notes if available */}
                    {student.notes && student.notes.trim() && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="text-xs text-gray-600 italic truncate">
                                Notes: {student.notes}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}