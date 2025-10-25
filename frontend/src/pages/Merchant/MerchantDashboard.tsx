import React, { useEffect, useState } from "react";

interface OrderSummary {
  code: string;
  customer: string;
  total: number;
  payment: string;
  status: string;
  time: string;
}

export default function MerchantDashboard() {
  const [stats, setStats] = useState({
    orders_today: 0,
    revenue_today: 0,
    sold_out: 0,
    recent_orders: [] as OrderSummary[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/merchant/dashboard/", {
          credentials: "include",
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error("Fetch dashboard failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-slate-600">
        Đang tải dữ liệu...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-lg font-semibold text-green-700">
              Fast Food Merchant
            </span>
          </div>
          <nav className="hidden gap-6 md:flex">
            <a className="text-sm hover:text-green-700" href="/">Trang chủ</a>
            <a className="text-sm hover:text-green-700" href="/menu">Menu</a>
            <a className="text-sm font-medium text-green-700" href="/merchant/dashboard">Merchant</a>
            <a className="text-sm hover:text-green-700" href="/shipper">Shipper</a>
            <a className="text-sm hover:text-green-700" href="/admin">Admin</a>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl p-4 md:p-6">
        <h1 className="mb-4 text-xl font-semibold">Merchant Dashboard</h1>

        {/* Statistic Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard title="Đơn hôm nay" value={stats.orders_today} color="text-green-600" />
          <StatCard title="Doanh thu (VND)" value={stats.revenue_today.toLocaleString()} color="text-green-600" />
          <StatCard title="Món hết hàng" value={stats.sold_out} color="text-orange-600" />
        </div>

        {/* Recent Orders Table */}
        <section className="mt-6 rounded-2xl border bg-white shadow-sm">
          <div className="border-b bg-green-50 px-4 py-3 text-sm font-medium text-green-900">
            Đơn hàng gần đây
          </div>
          {stats.recent_orders.length === 0 ? (
            <div className="p-4 text-sm text-slate-500">Chưa có đơn hàng hôm nay.</div>
          ) : (
            <table className="w-full text-sm text-slate-700">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="px-4 py-2">Mã đơn</th>
                  <th className="px-4 py-2">Khách hàng</th>
                  <th className="px-4 py-2">Tổng tiền</th>
                  <th className="px-4 py-2">Thanh toán</th>
                  <th className="px-4 py-2">Trạng thái</th>
                  <th className="px-4 py-2">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((order, i) => (
                  <tr key={i} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">#{order.code}</td>
                    <td className="px-4 py-2">{order.customer}</td>
                    <td className="px-4 py-2">{order.total.toLocaleString()} đ</td>
                    <td className="px-4 py-2">{order.payment}</td>
                    <td className="px-4 py-2">
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <footer className="mt-8 text-center text-xs text-slate-500">
          © 2025 FastFood · <a href="#">Liên hệ</a> · <a href="#">Chính sách</a>
        </footer>
      </main>
    </div>
  );
}

function StatCard({ title, value, color }: { title: string; value: any; color: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
