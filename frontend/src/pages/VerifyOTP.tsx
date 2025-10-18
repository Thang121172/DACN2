import React, { useState, useEffect } from 'react'
import api from '../services/http'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

export default function VerifyOTP(){
  const location = useLocation()
  const nav = useNavigate()

  const computeInitialIdentifier = () => {
    try{
      const qp = new URLSearchParams(location.search || '')
      const q = qp.get('identifier')
      if(q) return q
    }catch(e){}
    try{
      const s = sessionStorage.getItem('pending_verify_identifier')
      if(s) return s
    }catch(e){}
    return ''
  }

  const [identifier, setIdentifier] = useState<string>(computeInitialIdentifier)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(()=>{
    if(!identifier) return
    // try to auto-fill latest OTP in dev when identifier changes
    (async ()=>{
      try{
        const res = await api.get(`/accounts/dev_latest_otp/?identifier=${encodeURIComponent(identifier)}`)
        setCode(res.data.code)
      }catch(e){
        // ignore
      }
    })()
  }, [identifier])

  const verify = async (e:any)=>{
    e.preventDefault()
    try{
      const rawId = (identifier || '').trim()
      const id = rawId.includes('@') ? rawId.toLowerCase() : rawId
      const rawCode = (code || '').trim()
      if(!id) return alert('Vui lòng nhập email hoặc số điện thoại')
      if(!rawCode) return alert('Vui lòng nhập mã OTP')
      await api.post('/accounts/verify_otp/', { identifier: id, code: rawCode })
      if(newPassword) {
        // use the same normalized identifier + code for password reset
        await api.post('/accounts/password_reset/', { identifier: id, code: rawCode, new_password: newPassword })
      }
      alert('Xác minh thành công')
      nav('/login')
    }catch(e){
      // prefer server-provided message when available
      const err: any = e
      const msg = err?.response?.data?.detail || err?.response?.data?.non_field_errors?.[0] || err?.message || 'Invalid or expired'
      alert(msg)
    }
  }

  const fetchLatest = async ()=>{
    if(!identifier) return alert('Enter identifier first')
    try{
      const res = await api.get(`/accounts/dev_latest_otp/?identifier=${encodeURIComponent(identifier)}`)
      setCode(res.data.code)
      alert('Fetched latest OTP (dev)')
    }catch(err){
      alert('Could not fetch latest OTP (dev only)')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Xác minh OTP</h2>
      <form onSubmit={verify} className="bg-white p-6 rounded border">
        <label className="block mb-2">Email hoặc số điện thoại</label>
        <input value={identifier} onChange={e=>setIdentifier(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <label className="block mb-2">Mã OTP</label>
        <input value={code} onChange={e=>setCode(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <label className="block mb-2">Mật khẩu mới (nếu đổi mật khẩu)</label>
        <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded">Xác minh</button>
          <button type="button" onClick={fetchLatest} className="bg-slate-400 text-white px-4 py-2 rounded">Fetch latest (dev)</button>
        </div>
      </form>
    </div>
  )
}
