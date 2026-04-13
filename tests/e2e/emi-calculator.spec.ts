import { test, expect } from '@playwright/test'

test.describe('EMI Calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculators/emi')
  })

  test('should load EMI calculator page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('EMI Calculator')
  })

  test('should calculate basic EMI', async ({ page }) => {
    // Fill in loan details
    await page.fill('#principal', '1000000')
    await page.fill('#rate', '8.5')
    await page.fill('#tenure', '20')

    // Click calculate
    await page.click('button:has-text("Calculate EMI")')

    // Wait for results
    await page.waitForSelector('text=Monthly EMI')

    // Verify results are displayed
    const emiText = await page.textContent('text=Monthly EMI >> .. >> div:has-text("₹")')
    expect(emiText).toContain('₹')
  })

  test('should calculate with savings strategies', async ({ page }) => {
    // Fill basic details
    await page.fill('#principal', '5000000')
    await page.fill('#rate', '8.5')
    await page.fill('#tenure', '20')

    await page.click('button:has-text("Calculate EMI")')
    await page.waitForSelector('text=Monthly EMI')

    // Switch to Home Loan tab
    await page.click('button:has-text("Home Loan")')

    // Fill savings strategies
    await page.fill('#extraEmis', '1')
    await page.fill('#stepUp', '5')
    await page.fill('#prepay', '100000')

    // Recalculate with savings
    await page.click('button:has-text("Recalculate with Savings")')

    // Wait for savings results
    await page.waitForSelector('text=Saved')

    // Verify savings are displayed
    const savingsText = await page.textContent('text=Saved')
    expect(savingsText).toContain('Saved')
  })

  test('should export schedule as CSV', async ({ page }) => {
    await page.fill('#principal', '1000000')
    await page.fill('#rate', '10')
    await page.fill('#tenure', '10')

    await page.click('button:has-text("Calculate EMI")')
    await page.waitForSelector('text=Monthly EMI')

    // Setup download listener
    const downloadPromise = page.waitForEvent('download')
    await page.click('button:has-text("Export CSV")')
    const download = await downloadPromise

    // Verify filename
    expect(download.suggestedFilename()).toContain('emi-schedule')
  })
})
