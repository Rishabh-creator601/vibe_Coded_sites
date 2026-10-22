import { useSelector } from 'react-redux';

// Shows the uploaded profile picture, or the user's initials as a fallback.
export default function Avatar({ size = 40 }) {
  const user = useSelector((s) => s.auth.user);
  const initials = (user?.name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (user?.profilePicture) {
    return (
      <img
        className="avatar"
        src={user.profilePicture}
        alt="Profile"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div className="avatar avatar-initials" style={{ width: size, height: size, fontSize: size / 2.5 }}>
      {initials}
    </div>
  );
}
