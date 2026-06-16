import React, { useState } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { currentUser, updateProfile } = useApp();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [infoLoading, setInfoLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [infoError, setInfoError] = useState('');
  const [passError, setPassError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);

  const avatarInitials = (currentUser?.name || 'US').substring(0, 2).toUpperCase();

  const handleInfoSave = async (e) => {
    e.preventDefault();
    setInfoError('');
    setInfoSuccess(false);
    if (!name.trim() || !email.trim()) {
      setInfoError('Name and email are required.');
      return;
    }
    setInfoLoading(true);
    const result = await updateProfile({ name: name.trim(), email: email.trim() });
    setInfoLoading(false);
    if (result.success) {
      setInfoSuccess(true);
      setTimeout(() => setInfoSuccess(false), 3000);
    } else {
      setInfoError(result.message);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }
    setPassLoading(true);
    const result = await updateProfile({ currentPassword, newPassword });
    setPassLoading(false);
    if (result.success) {
      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(false), 3000);
    } else {
      setPassError(result.message);
    }
  };

  const inputClass = "w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-700 outline-none px-3.5 py-2.5 text-sm transition-all";

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex items-center gap-5 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-950 font-bold text-xl tracking-tight shrink-0 shadow-md">
          {avatarInitials}
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{currentUser?.name}</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{currentUser?.email}</p>
          <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Active Account</span>
        </div>
      </div>

      {/* Edit Profile Info */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <User size={16} className="text-zinc-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Personal Information</h3>
        </div>

        <form onSubmit={handleInfoSave} className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {infoError && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{infoError}</p>
          )}

          <button
            type="submit"
            disabled={infoLoading}
            className="flex items-center gap-2 self-start px-5 py-2.5 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-sm font-bold rounded-lg transition-all active:scale-95 disabled:opacity-60"
          >
            {infoSuccess ? <CheckCircle size={15} className="text-emerald-400" /> : <Save size={15} />}
            {infoSuccess ? 'Saved!' : infoLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <Lock size={16} className="text-zinc-500" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
          {[
            { label: 'Current Password', value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
            { label: 'New Password', value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(v => !v) },
            { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
          ].map(({ label, value, set, show, toggle }) => (
            <div key={label}>
              <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">{label}</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <input
                  type={show ? 'text' : 'password'}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder="••••••••"
                  className={`${inputClass} pl-9 pr-10`}
                />
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          ))}

          {passError && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{passError}</p>
          )}

          <button
            type="submit"
            disabled={passLoading}
            className="flex items-center gap-2 self-start px-5 py-2.5 bg-zinc-900 dark:bg-zinc-50 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-sm font-bold rounded-lg transition-all active:scale-95 disabled:opacity-60"
          >
            {passSuccess ? <CheckCircle size={15} className="text-emerald-400" /> : <Lock size={15} />}
            {passSuccess ? 'Password Updated!' : passLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
