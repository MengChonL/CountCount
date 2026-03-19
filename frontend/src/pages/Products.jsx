import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 
import Card from '../components/Card'; 
import ProductTable from '../components/ProductTable';
import ProductModal from '../components/ProductModal';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ 
    name: '', 
    category: '', 
    price: '', 
    stock: '', 
    cost_price: '' 
  });

  // 後端 server 目前啟在 5001（見 backend/src/server.js）
  const API_BASE_URL = 'http://localhost:5001/api/products';

  useEffect(() => {
    fetchProducts();
  }, []);

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("請先登入！");
    return session.access_token;
  };

  const fetchProducts = async () => {
    try {
      const token = await getAuthToken(); 
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '獲取商品失敗');
      setProducts(data); 
    } catch (error) {
      console.error("錯誤:", error.message);
    } finally {
      setLoading(false); 
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', category: '', price: '', stock: '', cost_price: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      category: product.category || '',
      price: product.price,
      stock: product.stock,
      cost_price: product.cost_price || ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', category: '', price: '', stock: '', cost_price: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAuthToken(); 
      const url = editingId ? `${API_BASE_URL}/${editingId}` : API_BASE_URL;
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          price: Number(formData.price),
          stock: Number(formData.stock),
          cost_price: Number(formData.cost_price)
        })
      });

      // 盡量把後端錯誤訊息帶出來，避免只看到「新增失敗」
      let errMsg = '';
      if (!response.ok) {
        try {
          const data = await response.json();
          errMsg = data?.error || '';
        } catch {
          // ignore
        }
        throw new Error(errMsg || (editingId ? '更新失敗' : '新增失敗'));
      }
      closeModal();
      fetchProducts(); 
    } catch (error) {
      console.error('操作失敗:', error);
      alert(error?.message || '操作失敗，請重試');
    }
  };

  const handleDeleteClick = async (id) => {
    if (!confirm('確定要刪除這個商品嗎？')) return;
    try {
      const token = await getAuthToken(); 
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('刪除失敗');
      fetchProducts(); 
    } catch (error) {
      console.error('刪除失敗:', error);
    }
  };

  const styles = {
    // 頁面主體
    container: { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: '"Segoe UI", sans-serif', color: '#333', backgroundColor: '#f4f7f6', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1a1a1a' },
    btnPrimary: { backgroundColor: '#000', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', transition: '0.2s', fontSize: '15px' },
    statusText: { padding: '40px', textAlign: 'center', color: '#666' },

    // 🌟 彈出視窗核心樣式 (確保卡片效果與懸浮感)
    overlay: { 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', // 半透明黑色背景
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      zIndex: 1000 
    },
    modalContent: { 
      backgroundColor: '#fff', padding: '30px', borderRadius: '12px', 
      width: '90%', maxWidth: '450px', 
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)' // 卡片陰影
    },
    modalTitle: { marginTop: 0, marginBottom: '20px', fontSize: '22px', textAlign: 'center' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' },
    input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' },
    btnCancel: { padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer' },
    btnSubmit: { padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#000', color: '#fff', cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>商品庫存管理</h1>
        <button style={styles.btnPrimary} onClick={openAddModal}>+ 新增商品</button>
      </div>

      <Card title="商品清單" extra={`總計: ${products.length} 件`}>
        {loading ? (
          <div style={styles.statusText}>載入中...</div>
        ) : (
          <ProductTable 
            products={products} 
            onEdit={openEditModal} 
            onDelete={handleDeleteClick} 
          />
        )}
      </Card>

      {/* 傳遞完整的 styles 給 Modal */}
      <ProductModal 
        isOpen={isModalOpen}
        editingId={editingId}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        onClose={closeModal}
        styles={styles}
      />
    </div>
  );
}

export default Products;