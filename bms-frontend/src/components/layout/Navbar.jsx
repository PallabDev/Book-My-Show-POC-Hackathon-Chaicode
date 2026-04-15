import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Film, LogOut, User, Menu, X } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
            <Film className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold text-xl tracking-tight text-primary">
              CineNova
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-4">
          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Button variant="ghost" asChild>
                    <Link to="/admin/dashboard">Admin Dashboard</Link>
                  </Button>
                )}
                <Button variant="ghost" asChild>
                  <Link to="/my-bookings">My Bookings</Link>
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border rounded-md bg-secondary text-secondary-foreground">
                  <User className="w-4 h-4" />
                  <span>{user.first_name}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="default" asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </nav>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden border-t bg-background/98 backdrop-blur px-4 py-4 flex flex-col gap-2">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium border rounded-md bg-secondary text-secondary-foreground w-fit">
                <User className="w-4 h-4" />
                <span>{user.first_name}</span>
              </div>
              {user.role === "admin" && (
                <Button variant="ghost" asChild className="justify-start w-full">
                  <Link to="/admin/dashboard" onClick={closeMenu}>
                    Admin Dashboard
                  </Link>
                </Button>
              )}
              <Button variant="ghost" asChild className="justify-start w-full">
                <Link to="/my-bookings" onClick={closeMenu}>
                  My Bookings
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 justify-start w-full"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="justify-start w-full">
                <Link to="/login" onClick={closeMenu}>
                  Login
                </Link>
              </Button>
              <Button variant="default" asChild className="justify-start w-full">
                <Link to="/signup" onClick={closeMenu}>
                  Sign up
                </Link>
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
