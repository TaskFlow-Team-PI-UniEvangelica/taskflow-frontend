import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

export const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const auth = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);

  useEffect(() => {
    const fetchOrgs = async () => {
      const token = auth?.user?.access_token;
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);
          if (data.length > 0) {
            // Load from localStorage if previously selected
            const savedOrgId = localStorage.getItem('selectedOrgId');
            const savedOrg = data.find(o => o.id === Number(savedOrgId));
            if (savedOrg) {
              setCurrentOrg(savedOrg);
            } else {
              setCurrentOrg(data[0]);
            }
          }
        }
      } catch (err) {
        console.error("Erro ao carregar organizações", err);
      }
    };

    fetchOrgs();
  }, [auth?.user?.access_token]);

  const selectOrganization = (orgId) => {
    const org = organizations.find(o => o.id === Number(orgId));
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem('selectedOrgId', org.id);
    }
  };

  const refreshOrganizations = async () => {
     // call the API again and update state
      const token = auth?.user?.access_token;
      if (!token) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);
          if (currentOrg) {
              const updatedCurrent = data.find(o => o.id === currentOrg.id);
              if (updatedCurrent) setCurrentOrg(updatedCurrent);
          }
        }
      } catch (err) {}
  };

  return (
    <OrganizationContext.Provider value={{ organizations, currentOrg, selectOrganization, refreshOrganizations }}>
      {children}
    </OrganizationContext.Provider>
  );
};
