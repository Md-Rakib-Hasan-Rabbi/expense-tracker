import { useEffect, useState } from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { PageHeader } from '../components/common/PageHeader';
import { useAuth } from '../context/useAuth';
import { userApi } from '../services/resourceApi';
import { getApiErrorMessage } from '../utils/apiError';

export function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: '', currency: '', timezone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      queueMicrotask(() => {
        setProfileForm({
          name: user.name || '',
          currency: user.currency || 'USD',
          timezone: user.timezone || 'UTC',
        });
      });
    }
  }, [user]);

  const updateProfile = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await userApi.updateProfile(profileForm);
      await refreshProfile();
      setMessage('Profile updated successfully.');
    } catch (updateError) {
      setError(getApiErrorMessage(updateError, 'Failed to update profile'));
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    try {
      await userApi.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setMessage('Password changed successfully.');
    } catch (updateError) {
      setError(getApiErrorMessage(updateError, 'Failed to update password'));
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Manage account profile and security preferences" />

      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <Card title="Profile Settings">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={updateProfile}>
          <Input
            label="Name"
            value={profileForm.name}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            label="Currency"
            value={profileForm.currency}
            onChange={(event) =>
              setProfileForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))
            }
          />
          <Input
            label="Timezone"
            value={profileForm.timezone}
            onChange={(event) => setProfileForm((prev) => ({ ...prev, timezone: event.target.value }))}
          />
          <div className="flex items-end">
            <Button type="submit">Save Profile</Button>
          </div>
        </form>
      </Card>

      <Card title="Password & Security">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={updatePassword}>
          <Input
            label="Current Password"
            type="password"
            required
            value={passwordForm.currentPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
            }
          />
          <Input
            label="New Password"
            type="password"
            required
            minLength={8}
            value={passwordForm.newPassword}
            onChange={(event) =>
              setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
            }
          />
          <div>
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
