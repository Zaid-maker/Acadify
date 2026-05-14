import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationsDropdown from "./NotificationsDropdown";
import { 
  LogOut, 
  LayoutDashboard, 
  Search, 
  ShieldCheck, 
  BarChart3,
  Video,
  Users,
  Menu,
  X,
  Moon,
  Sun
} from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = [
    { name: "Browse", path: "/lms", icon: Search, roles: ["student", "instructor", "admin"] },
    { name: "My Learning", path: "/dashboard", icon: LayoutDashboard, roles: ["student"] },
    { name: "Students", path: "/instructor/students", icon: Users, roles: ["instructor", "admin"] },
    { name: "Teach", path: "/instructor", icon: BarChart3, roles: ["instructor", "admin"] },
    { name: "Live", path: "/instructor/live", icon: Video, roles: ["instructor", "admin"] },
    { name: "Moderation", path: "/admin/moderation", icon: ShieldCheck, roles: ["admin"] },
  ];

  const activeLink = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src="/logo.png" 
                alt="Acadify Logo" 
                className="w-10 h-10 object-contain transition-transform group-hover:rotate-6 shadow-lg shadow-blue-500/10 rounded-xl"
              />
              <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter transition-colors group-hover:text-blue-600">
                Acadify
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              (!link.roles || (user && link.roles.includes(user.role))) && (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    activeLink(link.path)
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <link.icon className={`w-4 h-4 ${activeLink(link.path) ? "animate-pulse" : ""}`} />
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* User Actions Section */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {user ? (
              <>
                <NotificationsDropdown />
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
                <div className="flex items-center gap-3 pl-2">
                  <div className="text-right">
                    <p className="text-xs font-black text-gray-900 dark:text-white leading-none">{user.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      {user.role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-5 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="px-5 py-2 text-sm font-bold text-white bg-gray-900 dark:bg-blue-600 rounded-xl hover:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-lg shadow-black/5 hover:shadow-blue-500/20">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {theme === "light" ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
            </button>
             {user && <NotificationsDropdown />}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              (!link.roles || (user && link.roles.includes(user.role))) && (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold transition-all ${
                    activeLink(link.path)
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </Link>
              )
            ))}
            {user ? (
               <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all mt-4"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-4">
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center px-4 py-3 rounded-2xl border border-gray-200 font-bold text-gray-700">Sign In</Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center px-4 py-3 rounded-2xl bg-gray-900 text-white font-bold">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
