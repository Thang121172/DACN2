import React, { useEffect, useState } from 'react'
import api from '../services/http'

export default function Merchant(){
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const load = async ()=>{
      try{
        const token = localStorage.getItem('token')
        const r = await api.get('/merchant/orders/', { headers: { Authorization: `Bearer ${token}` }})
        setOrders(r.data || [])
      }catch(e){
        console.error('failed to load merchant orders', e)
      }finally{ setLoading(false) }
    }
    load()
  }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Merchant Orders</h2>
      {loading && <div>Loading...</div>}
      {!loading && orders.length===0 && <div className="p-4 bg-white rounded border">No orders yet</div>}
      <div className="space-y-3 mt-4">
        {orders.map(o=> (
          <div key={o.id} className="p-4 bg-white rounded border">
            <div className="font-semibold">Order #{o.id} — {o.status}</div>
            <div>Customer: {o.customer_name ?? o.customer}</div>
            <div>Total: {o.total}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
