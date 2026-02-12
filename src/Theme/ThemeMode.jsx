import { createTheme, ThemeProvider } from "@mui/material/styles";
import { createContext, useContext, useState } from "react";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0066FF" },
    secondary: { main: "#f50057" },
    background: { default: "#F5F6FA", paper: "#F5F6FA" },
    text: { primary: "#333333", secondary: "#666666" },
    divider: "#dddddd",
    custome: { datagridcolor: "#66BB6A" },
    customAppbar: { appbarcolor: "#fffff" },
    DrawerCustom: { Drawercolor: "#fffff" },
    CustomListDrawer: { ListDrawerColor: "#F5F6FA" },
    CustomLoader: { LoaderColor: "#080D2B" },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#1976D2" },
    background: { default: "#060B27", paper: "#080D2B" },
    text: { primary: "#ffffff", secondary: "#bbbbbb" },
    divider: "#555555",
    custome: { datagridcolor: "#171821" },
    customAppbar: { appbarcolor: "#393A44" },
    DrawerCustom: { Drawercolor: "#080D2B" },
    CustomListDrawer: { ListDrawerColor: "#080D2B" },
    CustomLoader: { LoaderColor: "#fffff" },
  },
  components: {
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: "#ffffff",
        },
      },
    },
  },
});

export const ModeContext = createContext({
  themeMode: "light",
  DarkMode: () => {},
  LightMode: () => {},
});

export function ThemeMode({ children }) {
  const [themeMode, setThemeMode] = useState("light");

  const LightMode = () => {
    setThemeMode("light");
  };

  const DarkMode = () => {
    setThemeMode("dark");
  };
  return (
    <ModeContext.Provider value={{ themeMode, LightMode, DarkMode }}>
      <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
        {children}
      </ThemeProvider>
    </ModeContext.Provider>
  );
}
export function useThemeMode() {
  return useContext(ModeContext);
}
