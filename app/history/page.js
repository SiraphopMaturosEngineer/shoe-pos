"use client"

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function HistoryPage() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  // ดึงข้อมูลประวัติการขายจาก Supabase (เรียงจากล่าสุดไปเก่าสุด)
  const fetchSales = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('sold_at', { ascending: false })

    if (error) {
      console.error('Error fetching sales history:', error)
      alert('ไม่สามารถดึงข้อมูลประวัติการขายได้')
    } else {
      setSales(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchSales()
  }, [])

  // คำนวณยอดขายรวมทั้งหมด
  const totalRevenue = sales.reduce((sum, item) => sum + (Number(item.total_price) || 0), 0)

  // ฟังก์ชันแปลงรูปแบบวันเวลาให้อ่านง่าย
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <h2 style={{ marginBottom: '0.25rem' }}>📊 ประวัติการขาย & สรุปยอด</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        ตรวจสอบรายการขายรองเท้าทั้งหมดและยอดขายรวมของร้าน
      </p>

      {/* สรุปยอดขายรวมทั้งหมด ตัวใหญ่ชัดเจน */}
      <div className="card" style={{
        backgroundColor: '#f0fdf4',
        border: '2px solid var(--success)',
        textAlign: 'center',
        padding: '1.5rem'
      }}>
        <span style={{ fontSize: '1rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
          ยอดขายรวมทั้งหมด
        </span>
        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success)' }}>
          {totalRevenue.toLocaleString()} <span style={{ fontSize: '1.25rem' }}>บาท</span>
        </div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
          จำนวนรายการขายทั้งหมด: {sales.length} รายการ
        </span>
      </div>

      {/* ตารางแสดงประวัติการขาย */}
      <div className="card">
        <h3 style={{ marginBottom: '0.5rem' }}>📜 รายการขายล่าสุด</h3>
        {loading ? (
          <p style={{ padding: '1rem 0', textAlign: 'center' }}>กำลังโหลดประวัติการขาย...</p>
        ) : sales.length === 0 ? (
          <p style={{ padding: '1rem 0', color: 'var(--text-muted)', textAlign: 'center' }}>
            ยังไม่มีประวัติการขายในระบบ
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>วันเวลาที่ขาย</th>
                  <th>ชื่อรองเท้า / สี / ไซส์</th>
                  <th style={{ textAlign: 'center' }}>จำนวน</th>
                  <th style={{ textAlign: 'right' }}>ราคารวม (บาท)</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {formatDate(item.sold_at)}
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {item.product_name}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.quantity} คู่
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--primary)' }}>
                      {Number(item.total_price).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
