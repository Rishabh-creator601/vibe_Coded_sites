import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../store/authSlice.js';
import Avatar from './Avatar.jsx';

// Avatar button with a dropdown: profile, settings, log out (item 11).
export default function UserMenu() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="user-menu" ref={ref}>
      <button className="avatar-btn" onClick={() => setOpen((v) => !v)} aria-label="Account menu">
        <Avatar size={40} />
      </button>

      {open && (
        <div className="menu-dropdown">
          <div className="menu-head">
            <Avatar size={44} />
            <div>
              <div className="food-name">{user.name}</div>
              <div className="food-meta">{user.email}</div>
            </div>
          </div>
          <Link to="/settings" className="menu-item" onClick={() => setOpen(false)}>
            ⚙️ Settings
          </Link>
          <button className="menu-item danger" onClick={() => dispatch(logout())}>
            ⎋ Log out
          </button>
        </div>
      )}
    </div>
  );
}
