import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'modern' | 'industrial';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return (savedTheme as Theme) || 'modern';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  useEffect(() => {
    // También aplicar una clase al elemento raíz para facilitar la segmentación CSS
    const root = document.documentElement;
    root.classList.remove('theme-modern', 'theme-industrial');
    root.classList.add(`theme-${theme}`);
    
    // Establecer un atributo de datos para una segmentación aún más fácil o bibliotecas de terceros
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
