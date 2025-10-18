import React, { useState } from 'react'
import api from '../services/http'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()
  const { login: authLogin } = useAuth()

  const submit = async (e:any)=>{
    e.preventDefault()
    try{
  const r = await api.post('/accounts/login/', { username: email, password })
  // use auth hook to store token and refresh user
  authLogin(r.data.access)
  nav('/')
    }catch(e){
      const err: any = e
      const serverData = err?.response?.data
      const formatServer = (d:any) => {
        if (typeof d === 'string') return d
        if (Array.isArray(d)) return d.join('\n')
        if (typeof d === 'object' && d !== null) {
          return Object.entries(d).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join('; '):v}`).join('\n')
        }
        return String(d)
      }
      const serverMsg = serverData?.detail || (serverData ? formatServer(serverData) : null)
      const msg = serverMsg || err?.message || JSON.stringify(err)
      alert(msg)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Đăng nhập</h2>
      <form onSubmit={submit} className="bg-white p-6 rounded border">
        <label className="block mb-2">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <label className="block mb-2">Mật khẩu</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Đăng nhập</button>
      </form>
    </div>
  )
}
