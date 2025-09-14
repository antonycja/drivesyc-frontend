import { redirect } from 'next/navigation';
// import { getServerSession } from 'next-auth'; // if using NextAuth

export default async function LearnerDashboard() {
  // Check authentication
  // const session = await getServerSession();
  // if (!session || session.user.role !== 'admin') {
  //   redirect('/login');
  // }

  return (
    <div className="p-8 text-black">
      <h1 className="text-2xl font-bold">Learner Dashboard</h1>
      <p>Welcome to the learner area!</p>
    </div>
  );
}