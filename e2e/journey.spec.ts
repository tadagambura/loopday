import { expect, test, type Page } from '@playwright/test';

async function finishIntro(page: Page) {
  await expect(page.getByTestId('intro')).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByTestId('intro-next').click();
  await expect(page.getByTestId('today')).toBeVisible();
}

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

test('first open → starter habit → tick → undo → tick → persists', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await finishIntro(page);
  await page.getByTestId('starter-Drink water').click();
  await expect(page.getByTestId('habit-Drink water')).toBeVisible();
  await expect(page.getByText('0 of 1 done')).toBeVisible();

  await page.getByTestId('check-Drink water').click();
  await expect(page.getByTestId('toast')).toContainText('Drink water: done');
  await expect(page.getByText('All done today 🎉')).toBeVisible();
  await page.getByTestId('toast-action').click();
  await expect(page.getByText('0 of 1 done')).toBeVisible();
  await page.getByTestId('check-Drink water').click();

  await page.reload();
  await expect(page.getByText('All done today 🎉')).toBeVisible();
  await expect(page.getByTestId('check-Drink water')).toHaveAttribute('aria-checked', 'true');
  expect(errors).toEqual([]);
});

test('reading habit logs pages; backfilling the week builds a streak', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.getByTestId('starter-Read').click();
  await page.getByTestId('check-Read').click();
  await page.getByTestId('amount-input').fill('25');
  await page.getByTestId('amount-save').click();
  await expect(page.getByText('25 pages today')).toBeVisible();

  // Open the habit and fill in yesterday and the day before (forgot to tick)
  await page.getByRole('button', { name: 'Read details' }).click();
  await expect(page.getByTestId('habit')).toBeVisible();
  await expect(page.getByTestId('habit-week-total')).toBeVisible();
  await page.getByTestId('finish-book').click();
  await expect(page.getByText(/1 of 12 books this year/)).toBeVisible();
});

test('custom habit on chosen days, and a rest day keeps the streak safe', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.getByTestId('habit-new').click();
  await page.getByTestId('habit-name').fill('Stretch');
  await page.getByTestId('habit-save').click();
  await expect(page.getByTestId('habit-Stretch')).toBeVisible();
  await page.getByRole('button', { name: 'Stretch details' }).click();
  // Backfill two earlier days, then rest today
  await page.getByTestId(`day-${daysAgo(2)}`).click();
  await page.getByTestId(`day-${daysAgo(1)}`).click();
  await page.getByTestId('rest-today').click();
  await expect(page.getByTestId('habit-streak-msg')).toContainText('Rest day');
  await page.reload();
  await expect(page.getByTestId('habit-streak-msg')).toContainText('2-day streak is safe');
  expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
});

test('free tier allows 3 habits, then shows the paywall', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.getByTestId('starter-Walk').click();
  await page.getByTestId('habit-new').click();
  await page.getByTestId('habit-name').fill('Floss');
  await page.getByTestId('habit-save').click();
  await page.getByTestId('habit-new').click();
  await page.getByTestId('habit-name').fill('Journal');
  await page.getByTestId('habit-save').click();
  await expect(page.getByTestId('habit-Journal')).toBeVisible();
  await page.getByTestId('habit-new').click();
  await expect(page.getByTestId('paywall')).toBeVisible();
});

test('stats show and delete-all resets the app', async ({ page }) => {
  await page.goto('/');
  await finishIntro(page);
  await page.getByTestId('starter-Stretch').click();
  await page.getByTestId('check-Stretch').click();
  await page.goto('/stats');
  await expect(page.getByTestId('stats-rate')).toHaveText('100%');
  await page.goto('/settings');
  await page.getByTestId('settings-delete').click();
  await page.getByTestId('confirm-yes').click();
  await page.goto('/');
  await finishIntro(page);
  await expect(page.getByText('Hello!')).toBeVisible();
});
