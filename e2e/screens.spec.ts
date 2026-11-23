// Captures the core screens for review: SCREENS=1 npx playwright test e2e/screens.spec.ts
import { test } from '@playwright/test';

const out = (n: string) => `../docs/pilots/screens/loopday-${n}.png`;
const ago = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

test('screens', async ({ page }) => {
  test.skip(!process.env.SCREENS, 'set SCREENS=1 to capture');
  await page.goto('/');
  await page.getByTestId('intro').waitFor();
  await page.screenshot({ path: out('1-intro') });
  for (let i = 0; i < 3; i++) await page.getByTestId('intro-next').click();
  for (const s of ['Drink water', 'Read', 'Walk']) await page.getByTestId(`starter-${s}`).click();
  await page.getByRole('button', { name: 'Drink water details' }).click();
  for (let i = 8; i >= 1; i--) if (i <= 6) await page.getByTestId(`day-${ago(i)}`).click();
  await page.goBack();
  await page.getByTestId('check-Drink water').click();
  await page.waitForTimeout(3000);
  await page.getByTestId('check-Walk').click();
  await page.getByTestId('amount-20').click();
  await page.waitForTimeout(3500);
  await page.screenshot({ path: out('2-today'), fullPage: true });
  await page.getByRole('button', { name: 'Drink water details' }).click();
  await page.getByTestId('habit').waitFor();
  await page.screenshot({ path: out('3-habit'), fullPage: true });
  await page.goto('/stats');
  await page.getByTestId('stats').waitFor();
  await page.screenshot({ path: out('4-stats'), fullPage: true });
});
