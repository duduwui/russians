"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  UserCheck,
  Plus,
  X,
} from "lucide-react";

interface AppUser {
  id: string;
  username: string;
  name: string;
  role: "ADMIN" | "CASHIER";
  active: boolean;
  createdAt: string;
}

export function UsersManager() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "CASHIER">("CASHIER");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !name) return;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, name, password, role }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setUsername("");
        setName("");
        setPassword("");
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-[#ebf0f4] space-y-3">
      {/* Top Header Card */}
      <div className="bg-white p-3.5 border border-[#d2d6de] rounded-[2px] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#333333]">User Roles & Cashier Management</h2>
            <p className="text-xs text-[#777777]">Manage staff cashier logins, supervisor pin codes, and administrator permissions</p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#1fbad9] hover:bg-[#17a2b8] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Cashier</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#d2d6de] rounded-[2px] shadow-2xs overflow-x-auto">
        <table className="w-full text-start text-xs">
          <thead className="bg-[#cfd6de] text-[#333333] font-bold">
            <tr>
              <th className="py-2.5 px-3 text-start">Full Name</th>
              <th className="py-2.5 px-3 text-start">Login Username</th>
              <th className="py-2.5 px-3 text-center">Role / Access</th>
              <th className="py-2.5 px-3 text-center">Account Status</th>
              <th className="py-2.5 px-3 text-end">Created Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">Loading user accounts...</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-slate-800">{u.name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{u.username}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-end text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[3px] border border-slate-300 shadow-xl w-full max-w-sm overflow-hidden">
            <div className="bg-[#1a2226] text-white px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-sm">Create Cashier Account</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Staff Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Ayu Safitri"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Login Username *</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cashier2"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role / Permissions</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "ADMIN" | "CASHIER")}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-[2px] bg-white"
                >
                  <option value="CASHIER">Cashier (POS & Sales only)</option>
                  <option value="ADMIN">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#00a65a] hover:bg-[#008d4c] text-white text-xs font-bold rounded cursor-pointer shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
