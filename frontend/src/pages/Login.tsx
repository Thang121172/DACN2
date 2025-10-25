import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const { login } = useAuthContext(); // ✅ dùng trong component, KHÔNG await ở đây

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 👉 Gửi đủ field để khớp backend (username/email/phone)
      await login({
        username: identifier,
        email: identifier,
        phone: identifier,
        password,
      });

      // ✅ Đăng nhập OK → điều hướng
      nav("/");
    } catch (err: any) {
      const serverData = err?.response?.data;
      const formatServer = (d: any) => {
        if (typeof d === "string") return d;
        if (Array.isArray(d)) return d.join("\n");
        if (typeof d === "object" && d !== null) {
          return Object.entries(d)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join("; ") : v}`)
            .join("\n");
        }
        return String(d);
      };
      const msg =
        serverData?.detail ||
        (serverData ? formatServer(serverData) : err?.message);
      alert(msg || "Đăng nhập thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Đăng nhập</h2>
      <form onSubmit={submit} className="bg-white p-6 rounded border">
        <label className="block mb-2">Email / Username / SĐT</label>
        <input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          placeholder="email hoặc username hoặc sđt"
        />

        <label className="block mb-2">Mật khẩu</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mb-3"
          placeholder="••••••••"
        />

        <button
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
