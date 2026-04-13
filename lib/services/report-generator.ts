import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  totalInvestments: number;
  totalBalance: number;
  savingsRate: string;
  incomeData: any[];
  expensesData: any[];
  investmentsData?: any[];
  accountsData?: any[];
}

interface ReportOptions {
  type: 'monthly' | 'tax' | 'custom';
  period: string;
  periodStart: string;
  periodEnd: string;
  userId: string;
}

export class ReportGenerator {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generateReport(
    financialData: FinancialData,
    options: ReportOptions
  ): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Initialize autoTable plugin
    (doc as any).autoTable = autoTable;
    
    // Generate AI insights
    const insights = await this.generateAIInsights(financialData, options);
    
    // Add header
    this.addHeader(doc, options);
    
    // Add summary section
    this.addSummarySection(doc, financialData);
    
    // Add AI insights section
    const currentY = this.addInsightsSection(doc, insights);
    
    // Add detailed tables based on report type
    if (options.type === 'monthly') {
      this.addMonthlyDetails(doc, financialData, currentY);
    } else if (options.type === 'tax') {
      this.addTaxDetails(doc, financialData, currentY);
    } else {
      this.addCustomDetails(doc, financialData, options, currentY);
    }
    
    // Add footer
    this.addFooter(doc);
    
    return Buffer.from(doc.output('arraybuffer'));
  }

  private addHeader(doc: jsPDF, options: ReportOptions) {
    // Set colors and fonts
    doc.setFillColor(37, 99, 235); // Blue
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 Financial Report', 20, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${options.type.toUpperCase()} REPORT`, 20, 35);
    
    // Report details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Period: ${options.period}`, 20, 50);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 58);
    doc.text(`Report Type: ${options.type.charAt(0).toUpperCase() + options.type.slice(1)}`, 20, 66);
  }

  private addSummarySection(doc: jsPDF, data: FinancialData) {
    let yPos = 80;
    
    // Summary box
    doc.setFillColor(239, 246, 255);
    doc.rect(15, yPos - 5, 180, 45, 'F');
    doc.setDrawColor(37, 99, 235);
    doc.rect(15, yPos - 5, 180, 45, 'S');
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Financial Summary', 20, yPos + 5);
    
    // Metrics in two columns
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const leftCol = 25;
    const rightCol = 110;
    let leftY = yPos + 15;
    let rightY = yPos + 15;
    
    // Left column
    doc.setFont('helvetica', 'bold');
    doc.text('Total Income:', leftCol, leftY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(16, 185, 129);
    doc.text(`₹${data.totalIncome.toLocaleString()}`, leftCol + 35, leftY);
    
    leftY += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Expenses:', leftCol, leftY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(239, 68, 68);
    doc.text(`₹${data.totalExpenses.toLocaleString()}`, leftCol + 35, leftY);
    
    leftY += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Net Savings:', leftCol, leftY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(59, 130, 246);
    doc.text(`₹${(data.totalIncome - data.totalExpenses).toLocaleString()}`, leftCol + 35, leftY);
    
    // Right column
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Savings Rate:', rightCol, rightY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(139, 92, 246);
    doc.text(`${data.savingsRate}%`, rightCol + 35, rightY);
    
    rightY += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Balance:', rightCol, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text(`₹${data.totalBalance.toLocaleString()}`, rightCol + 35, rightY);
    
    rightY += 8;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Investments:', rightCol, rightY);
    doc.setFont('helvetica', 'normal');
    doc.text(`₹${data.totalInvestments.toLocaleString()}`, rightCol + 35, rightY);
  }

  private addInsightsSection(doc: jsPDF, insights: string) {
    const yPos = 135;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('🤖 AI Financial Insights', 20, yPos);
    
    // Split insights into lines
    const maxWidth = 170;
    const lines = doc.splitTextToSize(insights, maxWidth);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    let currentY = yPos + 10;
    lines.forEach((line: string) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(line, 20, currentY);
      currentY += 5;
    });
    
    return currentY + 10;
  }

  private addMonthlyDetails(doc: jsPDF, data: FinancialData, startY: number = 200) {
    let yPos = startY;
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Income table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Income Breakdown', 20, yPos);
    
    const incomeTableData = data.incomeData.slice(0, 10).map(item => [
      new Date(item.date).toLocaleDateString(),
      item.source || 'N/A',
      item.type,
      `₹${item.amount.toLocaleString()}`
    ]);
    
    doc.autoTable({
      startY: yPos + 5,
      head: [['Date', 'Source', 'Type', 'Amount']],
      body: incomeTableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
      margin: { left: 20, right: 20 }
    });
    
    // Expenses table
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Expense Breakdown', 20, yPos);
    
    const expenseTableData = data.expensesData.slice(0, 10).map(item => [
      new Date(item.date).toLocaleDateString(),
      item.category,
      item.description,
      `₹${item.amount.toLocaleString()}`
    ]);
    
    doc.autoTable({
      startY: yPos + 5,
      head: [['Date', 'Category', 'Description', 'Amount']],
      body: expenseTableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
      margin: { left: 20, right: 20 }
    });
  }

  private addTaxDetails(doc: jsPDF, data: FinancialData, startY: number = 200) {
    let yPos = startY;
    
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    // Tax-specific calculations
    const taxableIncome = data.totalIncome;
    const deductions = data.totalInvestments; // Simplified
    const netTaxableIncome = Math.max(0, taxableIncome - deductions);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Tax Summary', 20, yPos);
    
    const taxData = [
      ['Total Income', `₹${taxableIncome.toLocaleString()}`],
      ['Deductions (Investments)', `₹${deductions.toLocaleString()}`],
      ['Net Taxable Income', `₹${netTaxableIncome.toLocaleString()}`],
      ['Estimated Tax (30%)', `₹${(netTaxableIncome * 0.3).toLocaleString()}`]
    ];
    
    doc.autoTable({
      startY: yPos + 5,
      head: [['Description', 'Amount']],
      body: taxData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 }
    });
  }

  private addCustomDetails(doc: jsPDF, data: FinancialData, options: ReportOptions, startY: number = 200) {
    let yPos = startY;
    
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text(`Custom Period Analysis (${options.periodStart} to ${options.periodEnd})`, 20, yPos);
    
    // Category-wise expense breakdown
    const categoryTotals: { [key: string]: number } = {};
    data.expensesData.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    const categoryData = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([category, amount]) => [category, `₹${amount.toLocaleString()}`]);
    
    doc.autoTable({
      startY: yPos + 5,
      head: [['Category', 'Total Amount']],
      body: categoryData,
      theme: 'grid',
      headStyles: { fillColor: [147, 51, 234] },
      styles: { fontSize: 10 },
      margin: { left: 20, right: 20 }
    });
  }

  private addFooter(doc: jsPDF) {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(229, 231, 235);
      doc.line(20, 280, 190, 280);
      
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text('Generated by FinanceAI - Your Personal Finance Manager', 20, 285);
      doc.text(`Page ${i} of ${pageCount}`, 170, 285);
      doc.text('This is an automated report. Please verify all information.', 20, 290);
    }
  }

  private async generateAIInsights(
    data: FinancialData,
    options: ReportOptions
  ): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
        Analyze the following financial data for a ${options.type} report covering ${options.period}:
        
        Financial Summary:
        - Total Income: ₹${data.totalIncome.toLocaleString()}
        - Total Expenses: ₹${data.totalExpenses.toLocaleString()}
        - Net Savings: ₹${(data.totalIncome - data.totalExpenses).toLocaleString()}
        - Savings Rate: ${data.savingsRate}%
        - Total Balance: ₹${data.totalBalance.toLocaleString()}
        - Investments: ₹${data.totalInvestments.toLocaleString()}
        
        Top Expense Categories:
        ${this.getTopExpenseCategories(data.expensesData)}
        
        Please provide:
        1. Key financial insights and trends
        2. Spending pattern analysis
        3. Savings recommendations
        4. Investment suggestions
        5. Areas for improvement
        
        Keep the response concise (max 300 words) and actionable for an Indian user.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return `Financial Analysis for ${options.period}:

• Your savings rate of ${data.savingsRate}% ${parseFloat(data.savingsRate) >= 20 ? 'is excellent' : 'could be improved'}
• Total expenses: ₹${data.totalExpenses.toLocaleString()}
• Net savings: ₹${(data.totalIncome - data.totalExpenses).toLocaleString()}

Recommendations:
• Consider reviewing your top expense categories
• Aim for a 20% savings rate if possible
• Diversify your investment portfolio
• Track expenses regularly for better financial control`;
    }
  }

  private getTopExpenseCategories(expensesData: any[]): string {
    const categoryTotals: { [key: string]: number } = {};
    expensesData.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    return Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => `${category}: ₹${amount.toLocaleString()}`)
      .join('\n');
  }
}
