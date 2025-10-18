// useAuth placeholder

import { useState, useEffect } from 'react'
import api from '../services/http'

type User = {
  username: string
  role: string
}

export function useAuth(){
  const [user, setUser] = useState<User | null>(null)

  const fetchMe = async ()=>{
    const token = localStorage.getItem('token')
    if(!token){ setUser(null); return }
    try{
      const r = await api.get('/accounts/me/', { headers: { Authorization: `Bearer ${token}` }})
      setUser(r.data)
    }catch(e){
      console.error('fetchMe failed', e)
      setUser(null)
    }
  }

  useEffect(()=>{ fetchMe() }, [])

  const login = (token: string)=>{
    localStorage.setItem('token', token)
    fetchMe()
  }

  const logout = ()=>{
    localStorage.removeItem('token')
    setUser(null)
  }

  return { user, fetchMe, login, logout }
}
