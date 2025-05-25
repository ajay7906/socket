import { useState, useEffect } from 'react';

function ProtectedRoute({ children, allowedRole }) {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role);
      } catch (error) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  if (!role) return <div>Loading...</div>;
  if (role !== allowedRole) return <div>Unauthorized</div>;
  return children;
}

export default ProtectedRoute;