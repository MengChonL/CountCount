import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import ProductsAdmin from './pages/Products';
import OrdersAdmin from './pages/Orders';
import ExpensesAdmin from './pages/Expenses'; 
// 🌟 1. 引入剛剛寫好的報表頁面 (檔名根據你實際建立的名稱為準)
import ReportsAdmin from './pages/Reports'; 
import Login from './pages/Login';
import './App.css';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- 現代化導覽列樣式 ---
  const styles = {
    nav: {
      backgroundColor: '#1a1a1a', 
      padding: '16px 30px',
      display: 'flex',
      gap: '30px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    },
    link: {
      color: '#f8f9fa',
      textDecoration: 'none',
      fontSize: '16px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'opacity 0.2s'
    },
    logoutBtn: { 
      marginLeft: 'auto', 
      padding: '8px 16px', 
      backgroundColor: '#ff4d4f', 
      color: 'white', 
      border: 'none', 
      borderRadius: '6px', 
      cursor: 'pointer',
      fontWeight: 'bold'
    },
    mainContent: {
      padding: '20px',
      backgroundColor: '#f5f7fa', 
      minHeight: '100vh'
    }
  };

  return (
    <BrowserRouter>
      {/* 只有登入時才顯示導覽列 */}
      {session && (
        <nav style={styles.nav}>
          <Link to="/products" style={styles.link} onMouseOver={(e) => e.target.style.opacity = 0.8} onMouseOut={(e) => e.target.style.opacity = 1}>
            📦 商品管理
          </Link>
          <Link to="/orders" style={styles.link} onMouseOver={(e) => e.target.style.opacity = 0.8} onMouseOut={(e) => e.target.style.opacity = 1}>
            📋 訂單管理
          </Link>
          <Link to="/expenses" style={styles.link} onMouseOver={(e) => e.target.style.opacity = 0.8} onMouseOut={(e) => e.target.style.opacity = 1}>
            💸 營運開支
          </Link>
          {/* 🌟 2. 在導覽列加上報表頁面的連結 */}
          <Link to="/reports" style={styles.link} onMouseOver={(e) => e.target.style.opacity = 0.8} onMouseOut={(e) => e.target.style.opacity = 1}>
            📊 財務報表
          </Link>
          
          <button style={styles.logoutBtn} onClick={handleLogout}>登出</button>
        </nav>
      )}

      <div style={styles.mainContent}>
        <Routes>
          <Route path="/login" element={session ? <Navigate to="/products" replace /> : <Login />} />
          <Route path="/products" element={session ? <ProductsAdmin /> : <Navigate to="/login" replace />} />
          <Route path="/orders" element={session ? <OrdersAdmin /> : <Navigate to="/login" replace />} />
          <Route path="/expenses" element={session ? <ExpensesAdmin /> : <Navigate to="/login" replace />} />
          
          {/* 🌟 3. 設定報表頁面的專屬網址，並加上身分驗證保護 */}
          <Route path="/reports" element={session ? <ReportsAdmin /> : <Navigate to="/login" replace />} />
          
          <Route path="/" element={<Navigate to={session ? "/products" : "/login"} replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;