'use client';

export function DemoCredentials() {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-xs text-yellow-800 font-medium mb-1">Demo Credentials:</p>
      <div className="text-xs text-yellow-700 space-y-1">
        <div>Admin: admin@example.com / password123</div>
        <div>Instructor: instructor@example.com / password123</div>
        <div>Learner: learner@example.com / password123</div>
      </div>
    </div>
  );
}