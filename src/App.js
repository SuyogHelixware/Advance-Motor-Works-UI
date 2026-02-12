import "./App.css";
import { AuthProvider } from "./Routing/AuthContext";
import Routing from "./Routing/Routing";
import { ThemeMode } from "./Theme/ThemeMode";

function App() {
  return (
    <ThemeMode>
      <AuthProvider>
        <Routing />
      </AuthProvider>
    </ThemeMode>
  );
}
export default App;
