import React, { useState } from "react";
import api from "../../services/http";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

export default function RegisterStore(){
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [address, setAddress]   = useState("");
  const [phone, setPhone]       = useState("");
  const [loading, setLoading]   = useState(false);

  const nav = useNavigate();
  const { setToken, fetchMe, user } = useAuthContext();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try{
      const payload: any = { name, address, phone };
      if (!user) { payload.username = username; payload.email = email; payload.password = password; }

      const r = await api.post("/accounts/register_merchant/", payload);

      if (r.data?.access) {
        await setToken(r.data.access);
      } else {
        await fetchMe();
      }
      nav("/merchant/dashboard");
    }catch(err:any){
      const server = err?.response?.data;
      alert(server?.detail || JSON.stringify(server) || err?.message);
    }finally{ setLoading(false); }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Đăng ký cửa hàng</h2>
      <form onSubmit={submit} className="bg-white p-6 rounded border grid grid-cols-2 gap-3">
        {!user && (
          <>
            <div className="col-span-1">
              <label className="block mb-1">Tên đăng nhập</label>
              <input className="w-full border p-2 rounded" value={username} onChange={e=>setUsername(e.target.value)} />
            </div>
            <div className="col-span-1">
              <label className="block mb-1">Email</label>
              <input className="w-full border p-2 rounded" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block mb-1">Mật khẩu</label>
              <input type="password" className="w-full border p-2 rounded" value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            <div className="col-span-2 h-px bg-slate-200 my-2" />
          </>
        )}

        <div className="col-span-2">
          <label className="block mb-1">Tên cửa hàng</label>
          <input className="w-full border p-2 rounded" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className="block mb-1">Địa chỉ</label>
          <input className="w-full border p-2 rounded" value={address} onChange={e=>setAddress(e.target.value)} />
        </div>
        <div className="col-span-1">
          <label className="block mb-1">SĐT</label>
          <input className="w-full border p-2 rounded" value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>

        <div className="col-span-2">
          <button disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
            {loading ? "Đang tạo..." : "Tạo cửa hàng"}
          </button>
        </div>
      </form>
    </div>
  )
}
