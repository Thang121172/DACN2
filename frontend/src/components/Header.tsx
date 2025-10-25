import React from "react";
import { Link } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

export default function Header(){
  const { user, logout, isAuthenticated } = useAuthContext();

  return (
    <header className="bg-white shadow-sm">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500" />
            <div className="text-lg font-semibold">Fast Food</div>
          </Link>
        </div>

        <nav className="space-x-4 text-sm text-gray-700">
          <Link to="/" className="hover:underline">Trang chủ</Link>

          {user?.role === "merchant" && (
            <Link to="/merchant/dashboard" className="hover:underline">Merchant Dashboard</Link>
          )}
          {user?.role === "shipper" && (
            <Link to="/shipper" className="hover:underline">Shipper Dashboard</Link>
          )}
          {(!user || user.role === "customer") && (
            <>
              <Link to="/customer" className="hover:underline">Menu</Link>
              <Link to="/merchant/register" className="hover:underline">Đăng ký cửa hàng</Link>
            </>
          )}
          <Link to="/cart" className="hover:underline">Giỏ hàng</Link>
        </nav>

        <div>
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700">{user.username}</div>
              <button onClick={logout} className="px-3 py-1 border rounded">Đăng xuất</button>
            </div>
          ) : (
            <div>
              <Link to="/login" className="px-3 py-1 border rounded mr-2">Đăng nhập</Link>
              <Link to="/register" className="px-3 py-1 bg-green-500 text-white rounded">Đăng ký</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
