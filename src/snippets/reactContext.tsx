import { createContext, useContext, useEffect } from "react";

export type AppContextType = {};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {}, []);

  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
};
const AppContext = createContext<AppContextType>({} as AppContextType);

const useAppProvider = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppProvider must be used within an AppProvider");
  }
  return context;
};

export { AppProvider, useAppProvider };
