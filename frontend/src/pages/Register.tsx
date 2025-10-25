import React, { useState } from 'react'
import api from '../services/http'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

export default function Register(){
  console.log("REGISTER PAGE LIVE") // debug
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const nav = useNavigate()
  const { setToken, login } = useAuthContext()

  const submit = async (e: React.FormEvent)=>{
    e.preventDefault()
    setSubmitting(true)
    try{
      const res = await api.post('/accounts/register/', { username, password, email })
      const data = res.data || {}
      if (data.access) {
        await setToken(data.access)
      } else {
        await login({ username, email, password })
      }
      nav('/')  // ✅ không còn điều hướng verify-otp
    }catch(err: any){
      const server = err?.response?.data
      const format = (d:any) => {
        if (typeof d === 'string') return d
        if (Array.isArray(d)) return d.join('\n')
        if (typeof d === 'object' && d !== null)
          return Object.entries(d).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join('; '):v}`).join('\n')
        return String(d)
      }
      alert(server?.detail || (server?format(server):err?.message) || 'Đăng ký thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Đăng ký</h2>
      <form onSubmit={submit} className="bg-white p-6 rounded border">
        <label className="block mb-2">Tên đăng nhập</label>
        <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full p-2 border rounded mb-3" />

        <label className="block mb-2">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded mb-3" />

        <label className="block mb-2">Mật khẩu</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded mb-3" />

        <button disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60">
          {submitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
    </div>
  )
}
