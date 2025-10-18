import React from 'react'
import { useCart } from '../store/cart'

function Row({item}:{item:any}){
  const updateQty = useCart(s=>s.updateQty)
  return (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="w-2/3">
        <div className="font-medium">{item.name}</div>
      </div>
      <div className="w-1/6 text-center">
        <input type="number" min={1} value={item.qty} onChange={(e)=>updateQty(item.id, Number(e.target.value)||1)} className="w-16 p-1 border rounded" />
      </div>
      <div className="w-1/6 text-right">{item.price.toLocaleString()} đ</div>
    </div>
  )
}

export default function Cart(){
  const items = useCart(s=>s.items)
  const subtotal = useCart(s=>s.subtotal)()
  const delivery = 15000
  const total = subtotal + (items.length? delivery:0)

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8">
        <h2 className="text-xl font-semibold mb-4">Giỏ hàng</h2>
        <div className="bg-white rounded p-2 border">
          <div className="grid grid-cols-12 font-semibold text-sm p-3 border-b text-gray-600">
            <div className="col-span-8">Món</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-right">Giá</div>
          </div>
          {items.length===0 ? <div className="p-6 text-center text-gray-500">Giỏ hàng trống</div> : items.map(it=> <Row key={it.id} item={it} />)}
        </div>
      </div>

      <aside className="col-span-4">
        <div className="bg-white p-4 rounded border">
          <h3 className="font-semibold">Tóm tắt đơn</h3>
          <div className="mt-3 text-sm text-gray-600">
            <div className="flex justify-between"><span>Tạm tính</span><span>{subtotal.toLocaleString()} đ</span></div>
            <div className="flex justify-between"><span>Phí giao</span><span>{items.length? delivery.toLocaleString()+' đ' : '0 đ'}</span></div>
            <div className="flex justify-between font-bold text-lg mt-3"><span>Tổng</span><span className="text-green-600">{total.toLocaleString()} đ</span></div>
          </div>
          <button className="mt-4 w-full bg-green-600 text-white py-2 rounded">Thanh toán</button>
          <div className="mt-4 text-sm text-gray-500">
            <label>Địa chỉ giao</label>
            <input className="w-full p-2 border rounded mt-1" placeholder="Số nhà, đường, quận..." />
          </div>
        </div>
      </aside>
    </div>
  )
}
