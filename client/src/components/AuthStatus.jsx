import { useAuth } from '../contexts/AuthContext';

export default function AuthStatus() {
  const { currentUser } = useAuth();

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Authentication Status</h2>
      {currentUser ? (
        <div>
          <p className="text-green-600">✅ User is authenticated</p>
          <p>Email: {currentUser.email}</p>
          <p>UID: {currentUser.uid}</p>
        </div>
      ) : (
        <p className="text-red-600">❌ User is not authenticated</p>
      )}
    </div>
  );
} 