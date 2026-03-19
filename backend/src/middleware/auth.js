// middleware/auth.js
const supabase = require('../supabase');

const requireMerchantAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new Error('缺少授權標頭');

        const token = authHeader.split(' ')[1];
        
        // 1. 驗證 Token，拿到這個商家的帳號資料
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) throw new Error('登入無效或已過期');

        // 2. 🌟 極簡核心：登入者的 ID，就是商家的 ID！
        req.merchantId = user.id; 

        next(); // 放行！
    } catch (error) {
        return res.status(401).json({ error: error.message });
    }
};

module.exports = requireMerchantAuth;