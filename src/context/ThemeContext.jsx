import React, { createContext, useState, useContext, useEffect } from 'react';


const ThemeContext = createContext();


export const ThemeProvider = ({ children }) => {

  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };


  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};


// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);