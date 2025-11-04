import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Investments from "./pages/Investments";
import Documents from "./pages/Documents";
import Profiles from "./pages/Profiles";
import Deals from "./pages/Deals";
import Settings from "./pages/Settings";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
