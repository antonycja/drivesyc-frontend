'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ApiProxy from '@/app/api/lib/proxy'


export default function AdminDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null); // store entire JSON
  const [bookingsData, setBookingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, status } = await ApiProxy.get('/api/me', true);
        
        if (status === 200) {
          if (data.role !== 'admin' && !data.is_admin) {
            router.replace('/auth/login');
          } else {
            setUserData(data); // store entire JSON
          }
        } else {
          router.replace('/auth/login');
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
        router.replace('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const { data, status } = await ApiProxy.get('/api/bookings', true );
        
        if (status === 200) {
          setBookingsData(data)
          // console.log("DATA: ",data)
        } else {
          // console.log("Error with request")
          // router.replace('/auth/login');
        }
      } catch (err) {
        // console.error('Error fetching user info:', err);
        // router.replace('/auth/login');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
    fetchBookings();
  }, [router]);

  if (loading) return <p className="p-8 text-black">Loading...</p>;

  return (
    <div className="p-8 text-black">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      {userData && (
        <pre className="mt-4 bg-gray-100 p-4 rounded">
          {JSON.stringify(userData, null, 2)}
        </pre>
      )}
    </div>
  );
}
