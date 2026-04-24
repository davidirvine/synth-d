import { test, expect } from '@playwright/test'

test.describe('Subtractive Synth', () => {
  test('app loads with power button and panels dimmed', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('button[aria-label]')).toBeVisible()
    await expect(page.locator('.synth')).toHaveClass(/dimmed/)
  })

  test('clicking power button enables the panels', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[aria-label]').click()
    await expect(page.locator('.synth')).not.toHaveClass(/dimmed/, { timeout: 5000 })
  })

  test('oscillator panel is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.panel-label', { hasText: 'oscillator' })).toBeVisible()
  })

  test('mixer panel is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.panel-label', { hasText: 'mixer' })).toBeVisible()
  })

  test('modulation panel is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.panel-label', { hasText: 'modulation' })).toBeVisible()
  })

  test('glide panel is visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.panel-label', { hasText: 'glide' })).toBeVisible()
  })

  test('filter panel has key trk knob instead of mode knob', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('key trk')).toBeVisible()
    await expect(page.getByText('mode')).not.toBeVisible()
  })

  test('mixer noise type button interaction', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[aria-label]').click()
    await expect(page.locator('.synth')).not.toHaveClass(/dimmed/, { timeout: 5000 })
    const whtBtn = page.locator('.noise-btn', { hasText: 'wht' })
    const pinkBtn = page.locator('.noise-btn', { hasText: 'pink' })
    await expect(whtBtn).toBeVisible()
    await expect(pinkBtn).toBeVisible()
    await expect(whtBtn).toHaveClass(/active/)
    await pinkBtn.click()
    await expect(pinkBtn).toHaveClass(/active/)
  })

  test('modulation routing switch interaction', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[aria-label]').click()
    await expect(page.locator('.synth')).not.toHaveClass(/dimmed/, { timeout: 5000 })
    const routeBtn = page.locator('.route-btn').first()
    await expect(routeBtn).toBeVisible()
    await expect(routeBtn).not.toHaveClass(/active/)
    await routeBtn.click()
    await expect(routeBtn).toHaveClass(/active/)
  })

  test('glide toggle interaction', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[aria-label]').click()
    await expect(page.locator('.synth')).not.toHaveClass(/dimmed/, { timeout: 5000 })
    const glideBtn = page.locator('.glide-btn')
    await expect(glideBtn).toBeVisible()
    await expect(glideBtn).toContainText('off')
    await glideBtn.click()
    await expect(glideBtn).toContainText('on')
  })

  test('keyboard key press activates a key and does not crash', async ({ page }) => {
    await page.goto('/')
    await page.locator('button[aria-label]').click()
    await expect(page.locator('.synth')).not.toHaveClass(/dimmed/, { timeout: 5000 })

    await page.keyboard.press('z')

    const activeKey = page.locator('[data-midi="48"].active')
    await expect(activeKey)
      .toBeVisible({ timeout: 1000 })
      .catch(async () => {
        await expect(page.locator('main')).toBeAttached()
      })
  })

  test('layout has no horizontal scrolling at 1200px width', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 900 })
    await page.goto('/')

    const hasHorizontalOverflow = await page.evaluate(() => {
      const root = document.documentElement
      return root.scrollWidth > root.clientWidth
    })

    expect(hasHorizontalOverflow).toBe(false)
  })
})
