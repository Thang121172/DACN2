import React from 'react'

type Props = {
  id: number
  name: string
  price?: number
  stock?: number
  discount?: number
}

export default function MenuCard({ id, name, price, stock, discount }: Props){
  return (
    <article className="card relative overflow-hidden">
      {/* image placeholder */}
      <div className="w-full h-36 bg-green-50 rounded-md mb-3" />

      {/* discount badge */}
      {discount ? (
        <div className="absolute left-3 top-3 bg-yellow-300 text-xs font-semibold px-3 py-1 rounded">-{discount}%</div>
      ) : null}

      <div className="px-1 pb-2">
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm text-gray-500">Địa chỉ • 2.1 km</p>

        <div className="mt-3 flex items-center gap-2">
          <button className="text-xs px-2 py-1 border rounded-full bg-yellow-50">Yêu thích</button>
          <button className="text-xs px-2 py-1 border rounded-full text-green-700">Mở cửa</button>
        </div>
      </div>
    </article>
  )
}
