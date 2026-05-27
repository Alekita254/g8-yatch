import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api';

export default function useOrganisation(djangoUser) {
  const [organisationDetails, setOrganisationDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Organization Details Fields State
  const [organisationName, setOrganisationName] = useState('');
  const [taxpayerPin, setTaxpayerPin] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [physicalAddress, setPhysicalAddress] = useState('');
  
  // Coordinator Fields State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRole, setContactRole] = useState('');
  
  // Director Fields State
  const [directorKraPin, setDirectorKraPin] = useState('');
  const [directorPhone, setDirectorPhone] = useState('');

  // Loading / Saving States
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchWorkspaceData = async () => {
    // If the logged in user profile doesn't have an organisation assigned, skip loading
    if (!djangoUser || !djangoUser.organisation) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Consume exact endpoint: /api/organisation/{id}/
      const orgRes = await api.get(`/api/organisation/${djangoUser.organisation}/`);
      if (orgRes.data) {
        const org = orgRes.data;
        setOrganisationDetails(org);
        
        // Populate states
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
      console.error("Failed to load organisation details by ID:", err);
      toast.error("Error refreshing organisation details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [djangoUser]);

  const updateProfile = async (e) => {
    if (e) e.preventDefault();
    if (!organisationName.trim() || !organisationDetails?.id) return false;
    
    try {
      setUpdating(true);
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

      // Perform update using PATCH on exact /api/organisation/{id}/ endpoint
      await api.patch(`/api/organisation/${organisationDetails.id}/`, payload);
      toast.success('Corporate credentials updated successfully!');
      setIsEditing(false);
      
      // Refresh local states
      await fetchWorkspaceData();
      return true;
    } catch (err) {
      console.error(err);
      toast.error('Failed to update workspace profile details.');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const cancelEdit = () => {
    if (organisationDetails) {
      setOrganisationName(organisationDetails.name || '');
      setTaxpayerPin(organisationDetails.taxpayer_pin || '');
      setBusinessEmail(organisationDetails.business_email || '');
      setBusinessPhone(organisationDetails.business_phone || '');
      setPhysicalAddress(organisationDetails.physical_address || '');
      
      setContactName(organisationDetails.contact_person_name || '');
      setContactEmail(organisationDetails.contact_person_email || '');
      setContactPhone(organisationDetails.contact_person_phone || '');
      setContactRole(organisationDetails.contact_person_role || '');
      
      setDirectorKraPin(organisationDetails.director_kra_pin || '');
      setDirectorPhone(organisationDetails.director_phone || '');
    }
    setIsEditing(false);
  };

  // Onboarding component adapter mapping
  const onboardingAdapter = {
    companyName: organisationName,
    setCompanyName: setOrganisationName,
    businessEmail,
    setBusinessEmail,
    businessPhone,
    setBusinessPhone,
    physicalAddress,
    setPhysicalAddress,
    
    contactName,
    setContactName,
    contactEmail,
    setContactEmail,
    contactPhone,
    setContactPhone,
    contactRole,
    setContactRole,
    
    taxpayerPin,
    setTaxpayerPin,
    directorKraPin,
    setDirectorKraPin,
    directorPhone,
    setDirectorPhone
  };

  return {
    organisationDetails,
    isEditing,
    setIsEditing,
    loading,
    updating,
    updateProfile,
    cancelEdit,
    onboardingAdapter
  };
}
