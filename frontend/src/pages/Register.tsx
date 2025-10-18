import React, { useState } from 'react'
import api from '../services/http'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const nav = useNavigate()

  const submit = async (e:any)=>{
    e.preventDefault()
    try{
      await api.post('/accounts/register/', { username, password, email })
  // send otp
  const rawIdentifier = (email || username || '').trim()
  const identifier = rawIdentifier.includes('@') ? rawIdentifier.toLowerCase() : rawIdentifier
  await api.post('/accounts/send_otp/', { identifier })
  // save the pending identifier so the verify page can pre-fill after navigation or reload
  try{ sessionStorage.setItem('pending_verify_identifier', identifier) }catch(e){}
  // navigate to verify page and pass the identifier so it pre-fills
  nav(`/verify-otp?identifier=${encodeURIComponent(identifier)}`)
    }catch(e){
      // show backend message when possible and log full error for debugging
      const err: any = e
      console.error('Register error', err)
      // axios network errors sometimes don't have response; show as much info as possible
      const serverData = err?.response?.data
      // helper to stringify fielded errors (lists/objects)
      const formatServer = (d:any) => {
        if (typeof d === 'string') return d
        if (Array.isArray(d)) return d.join('\n')
        if (typeof d === 'object' && d !== null) {
          // join field errors
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
      <h2 className="text-xl font-semibold mb-4">Đăng ký</h2>
      <form onSubmit={submit} className="bg-white p-6 rounded border">
        <label className="block mb-2">Tên đăng nhập</label>
        <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <label className="block mb-2">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <label className="block mb-2">Mật khẩu</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Đăng ký & Gửi OTP</button>
      </form>
    </div>
  )
}
