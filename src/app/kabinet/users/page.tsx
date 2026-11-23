"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Crown, 
  UserCheck, 
  Key, 
  Trash2, 
  Edit3, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Mail, 
  User, 
  Building2,
  ShieldAlert,
  X
} from "lucide-react";
import { UserRole } from "@/types";

interface ManagedUser {
  _id: string;
  email: string;
  displayName: string;
  department: string;
  role: UserRole;
  createdAt: number;
}

export default function UserManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{
    uid: string;
    displayName: string;
    email: string;
    role: UserRole;
    department: string;
  } | null>(null);

  const [token, setToken] = useState<string>("");
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<ManagedUser | null>(null);
  const [showRoleModal, setShowRoleModal] = useState<ManagedUser | null>(null);
  const [showEditModal, setShowEditModal] = useState<ManagedUser | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    displayName: "",
    email: "",
    department: "Layihələrin idarə olunması",
    password: "",
    role: "member" as UserRole,
  });

  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [selectedRoleInput, setSelectedRoleInput] = useState<UserRole>("member");
  const [editForm, setEditForm] = useState({
    displayName: "",
    department: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // Check auth and load users
  useEffect(() => {
    const userStr = localStorage.getItem("aeik_user");
    const storedToken = localStorage.getItem("aeik_token");

    if (!userStr || !storedToken) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userStr);
      if (parsedUser.role !== "owner" && parsedUser.role !== "admin") {
        router.push("/kabinet");
        return;
      }
      setCurrentUser(parsedUser);
      setToken(storedToken);
      fetchUsers(storedToken);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const fetchUsers = async (authToken: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "İstifadəçiləri yükləmək mümkün olmadı.");
      }

      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper notification
  const showMessage = (msg: string, isErr = false) => {
    if (isErr) {
      setError(msg);
      setTimeout(() => setError(""), 5000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(""), 4000);
    }
  };

  // 1. Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "İstifadəçi yaradılmadı.");
      }

      showMessage(`${createForm.displayName} uğurla əlavə edildi.`);
      setShowCreateModal(false);
      setCreateForm({
        displayName: "",
        email: "",
        department: "Layihələrin idarə olunması",
        password: "",
        role: "member",
      });
      fetchUsers(token);
    } catch (err: any) {
      showMessage(err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordModal) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${showPasswordModal._id}/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: newPasswordInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Şifrə yenilənmədi.");
      }

      showMessage(`${showPasswordModal.displayName} üçün şifrə uğurla dəyişdirildi.`);
      setShowPasswordModal(null);
      setNewPasswordInput("");
    } catch (err: any) {
      showMessage(err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Change Role (Owner only)
  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRoleModal) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${showRoleModal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: selectedRoleInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Rol dəyişdirilmədi.");
      }

      showMessage(`${showRoleModal.displayName} üçün rol uğurla "${selectedRoleInput.toUpperCase()}" olaraq yeniləndi.`);
      setShowRoleModal(null);
      fetchUsers(token);
    } catch (err: any) {
      showMessage(err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Edit User info
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${showEditModal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Məlumatlar yenilənmədi.");
      }

      showMessage("İstifadəçi məlumatları yeniləndi.");
      setShowEditModal(null);
      fetchUsers(token);
    } catch (err: any) {
      showMessage(err.message, true);
    } finally {
      setSubmitting(false);
    }
  };

  // 5. Delete User
  const handleDeleteUser = async (user: ManagedUser) => {
    if (!confirm(`Həqiqətən "${user.displayName}" (${user.email}) adlı istifadəçini silmək istəyirsiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Silinmə zamanı xəta baş verdi.");
      }

      showMessage(`${user.displayName} silindi.`);
      fetchUsers(token);
    } catch (err: any) {
      showMessage(err.message, true);
    }
  };

  const isOwner = currentUser?.role === "owner";
  const isAdmin = currentUser?.role === "admin";

  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case "owner":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Crown size={13} className="text-amber-600" />
            <span>Owner</span>
          </span>
        );
      case "admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-brand-700 border border-purple-300">
            <ShieldCheck size={13} className="text-brand-600" />
            <span>Admin</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <UserCheck size={13} className="text-slate-500" />
            <span>Member (Üzv)</span>
          </span>
        );
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F8F7FD] flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-purple-100/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/kabinet" className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors">
              <ArrowLeft size={16} />
              <span>Kabinetə Qayıt</span>
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div className="relative w-40 h-10 shrink-0">
              <Image
                src="/assets/logo-primary-trim.png"
                alt="AEİK"
                fill
                sizes="160px"
                className="object-contain object-left"
                priority
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800">{currentUser.displayName}</p>
              <p className="text-[10px] text-slate-500">{currentUser.department}</p>
            </div>
            {renderRoleBadge(currentUser.role)}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Notifications */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle size={18} className="shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 size={18} className="shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-purple-100/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Users size={22} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  İstifadəçi və Rol İdarəetməsi
                </h1>
                <p className="text-xs text-slate-500">
                  İstifadəçilərin siyahısı, giriş səlahiyyətləri və təhlükəsizlik
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setCreateForm({
                displayName: "",
                email: "",
                department: "Layihələrin idarə olunması",
                password: "",
                role: "member",
              });
              setShowCreateModal(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
          >
            <UserPlus size={16} />
            <span>Yeni İstifadəçi Əlavə Et</span>
          </button>
        </div>

        {/* Permissions Guidance Card */}
        <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
          isOwner 
            ? "bg-amber-50/60 border-amber-200 text-amber-900" 
            : "bg-purple-50/60 border-purple-200 text-brand-900"
        }`}>
          {isOwner ? (
            <Crown size={18} className="text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert size={18} className="text-brand-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-bold">
              {isOwner ? "Owner (Sistem Sahibi) Səlahiyyəti:" : "Admin Səlahiyyəti:"}
            </span>
            <p>
              {isOwner 
                ? "Siz həm istifadəçiləri yarada, redaktə edə və silə, həm də istənilən istifadəçiyə Owner, Admin və ya Member rolu (Role Management) təyin edə bilərsiniz."
                : "Siz istifadəçi idarəetməsi (User Management) edə bilərsiniz: yeni üzvlər əlavə edə, şifrə təyin edə və redaktə edə bilərsiniz. Qaydalara əsasən, rolların dəyişdirilməsi (Role Management) yalnız Owner tərəfindən həyata keçirilir."}
            </p>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-white rounded-3xl border border-purple-100/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>Bazada Qeydiyyatda Olan İstifadəçilər</span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-brand-700 text-xs font-semibold">
                {users.length}
              </span>
            </h2>
            <button
              onClick={() => fetchUsers(token)}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold transition-colors"
            >
              Yenilə
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">İstifadəçilər bazadan gətirilir...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Heç bir istifadəçi tapılmadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="py-3 px-5 font-semibold">İstifadəçi</th>
                    <th className="py-3 px-5 font-semibold">Email</th>
                    <th className="py-3 px-5 font-semibold">Şöbə</th>
                    <th className="py-3 px-5 font-semibold">Rol</th>
                    <th className="py-3 px-5 font-semibold">Tarix</th>
                    <th className="py-3 px-5 font-semibold text-right">Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {users.map((u) => {
                    const isSelf = currentUser.uid === u._id;
                    const canEditThisUser = isOwner || (isAdmin && u.role === "member");
                    const canDeleteThisUser = (isOwner && !isSelf) || (isAdmin && u.role === "member");

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-5 font-medium text-slate-900">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {u.displayName ? u.displayName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 leading-tight">
                                {u.displayName}
                                {isSelf && (
                                  <span className="ml-2 text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-semibold">
                                    Siz
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-mono text-[11px]">
                          {u.email}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600">
                          {u.department || "—"}
                        </td>
                        <td className="py-3.5 px-5">
                          {renderRoleBadge(u.role)}
                        </td>
                        <td className="py-3.5 px-5 text-slate-400 text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("az-AZ") : "—"}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Role management button (ONLY Owner can change role) */}
                            {isOwner ? (
                              <button
                                onClick={() => {
                                  setSelectedRoleInput(u.role);
                                  setShowRoleModal(u);
                                }}
                                title="Rolu dəyiş (Yalnız Owner)"
                                className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-200 transition-colors"
                              >
                                <Crown size={14} />
                              </button>
                            ) : (
                              <button
                                disabled
                                title="Rolu dəyişmək səlahiyyəti yalnız Owner-ə məxsusdur"
                                className="p-1.5 rounded-lg text-slate-300 border border-slate-100 cursor-not-allowed"
                              >
                                <Crown size={14} />
                              </button>
                            )}

                            {/* Password button */}
                            {canEditThisUser && (
                              <button
                                onClick={() => {
                                  setNewPasswordInput("");
                                  setShowPasswordModal(u);
                                }}
                                title="Şifrə təyin et / dəyiş"
                                className="p-1.5 rounded-lg text-purple-700 hover:bg-purple-50 border border-purple-200 transition-colors"
                              >
                                <Key size={14} />
                              </button>
                            )}

                            {/* Edit info button */}
                            {canEditThisUser && (
                              <button
                                onClick={() => {
                                  setEditForm({
                                    displayName: u.displayName,
                                    department: u.department,
                                  });
                                  setShowEditModal(u);
                                }}
                                title="Redaktə et"
                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                              >
                                <Edit3 size={14} />
                              </button>
                            )}

                            {/* Delete button */}
                            {canDeleteThisUser && (
                              <button
                                onClick={() => handleDeleteUser(u)}
                                title="İstifadəçini sil"
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1: Create User */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-purple-100 animate-scaleUp">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <UserPlus size={18} className="text-brand-600" />
                <span>Yeni İstifadəçi Əlavə Et</span>
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ad və Soyad
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={createForm.displayName}
                    onChange={(e) => setCreateForm({ ...createForm, displayName: e.target.value })}
                    placeholder="Məs: Cavid Quluyev"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Ünvanı
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="ad@aeik.az"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Şöbə / Vəzifə
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    placeholder="Məs: Layihələrin idarə olunması"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Şifrə (ən azı 6 simvol)
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
                  />
                </div>
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  İstifadəçi Rolu
                </label>
                {isOwner ? (
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600 bg-white"
                  >
                    <option value="member">👤 Member (Könüllü / Üzv)</option>
                    <option value="admin">🛡️ Admin (İdarəçi)</option>
                    <option value="owner">👑 Owner (Tam Sahib)</option>
                  </select>
                ) : (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span>👤 Member (Üzv)</span>
                    <span className="text-[10px] text-slate-400 italic">Admin yalnız Member yarada bilər</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 active:scale-98 text-white text-xs font-semibold shadow-md shadow-brand-600/20 transition-all disabled:opacity-50"
                >
                  {submitting ? "Yaradılır..." : "Yarat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Change Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Key size={16} className="text-brand-600" />
                <span>Şifrəni Dəyiş</span>
              </h3>
              <button 
                onClick={() => setShowPasswordModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              <strong className="text-slate-700">{showPasswordModal.displayName}</strong> üçün yeni şifrə təyin edin:
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Yeni Şifrə (min 6 simvol)
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(null)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? "Yenilənir..." : "Təsdiqlə"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Change Role (Owner only) */}
      {showRoleModal && isOwner && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Crown size={16} className="text-amber-500" />
                <span>Rolu Dəyişdir (Role Management)</span>
              </h3>
              <button 
                onClick={() => setShowRoleModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              <strong className="text-slate-700">{showRoleModal.displayName}</strong> üçün yeni rol seçin:
            </p>

            <form onSubmit={handleChangeRole} className="space-y-4">
              <div className="space-y-2">
                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedRoleInput === "member" ? "border-brand-600 bg-brand-50/50" : "border-slate-200 hover:bg-slate-50"
                }`}>
                  <input
                    type="radio"
                    name="roleChoice"
                    value="member"
                    checked={selectedRoleInput === "member"}
                    onChange={() => setSelectedRoleInput("member")}
                    className="text-brand-600"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">👤 Member (Könüllü / Üzv)</p>
                    <p className="text-[10px] text-slate-500">Paneldə yalnız layihə və tapşırıqları görə bilir</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedRoleInput === "admin" ? "border-brand-600 bg-brand-50/50" : "border-slate-200 hover:bg-slate-50"
                }`}>
                  <input
                    type="radio"
                    name="roleChoice"
                    value="admin"
                    checked={selectedRoleInput === "admin"}
                    onChange={() => setSelectedRoleInput("admin")}
                    className="text-brand-600"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">🛡️ Admin (İdarəçi)</p>
                    <p className="text-[10px] text-slate-500">Bütün modulları idarə edir, üzvləri əlavə edə bilir</p>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedRoleInput === "owner" ? "border-amber-500 bg-amber-50/50" : "border-slate-200 hover:bg-slate-50"
                }`}>
                  <input
                    type="radio"
                    name="roleChoice"
                    value="owner"
                    checked={selectedRoleInput === "owner"}
                    onChange={() => setSelectedRoleInput("owner")}
                    className="text-amber-600"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">👑 Owner (Tam Sahib)</p>
                    <p className="text-[10px] text-slate-500">Tam səlahiyyət və rol dəyişmə (Role Management) hüququ</p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(null)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? "Yenilənir..." : "Rolu Təsdiqlə"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Edit User Info */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 animate-scaleUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Edit3 size={16} className="text-brand-600" />
                <span>Məlumatları Redaktə Et</span>
              </h3>
              <button 
                onClick={() => setShowEditModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ad və Soyad
                </label>
                <input
                  type="text"
                  required
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Şöbə / Vəzifə
                </label>
                <input
                  type="text"
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(null)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? "Yadda saxlanılır..." : "Yadda Saxla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
