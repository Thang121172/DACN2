import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * Merchant – Xác nhận đơn
 * - Hiển thị mã đơn, khách, khoảng cách + tổng tiền
 * - Liệt kê món
 * - Chọn thời gian chuẩn bị (10–30 phút)
 * - Nút Xác nhận (POST /confirm/) & Từ chối (POST /reject/)
 * 
 * Đặt file tại: frontend/src/pages/Merchant/MerchantConfirmOrder.tsx
 * Yêu cầu route (App.tsx):
 *   <Route path="/merchant/orders/:orderId/confirm" element={<MerchantConfirmOrder />} />
 */

// ====== CONFIG – sửa lại nếu API base khác ======
const API_BASE = "/api";
const ENDPOINTS = {
  orderDetail: (id: string) => `${API_BASE}/orders/${id}/`,            // GET
  confirm:     (id: string) => `${API_BASE}/orders/${id}/confirm/`,     // POST { prep_time_minutes }
  reject:      (id: string) => `${API_BASE}/orders/${id}/reject/`,      // POST { reason? }
};

// ====== Types (điều chỉnh nếu schema backend khác) ======
interface OrderItem {
  id: number | string;
  name: string;
  price: number;      // đơn giá
  quantity: number;
}
interface OrderDetail {
  id: number | string;
  code: string;       // ví dụ: FF2025
  customer_name: string;
  distance_km?: number;
  items: OrderItem[];
}

function formatCurrency(v: number, suffix = "đ") {
  try { return new Intl.NumberFormat("vi-VN").format(v) + (suffix ? ` ${suffix}` : ""); }
  catch { return `${v.toLocaleString()} ${suffix}`; }
}

export default function MerchantConfirmOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [prepTime, setPrepTime] = useState<number | null>(15);

  // Tải chi tiết đơn
  useEffect(() => {
    if (!orderId) return;
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(ENDPOINTS.orderDetail(orderId), { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json();
        if (!ignore) setOrder(normalizeOrder(raw));
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Không tải được đơn hàng.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [orderId]);

  const total = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce((s, it) => s + it.price * it.quantity, 0);
  }, [order]);

  async function onConfirm() {
    if (!orderId || prepTime == null) return;
    try {
      setSubmitting(true);
      const res = await fetch(ENDPOINTS.confirm(orderId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prep_time_minutes: prepTime }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert("✅ Xác nhận đơn thành công!");
      navigate("/merchant/dashboard");
    } catch (e: any) {
      alert("❌ Xác nhận thất bại: " + (e?.message || "Lỗi không xác định"));
    } finally {
      setSubmitting(false);
    }
  }

  async function onReject() {
    if (!orderId) return;
    const reason = prompt("Lý do từ chối? (tuỳ chọn)") || undefined;
    try {
      setSubmitting(true);
      const res = await fetch(ENDPOINTS.reject(orderId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert("⛔️ Đã từ chối đơn.");
      navigate("/merchant/dashboard");
    } catch (e: any) {
      alert("❌ Từ chối thất bại: " + (e?.message || "Lỗi không xác định"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-800">
      <main className="mx-auto max-w-6xl p-4 md:p-6">
        <h1 className="mb-4 text-xl font-semibold">Merchant – Xác nhận đơn</h1>

        <section className="rounded-2xl border bg-white shadow-sm">
          {/* Header/summary */}
          <div className="rounded-t-2xl border-b bg-green-50 px-4 py-3 text-sm text-green-900">
            {loading ? (
              <span>Đang tải đơn...</span>
            ) : error ? (
              <span className="text-red-600">{error}</span>
            ) : order ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-medium">Mã đơn:</span>{" "}
                  <span className="font-semibold">#{order.code}</span>
                  <span className="mx-2">•</span>
                  <span className="font-medium">Khách:</span>{" "}
                  <span>{order.customer_name}</span>
                  {typeof order.distance_km === "number" && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{order.distance_km.toFixed(1)} km</span>
                    </>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm text-slate-500">Tổng:</div>
                  <div className="text-base font-semibold text-slate-800">
                    {formatCurrency(total)}
                  </div>
                </div>
              </div>
            ) : (
              <span>Không có dữ liệu đơn hàng.</span>
            )}
          </div>

          {/* Body */}
          <div className="p-4 md:p-6">
            {/* Items */}
            <div className="space-y-2">
              {order?.items?.length ? (
                order.items.map((it, idx) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 shadow-sm"
                  >
                    <div className="flex-1 truncate text-sm text-slate-700">
                      <span className="font-medium">Món {idx + 1}</span>{" "}
                      <span>× {it.quantity}</span>{" "}
                      <span className="text-slate-400">•</span>{" "}
                      <span>{formatCurrency(it.price)}</span>
                      <span className="text-slate-400"> — </span>
                      <span className="truncate">{it.name}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-500">
                  Chưa có món trong đơn.
                </div>
              )}
            </div>

            {/* Prep time */}
            <div className="mt-5">
              <div className="mb-2 text-sm font-medium text-slate-700">Thời gian chuẩn bị</div>
              <div className="flex flex-wrap gap-2">
                {[10, 15, 20, 25, 30].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPrepTime(m)}
                    className={[
                      "rounded-lg border px-3 py-1.5 text-sm transition",
                      prepTime === m
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-slate-300 bg-white hover:border-slate-400",
                    ].join(" ")}
                    disabled={submitting}
                    type="button"
                  >
                    {m} phút
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={onConfirm}
                disabled={submitting || loading || !order}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
              <button
                onClick={onReject}
                disabled={submitting || loading || !order}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Từ chối
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-8 text-center text-xs text-slate-500">
          © 2025 FastFood · <a className="hover:underline" href="#">Liên hệ</a> ·{" "}
          <a className="hover:underline" href="#">Chính sách</a>
        </footer>
      </main>
    </div>
  );
}

// -------- Helpers --------
function normalizeOrder(raw: any): OrderDetail {
  const id = raw?.id ?? raw?.order_id ?? "";
  const code = raw?.code || raw?.order_code || String(id) || "";
  const customer_name = raw?.customer_name || raw?.customer?.name || "Khách";
  const distance_km = (raw?.distance_km ?? raw?.distance) as number | undefined;
  const items: OrderItem[] = Array.isArray(raw?.items)
    ? raw.items.map((r: any, idx: number) => ({
        id: r?.id ?? idx,
        name: r?.name || r?.menu_name || r?.title || `Món ${idx + 1}`,
        price: Number(r?.price ?? r?.unit_price ?? 0),
        quantity: Number(r?.quantity ?? r?.qty ?? 1),
      }))
    : [];
  return { id, code, customer_name, distance_km, items };
}
