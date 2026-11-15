import { createContext } from 'react';

// Objeto de contexto separado do provider (OrganizationContext.jsx) para que o fast refresh do
// Vite funcione: arquivos de componente devem exportar apenas componentes.
export const OrganizationContext = createContext();
