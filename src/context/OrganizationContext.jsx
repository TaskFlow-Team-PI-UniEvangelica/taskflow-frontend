import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from 'react-oidc-context';

export const OrganizationContext = createContext();

function isSameOrg(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.id === b.id &&
    a.nome === b.nome &&
    a.myRole === b.myRole &&
    Boolean(a.membersCanCreateTasks) === Boolean(b.membersCanCreateTasks) &&
    Boolean(a.membersCanDeleteTasks) === Boolean(b.membersCanDeleteTasks) &&
    Boolean(a.membersCanDeleteOwnTasks) === Boolean(b.membersCanDeleteOwnTasks) &&
    Boolean(a.membersCanEditAllTasks) === Boolean(b.membersCanEditAllTasks) &&
    Boolean(a.membersCanEditOwnOrAssignedTasks) === Boolean(b.membersCanEditOwnOrAssignedTasks) &&
    Boolean(a.membersCanMoveAllTasks) === Boolean(b.membersCanMoveAllTasks) &&
    Boolean(a.membersCanMoveOwnOrAssignedTasks) === Boolean(b.membersCanMoveOwnOrAssignedTasks) &&
    Boolean(a.membersCanChangeDeadlines) === Boolean(b.membersCanChangeDeadlines) &&
    Boolean(a.membersCanReturnTasks) === Boolean(b.membersCanReturnTasks) &&
    (a.deletedTasksRetentionDays ?? null) === (b.deletedTasksRetentionDays ?? null)
  );
}

function isSameOrgList(listA, listB) {
  if (listA === listB) return true;
  if (!Array.isArray(listA) || !Array.isArray(listB)) return false;
  if (listA.length !== listB.length) return false;
  for (let i = 0; i < listA.length; i++) {
    if (!isSameOrg(listA[i], listB[i])) return false;
  }
  return true;
}

export const OrganizationProvider = ({ children }) => {
  const auth = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const currentOrgRef = useRef(null);

  useEffect(() => {
    currentOrgRef.current = currentOrg;
  }, [currentOrg]);

  const syncOrganizationsSilently = useCallback(async () => {
    const token = auth?.user?.access_token;
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/organization/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) return;

      const data = await response.json();
      if (!Array.isArray(data)) return;

      // Só atualiza a lista se algum campo realmente mudou (evita re-renders/flicker)
      setOrganizations(prev => (isSameOrgList(prev, data) ? prev : data));

      if (data.length === 0) {
        if (currentOrgRef.current !== null) {
          setCurrentOrg(null);
        }
        localStorage.removeItem('selectedOrgId');
        return;
      }

      const activeOrg = currentOrgRef.current;
      const savedOrgId = localStorage.getItem('selectedOrgId');
      const targetId = activeOrg?.id ?? (savedOrgId ? Number(savedOrgId) : null);
      const matched = targetId ? data.find(o => o.id === targetId) : null;
      const nextCurrent = matched || data[0];

      if (!isSameOrg(activeOrg, nextCurrent)) {
        setCurrentOrg(nextCurrent);
        localStorage.setItem('selectedOrgId', nextCurrent.id);
      }
    } catch (err) {
      console.error("Erro ao sincronizar organizações", err);
    }
  }, [auth?.user?.access_token]);

  useEffect(() => {
    const token = auth?.user?.access_token;
    if (!token) return;

    syncOrganizationsSilently();

    // Carregar o perfil do usuário autenticado uma vez para verificação de autoria (ex: criadorId)
    fetch(`${import.meta.env.VITE_API_URL}/user/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => (res.ok ? res.json() : null))
      .then(user => {
        if (user) setCurrentUser(user);
      })
      .catch(() => {});

    // Hot Reload silencioso sem piscar a tela:
    // 1. A cada 4s enquanto a aba estiver visível
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncOrganizationsSilently();
      }
    }, 4000);

    // 2. Imediatamente quando o usuário foca a janela ou volta para a aba
    const handleFocus = () => syncOrganizationsSilently();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncOrganizationsSilently();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auth?.user?.access_token, syncOrganizationsSilently]);

  const selectOrganization = (orgId) => {
    const org = organizations.find(o => o.id === Number(orgId));
    if (org) {
      setCurrentOrg(org);
      localStorage.setItem('selectedOrgId', org.id);
    }
  };

  const refreshOrganizations = async () => {
    await syncOrganizationsSilently();
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrg,
        currentUser,
        selectOrganization,
        refreshOrganizations
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};
