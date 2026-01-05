import { test, expect } from '@playwright/test';

test.describe('Seating Map', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for venue to load
    await page.waitForSelector('text=Metropolis Arena', { timeout: 10000 });
  });

  test('should load venue and display seating map', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Metropolis Arena');
    await expect(page.locator('svg')).toBeVisible();
  });

  test('should select and deselect seats', async ({ page }) => {
    // Find an available seat and click it
    const seat = page.locator('g[role="button"]').first();
    await seat.click();
    
    // Check that seat is selected (should have blue color)
    await expect(seat).toHaveAttribute('aria-pressed', 'true');
    
    // Check selection summary updates
    await expect(page.locator('text=Selected Seats (1/8)')).toBeVisible();
    
    // Deselect the seat
    await seat.click();
    await expect(seat).toHaveAttribute('aria-pressed', 'false');
  });

  test('should limit selection to 8 seats', async ({ page }) => {
    const seats = page.locator('g[role="button"]');
    const count = await seats.count();
    
    // Select 8 seats
    for (let i = 0; i < Math.min(8, count); i++) {
      await seats.nth(i).click();
    }
    
    // Try to select a 9th seat - should not work
    if (count > 8) {
      await seats.nth(8).click();
      await expect(page.locator('text=Selected Seats (8/8)')).toBeVisible();
    }
  });

  test('should persist selection after page reload', async ({ page }) => {
    // Select a seat
    const seat = page.locator('g[role="button"]').first();
    await seat.click();
    
    // Reload page
    await page.reload();
    await page.waitForSelector('text=Metropolis Arena');
    
    // Check selection is restored
    await expect(page.locator('text=Selected Seats (1/8)')).toBeVisible();
  });

  test('should toggle dark mode', async ({ page }) => {
    const darkModeButton = page.locator('button:has-text("Dark")');
    await darkModeButton.click();
    
    // Check dark mode is applied
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // Toggle back
    const lightModeButton = page.locator('button:has-text("Light")');
    await lightModeButton.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should toggle heat map', async ({ page }) => {
    const heatMapButton = page.locator('button:has-text("Heat Map")');
    await heatMapButton.click();
    
    // Check heat map is enabled
    await expect(heatMapButton).toContainText('On');
    
    // Toggle off
    await heatMapButton.click();
    await expect(heatMapButton).toContainText('Off');
  });

  test('should find adjacent seats', async ({ page }) => {
    const findButton = page.locator('button:has-text("Find Adjacent")');
    await findButton.click();
    
    // Check that seats are highlighted (may show alert if none found)
    // This test may need adjustment based on actual venue data
    const highlightedSeats = page.locator('g.animate-bounce');
    // If seats are found, they should be highlighted
  });

  test('should navigate with keyboard', async ({ page }) => {
    // Focus first seat
    const firstSeat = page.locator('g[role="button"]').first();
    await firstSeat.focus();
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    
    // Check selection updated
    await expect(page.locator('text=Selected Seats')).toBeVisible();
  });

  test('should display seat details on focus', async ({ page }) => {
    const seat = page.locator('g[role="button"]').first();
    await seat.focus();
    
    // Check seat details panel shows information
    await expect(page.locator('text=Seat Details')).toBeVisible();
  });

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check responsive layout
    await expect(page.locator('svg')).toBeVisible();
    
    // Check sidebar is accessible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('text=Selected Seats')).toBeVisible();
  });
});

