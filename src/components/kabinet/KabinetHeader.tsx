"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  Database,
  CheckCircle2,
  Users,
  Crown,
  UserCheck
} from "lucide-react";
import { UserRole } from "@/types";

interface KabinetHeaderProps {
  currentUser: {
    displayName: string;
    email: string;
    role: UserRole;
    department: string;
  };
  isMongoConnected?: boolean;
}

export default function KabinetHeader({ 
  currentUser, 
  isMongoConnected = false,
}: KabinetHeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("aeik_user");
    localStorage.removeItem("aeik_token");
    router.push("/login");
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "owner":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
            <Crown size={14} />
            <span>Owner</span>
          </span>
        );
      case "admin":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-brand-600 text-white shadow-xs">
            <ShieldCheck size={14} />
            <span>Admin</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            <UserCheck size={14} />
            <span>Üzv</span>
          </span>
        );
    }
  };

  const canManageUsers = currentUser.role === "owner" || currentUser.role === "admin";

  return (
    <header className="bg-white border-b border-purple-100/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-4">
          <Link href="/" className="relative w-40 sm:w-48 h-10 block shrink-0">
            <Image
              src="/assets/logo-primary-trim.png"
              alt="AEİK"
              fill
              sizes="(min-width: 640px) 192px, 160px"
              className="object-contain object-left"
              priority
            />
          </Link>
          <div className="hidden sm:block h-6 w-px bg-slate-200" />
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-slate-800 leading-tight">
              İdarə Heyəti Paneli
            </h1>
            <p className="text-xs text-slate-500">
              Şəxsi kabinet və fəaliyyət modulları
            </p>
          </div>
        </div>

        {/* Right: User details, role switch, sync status, and actions */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Storage / MongoDB Status */}
          <div 
            title={isMongoConnected ? "MongoDB Atlas Aktiv Əlaqə" : "Məlumatlar lokal olaraq saxlanılır"}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              isMongoConnected 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-purple-50 text-brand-700 border-purple-200"
            }`}
          >
            <Database size={13} className={isMongoConnected ? "text-emerald-600" : "text-brand-600"} />
            <span>{isMongoConnected ? "MongoDB Aktiv" : "Daxili Yaddaş"}</span>
            <CheckCircle2 size={13} className={isMongoConnected ? "text-emerald-500" : "text-brand-500"} />
          </div>

          {/* User Management link (Owner & Admin only) */}
          {canManageUsers && (
            <Link
              href="/kabinet/users"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-brand-700 border border-purple-200 transition-colors"
            >
              <Users size={14} />
              <span>İstifadəçilər</span>
            </Link>
          )}

          {/* Real Role badge */}
          {getRoleBadge(currentUser.role)}

          {/* User profile capsule */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
              {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-slate-800 leading-none">
                {currentUser.displayName}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                {currentUser.department}
              </p>
            </div>
          </div>

          {/* Public site link */}
          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-xl text-slate-500 hover:text-brand-600 hover:bg-purple-50 transition-colors"
            title="Əsas saytı yeni tabda aç"
          >
            <ExternalLink size={17} />
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Çıxış"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
