import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  UserPlus, Mail, Loader2, Building2, UserCheck, ShieldCheck, 
  FileText, UploadCloud, Users, Settings2, Trash2, CheckCircle2, 
  MapPin, Phone, Award, Receipt, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api';

export default function WorkspaceSettingsPage() {
  const { djangoUser } = useOutletContext();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Organization States
  const [organisationDetails, setOrganisationDetails] = useState(null);
  const [organisationName, setOrganisationName] = useState('');
  const [taxpayerPin, setTaxpayerPin] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [physicalAddress, setPhysicalAddress] = useState('');
  
  // Coordinator States
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRole, setContactRole] = useState('');
  
  // Director States
  const [directorKraPin, setDirectorKraPin] = useState('');
  const [directorPhone, setDirectorPhone] = useState('');

  // Team & Invitation States
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('COMPANY');

  // Loading States
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [loadingWorkspace, setLoadingWorkspace] = useState(true);

  // Compliance Vault States (Simulated live upload changes)
  const [complianceDocs, setComplianceDocs] = useState([
    { id: 'kra', name: 'iTax KRA PIN Certificate', status: 'VERIFIED', size: '2.4 MB', updated: '2 hours ago', required: true },
    { id: 'incorporation', name: 'Certificate of Incorporation (CR12)', status: 'VERIFIED', size: '4.8 MB', updated: '1 day ago', required: true },
    { id: 'agpo', name: 'AGPO Registration Certificate', status: 'PENDING', size: '1.2 MB', updated: 'Just now', required: false },
    { id: 'permit', name: 'Nairobi County Single Business Permit', status: 'MISSING', size: '-', updated: '-', required: true },
  ]);

  const fetchWorkspaceData = async () => {
    try {
      setLoadingWorkspace(true);
      
      // 1. Fetch current members
      const membersRes = await api.get('/api/organisation/members/');
      setMembers(membersRes.data);
      
      // 2. Fetch pending invitations
      const invitesRes = await api.get('/api/organisation/invitations/');
      setInvitations(invitesRes.data);
      
      // 3. Fetch full organization details
      const orgRes = await api.get('/api/organisation/');
      if (orgRes.data && orgRes.data.length > 0) {
        const org = orgRes.data[0];
        setOrganisationDetails(org);
        
        // Load editable fields into states
        setOrganisationName(org.name || '');
        setTaxpayerPin(org.taxpayer_pin || '');
        setBusinessEmail(org.business_email || '');
        setBusinessPhone(org.business_phone || '');
        setPhysicalAddress(org.physical_address || '');
        
        setContactName(org.contact_person_name || '');
        setContactEmail(org.contact_person_email || '');
        setContactPhone(org.contact_person_phone || '');
        setContactRole(org.contact_person_role || '');
        
        setDirectorKraPin(org.director_kra_pin || '');
        setDirectorPhone(org.director_phone || '');
      }
    } catch (err) {
      console.error("Failed to load workspace settings:", err);
      toast.error("Error refreshing workspace datasets.");
    } finally {
      setLoadingWorkspace(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [djangoUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!organisationName.trim()) return;
    try {
      setUpdatingProfile(true);
      
      const payload = {
        name: organisationName,
        taxpayer_pin: taxpayerPin || null,
        business_email: businessEmail || null,
        business_phone: businessPhone || null,
        physical_address: physicalAddress || null,
        contact_person_name: contactName || null,
        contact_person_email: contactEmail || null,
        contact_person_phone: contactPhone || null,
        contact_person_role: contactRole || null,
        director_kra_pin: directorKraPin || null,
        director_phone: directorPhone || null
      };

      await api.patch(`/api/organisation/${organisationDetails.id}/`, payload);
      toast.success('Corporate credentials updated successfully!');
      fetchWorkspaceData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update workspace profile details.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    try {
      setSendingInvite(true);
      await api.post('/api/organisation/invitations/', {
        email: inviteEmail,
        role: inviteRole
      });
      toast.success(`Invitation dispatched successfully to ${inviteEmail}!`);
      setInviteEmail('');
      
      // Reload invitations list
      const invitesRes = await api.get('/api/organisation/invitations/');
      setInvitations(invitesRes.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to dispatch workspace invitation.');
    } finally {
      setSendingInvite(false);
    }
  };

  // Simulated Document Upload handler
  const handleDocUpload = (id) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Uploading secure document to compliance vault...',
        success: <b>Document saved & marked for automated KRA review!</b>,
        error: <b>Failed to store certificate safely.</b>,
      }
    ).then(() => {
      setComplianceDocs(prev => prev.map(doc => {
        if (doc.id === id) {
          return {
            ...doc,
            status: 'PENDING',
            size: '3.6 MB',
            updated: 'Just now'
          };
        }
        return doc;
      }));
    });
  };

  // Calculate compliance progress %
  const verifiedCount = complianceDocs.filter(d => d.status === 'VERIFIED').length;
  const compliancePercentage = Math.round((verifiedCount / complianceDocs.length) * 100);

  if (loadingWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin" />
        <p className="text-sm font-bold text-app-muted animate-pulse">Retrieving isolated tenant directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Header Holographic Banner */}
      <div className="glass rounded-[2rem] p-8 border-app-border/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-[1.25rem] bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl md:text-3xl font-black text-app-text tracking-tight font-display leading-none">
                {organisationDetails?.name}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/25 text-emerald-500">
                <ShieldCheck className="w-3 h-3" /> Active Tenant
              </span>
            </div>
            <p className="text-xs text-app-muted font-bold tracking-wide uppercase">
              iTax KRA PIN: <strong className="text-app-text">{organisationDetails?.taxpayer_pin || "Not Registered"}</strong>
            </p>
          </div>
        </div>

        {/* Tab Selector Links */}
        <div className="flex bg-app-card/60 p-1.5 rounded-2xl border border-app-border relative z-10 shrink-0 select-none self-start md:self-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Settings2 className="w-4 h-4" /> Corporate Profile
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'team' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Users className="w-4 h-4" /> Team & Invites
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'vault' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-app-muted hover:text-app-text'
            }`}
          >
            <Award className="w-4 h-4" /> Compliance Vault
          </button>
        </div>

        {/* Animated background aesthetics */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      {/* 2. TAB CONTENT 1: CORPORATE PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Columns - Corporate Profile & Contacts */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Section A: Company Info */}
            <div className="glass rounded-[2rem] p-8 border-app-border/40 space-y-6">
              <h3 className="text-lg font-black text-app-text uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-500" /> Corporate Credentials
              </h3>
              
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-app-muted">Registered Company Name</label>
                  <input
                    type="text"
                    value={organisationName}
                    onChange={(e) => setOrganisationName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-app-card border border-app-border text-sm text-app-text focus:outline-none focus:border-brand-500 transition-all font-semibold"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-app-muted">Company Taxpayer PIN (KRA)</label>
                  <input
                    type="text"
                    value={taxpayerPin}
                    onChange={(e) => setTaxpayerPin(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-app-card border border-app-border text-sm text-app-text focus:outline-none focus:border-brand-500 transition-all font-semibold uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-app-muted">Corporate Business Email</label>
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-app-card border border-app-border text-sm text-app-text focus:outline-none focus:border-brand-500 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-app-muted">Corporate Business Phone</label>
                  <input
                    type="tel"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-app-card border border-app-border text-sm text-app-text focus:outline-none focus:border-brand-500 transition-all font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-app-muted">Physical Headquarter Address</label>
                <input
                  type="text"
                  value={physicalAddress}
                  onChange={(e) => setPhysicalAddress(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-app-card border border-app-border text-sm text-app-text focus:outline-none focus:border-brand-500 transition-all font-semibold"
                />
              </div>
            </div>

            {/* Section B: Designated Bid Coordinator */}
            <div className="glass rounded-[2rem] p-8 border-app-border/40 space-y-6">
              <h3 className="text-lg font-black text-app-text uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand-500" /> Designated Bid Coordinator
              </h3>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-app-muted">Full Legal Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-app-card border border-app-border text-sm text-app-text focus:outline-none focus:border-brand-500 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-app-muted">Corporate Role / Title</label>
                  <input
                    type="text"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-app-card border border-app-border text-sm text-app-text focus:outline-none focus:border-brand-500 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-app-muted">Coordinator Email Address</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-app-card border border-app-border text-sm text-app-text focus:outline-none focus:border-brand-500 transition-all font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-app-muted">Coordinator Phone Number</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-app-card border border-app-border text-sm text-app-text focus:outline-none focus:border-brand-500 transition-all font-semibold"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Directors & Submit */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Section C: Director Compliance info */}
            <div className="glass rounded-[2rem] p-8 border-app-border/40 space-y-6">
              <h3 className="text-lg font-black text-app-text uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-500" /> Director Verification
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-app-muted">Executive Director KRA PIN</label>
                  <input
                    type="text"
                    value={directorKraPin}
                    onChange={(e) => setDirectorKraPin(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-app-card border border-app-border text-sm text-app-text focus:outline-none focus:border-brand-500 transition-all font-semibold uppercase"
                    placeholder="e.g. A001234567Z"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-app-muted">Director iTax Phone Number</label>
                  <input
                    type="tel"
                    value={directorPhone}
                    onChange={(e) => setDirectorPhone(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-app-card border border-app-border text-sm text-app-text focus:outline-none focus:border-brand-500 transition-all font-semibold"
                    placeholder="e.g. +254 700 000 000"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3 text-[11px] text-app-muted font-medium leading-relaxed">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <span>Ensuring director iTax alignment is mandatory for automated compliance validation against government listing API checks.</span>
              </div>
            </div>

            {/* Action Bar */}
            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-4.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold transition-all shadow-lg hover:shadow-brand-500/25 text-base cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updatingProfile ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Save Profile Changes <ShieldCheck className="w-5 h-5" /></>
              )}
            </button>
          </div>

        </form>
      )}

      {/* 3. TAB CONTENT 2: TEAM DIRECTORY */}
      {activeTab === 'team' && (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Active Members List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-app-text tracking-tight flex items-center gap-2.5">
                Active Staff Directory
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-500 border border-brand-500/20">
                  {members.length}
                </span>
              </h3>
            </div>

            <div className="glass rounded-[2rem] border-app-border/40 overflow-hidden divide-y divide-app-border/50">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-6 hover:bg-app-card/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500/5 border border-brand-500/10 flex items-center justify-center font-black text-sm text-brand-500 shadow-inner">
                      {member.first_name ? member.first_name[0] : member.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-app-text">
                        {member.first_name ? `${member.first_name} ${member.last_name || ''}` : member.username}
                      </p>
                      <p className="text-xs font-semibold text-app-muted mt-0.5">{member.email}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                    member.role === 'ADMIN' 
                      ? 'bg-brand-500/10 border-brand-500/20 text-brand-500' 
                      : 'bg-app-card border-app-border text-app-muted'
                  }`}>
                    {member.role || 'Staff'}
                  </span>
                </div>
              ))}
            </div>

            {/* Pending Invitations list */}
            <div className="space-y-4 pt-4">
              <h4 className="text-lg font-black text-app-text tracking-tight">Pending Email Invitations</h4>
              
              <div className="glass rounded-[2rem] border-app-border/40 overflow-hidden divide-y divide-app-border/50">
                {invitations.length === 0 ? (
                  <div className="p-8 text-center text-app-muted space-y-1">
                    <p className="text-sm font-bold">No Pending Invitations</p>
                    <p className="text-xs opacity-75">Invited business personnel will appear here before they sign up.</p>
                  </div>
                ) : (
                  invitations.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between p-6 hover:bg-app-card/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-500">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-app-text">{invite.email}</p>
                          <p className="text-xs font-semibold text-app-muted mt-0.5">Invited as {invite.role}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500">
                        Pending Accept
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Send Invitation Form */}
          <div className="lg:col-span-1">
            <div className="glass rounded-[2rem] p-8 border-app-border/40 space-y-6 sticky top-24">
              <div className="space-y-2">
                <h3 className="text-lg font-black text-app-text uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-brand-500" /> Invite Colleague
                </h3>
                <p className="text-xs text-app-muted font-medium leading-relaxed">
                  Provide credentials to dispatch a secure multi-tenant activation link for your corporate environment.
                </p>
              </div>

              <form onSubmit={handleSendInvitation} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-app-muted">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-app-muted" />
                    <input
                      type="email"
                      placeholder="e.g. colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-app-card border border-app-border text-sm focus:outline-none focus:border-brand-500 transition-all font-semibold"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-app-muted">Workspace Permission Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-app-card border border-app-border text-sm focus:outline-none focus:border-brand-500 transition-all font-semibold"
                  >
                    <option value="COMPANY">Company Staff (Viewer)</option>
                    <option value="ADMIN">Workspace Admin (Executive)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={sendingInvite}
                  className="w-full py-4 rounded-xl border border-brand-500 text-brand-600 dark:text-white dark:hover:bg-brand-500 hover:bg-brand-50 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {sendingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invitation'}
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* 4. TAB CONTENT 3: COMPLIANCE VAULT */}
      {activeTab === 'vault' && (
        <div className="space-y-8">
          
          {/* Progress bar info card */}
          <div className="glass rounded-[2rem] p-8 border-app-border/40 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
            <div className="space-y-2 max-w-lg">
              <h3 className="text-xl font-black text-app-text tracking-tight flex items-center gap-2">
                Corporate Compliance Health
              </h3>
              <p className="text-xs text-app-muted font-medium leading-relaxed">
                To bid on active tenders, public procurement bodies require secure validation of your company files. Keep your documents up to date to guarantee instant AI tender matches.
              </p>
            </div>

            {/* Glowing radial/bar counter */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="space-y-1 text-right">
                <p className="text-2xl font-black text-emerald-500 font-display leading-none">{compliancePercentage}%</p>
                <p className="text-[10px] font-black text-app-muted uppercase tracking-wider">Health Index</p>
              </div>
              <div className="w-32 h-3 bg-app-border/50 rounded-full overflow-hidden border border-app-border/30">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${compliancePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Compliance List Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {complianceDocs.map((doc) => (
              <div 
                key={doc.id}
                className="glass rounded-[2rem] p-6 border-app-border/40 flex flex-col justify-between gap-6 hover:shadow-lg transition-all relative overflow-hidden group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center shrink-0 border ${
                      doc.status === 'VERIFIED' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' :
                      doc.status === 'PENDING' ? 'bg-amber-500/5 border-amber-500/10 text-amber-500' :
                      'bg-red-500/5 border-red-500/10 text-red-500'
                    }`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-app-text leading-snug group-hover:text-brand-500 transition-colors">
                          {doc.name}
                        </h4>
                        {doc.required && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 uppercase tracking-widest leading-none shrink-0">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-app-muted font-medium">
                        Size: {doc.size} • Updated: {doc.updated}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shrink-0 ${
                    doc.status === 'VERIFIED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    doc.status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse' :
                    'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                    {doc.status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-app-border/40 pt-4 relative z-10">
                  <span className="text-[10px] text-app-muted font-bold tracking-wide">
                    {doc.status === 'VERIFIED' && '✅ Vault check completed'}
                    {doc.status === 'PENDING' && '⏳ Automated OCR parsing in progress'}
                    {doc.status === 'MISSING' && '❌ Missing document'}
                  </span>
                  
                  <button
                    onClick={() => handleDocUpload(doc.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-app-card hover:bg-app-border border border-app-border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer hover:border-brand-500/50 hover:text-brand-500"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Upload File
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
