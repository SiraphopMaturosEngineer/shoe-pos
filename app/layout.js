import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'ระบบจัดการร้านรองเท้า Shoe POS',
  description: 'ระบบ Mini POS สำหรับจัดการคลังและขายรองเท้าหน้าร้าน',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        <header className="navbar">
          <div className="container nav-container">
            <h1 className="logo">👟 ระบบจัดการร้านรองเท้า Shoe POS</h1>
            <nav>
              <ul className="nav-links">
                <li>
                  <Link href="/">คลังรองเท้า</Link>
                </li>
                <li>
                  <Link href="/sell">ขายรองเท้า</Link>
                </li>
                <li>
                  <Link href="/history">ประวัติการขาย</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="container main-content">
          {children}
        </main>
      </body>
    </html>
  )
}
