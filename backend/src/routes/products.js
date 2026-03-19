const express = require('express');
const router = express.Router();
const supabase = require('../supabase'); 
const requireMerchantAuth = require('../middleware/auth');

router.use(requireMerchantAuth);

// --- API: 取得所有商品 (Read) ---
router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', req.merchantId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      console.error('獲取商品失敗:', error);
      res.status(500).json({ error: error.message });
    }
});

// --- API: 新增商品 (Create) ---
router.post('/', async (req, res) => {
    try {
        const { name, category, price, stock, description, cost_price } = req.body;
        const merchant_id = req.merchantId; 
        const { data, error } = await supabase
          .from('products')
          .insert([
               { name, category, price, stock, description, cost_price, merchant_id }
          ])
          .select();
          
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('新增商品失敗:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- API: 更新商品 (Update) ---
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    const { name, category, price, stock, cost_price } = req.body; 

    const { data, error } = await supabase
      .from('products')
      .update({ name, category, price, stock, cost_price }) 
      .eq('id', id) 
      .eq('merchant_id', req.merchantId) 
      .select();

    if (error) throw error;
    res.status(200).json(data[0]); 
  } catch (error) {
    console.error('更新商品失敗:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- API: 刪除商品 (Delete) ---
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params; 

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('merchant_id', req.merchantId); 

    if (error) throw error;
    res.status(200).json({ message: '刪除成功' }); 
  } catch (error) {
    console.error('刪除商品失敗:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;