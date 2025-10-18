import React, { useEffect, useState } from 'react'
import api from '../services/http'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const shipperIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25,41],
  iconAnchor: [12,41]
})

export default function ShipperApp(){
  const [orders, setOrders] = useState<any[]>([])
  const [shipperPos, setShipperPos] = useState<[number,number]>([16.0544, 108.2022])

  useEffect(()=>{
    api.get('/shipper/').then(r=>setOrders(r.data)).catch(()=>{
      // mock orders with lat/lng near Da Nang
      setOrders(Array.from({length:6}).map((_,i)=>({id:200+i, status:'waiting', eta:'15 phút', dist:'2.3 km', lat:16.0544 + (i+1)*0.002, lng:108.2022 + (i+1)*0.002})))
    })
  },[])

  const pickup = async (id:number)=>{
    try{
      await api.post(`/shipper/${id}/pickup/`)
      setOrders(o=>o.map(it=> it.id===id?{...it, status:'picked'}:it))
    }catch(e){
      console.error(e)
      setOrders(o=>o.map(it=> it.id===id?{...it, status:'picked'}:it))
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Shipper — Đơn cần giao</h2>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-9">
          <MapContainer center={shipperPos} zoom={13} style={{height: '420px', borderRadius:8}}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={shipperPos} icon={shipperIcon}>
              <Popup>Vị trí shipper</Popup>
            </Marker>
            {orders.map(o=> (
              <Marker key={o.id} position={[o.lat, o.lng]}>
                <Popup>#{o.id} • {o.eta}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
        <aside className="col-span-3">
          <div className="bg-white rounded p-3 border">
            <h3 className="font-medium mb-3">Danh sách đơn</h3>
            <ul className="space-y-2">
              {orders.map(o=> (
                <li key={o.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="text-sm">#{o.id} • {o.dist} • {o.eta}</div>
                  <div>
                    <button disabled={o.status==='picked'} onClick={()=>pickup(o.id)} className="px-4 py-2 bg-green-600 text-white rounded">{o.status==='picked' ? 'Đã nhận' : 'Nhận đơn'}</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
