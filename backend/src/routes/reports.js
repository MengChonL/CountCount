const express = require('express');
const router = express.Router();
const supabase = require('../supabase'); 
const requireMerchantAuth = require('../middleware/auth');

router.get('/', requireMerchantAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // 1. 撈取指定時間內的「訂單收入」
    let ordersQuery = supabase
      .from('orders')
      .select('created_at, total_amount')
      .eq('merchant_id', req.merchantId);
    
    if (startDate) ordersQuery = ordersQuery.gte('created_at', `${startDate}T00:00:00.000Z`);
    if (endDate) ordersQuery = ordersQuery.lte('created_at', `${endDate}T23:59:59.999Z`);
    
    const { data: orders, error: ordersError } = await ordersQuery;
    if (ordersError) throw ordersError;

    // 2. 撈取指定時間內的「營運開支」
    let expensesQuery = supabase
      .from('expenses')
      .select('created_at, amount')
      .eq('merchant_id', req.merchantId);
      
    if (startDate) expensesQuery = expensesQuery.gte('created_at', `${startDate}T00:00:00.000Z`);
    if (endDate) expensesQuery = expensesQuery.lte('created_at', `${endDate}T23:59:59.999Z`);

    const { data: expenses, error: expensesError } = await expensesQuery;
    if (expensesError) throw expensesError;

    // 將兩包資料一起回傳給前端去整理畫圖
    res.status(200).json({ orders, expenses });
  } catch (error) {
    console.error('獲取報表資料失敗:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;