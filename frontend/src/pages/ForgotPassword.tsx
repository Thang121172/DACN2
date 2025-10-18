import React, { useState } from 'react'
import api from '../services/http'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword(){
  const [identifier, setIdentifier] = useState('')
  const nav = useNavigate()

  const submit = async (e:any)=>{
    e.preventDefault()
    try{
      const raw = (identifier || '').trim()
      const id = raw.includes('@') ? raw.toLowerCase() : raw
      await api.post('/accounts/send_otp/', { identifier: id })
      nav(`/verify-otp?identifier=${encodeURIComponent(id)}`)
    }catch(e){
      alert('Failed')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Quên mật khẩu</h2>
      <form onSubmit={submit} className="bg-white p-6 rounded border">
        <label className="block mb-2">Email hoặc số điện thoại</label>
        <input value={identifier} onChange={e=>setIdentifier(e.target.value)} className="w-full p-2 border rounded mb-3" />
        <button className="bg-green-600 text-white px-4 py-2 rounded">Gửi mã OTP</button>
      </form>
    </div>
  )
}
