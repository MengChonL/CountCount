import { useState } from 'react';
import { supabase } from '../supabaseClient';
import Card from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function Reports() {
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netProfit: 0 });
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://8.138.242.143/api/reports';

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("請先登入！");
    return session.access_token;
  };

  const fetchReportData = async (e) => {
    e.preventDefault();
    if (!dateRange.startDate || !dateRange.endDate) return alert('請選擇完整的日期範圍');
    
    setLoading(true);
    try {
      const token = await getAuthToken();
      // 透過網址參數傳遞日期給後端 API
      const url = `${API_BASE_URL}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      processDataForChart(data.orders, data.expenses);
    } catch (error) {
      console.error('獲取報表失敗:', error);
      alert('獲取資料失敗');
    } finally {
      setLoading(false);
    }
  };

  // 🌟 核心邏輯：把後端傳來的零散資料，按「日期」分組計算，變成圖表看得懂的格式
  const processDataForChart = (orders, expenses) => {
    const dailyData = {};
    let tIncome = 0;
    let tExpense = 0;

    // 處理收入 (訂單)
    orders.forEach(order => {
      const date = order.created_at.split('T')[0]; // 取出 YYYY-MM-DD
      if (!dailyData[date]) dailyData[date] = { date, income: 0, expense: 0 };
      dailyData[date].income += Number(order.total_amount);
      tIncome += Number(order.total_amount);
    });

    // 處理開支
    expenses.forEach(exp => {
      const date = exp.created_at.split('T')[0];
      if (!dailyData[date]) dailyData[date] = { date, income: 0, expense: 0 };
      dailyData[date].expense += Number(exp.amount);
      tExpense += Number(exp.amount);
    });

    // 將物件轉成陣列，並按日期排序
    const finalData = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    setChartData(finalData);
    setSummary({ totalIncome: tIncome, totalExpense: tExpense, netProfit: tIncome - tExpense });
  };

  // 🌟 匯出 PDF 核心功能
  const exportPDF = () => {
    const reportElement = document.getElementById('pdf-content-area');
    
    html2canvas(reportElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`財務報表_${dateRange.startDate}_至_${dateRange.endDate}.pdf`);
    });
  };

  const styles = {
    container: { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', fontFamily: '"Segoe UI", sans-serif', color: '#333', backgroundColor: '#f4f7f6', minHeight: '100vh' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#1a1a1a' },
    formGroup: { display: 'flex', gap: '15px', alignItems: 'center', padding: '20px' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' },
    btnPrimary: { backgroundColor: '#000', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    btnExport: { backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    summaryBox: { display: 'flex', gap: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' },
    statBox: { flex: 1, padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' },
    statLabel: { fontSize: '14px', color: '#666', marginBottom: '8px' },
    statValue: { fontSize: '24px', fontWeight: 'bold' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>財務報表與分析</h1>
        {chartData.length > 0 && (
          <button style={styles.btnExport} onClick={exportPDF}>下載為 PDF</button>
        )}
      </div>

      <Card title="選擇查詢區間">
        <form style={styles.formGroup} onSubmit={fetchReportData}>
          <input type="date" style={styles.input} value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} required />
          <span>至</span>
          <input type="date" style={styles.input} value={dateRange.endDate} onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} required />
          <button type="submit" style={styles.btnPrimary}>{loading ? '計算中...' : '生成報表'}</button>
        </form>
      </Card>

      {/* 🌟 這個 div 加上 id，就是我們要截圖轉 PDF 的區域 */}
      {chartData.length > 0 && (
        <div id="pdf-content-area" style={{ backgroundColor: '#f4f7f6', paddingBottom: '20px' }}>
          
          <div style={styles.summaryBox}>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>總收入 ($)</div>
              <div style={{...styles.statValue, color: '#28a745'}}>{summary.totalIncome}</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>總開支 ($)</div>
              <div style={{...styles.statValue, color: '#d9534f'}}>{summary.totalExpense}</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statLabel}>淨利潤 ($)</div>
              <div style={{...styles.statValue, color: summary.netProfit >= 0 ? '#0066cc' : '#d9534f'}}>
                {summary.netProfit}
              </div>
            </div>
          </div>

          <Card title="每日收支趨勢圖">
            <div style={{ width: '100%', height: 400, padding: '20px 0' }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" name="收入" fill="#28a745" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="開支" fill="#d9534f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Reports;
