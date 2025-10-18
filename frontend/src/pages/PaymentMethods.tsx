import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PaymentMethods(){
  const [method, setMethod] = useState('card')
  const nav = useNavigate()
  const submit = (e:any)=>{ e.preventDefault(); nav('/payment/card') }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Thanh toán</h2>
      <form onSubmit={submit} className="bg-white p-6 rounded border">
        <div className="mb-4">
          <label className="block mb-2">Chọn phương thức</label>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded">
              <input type="radio" checked={method==='card'} onChange={()=>setMethod('card')} className="mr-3" /> Thanh toán bằng thẻ (Credit/Debit)
            </label>
            <label className="flex items-center p-3 border rounded">
              <input type="radio" checked={method==='cash'} onChange={()=>setMethod('cash')} className="mr-3" /> Thanh toán tiền mặt khi nhận hàng
            </label>
          </div>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded">Tiếp tục</button>
      </form>
    </div>
  )
}
