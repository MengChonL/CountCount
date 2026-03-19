// routes/expenses.js
const express = require('express');
const router = express.Router();
const supabase = require('../supabase'); 
const requireMerchantAuth = require('../middleware/auth'); //  引入身分驗證攔截器
router.use(requireMerchantAuth);

// --- API: 取得所有開支 (Read) ---
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('merchant_id', req.merchantId) 
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('獲取開支失敗:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- API: 新增一筆開支 (Create) ---
router.post('/', async (req, res) => {
    try {
        const { amount, description } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: '開支金額必須大於 0' });
        }

        const { data, error } = await supabase
            .from('expenses')
            .insert([{ 
                amount, 
                description, 
                merchant_id: req.merchantId 
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        console.error('新增開支失敗:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- API: 刪除開支 (Delete) ---
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id)
            .eq('merchant_id', req.merchantId); 

        if (error) throw error;
        res.status(200).json({ message: '開支刪除成功' });
    } catch (error) {
        console.error('刪除開支失敗:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;