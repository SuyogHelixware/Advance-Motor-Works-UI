import { createContext, useContext, useEffect, useState } from "react";
import Swal from "sweetalert2";
import apiClient from "../services/apiClient";

const AuthContext = createContext();

export default function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [companyError, setCompanyError] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [warehouseData, setWarehouseData] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyNeedsSetup, setCompanyNeedsSetup] = useState(false);

  const fetchCompanyName = async () => {
    try {
      const { data } = await apiClient.get(`/CompanyDetails/All`);
      const { values } = data;
      if (Array.isArray(values) && values.length > 0) {
        const rawCompany = values[0];
        const normalizedCompany = {
          ...rawCompany,
          companyName: rawCompany.CompnyName,
        };

        setCompanyData(normalizedCompany);
        setCompanyNeedsSetup(false);
        setCompanyError(false); // ✅ no error
      } else {
        setCompanyData(null);
        setCompanyNeedsSetup(true); // ✅ setup needed (no data)
        setCompanyError(false);
      }
    } catch (error) {
      console.error("Error fetching company name:", error);
      setCompanyData(null);
      setCompanyNeedsSetup(false); // ✅ don't falsely trigger setup
      setCompanyError(true); // ✅ mark error
    } finally {
      setCompanyLoading(false);
    }
  };

  const fetchWarehouse = async () => {
    try {
      const { data } = await apiClient.get(`/WarehouseV2/All`);
      if (data.success) {
        const values = data?.values || [];
        const filterWareHouse = values.filter((item) => item.Status === "1");
        setWarehouseData(filterWareHouse);
      } else if (data.success === false) {
        Swal.fire({
          text: data.message,
          icon: "question",
          confirmButtonText: "YES",
          showConfirmButton: true,
        });
      }
    } catch (error) {
      console.error("Error fetching company name:", error);
    }
  };
  const login = (userData) => {
    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("user");
  };
  useEffect(() => {
    fetchWarehouse();
    fetchCompanyName();
  }, []);
  const value = {
    user,
    login,
    logout,
    fetchWarehouse,
    fetchCompanyName,
    companyData,
    warehouseData,
    companyLoading,
    companyNeedsSetup,
    companyError, // ✅ add this
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
