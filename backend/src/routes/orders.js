const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const requireMerchantAuth = require('../middleware/auth');

// --- API: 取得所有訂單 ---
router.get('/', requireMerchantAuth, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                id, 
                phone_number, 
                total_amount, 
                created_at,
                order_items (
                    quantity,
                    price_at_purchase,
                    products ( name, category, cost_price ) 
                )
            `)
            .eq('merchant_id', req.merchantId) 
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (error) {
        console.error('獲取訂單失敗:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- API: 建立新訂單 (Checkout) ---
router.post('/', requireMerchantAuth, async (req, res) => {
    try {
        const { phone_number, cartItems } = req.body;

        if (!phone_number || !cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: '電話號碼與購物車不能為空' });
        }

        // ==========================================
        // 🛡️ 【資安防護與資料準備】：從資料庫抓取真實價格與成本
        // ==========================================
        const productIds = cartItems.map(item => item.product_id);
        const { data: dbProducts, error: dbError } = await supabase
            .from('products')
            .select('id, name, price, cost_price, stock')
            .in('id', productIds)
            .eq('merchant_id', req.merchantId); // 確保這些商品都是這個老闆的

        if (dbError) throw dbError;

        let total_amount = 0;
        const finalOrderItems = [];

        // 檢查庫存，並使用資料庫的真實價格來計算總額
        for (const item of cartItems) {
            const dbProduct = dbProducts.find(p => p.id === item.product_id);
            if (!dbProduct) throw new Error(`找不到商品 ID ${item.product_id}`);
            if (dbProduct.stock < item.quantity) throw new Error(`商品 ${dbProduct.name} 庫存不足！`);

            // 使用資料庫的真實售價算總金額，防止前端竄改價格
            total_amount += (dbProduct.price * item.quantity);

            // 準備要寫入明細表的資料
            finalOrderItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
                // 寫入當下的真實售價；成本價直接從 products.cost_price 查就好
                price_at_purchase: dbProduct.price
            });
        }

        // ==========================================
        // 【連環技第一步】：寫入 orders 主表
        // ==========================================
        const { data: newOrder, error: orderError } = await supabase
            .from('orders')
            .insert([{ 
                phone_number, 
                total_amount, // 這是後端算出來的安全總額
                merchant_id: req.merchantId 
            }])
            .select()
            .single(); 

        if (orderError) throw orderError;
        const currentOrderId = newOrder.id;

        // ==========================================
        // 【連環技第二步】：寫入 order_items 明細表
        // ==========================================
        // 把剛剛準備好的 finalOrderItems 加上 order_id 標籤
        const orderItemsToInsert = finalOrderItems.map(item => ({
            ...item,
            order_id: currentOrderId
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);

        if (itemsError) throw itemsError;

        // ==========================================
        // 【連環技第三步】：扣除商品庫存 (🛡️ 樂觀鎖)
        // ==========================================
        for (const item of cartItems) {
            const dbProduct = dbProducts.find(p => p.id === item.product_id);
            const newStock = dbProduct.stock - item.quantity;

            const { data: updatedProduct, error: updateError } = await supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', item.product_id)
                .eq('merchant_id', req.merchantId) 
                .eq('stock', dbProduct.stock) // 樂觀鎖：確認庫存沒被別人中途改掉
                .select();

            if (updateError) throw updateError;
            if (!updatedProduct || updatedProduct.length === 0) {
                throw new Error(`系統繁忙，${dbProduct.name} 的庫存已被其他使用者更新，請重新結帳！`);
            }
        }

        res.status(201).json({ 
            message: '訂單建立成功，且庫存已扣除！', 
            order: newOrder 
        });

    } catch (error) {
        console.error('結帳失敗:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;