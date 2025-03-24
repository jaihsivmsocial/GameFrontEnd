'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isMounted, setIsMounted] = useState(false); // Prevents hydration error
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true); // Ensures component is mounted on the client
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      router.push('/login'); // Redirect to login if no user
    }
  }, [router]);

  if (!isMounted) {
    return null; // Avoid hydration issues
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg text-center">
        {user ? (
          <>
            <img
              src={user.profilePic}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-2 border-blue-500"
            />
            <h2 className="text-2xl font-bold mt-4">{user.username}</h2>
            <p className="text-gray-400">Change Avatar</p>
          </>
        ) : (
          <p className="text-gray-400">Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
