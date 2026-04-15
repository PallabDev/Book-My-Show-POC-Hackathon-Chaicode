import React from "react";
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Film, MapPin } from "lucide-react";

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-sans antialiased">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-secondary/30 py-8 mt-auto">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2 group">
              <Film className="h-5 w-5 text-primary" />
              <span className="font-bold text-base tracking-tight text-primary">
                CineNova
              </span>
            </Link>

            {/* Location */}
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              Serving Kalyani, West Bengal
            </p>

            {/* Copyright */}
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CineNova. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
