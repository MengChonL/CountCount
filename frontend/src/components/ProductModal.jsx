const ProductModal = ({ isOpen, editingId, formData, onChange, onSubmit, onClose, styles }) => {
    if (!isOpen) return null;
  
    // 🌟 優化：將欄位名稱與顯示的中文標籤對應起來，代碼更乾淨
    const fieldLabels = {
      name: '商品名稱',
      category: '分類',
      cost_price: '原本成本', // 新增的成本價欄位
      price: '價格 (售價)',
      stock: '庫存'
    };
  
    // 定義哪些欄位需要數字鍵盤，哪些欄位是必填
    const numberFields = ['price', 'stock', 'cost_price'];
    const requiredFields = ['name', 'price', 'cost_price'];
  
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h3 style={styles.modalTitle}>{editingId ? '編輯商品' : '新增商品'}</h3>
          
          <form onSubmit={onSubmit}>
            {/* 🌟 透過 Object.keys 自動把上面定義的 5 個欄位渲染出來 */}
            {Object.keys(fieldLabels).map((field) => (
              <div key={field} style={styles.formGroup}>
                <label style={styles.label}>
                  {fieldLabels[field]}
                </label>
                <input
                  style={styles.input}
                  type={numberFields.includes(field) ? 'number' : 'text'}
                  name={field}
                  value={formData[field]}
                  onChange={onChange}
                  required={requiredFields.includes(field)}
                  // 給原本成本一個提示，防呆
                  placeholder={field === 'cost_price' ? '您的採購成本 (例: 1500)' : ''} 
                />
              </div>
            ))}
            
            <div style={styles.modalActions}>
              <button type="button" style={styles.btnCancel} onClick={onClose}>取消</button>
              <button type="submit" style={styles.btnSubmit}>{editingId ? '儲存修改' : '確認新增'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  export default ProductModal;