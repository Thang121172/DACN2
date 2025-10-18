import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import './index.css'
import Home from './pages/Home'
import CustomerApp from './pages/CustomerApp'
import MerchantApp from './pages/MerchantApp'
import Merchant from './pages/Merchant'
import ShipperApp from './pages/ShipperApp'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP'
import PaymentMethods from './pages/PaymentMethods'
import PaymentCard from './pages/PaymentCard'

export default function App(){
	return (
		<BrowserRouter>
			<div className="app-shell">
				<Header />
				<main className="container py-6">
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/customer" element={<CustomerApp />} />
						<Route path="/merchant" element={<Merchant />} />
						<Route path="/shipper" element={<ShipperApp />} />
						<Route path="/cart" element={<Cart />} />
						<Route path="/login" element={<Login />} />
						<Route path="/register" element={<Register />} />
						<Route path="/forgot" element={<ForgotPassword />} />
						<Route path="/verify-otp" element={<VerifyOTP />} />
						<Route path="/payment" element={<PaymentMethods />} />
						<Route path="/payment/card" element={<PaymentCard />} />
					</Routes>
				</main>
			</div>
		</BrowserRouter>
	)
}
