import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import RegisteredStudentSelector from "./RegisteredStudentSelector";
import NewStudentForm from "./NewStudentForm";

export default function StudentSelection({
    isUnregisteredLearner,
    onLearnerTypeChange,
    formData,
    onInputChange,
    existingUser,
    checkingUser,
    checkField,
    onSelectExistingUser,
    clearExistingUser, // Add this prop
    errors
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Student Information</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex space-x-4">
                    <Button
                        type="button"
                        variant={!isUnregisteredLearner ? "default" : "outline"}
                        onClick={() => onLearnerTypeChange(false)}
                        className="flex-1"
                    >
                        Registered Student
                    </Button>
                    <Button
                        type="button"
                        variant={isUnregisteredLearner ? "default" : "outline"}
                        onClick={() => onLearnerTypeChange(true)}
                        className="flex-1"
                    >
                        New Student
                    </Button>
                </div>

                {isUnregisteredLearner ? (
                    <NewStudentForm
                        formData={formData}
                        onInputChange={onInputChange}
                        existingUser={existingUser}
                        checkingUser={checkingUser}
                        checkField={checkField}
                        onSelectExistingUser={onSelectExistingUser}
                        errors={errors}
                    />
                ) : (
                    <RegisteredStudentSelector
                        formData={formData}
                        onInputChange={onInputChange}
                        onLearnerTypeChange={onLearnerTypeChange}
                        existingUser={existingUser} // Pass existing user
                        clearExistingUser={clearExistingUser} // Pass clear function
                        errors={errors}
                    />
                )}
            </CardContent>
        </Card>
    );
}