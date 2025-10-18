import React from 'react'

export default function PaymentCard(){
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Thanh toán bằng thẻ</h2>
      <div className="bg-white p-6 rounded border">
        <div className="mb-3">
          <label className="block mb-1">Số thẻ</label>
          <input className="w-full p-2 border rounded" placeholder="1234 5678 9012 3456" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input className="p-2 border rounded" placeholder="MM/YY" />
          <input className="p-2 border rounded" placeholder="CVC" />
          <input className="p-2 border rounded" placeholder="Chủ thẻ" />
        </div>
        <div className="mt-4">
          <button className="bg-green-600 text-white px-4 py-2 rounded">Thanh toán</button>
        </div>
      </div>
    </div>
  )
}
