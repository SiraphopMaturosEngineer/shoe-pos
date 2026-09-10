"use client"

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function SellPage() {
  const [products, setProducts] = useState([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // ดึงรายการรองเท้าทั้งหมดจาก Supabase
  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
      alert('ไม่สามารถดึงข้อมูลรายการรองเท้าได้')
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // ค้นหารายการรองเท้าที่เลือกอยู่
  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const qtyNum = parseInt(quantity) || 0
  const totalPrice = selectedProduct ? selectedProduct.price * qtyNum : 0

  // บันทึกการขาย
  const handleSell = async (e) => {
    e.preventDefault()

    if (!selectedProduct) {
      alert('กรุณาเลือกรองเท้าที่ต้องการขาย')
      return
    }

    if (qtyNum <= 0) {
      alert('กรุณาระบุจำนวนที่ถูกต้อง (ต้องมากกว่า 0)')
      return
    }

    // ตรวจสอบจำนวนสต๊อกคงเหลือ
    if (qtyNum > selectedProduct.stock) {
      alert(`สต๊อกไม่พอ! ปัจจุบันมีคงเหลือเพียง ${selectedProduct.stock} ${selectedProduct.unit || 'คู่'}`)
      return
    }

    setSubmitting(true)

    try {
      // 1. บันทึกข้อมูลลงตาราง sales
      const { error: saleError } = await supabase.from('sales').insert([
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          quantity: qtyNum,
          total_price: totalPrice,
        },
      ])

      if (saleError) throw saleError

      // 2. หักลบสต๊อกรองเท้าในตาราง products อัตโนมัติ
      const newStock = selectedProduct.stock - qtyNum
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', selectedProduct.id)

      if (updateError) throw updateError

      alert(`ขายสำเร็จ!\n${selectedProduct.name}\nจำนวน: ${qtyNum} ${selectedProduct.unit || 'คู่'}\nยอดรวม: ${totalPrice.toLocaleString()} บาท`)

      // รีเซ็ตฟอร์มและโหลดข้อมูลใหม่
      setSelectedProductId('')
      setQuantity(1)
      await fetchProducts()
    } catch (error) {
      console.error('Error recording sale:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกการขาย: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '0.25rem' }}>🛍️ ขายรองเท้าหน้าร้าน (POS)</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        เลือกรายการรองเท้า ระบุจำนวนขาย และตัดสต๊อกอัตโนมัติ
      </p>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center', padding: '1rem' }}>กำลังโหลดรายการรองเท้า...</p>
        ) : (
          <form onSubmit={handleSell} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Dropdown เลือกรองเท้า */}
            <div>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>
                เลือกรองเท้าที่ต้องการขาย
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value)
                  setQuantity(1)
                }}
                required
              >
                <option value="">-- กรุณาเลือกรองเท้า --</option>
                {products.map((item) => (
                  <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                    [{item.sku}] {item.name} | {item.price.toLocaleString()} บาท (คงเหลือ: {item.stock} {item.unit})
                    {item.stock <= 0 ? ' [สินค้าหมด]' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* แสดงรายละเอียดสินค้าที่เลือก */}
            {selectedProduct && (
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '0.85rem 1rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                fontSize: '0.9rem',
                lineHeight: '1.6'
              }}>
                <p><strong>SKU:</strong> {selectedProduct.sku}</p>
                <p><strong>รายการ:</strong> {selectedProduct.name}</p>
                <p><strong>ราคาต่อหน่วย:</strong> {selectedProduct.price.toLocaleString()} บาท</p>
                <p>
                  <strong>สต๊อกคงเหลือ:</strong>{' '}
                  <span style={{ color: selectedProduct.stock < 5 ? '#dc2626' : 'inherit', fontWeight: 'bold' }}>
                    {selectedProduct.stock} {selectedProduct.unit}
                  </span>
                </p>
              </div>
            )}

            {/* ช่องระบุจำนวน */}
            <div>
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '0.3rem' }}>
                จำนวนที่จะขาย ({selectedProduct?.unit || 'คู่'})
              </label>
              <input
                type="number"
                min="1"
                max={selectedProduct ? selectedProduct.stock : 1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={!selectedProduct || selectedProduct.stock <= 0}
                required
              />
            </div>

            {/* สรุปราคารวมตัวใหญ่ */}
            <div style={{
              backgroundColor: '#eff6ff',
              border: '2px dashed var(--primary)',
              borderRadius: '8px',
              padding: '1.25rem',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                ยอดรวมทั้งสิ้น
              </span>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                {totalPrice.toLocaleString()} <span style={{ fontSize: '1.25rem' }}>บาท</span>
              </div>
            </div>

            {/* ปุ่มบันทึกการขาย */}
            <button
              type="submit"
              className="btn"
              disabled={!selectedProduct || selectedProduct.stock <= 0 || submitting}
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1.1rem',
                backgroundColor: !selectedProduct || selectedProduct.stock <= 0 ? '#94a3b8' : 'var(--success)',
                cursor: !selectedProduct || selectedProduct.stock <= 0 ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'กำลังบันทึกการขาย...' : '🛒 บันทึกการขาย'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
