import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // 🌟 補上 Supabase 引入
import Card from '../components/Card'; 

function Orders() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  // cartItems: [{ product_id: string|number, quantity: number }]
  const [cartItems, setCartItems] = useState([{ product_id: '', quantity: 1 }]);

  // 後端 server 目前啟在 5001（見 backend/src/server.js）
  const API_BASE_URL = 'http://localhost:5001/api';

  useEffect(() => {
    fetchData();
  }, []);

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("請先登入！");
    return session.access_token;
  };

  const fetchData = async () => {
    try {
      const token = await getAuthToken(); 
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      };

      const [productsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/products`, { headers }), 
        fetch(`${API_BASE_URL}/orders`, { headers })    
      ]);
      
      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();

      if (!productsRes.ok) throw new Error(productsData.error || '獲取商品失敗');
      if (!ordersRes.ok) throw new Error(ordersData.error || '獲取訂單失敗');
      
      const validProducts = Array.isArray(productsData) ? productsData : [];
      const validOrders = Array.isArray(ordersData) ? ordersData : [];

      setProducts(validProducts);
      setOrders(validOrders);
      
      // 如果購物車尚未選商品，預設帶第一個商品
      if (validProducts.length > 0) {
        setCartItems((prev) => {
          const hasSelected = prev.some((x) => String(x.product_id || '') !== '');
          if (hasSelected) return prev;
          return [{ product_id: String(validProducts[0].id), quantity: 1 }];
        });
      }
    } catch (error) {
      console.error('獲取資料失敗:', error.message);
    } finally {
      setLoading(false); 
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      alert('請填寫電話！');
      return;
    }

    const cleanedItems = cartItems
      .map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      }))
      .filter((item) => Number.isFinite(item.product_id) && item.product_id > 0 && Number.isFinite(item.quantity) && item.quantity > 0);

    if (cleanedItems.length === 0) {
      alert('請至少選擇 1 個商品並填寫數量！');
      return;
    }

    const payload = { phone_number: phoneNumber.trim(), cartItems: cleanedItems };

    try {
      const token = await getAuthToken(); 

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '結帳失敗');
      
      alert('🎉 結帳成功！庫存已自動扣除。');
      setPhoneNumber('');
      // 重置購物車（保留預設第一個商品，如果目前 products 已載入）
      setCartItems((prev) => {
        const first = products?.[0]?.id;
        if (first) return [{ product_id: String(first), quantity: 1 }];
        return [{ product_id: '', quantity: 1 }];
      });
      setIsCheckoutOpen(false);
      fetchData(); 

    } catch (error) {
      console.error('送出訂單失敗:', error.message);
      alert(error.message); 
    }
  };

  // 計算單筆訂單總利潤的函式
  const calculateOrderProfit = (orderItems) => {
    return orderItems.reduce((totalProfit, item) => {
      // 這裡做了一個防呆：直接使用商品表目前的成本價，如果沒有就算 0
      const itemCost = item.products?.cost_price || 0;
      const profitPerItem = item.price_at_purchase - itemCost;
      return totalProfit + (profitPerItem * item.quantity);
    }, 0);
  };

  const styles = {
    container: { maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: '"Segoe UI", sans-serif', color: '#333' },
    header: { marginBottom: '20px' },
    title: { fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1a1a1a' },
    formGroup: { display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', padding: '20px' },
    input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', outline: 'none', flex: 1, minWidth: '200px' },
    select: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', outline: 'none', flex: 2, minWidth: '250px' },
    numberInput: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', outline: 'none', width: '80px' },
    btnSubmit: { backgroundColor: '#000', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: '0.2s' },
    btnToggle: { backgroundColor: '#000', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    btnGhost: { backgroundColor: '#fff', color: '#111', border: '1px solid #ddd', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    btnDanger: { backgroundColor: '#fff', color: '#d9534f', border: '1px solid #f1c3c3', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
    itemRow: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', width: '100%' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '16px', backgroundColor: '#f8f9fa', color: '#666', fontWeight: '600', borderBottom: '2px solid #eaeaea' },
    td: { padding: '16px', borderBottom: '1px solid #eaeaea', verticalAlign: 'middle' },
    badge: { backgroundColor: '#e6f2ff', color: '#0066cc', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }
  };
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>資料載入中...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>訂單管理系統</h1>
      </div>

      <Card
        title="結帳"
        extra={
          <button
            type="button"
            style={styles.btnToggle}
            onClick={() => setIsCheckoutOpen((v) => !v)}
          >
            {isCheckoutOpen ? '關閉' : '開啟結帳'}
          </button>
        }
      >
        {isCheckoutOpen && (
          <form onSubmit={handleCheckout} style={styles.formGroup}>
            <input
              style={styles.input}
              type="text"
              placeholder="買家電話 (例: 0912345678)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />

            <div style={{ width: '100%' }}>
              {cartItems.map((item, idx) => (
                <div key={idx} style={{ ...styles.itemRow, marginBottom: '10px' }}>
                  <select
                    style={styles.select}
                    value={item.product_id}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCartItems((prev) => prev.map((x, i) => (i === idx ? { ...x, product_id: v } : x)));
                    }}
                  >
                    <option value="" disabled>選擇商品</option>
                    {products.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.name} (NT$ {p.price})
                      </option>
                    ))}
                  </select>

                  <input
                    style={styles.numberInput}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCartItems((prev) => prev.map((x, i) => (i === idx ? { ...x, quantity: v } : x)));
                    }}
                  />

                  <button
                    type="button"
                    style={styles.btnDanger}
                    onClick={() => setCartItems((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)))}
                    disabled={cartItems.length <= 1}
                    title={cartItems.length <= 1 ? '至少保留 1 個品項' : '刪除品項'}
                  >
                    刪除
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'flex-end' }}>
              <button
                type="button"
                style={styles.btnGhost}
                onClick={() => setCartItems((prev) => [...prev, { product_id: String(products?.[0]?.id || ''), quantity: 1 }])}
              >
                + 新增品項
              </button>
              <button type="submit" style={styles.btnSubmit}>確認結帳</button>
            </div>
          </form>
        )}
      </Card>

      <Card title="🧾 歷史訂單紀錄">
        {orders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>目前沒有任何訂單。</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>訂單編號</th>
                <th style={styles.th}>下單時間</th>
                <th style={styles.th}>買家電話</th>
                <th style={styles.th}>購買明細</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>總金額</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>純利潤</th> {/* 🌟 新增表頭 */}
                </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                // 🌟 在這裡呼叫函式計算這筆訂單的利潤
                const profit = calculateOrderProfit(order.order_items);
                
                return (
                  <tr key={order.id}>
                    <td style={styles.td}>
                      <span style={styles.badge}>#{order.id}</span>
                    </td>
                    <td style={{ ...styles.td, color: '#666', fontSize: '14px' }}>
                      {new Date(order.created_at).toLocaleString()}
                    </td>
                    <td style={{ ...styles.td, fontWeight: '500' }}>{order.phone_number}</td>
                    <td style={styles.td}>
                      <ul style={{ margin: 0, paddingLeft: '20px', color: '#555', fontSize: '14px' }}>
                        {order.order_items.map((item, index) => (
                          <li key={index} style={{ marginBottom: '4px' }}>
                            <strong>{item.products?.name}</strong> x {item.quantity} 
                            <span style={{ color: '#999' }}> (@${item.price_at_purchase})</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#1a1a1a' }}>
                      $ {order.total_amount}
                    </td>
                    {/* 顯示算出來的純利潤*/}
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 'bold', fontSize: '16px', color: '#28a745' }}>
                      $ {profit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

export default Orders;