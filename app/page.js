"use client"

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // ฟอร์มสำหรับเพิ่มรองเท้าใหม่
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    price: '',
    stock: '',
    unit: 'คู่'
  })

  // สถานะการแก้ไข (Inline Edit)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({ price: '', stock: '' })

  // ดึงข้อมูลรองเท้าจาก Supabase
  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      alert('เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า')
    } else {
      setProducts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // เพิ่มรองเท้าใหม่เข้าสต๊อก
  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!newProduct.sku || !newProduct.name || !newProduct.price || !newProduct.stock) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return
    }

    const { error } = await supabase.from('products').insert([
      {
        sku: newProduct.sku,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        unit: newProduct.unit || 'คู่'
      }
    ])

    if (error) {
      console.error('Error adding product:', error)
      alert('ไม่สามารถเพิ่มสินค้าได้ (รหัส SKU อาจซ้ำกัน): ' + error.message)
    } else {
      alert('เพิ่มรายการรองเท้าสำเร็จ!')
      setNewProduct({ sku: '', name: '', price: '', stock: '', unit: 'คู่' })
      fetchProducts()
    }
  }

  // เริ่มแก้ไขสินค้า
  const handleEditClick = (product) => {
    setEditingId(product.id)
    setEditData({ price: product.price, stock: product.stock })
  }

  // บันทึกการแก้ไขราคา/สต๊อก
  const handleSaveEdit = async (id) => {
    const { error } = await supabase
      .from('products')
      .update({
        price: parseFloat(editData.price),
        stock: parseInt(editData.stock)
      })
      .eq('id', id)

    if (error) {
      alert('ไม่สามารถแก้ไขข้อมูลได้: ' + error.message)
    } else {
      setEditingId(null)
      fetchProducts()
    }
  }

  // ลบรองเท้าออกจากระบบ
  const handleDelete = async (id, name) => {
    if (confirm(`คุณต้องการลบรายการ "${name}" ใช่หรือไม่?`)) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) {
        alert('ไม่สามารถลบได้ (อาจมีประวัติการขายผูกอยู่): ' + error.message)
      } else {
        fetchProducts()
      }
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '0.25rem' }}>👟 คลังรองเท้า & จัดการสต๊อก</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        จัดการรายการสินค้า เพิ่ม ลบ แก้ไขราคา และจำนวนสต๊อกรองเท้าหน้าร้าน
      </p>

      {/* ฟอร์มเพิ่มสินค้าใหม่ */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>➕ เพิ่มรองเท้าใหม่เข้าสต๊อก</h3>
        <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>รหัส SKU</label>
            <input
              type="text"
              placeholder="เช่น SHOE-SNK-40"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>ชื่อรองเท้า / สี / ไซส์</label>
            <input
              type="text"
              placeholder="เช่น Classic Sneaker - ขาว (40)"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>ราคา (บาท)</label>
            <input
              type="number"
              placeholder="เช่น 1290"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>จำนวนสต๊อก</label>
            <input
              type="number"
              placeholder="เช่น 10"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>หน่วยนับ</label>
            <input
              type="text"
              value={newProduct.unit}
              onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
              required
            />
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
            <button type="submit" className="btn">
              + เพิ่มรองเท้าเข้าคลัง
            </button>
          </div>
        </form>
      </div>

      {/* ตารางแสดงรายการสินค้า */}
      <div className="card">
        <h3 style={{ marginBottom: '0.5rem' }}>📦 รายการรองเท้าในคลัง</h3>
        {loading ? (
          <p style={{ padding: '1rem 0' }}>กำลังโหลดข้อมูลสินค้า...</p>
        ) : products.length === 0 ? (
          <p style={{ padding: '1rem 0', color: 'var(--text-muted)' }}>ยังไม่มีรายการรองเท้าในคลัง</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>ชื่อรองเท้า / สี / ไซส์</th>
                  <th>ราคา (บาท)</th>
                  <th>คงเหลือ</th>
                  <th>หน่วย</th>
                  <th>การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => {
                  const isLowStock = item.stock < 5
                  const isEditing = editingId === item.id

                  return (
                    <tr key={item.id} style={{ backgroundColor: isLowStock ? '#fef2f2' : 'transparent' }}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{item.sku}</td>
                      <td>
                        {item.name}
                        {isLowStock && (
                          <span style={{
                            marginLeft: '0.5rem',
                            padding: '0.15rem 0.4rem',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}>
                            ⚠️ สต๊อกเหลือน้อย ({item.stock})
                          </span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editData.price}
                            onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                            style={{ width: '90px' }}
                          />
                        ) : (
                          item.price.toLocaleString()
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editData.stock}
                            onChange={(e) => setEditData({ ...editData, stock: e.target.value })}
                            style={{ width: '70px' }}
                          />
                        ) : (
                          <span style={{ color: isLowStock ? '#dc2626' : 'inherit', fontWeight: isLowStock ? 'bold' : 'normal' }}>
                            {item.stock}
                          </span>
                        )}
                      </td>
                      <td>{item.unit}</td>
                      <td>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button
                              className="btn"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: 'var(--success)' }}
                              onClick={() => handleSaveEdit(item.id)}
                            >
                              บันทึก
                            </button>
                            <button
                              className="btn"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: 'var(--text-muted)' }}
                              onClick={() => setEditingId(null)}
                            >
                              ยกเลิก
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.3rem' }}>
                            <button
                              className="btn"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#f59e0b' }}
                              onClick={() => handleEditClick(item)}
                            >
                              แก้ไข
                            </button>
                            <button
                              className="btn"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: 'var(--danger)' }}
                              onClick={() => handleDelete(item.id, item.name)}
                            >
                              ลบ
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
