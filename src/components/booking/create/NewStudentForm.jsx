import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, UserPlus, Eye, Loader2 } from "lucide-react";

export default function NewStudentForm({
    formData,
    onInputChange,
    existingUser,
    checkingUser,
    checkField,
    onSelectExistingUser,
    errors
}) {
    return (
        <div className="space-y-4">
            {/* Existing user notification */}
            {existingUser && (
                <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
                    <CardContent className="pt-4">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full">
                                    <User className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                                        User Already Exists
                                    </h4>
                                    <Badge variant="outline" className="text-xs border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-300">
                                        {checkField === 'email' ? 'Email Match' : 'Phone Match'}
                                    </Badge>
                                </div>
                                <div className="space-y-1 mb-3">
                                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                        {existingUser.first_name} {existingUser.last_name}
                                    </p>
                                    <p className="text-sm text-orange-700 dark:text-orange-300">
                                        {existingUser.email}
                                    </p>
                                    <p className="text-sm text-orange-700 dark:text-orange-300">
                                        {existingUser.phone_number}
                                    </p>
                                    {existingUser.role && (
                                        <Badge variant="secondary" className="text-xs">
                                            {existingUser.role}
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={onSelectExistingUser}
                                        className="bg-orange-600 hover:bg-orange-700 text-white"
                                    >
                                        <UserPlus className="h-3 w-3 mr-1" />
                                        Select This User
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900"
                                        onClick={() => console.log('View user profile:', existingUser.id)}
                                    >
                                        <Eye className="h-3 w-3 mr-1" />
                                        View Profile
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        First Name *
                    </label>
                    <input
                        type="text"
                        value={formData.temp_learner_name}
                        onChange={(e) => onInputChange('temp_learner_name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md bg-background ${errors.temp_learner_name ? 'border-destructive' : 'border-input'}`}
                        placeholder="Enter first name"
                    />
                    {errors.temp_learner_name && (
                        <p className="text-sm text-destructive mt-1">{errors.temp_learner_name}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Surname *
                    </label>
                    <input
                        type="text"
                        value={formData.temp_learner_surname}
                        onChange={(e) => onInputChange('temp_learner_surname', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md bg-background ${errors.temp_learner_surname ? 'border-destructive' : 'border-input'}`}
                        placeholder="Enter surname"
                    />
                    {errors.temp_learner_surname && (
                        <p className="text-sm text-destructive mt-1">{errors.temp_learner_surname}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Phone Number *
                    </label>
                    <div className="relative">
                        <input
                            type="tel"
                            value={formData.temp_learner_phone}
                            onChange={(e) => onInputChange('temp_learner_phone', e.target.value)}
                            className={`w-full px-3 py-2 pr-10 border rounded-md bg-background ${errors.temp_learner_phone ? 'border-destructive' : 'border-input'}`}
                            placeholder="Enter phone number"
                        />
                        {checkingUser && checkField === 'phone' && (
                            <div className="absolute right-3 top-3">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    {errors.temp_learner_phone && (
                        <p className="text-sm text-destructive mt-1">{errors.temp_learner_phone}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Email *
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            value={formData.temp_learner_email}
                            onChange={(e) => onInputChange('temp_learner_email', e.target.value)}
                            className={`w-full px-3 py-2 pr-10 border rounded-md bg-background ${errors.temp_learner_email ? 'border-destructive' : 'border-input'}`}
                            placeholder="Enter email address"
                        />
                        {checkingUser && checkField === 'email' && (
                            <div className="absolute right-3 top-3">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                    {errors.temp_learner_email && (
                        <p className="text-sm text-destructive mt-1">{errors.temp_learner_email}</p>
                    )}
                </div>
            </div>
        </div>
    );
}