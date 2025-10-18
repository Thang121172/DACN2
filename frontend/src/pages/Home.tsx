import React, { useState } from 'react'
import CustomerApp from './CustomerApp'
import { useAuth } from '../hooks/useAuth'

function MerchantApp(){
	return <div className="p-6 bg-white rounded border">Merchant dashboard placeholder</div>
}

function ShipperApp(){
	return <div className="p-6 bg-white rounded border">Shipper dashboard placeholder</div>
}

export default function Home(){
	const [q, setQ] = useState('')
	const CATS = ['Tất cả', 'Đồ uống', 'Món ăn', 'Combo', 'Cà phê']
	const [cat, setCat] = useState('Tất cả')
	const { user } = useAuth()

	const onSearch = (e:any)=>{
		e.preventDefault()
		console.log('search', q, cat)
	}

	const role = user?.role ?? 'customer'

	return (
		<div>
			<section className="bg-green-50 p-8 rounded mb-6">
				<div className="container">
					<h1 className="text-3xl font-extrabold mb-2">Đặt món dễ dàng — Giao nhanh trong 20 phút!</h1>
					<p className="text-gray-600 mb-4">Hơn 10.000 địa điểm ở Đà Nẵng phục vụ 24/7</p>

					<form onSubmit={onSearch} className="flex gap-3 items-center max-w-3xl">
						<input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm địa điểm, món ăn, quán nước..." className="flex-1 p-3 rounded border" />
						<button className="bg-green-600 text-white px-4 py-2 rounded">Tìm kiếm</button>
					</form>

					<div className="mt-4 flex gap-3">
						{CATS.map(c=> (
							<button key={c} onClick={()=>setCat(c)} className={`px-3 py-1 rounded-full ${cat===c? 'bg-green-600 text-white':'bg-white border'}`}>
								{c}
							</button>
						))}
					</div>
				</div>
			</section>

			<section className="container">
				{role === 'merchant' && <MerchantApp />}
				{role === 'shipper' && <ShipperApp />}
				{(role === 'customer' || !user) && <CustomerApp />}
			</section>
		</div>
	)
}
