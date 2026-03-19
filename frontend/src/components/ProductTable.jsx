const ProductTable = ({ products, onEdit, onDelete }) => {
    // 表格專屬樣式
    const tableStyles = {
      table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', backgroundColor: '#fff' },
      th: { padding: '16px', backgroundColor: '#f8f9fa', color: '#666', fontWeight: '600', borderBottom: '2px solid #eaeaea', fontSize: '15px' },
      td: { padding: '16px', borderBottom: '1px solid #eaeaea', verticalAlign: 'middle', fontSize: '15px' },
      btnText: { backgroundColor: 'transparent', border: 'none', color: '#0066cc', cursor: 'pointer', padding: '6px 12px', marginRight: '8px', fontSize: '14px', borderRadius: '4px', fontWeight: '500' },
      btnDanger: { backgroundColor: 'transparent', border: 'none', color: '#d9534f', cursor: 'pointer', padding: '6px 12px', fontSize: '14px', borderRadius: '4px', fontWeight: '500' },
      emptyState: { padding: '40px', textAlign: 'center', color: '#999' }
    };
  
    if (!products || products.length === 0) {
      return <div style={tableStyles.emptyState}>目前尚無商品，請點擊右上方按鈕新增。</div>;
    }
  
    return (
      <table style={tableStyles.table}>
      <thead>
        <tr>
            <th style={tableStyles.th}>商品名稱</th>
            <th style={tableStyles.th}>分類</th>
            <th style={tableStyles.th}>原本成本</th>
            <th style={tableStyles.th}>價格 (售價)</th>
            <th style={tableStyles.th}>庫存</th>
            <th style={tableStyles.th}>操作</th>
        </tr>
      </thead>
      <tbody>
          {products.map(product => (
          <tr key={product.id}>
              <td style={{...tableStyles.td, fontWeight: '500', color: '#1a1a1a'}}>{product.name}</td>
              <td style={{...tableStyles.td, color: '#666'}}>{product.category || '-'}</td>
              <td style={{...tableStyles.td, color: '#d9534f'}}>
                ${product.cost_price || 0}
              </td>
              
              <td style={{...tableStyles.td, fontWeight: 'bold', color: '#28a745'}}>
                ${product.price}
            </td>
              <td style={tableStyles.td}>{product.stock}</td>
              <td style={tableStyles.td}>
                <button 
                  style={tableStyles.btnText} 
                  onClick={() => onEdit(product)}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f0f7ff'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  編輯
                </button>
                <button 
                  style={tableStyles.btnDanger} 
                  onClick={() => onDelete(product.id)}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#fff0f0'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  刪除
                </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  };
  
  export default ProductTable;