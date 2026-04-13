import { NextRequest, NextResponse } from 'next/server';
import { formatINR } from '@/lib/utils';
import type { BudgetResult } from '@/lib/budget/engine';

export async function POST(request: NextRequest) {
  try {
    const { result, format }: { result: BudgetResult; format: 'pdf' | 'csv' } = await request.json();

    if (format === 'csv') {
      return handleCSVExport(result);
    } else if (format === 'pdf') {
      return handlePDFExport(result);
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

function handleCSVExport(result: BudgetResult) {
  const { allocations, summary } = result;

  // Create CSV content
  const headers = ['Category', 'Amount (₹)', 'Percentage (%)', 'Type'];
  const rows = allocations
    .filter(a => a.amount > 0)
    .map(allocation => [
      allocation.name,
      allocation.amount.toString(),
      allocation.percentage.toFixed(2),
      allocation.type
    ]);

  // Add summary row
  rows.push(['', '', '', '']);
  rows.push(['SUMMARY', '', '', '']);
  rows.push(['Total Allocated', summary.totalAllocated.toString(), '100.00', '']);
  rows.push(['Essentials %', '', summary.essentialsPercentage.toFixed(2), '']);
  rows.push(['Investing %', '', summary.investingPercentage.toFixed(2), '']);
  rows.push(['Lifestyle %', '', summary.lifestylePercentage.toFixed(2), '']);
  rows.push(['Months to EF Target', summary.monthsToEfTarget.toString(), '', '']);
  
  if (summary.debtFreeEta) {
    rows.push(['Debt-free ETA (months)', summary.debtFreeEta.toString(), '', '']);
  }

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="budget-allocation.csv"',
    },
  });
}

async function handlePDFExport(result: BudgetResult) {
  // For now, return a simple text-based "PDF" (could be enhanced with actual PDF generation)
  const { allocations, summary, badges, notes } = result;

  const content = `
SMART BUDGET ALLOCATION REPORT
Generated on: ${new Date().toLocaleDateString()}

=== SUMMARY ===
Total Allocated: ${formatINR(summary.totalAllocated)}
Essentials: ${summary.essentialsPercentage.toFixed(1)}%
Investing: ${summary.investingPercentage.toFixed(1)}%
Lifestyle: ${summary.lifestylePercentage.toFixed(1)}%
Emergency Fund Target: ${summary.monthsToEfTarget === Infinity ? 'Not achievable' : `${summary.monthsToEfTarget} months`}
${summary.debtFreeEta ? `Debt-free ETA: ${summary.debtFreeEta} months` : ''}

=== BADGES ===
${badges.join(', ')}

=== CATEGORY BREAKDOWN ===
${allocations
  .filter(a => a.amount > 0)
  .map(a => `${a.name}: ${formatINR(a.amount)} (${a.percentage.toFixed(1)}%)`)
  .join('\n')}

=== INSIGHTS ===
${notes.map(note => `• ${note}`).join('\n')}

=== DISCLAIMER ===
This budget allocation is for educational purposes only and does not constitute financial advice.
Please consult with a qualified financial advisor for personalized recommendations.
`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': 'attachment; filename="budget-report.txt"',
    },
  });
}
