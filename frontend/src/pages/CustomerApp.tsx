import React, { useEffect, useState } from 'react'
import api from '../services/http'
import MenuCard from '../components/MenuCard'

const CATS = ['Tất cả', 'Đồ uống', 'Món ăn', 'Combo']

export default function CustomerApp(){
  const [menus, setMenus] = useState<any[]>([])
  const [cat, setCat] = useState<string>('Tất cả')

  useEffect(()=>{
    api.get('/merchant/').then(r=>setMenus(r.data)).catch(()=>{
      // fallback mock
      setMenus(Array.from({length:8}).map((_,i)=>({id:i+1, name:`Món ${i+1}`, discount:15})))
    })
  },[])

  return (
    <section>
      <h2 className="text-xl font-bold mb-3">Menu</h2>
      <div className="mb-4 flex items-center gap-3">
        {CATS.map(c => (
          <button key={c} onClick={()=>setCat(c)} className={`px-3 py-1 rounded-full ${cat===c? 'bg-green-500 text-white':'bg-white border'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {menus.map(m => (
          <MenuCard key={m.id} id={m.id} name={m.name} discount={m.discount} />
        ))}
      </div>
    </section>
  )
}
