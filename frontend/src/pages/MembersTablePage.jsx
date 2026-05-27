import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken } from '../api';
import api from '../api';
import { toast } from 'react-hot-toast';
import { Loader2, AlertCircle, UserPlus } from 'lucide-react';
import MemberTable from '../components/MemberTable';
import MemberRoleModal from '../components/MemberRoleModal';
import InviteMemberModal from '../components/InviteMemberModal';

/**
 * MembersTablePage – displays organisation members in a plain table.
 * A small "Invite Member" button at the top opens the invite modal.
 */
export default function MembersTablePage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const navigate = useNavigate();

  const fetchMembers = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) setAuthToken(token);
      const res = await api.get('/api/organisation/members/');
      setMembers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.detail || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEditRole = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  const handleSaveRole = async (memberId, role) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem('access_token');
      if (token) setAuthToken(token);
      const res = await api.patch(`/api/organisation/members/${memberId}/role/`, { role });
      setMembers((current) => current.map((member) => (member.id === memberId ? res.data : member)));
      toast.success('Member role updated');
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update role');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendInvitation = async ({ email, role }) => {
    try {
      setIsSendingInvite(true);
      const token = localStorage.getItem('access_token');
      if (token) setAuthToken(token);

      await api.post('/api/organisation/invitations/', { email, role });
      toast.success(`Invitation sent to ${email}`);
      setIsInviteModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send invitation');
    } finally {
      setIsSendingInvite(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchMembers, 0);
    return () => window.clearTimeout(timeoutId);
  }, [fetchMembers]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
        <p className="text-sm font-bold text-app-muted animate-pulse">Loading members…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-bold text-app-text">{error.response?.status === 401 ? 'Authentication required.' : 'Unable to load members.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with navigation buttons */}
      <div className="flex flex-col gap-4 p-8 glass rounded-[2rem] border-app-border/40 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="inline-flex items-center justify-center rounded-md border border-app-border px-4 py-2 text-sm font-semibold text-app-text transition hover:bg-app-border/50"
          >
            Back
          </button>
          <h2 className="text-2xl font-black text-app-text">Organisation Members</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-md hover:bg-brand-700"
        >
          <UserPlus className="w-5 h-5" /> Invite Member
        </button>
      </div>

      {/* Table view */}
      <MemberTable
        members={members}
        onEditRole={handleEditRole}
      />

      {/* Role Edit Modal */}
      <MemberRoleModal
        isOpen={isModalOpen}
        member={selectedMember}
        onClose={handleCloseModal}
        onSave={handleSaveRole}
        isLoading={isUpdating}
      />

      {isInviteModalOpen && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={handleSendInvitation}
          isLoading={isSendingInvite}
        />
      )}
    </div>
  );
}
