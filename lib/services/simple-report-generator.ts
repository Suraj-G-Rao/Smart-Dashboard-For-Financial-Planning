import jsPDF from 'jspdf';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  totalInvestments: number;
  totalBalance: number;
  savingsRate: string;
  netSavings?: number;
  totalDebt?: number;
  incomeData: any[];
  expensesData: any[];
  investmentsData?: any[];
  accountsData?: any[];
  loansData?: any[];
  expensesByCategory?: any;
  incomeBySource?: any;
}

interface ReportOptions {
  type: 'monthly' | 'tax' | 'custom';
  period: string;
  periodStart: string;
  periodEnd: string;
  userId: string;
}

export class SimpleReportGenerator {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key') {
      console.warn('GEMINI_API_KEY is not properly configured, AI insights will use fallback');
      this.genAI = null as any;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateReport(
    financialData: FinancialData,
    options: ReportOptions
  ): Promise<Buffer> {
    const doc = new jsPDF();
    
    // Generate AI insights (with fallback)
    let insights: string;
    try {
      insights = await this.generateAIInsights(financialData, options);
    } catch (error) {
      console.error('AI insights failed, using fallback:', error);
      insights = this.getFallbackInsights(financialData, options);
    }
    
    // Add header
    this.addHeader(doc, options);
    
    // Add summary section
    this.addSummarySection(doc, financialData);
    
    // Add AI insights section
    let currentY = this.addInsightsSection(doc, insights);
    
    // Add detailed sections based on report type
    currentY = this.addDetailedSection(doc, financialData, options, currentY);
    
    // Add footer
    this.addFooter(doc);
    
    return Buffer.from(doc.output('arraybuffer'));
  }

  private addHeader(doc: jsPDF, options: ReportOptions) {
    try {
      // Set colors and fonts
      doc.setFillColor(37, 99, 235); // Blue
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Report', 20, 25); // Remove emoji that might cause issues
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${options.type.toUpperCase()} REPORT`, 20, 35);
    
    // Report details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
      doc.text(`Period: ${options.period}`, 20, 50);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 58);
      doc.text(`Report Type: ${options.type.charAt(0).toUpperCase() + options.type.slice(1)}`, 20, 66);
    } catch (error) {
      console.error('Error adding header:', error);
      // Fallback to simple header
      doc.setFontSize(16);
      doc.text('Financial Report', 20, 25);
    }
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

    // Add debt information if available
    if (data.totalDebt && data.totalDebt > 0) {
      rightY += 8;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Total Debt:', rightCol, rightY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(239, 68, 68);
      doc.text(`₹${data.totalDebt.toLocaleString()}`, rightCol + 35, rightY);
    }
  }

  private addInsightsSection(doc: jsPDF, insights: string): number {
    const yPos = 135;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('AI Financial Insights', 20, yPos); // Remove emoji
    
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

  private addDetailedSection(doc: jsPDF, data: FinancialData, options: ReportOptions, startY: number): number {
    let currentY = startY;
    
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    // Add income section if there's income data
    if (data.incomeData && data.incomeData.length > 0) {
      currentY = this.addSimpleTable(doc, 'Income Breakdown', [
        ['Date', 'Source', 'Description', 'Amount']
      ].concat(
        data.incomeData.slice(0, 10).map(item => [
          new Date(item.date).toLocaleDateString(),
          item.category || item.merchant || 'Income',
          item.description || 'Transaction',
          `₹${Number(item.amount).toLocaleString()}`
        ])
      ), currentY);
      currentY += 10;
    }
    
    // Add expense section if there's expense data
    if (data.expensesData && data.expensesData.length > 0) {
      currentY = this.addSimpleTable(doc, 'Expense Breakdown', [
        ['Date', 'Category', 'Description', 'Amount']
      ].concat(
        data.expensesData.slice(0, 10).map(item => [
          new Date(item.date).toLocaleDateString(),
          item.category || 'Expense',
          item.description || 'Transaction',
          `₹${Math.abs(Number(item.amount)).toLocaleString()}`
        ])
      ), currentY);
      currentY += 10;
    }

    // Add expense category breakdown if available
    if (data.expensesByCategory && Object.keys(data.expensesByCategory).length > 0) {
      const categoryData = Object.entries(data.expensesByCategory)
        .sort(([,a]: any, [,b]: any) => b.total - a.total)
        .slice(0, 8)
        .map(([category, data]: any) => [
          category,
          `${data.transactions.length} transactions`,
          `₹${data.total.toLocaleString()}`
        ]);
      
      currentY = this.addSimpleTable(doc, 'Top Expense Categories', [
        ['Category', 'Transactions', 'Total Amount']
      ].concat(categoryData), currentY);
    }
    
    return currentY;
  }

  private addSimpleTable(doc: jsPDF, title: string, data: string[][], startY: number): number {
    let currentY = startY;
    
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    // Add title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text(title, 20, currentY);
    currentY += 10;
    
    // Add table data
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const colWidths = [40, 40, 60, 40]; // Column widths
    const startX = 20;
    
    data.forEach((row, rowIndex) => {
      if (currentY > 280) {
        doc.addPage();
        currentY = 20;
      }
      
      let x = startX;
      row.forEach((cell, colIndex) => {
        if (rowIndex === 0) {
          // Header row
          doc.setFont('helvetica', 'bold');
          doc.setFillColor(37, 99, 235);
          doc.setTextColor(255, 255, 255);
          doc.rect(x, currentY - 5, colWidths[colIndex], 8, 'F');
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
        }
        
        // Truncate text if too long
        const maxChars = Math.floor(colWidths[colIndex] / 2);
        const truncatedText = cell.length > maxChars ? cell.substring(0, maxChars - 3) + '...' : cell;
        doc.text(truncatedText, x + 2, currentY);
        x += colWidths[colIndex];
      });
      
      currentY += 8;
    });
    
    return currentY + 10;
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

  private getFallbackInsights(data: FinancialData, options: ReportOptions): string {
    const netSavings = data.netSavings || (data.totalIncome - data.totalExpenses);
    const savingsRateNum = parseFloat(data.savingsRate);
    const hasDebt = data.totalDebt && data.totalDebt > 0;
    
    // Analyze expense categories
    let topExpenseCategory = 'expenses';
    let topExpenseAmount = 0;
    if (data.expensesByCategory && Object.keys(data.expensesByCategory).length > 0) {
      const sortedCategories = Object.entries(data.expensesByCategory)
        .sort(([,a]: any, [,b]: any) => b.total - a.total);
      if (sortedCategories.length > 0) {
        topExpenseCategory = sortedCategories[0][0];
        topExpenseAmount = (sortedCategories[0][1] as any).total;
      }
    }

    let insights = `Financial Analysis for ${options.period}:\n\n`;
    
    // Income Analysis
    if (data.totalIncome > 0) {
      insights += `• Total Income: ₹${data.totalIncome.toLocaleString()}\n`;
      insights += `• Total Expenses: ₹${data.totalExpenses.toLocaleString()}\n`;
      insights += `• Net Savings: ₹${netSavings.toLocaleString()}\n`;
      insights += `• Savings Rate: ${data.savingsRate}% ${savingsRateNum >= 20 ? '(Excellent - above recommended 20%)' : savingsRateNum >= 10 ? '(Good - try to reach 20%)' : '(Needs improvement - aim for at least 10%)'}\n\n`;
    } else {
      insights += `• No income recorded for this period. Please ensure all income sources are tracked.\n\n`;
    }
    
    // Expense Analysis
    if (data.totalExpenses > 0 && topExpenseAmount > 0) {
      const expensePercentage = ((topExpenseAmount / data.totalExpenses) * 100).toFixed(1);
      insights += `• Highest expense category: ${topExpenseCategory} (₹${topExpenseAmount.toLocaleString()} - ${expensePercentage}%)\n`;
    }
    
    // Investment Analysis
    if (data.totalInvestments > 0) {
      insights += `• Investment Portfolio: ₹${data.totalInvestments.toLocaleString()}\n`;
    }
    
    // Debt Analysis
    if (hasDebt) {
      insights += `• Total Debt: ₹${data.totalDebt!.toLocaleString()}\n`;
    }
    
    insights += `\nKey Recommendations:\n`;
    
    if (savingsRateNum < 10) {
      insights += `• Priority: Increase savings rate to at least 10% by reducing ${topExpenseCategory} expenses\n`;
    } else if (savingsRateNum < 20) {
      insights += `• Good progress! Try to increase savings rate to 20% for optimal financial health\n`;
    }
    
    if (data.totalExpenses > 0 && topExpenseAmount > data.totalExpenses * 0.4) {
      insights += `• Consider reducing ${topExpenseCategory} expenses as they represent a large portion of your budget\n`;
    }
    
    if (data.totalInvestments === 0 && netSavings > 0) {
      insights += `• Start investing your savings in diversified mutual funds or SIPs for long-term growth\n`;
    }
    
    if (hasDebt && data.totalDebt! > data.totalIncome * 0.3) {
      insights += `• Focus on debt reduction as it's high relative to your income\n`;
    }
    
    insights += `• Build an emergency fund covering 6 months of expenses\n`;
    insights += `• Track expenses regularly to identify saving opportunities\n`;
    
    insights += `\nNote: This analysis uses basic financial principles. For personalized advice, consult a financial advisor.`;
    
    return insights;
  }

  private async generateAIInsights(
    data: FinancialData,
    options: ReportOptions
  ): Promise<string> {
    try {
      if (!this.genAI) {
        throw new Error('Gemini API not configured');
      }
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const netSavings = data.netSavings || (data.totalIncome - data.totalExpenses);
      const hasDebt = data.totalDebt && data.totalDebt > 0;
      
      // Get top expense categories from the new structure
      let topExpenseCategories = 'No expense data available';
      if (data.expensesByCategory && Object.keys(data.expensesByCategory).length > 0) {
        topExpenseCategories = Object.entries(data.expensesByCategory)
          .sort(([,a]: any, [,b]: any) => b.total - a.total)
          .slice(0, 5)
          .map(([category, data]: any) => `${category}: ₹${data.total.toLocaleString()} (${data.transactions.length} transactions)`)
          .join('\n');
      }

      const prompt = `
        Analyze the following financial data for a ${options.type} report covering ${options.period}:
        
        Financial Summary:
        - Total Income: ₹${data.totalIncome.toLocaleString()}
        - Total Expenses: ₹${data.totalExpenses.toLocaleString()}
        - Net Savings: ₹${netSavings.toLocaleString()}
        - Savings Rate: ${data.savingsRate}%
        - Account Balance: ₹${data.totalBalance.toLocaleString()}
        - Investments: ₹${data.totalInvestments.toLocaleString()}
        ${hasDebt ? `- Total Debt: ₹${data.totalDebt!.toLocaleString()}` : ''}
        
        Transaction Summary:
        - Income Transactions: ${data.incomeData?.length || 0}
        - Expense Transactions: ${data.expensesData?.length || 0}
        
        Top Expense Categories:
        ${topExpenseCategories}
        
        Please provide a comprehensive financial analysis including:
        1. Overall financial health assessment
        2. Spending pattern insights and trends
        3. Specific savings recommendations
        4. Investment strategy suggestions
        5. Debt management advice (if applicable)
        6. Areas for immediate improvement
        
        Focus on actionable advice for an Indian user. Keep response under 350 words.
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return this.getFallbackInsights(data, options);
    }
  }

}
