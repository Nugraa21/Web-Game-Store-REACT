import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';

function Profile() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="flex-1 p-8 bg-white">
      <h2 className="text-xl font-semibold mb-4">Profile</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Username:</h3>
          <p>{currentUser?.username || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Email:</h3>
          <p>{currentUser?.email || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium">PIN:</h3>
          <p>{currentUser?.pin || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;