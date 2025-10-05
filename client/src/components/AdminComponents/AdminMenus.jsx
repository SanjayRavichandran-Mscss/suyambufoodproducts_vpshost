import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Boxes, Archive, ShoppingCart, LogOut } from 'lucide-react';

const menus = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "dashboard" },
  { key: "customers", label: "Customers", icon: Users, path: "customers" },
  { key: "categories", label: "Categories", icon: Boxes, path: "categories" },
  { key: "products", label: "Products", icon: Archive, path: "products" },
  { key: "orders", label: "Orders", icon: ShoppingCart, path: "orders" },
];

const menuActive = "bg-[#69D84F] text-white shadow font-semibold";
const menuDefault = "text-gray-700 hover:bg-[#E3E8EE] hover:text-[#69D84F]";
const bottomMenuActive = "bg-[#69D84F] text-white shadow-sm rounded-lg p-2 transition-colors duration-200";
const bottomMenuDefault = "text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors duration-200";

export default function AdminMenus({ adminId }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ id: '', full_name: '', email: '' });
  const [showLogout, setShowLogout] = useState(false);

  // Fetch admin profile
  useEffect(() => {
    if (!adminId) return;
    const fetchProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/profile/${adminId}`);
        const data = await response.json();
        if (response.ok) {
          setProfile(data);
        } else {
          console.error('Error fetching profile:', data.error);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [adminId]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");
    navigate("/adminlogin", { replace: true });
  };

  return (
    <>
      {/* Top bar */}
      <nav className="fixed top-0 left-0 w-full bg-white flex items-center justify-between px-2 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-[#E3E8EE] z-50">
        <div className="flex items-center">
          <img
            src="/Assets/Suyambu_Eng_logo.png"
            alt="Suyambu Stores Logo"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </div>

        {/* Desktop horizontal nav */}
        <div className="hidden lg:flex items-center justify-center gap-4 lg:gap-6 flex-1">
          {menus.map(({ key, label, icon: Icon, path }) => (
            <NavLink
              key={key}
              to={`/admin/${path}?adminId=${btoa(adminId)}`}
              className={({ isActive }) =>
                `flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 text-sm lg:text-base rounded-full transition-colors ${
                  isActive ? menuActive : menuDefault
                }`
              }
              end
            >
              <Icon size={18} className="lg:w-5 lg:h-5" />
              <span className="hidden lg:block">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Profile */}
        <div 
          className="relative flex flex-col items-end cursor-pointer"
          onClick={() => setShowLogout(!showLogout)}
        >
          <span className="text-gray-700 font-semibold text-xs sm:text-sm lg:text-base">{profile.full_name || 'Admin'}</span>
          <span className="text-gray-500 text-xs lg:text-sm break-all">{profile.email || 'email@example.com'}</span>
          {showLogout && (
            <button
              onClick={handleLogout}
              className="absolute right-0 top-full mt-1 lg:mt-2 flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1.5 lg:py-2 bg-red-600 text-white border border-red-700 rounded-md shadow-sm hover:bg-red-700 hover:border-red-800 transition-colors text-xs lg:text-sm z-10"
            >
              <LogOut size={16} className="lg:w-4 lg:h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </nav>

      {/* Mobile bottom navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-[#E3E8EE] z-50 px-4 py-2">
        <div className="flex justify-evenly">
          {menus.map(({ key, label, icon: Icon, path }) => (
            <NavLink
              key={key}
              to={`/admin/${path}?adminId=${btoa(adminId)}`}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 transition-all min-w-0 ${
                  isActive ? bottomMenuActive : bottomMenuDefault
                }`
              }
              end
            >
              <Icon size={24} className="flex-shrink-0" />
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};