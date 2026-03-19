const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001; 

// 1. Middleware 設定 (CORS 必須在最前面)
app.use(cors());
app.use(express.json());

// 2. 引入我們剛剛拆分出去的「路由部門」
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const expensesRoutes = require('./routes/expenses'); // 正確宣告
const reportsRoutes = require('./routes/reports');

// 3. 核心分流機制 (總機轉接)
// 當有人訪問 /api/products 開頭的網址，全部交給 productRoutes 處理
app.use('/api/products', productRoutes);

// 當有人訪問 /api/orders 開頭的網址，全部交給 orderRoutes 處理
app.use('/api/orders', orderRoutes);

app.use('/api/expenses', expensesRoutes); 
app.use('/api/reports',reportsRoutes);

// -- 測試總機是否存活
app.get('/', (req, res) => {
    res.send('後端總機正常運作中 🚀');
});

// 4. 啟動伺服器
app.listen(PORT, () => {
  console.log(`伺服器已啟動，請打開瀏覽器輸入： http://localhost:${PORT}`);
});