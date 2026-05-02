import { test, expect } from '@playwright/test'

// Install a fake `requestMIDIAccess` and a `window.__fakeMidi.send(bytes)`
// helper before any page script runs. The fake exposes one connected input
// port whose `onmidimessage` is invoked synchronously when send() is called.
//
// Unlike the powered-audio specs in `synth.spec.js`, MIDI specs run
// unconditionally in CI: they only assert on DOM state and do not depend on
// the AudioWorklet or audio hardware.
test.describe('MIDI E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const port = {
        id: 'fake',
        name: 'Fake MIDI',
        type: 'input',
        state: 'connected',
        onmidimessage: null,
      }
      const access = { inputs: new Map([['fake', port]]), onstatechange: null }
      window.__fakeMidi = {
        port,
        send: (bytes) => port.onmidimessage && port.onmidimessage({ data: new Uint8Array(bytes) }),
      }
      navigator.requestMIDIAccess = async () => access
    })
  })

  test('page mount populates the MIDI status dot to connected', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.midi-status .dot.connected')).toBeVisible({ timeout: 2000 })
  })

  test('synthetic note-on highlights the key and flips status to active', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.midi-status .dot.connected')).toBeVisible({ timeout: 2000 })

    // 0x90 = note-on channel 1, note 60 (C4), velocity 100.
    await page.evaluate(() => window.__fakeMidi.send([0x90, 60, 100]))

    await expect(page.locator('[data-midi="60"].active')).toBeVisible({ timeout: 1000 })
    await expect(page.locator('.midi-status .dot.active')).toBeVisible({ timeout: 1000 })
  })

  test('learn mode binds CC and the assigned-CC label appears on the knob', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.midi-status .dot.connected')).toBeVisible({ timeout: 2000 })

    // The cutoff knob lives in the inert <main> until the synth is powered
    // on, so a real right-click would be swallowed. dispatchEvent fires the
    // contextmenu listener directly through Svelte's property handler.
    const cutoffHit = page
      .locator('.knob-wrap')
      .filter({ has: page.locator('.knob-label', { hasText: /^cutoff$/ }) })
      .locator('.knob-hit')
    await cutoffHit.dispatchEvent('contextmenu')

    // 0xb0 = CC channel 1, controller 74, value 64 → assigns CC 74 to cutoff.
    await page.evaluate(() => window.__fakeMidi.send([0xb0, 74, 64]))

    const cutoffWrap = page
      .locator('.knob-wrap')
      .filter({ has: page.locator('.knob-label', { hasText: /^cutoff$/ }) })
    await expect(cutoffWrap.locator('.cc-label', { hasText: /CC 74/ })).toBeVisible({
      timeout: 1000,
    })
  })
})
