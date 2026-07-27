const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    // CORS izinleri
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // GET: Kayıtları Listele
        if (req.method === 'GET') {
            const branchQuery = req.query.branch;
            let query = supabase.from('reports').select('*').order('date', { ascending: false });

            if (branchQuery && branchQuery !== 'ALL') {
                query = query.eq('branch', branchQuery);
            }

            const { data, error } = await query;

            if (error) throw error;

            return res.status(200).json({ success: true, data });
        }

        // POST: Yeni Kayıt Ekle
        if (req.method === 'POST') {
            const { branch, date, cash, bank, expense, expense_desc, stock_item, stock_qty, stock_unit, stock_amount } = req.body;

            if (!branch || !date) {
                return res.status(400).json({ success: false, message: 'Şube ve tarih zorunludur.' });
            }

            const { data, error } = await supabase
                .from('reports')
                .insert([
                    {
                        branch,
                        date,
                        cash: Number(cash) || 0,
                        bank: Number(bank) || 0,
                        expense: Number(expense) || 0,
                        expense_desc: expense_desc || '',
                        stock_item: stock_item || '',
                        stock_qty: Number(stock_qty) || 0,
                        stock_unit: stock_unit || '',
                        stock_amount: Number(stock_amount) || 0
                    }
                ])
                .select();

            if (error) throw error;

            return res.status(200).json({ success: true, message: 'Kayıt başarıyla eklendi.', data });
        }

        return res.status(405).json({ success: false, message: 'Method not allowed' });
    } catch (error) {
        console.error('Supabase Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
