import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import Card from '../components/Card'; 

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 表單狀態：只需要金額和描述
  const [formData, setFormData] = useState({ 
    amount: '', 
    description: '' 
  });

  // 🌟 注意這裡的 API 網址，對應我們剛剛寫的後端路由
  const API_BASE_URL = 'http://8.138.242.143/api/expenses';

  useEffect(() => {
    fetchExpenses();
  }, []);

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("請先登入！");
    return session.access_token;
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken(); 
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '獲取開支失敗');
      
      setExpenses(data); 
    } catch (error) {
      console.error("錯誤:", error.message);
    } finally {
      setLoading(false); 
    }
  };

  const openAddModal = () => {
    setFormData({ amount: '', description: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ amount: '', description: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAuthToken(); 
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          amount: Number(formData.amount), // 確保傳遞給後端的是數字
          description: formData.description
        })
      });

      if (!response.ok) throw new Error('新增開支失敗');
      
      closeModal();
      fetchExpenses(); // 重新整理列表
    } catch (error) {
      console.error('操作失敗:', error);
      alert('操作失敗，請重試');
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('確定要刪除這筆開支紀錄嗎？這可能會影響您的利潤計算。')) return;
    
    try {
      const token = await getAuthToken(); 
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('刪除失敗');
      
      fetchExpenses(); 
    } catch (error) {
      console.error('刪除失敗:', error);
      alert('刪除失敗，請重試');
    }
  };

  // 計算總開支金額
  const totalExpensesAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  // --- 統一的樣式設計 ---
  const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: '"Segoe UI", sans-serif', color: '#333', backgroundColor: '#f4f7f6', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1a1a1a' },
    btnPrimary: { backgroundColor: '#d9534f', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: '0.2s', fontSize: '15px' },
    statusText: { padding: '40px', textAlign: 'center', color: '#666' },
    
    // 表格專屬樣式
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#fff' },
    th: { padding: '16px', backgroundColor: '#f8f9fa', color: '#666', fontWeight: '600', borderBottom: '2px solid #eaeaea', fontSize: '15px' },
    td: { padding: '16px', borderBottom: '1px solid #eaeaea', verticalAlign: 'middle', fontSize: '15px' },
    btnDanger: { backgroundColor: 'transparent', border: 'none', color: '#d9534f', cursor: 'pointer', padding: '6px 12px', fontSize: '14px', borderRadius: '4px', fontWeight: '500' },
    
    // 彈出視窗樣式
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
    modalTitle: { marginTop: 0, marginBottom: '20px', fontSize: '22px', textAlign: 'center' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' },
    input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' },
    btnCancel: { padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer' },
    btnSubmit: { padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#d9534f', color: '#fff', cursor: 'pointer' } // 按鈕改用紅色系代表支出
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>營運開支管理</h1>
        {/* 開支的按鈕我特別用了紅色系 (d9534f)，與商品新增區隔開來 */}
        <button style={styles.btnPrimary} onClick={openAddModal}>+ 紀錄新開支</button>
      </div>

      <Card 
        title="開支紀錄明細" 
        extra={<span style={{ fontWeight: 'bold', color: '#d9534f' }}>總支出: $ {totalExpensesAmount}</span>}
      >
        {loading ? (
          <div style={styles.statusText}>載入中...</div>
        ) : expenses.length === 0 ? (
          <div style={styles.statusText}>目前沒有任何開支紀錄。</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>開支 ID</th>
                <th style={styles.th}>紀錄時間</th>
                <th style={styles.th}>描述項目</th>
                <th style={styles.th}>支出金額</th>
                <th style={styles.th}>操作</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense.id}>
                  <td style={{...styles.td, color: '#999'}}>#{expense.id}</td>
                  <td style={{...styles.td, color: '#666'}}>
                    {new Date(expense.created_at).toLocaleString()}
                  </td>
                  <td style={{...styles.td, fontWeight: '500', color: '#1a1a1a'}}>
                    {expense.description || '無描述'}
                  </td>
                  <td style={{...styles.td, fontWeight: 'bold', color: '#d9534f'}}>
                    - $ {expense.amount}
                  </td>
                  <td style={styles.td}>
                    <button 
                      style={styles.btnDanger} 
                      onClick={() => handleDeleteClick(expense.id)}
                    >
                      刪除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* 新增開支的彈出視窗 */}
      {isModalOpen && (
        <div style={styles.overlay} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>紀錄營運開支</h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>開支金額 ($)</label>
                <input
                  style={styles.input}
                  type="number"
                  name="amount"
                  min="1"
                  placeholder="例如: 1500"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>項目描述</label>
                <input
                  style={styles.input}
                  type="text"
                  name="description"
                  placeholder="例如: 伺服器租賃費用、購買滑鼠..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.btnCancel} onClick={closeModal}>取消</button>
                <button type="submit" style={styles.btnSubmit}>確認儲存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Expenses;
