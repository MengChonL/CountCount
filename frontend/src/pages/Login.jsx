import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Card from '../components/Card';

function Login() {
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true); // 切換登入或註冊模式
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    shopName: '' // 註冊時讓老闆填寫商店名稱
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLoginMode) {
        // --- 🟢 登入邏輯 ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
        alert('登入成功！歡迎回來。');
        navigate('/products'); // 登入成功後跳轉到商品頁面

      } else {
        // --- 🔵 註冊邏輯 ---
        if (!formData.shopName) throw new Error('請填寫商店名稱');

        // 1. 在 Supabase Auth 建立帳號
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
	  options:{
		data:{
			shop_name: formData.shopName
		}
	 }
        });
        if (authError) throw authError;

        alert('註冊成功！請直接登入。');
        setIsLoginMode(true); // 註冊完切換回登入模式
      }
    } catch (error) {
      console.error('驗證失敗:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 現代化置中樣式 ---
  const styles = {
    wrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
    container: { width: '100%', maxWidth: '400px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px', outline: 'none' },
    button: { padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#000', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
    switchText: { textAlign: 'center', marginTop: '15px', color: '#666', cursor: 'pointer', textDecoration: 'underline' }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <Card title={isLoginMode ? "商家登入" : "註冊新商家"}>
          <form style={styles.form} onSubmit={handleAuth}>
            
            {/* 只有註冊模式才顯示商店名稱輸入框 */}
            {!isLoginMode && (
              <input 
                style={styles.input}
                type="text" 
                placeholder="您的商店名稱" 
                value={formData.shopName}
                onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                required={!isLoginMode}
              />
            )}

            <input 
              style={styles.input}
              type="email" 
              placeholder="電子郵件 (Email)" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <input 
              style={styles.input}
              type="password" 
              placeholder="密碼 (至少 6 位數)" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? '處理中...' : (isLoginMode ? '登入' : '註冊')}
            </button>

            <div style={styles.switchText} onClick={() => setIsLoginMode(!isLoginMode)}>
              {isLoginMode ? '還沒有帳號嗎？點我註冊' : '已經有帳號了？點我登入'}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default Login;
