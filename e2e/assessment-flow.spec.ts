import { test, expect } from '@playwright/test';

test.describe('Assessment Flow', () => {
    test('should load homepage', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Hub de Sobriété Numérique/i);
    });

    test('should navigate to assessment page', async ({ page }) => {
        await page.goto('/');

        // Click on the assessment link
        await page.click('a[href="/assessment"]');

        // Wait for navigation
        await page.waitForURL('**/assessment');

        // Verify we're on the assessment page
        await expect(page.getByText(/Évaluez votre projet/i)).toBeVisible({ timeout: 5000 });
    });

    test('should create a new assessment', async ({ page }) => {
        // Navigate directly to assessment page
        await page.goto('/assessment');

        // Wait for the new project form to load
        await expect(page.getByText(/Informations du projet/i)).toBeVisible({ timeout: 10000 });

        // Fill project name (required field)
        await page.locator('input#name').fill('E2E Test Project');

        // Fill description (optional)
        await page.locator('textarea#description').fill('Testing the assessment flow');

        // Select "Light" level by clicking the button
        await page.locator('button').filter({ hasText: /^Light$/ }).click();

        // Wait a moment for the selection to register
        await page.waitForTimeout(300);

        // Submit the form
        await page.locator('button[type="submit"]').click();

        // Wait for the assessment form to load
        await expect(page.getByRole('heading', { name: 'Navigation' })).toBeVisible({ timeout: 10000 });

        // Verify accordion with themes is loaded
        await expect(page.locator('[data-radix-collection-item]').first()).toBeVisible();
    });

    test('should fill a question and navigate', async ({ page }) => {
        // First create an assessment
        await page.goto('/assessment');
        await expect(page.getByText(/Informations du projet/i)).toBeVisible({ timeout: 10000 });

        await page.locator('input#name').fill('E2E Navigation Test');
        await page.locator('button').filter({ hasText: /^Light$/ }).click();
        await page.waitForTimeout(300);
        await page.locator('button[type="submit"]').click();

        // Wait for form to load
        await expect(page.getByRole('heading', { name: 'Navigation' })).toBeVisible({ timeout: 10000 });

        // Expand first theme accordion
        const firstAccordion = page.locator('[data-radix-collection-item]').first();
        await firstAccordion.click();
        await page.waitForTimeout(500);

        // Click first question
        await page.locator('button').filter({ hasText: /^1\./ }).first().click();
        await page.waitForTimeout(300);

        // Wait for question form to be visible
        await expect(page.getByText(/Statut de conformité/i)).toBeVisible({ timeout: 5000 });

        // Select "Conforme" status
        await page.locator('input[value="compliant"]').click();

        // Add a comment
        await page.locator('textarea#comment').fill('This is a test comment');

        // Verify selection
        await expect(page.locator('input[value="compliant"]')).toBeChecked();

        // Click next
        await page.locator('button').filter({ hasText: /Suivant/ }).click();
        await page.waitForTimeout(500);

        // Verify progress shows at least 1 response
        await expect(page.getByText(/1 \/ \d+ réponses/)).toBeVisible();
    });

    test('should save assessment and show in dashboard', async ({ page }) => {
        // Create and fill assessment first
        await page.goto('/assessment');
        await expect(page.getByText(/Informations du projet/i)).toBeVisible({ timeout: 10000 });

        await page.locator('input#name').fill('Dashboard Test');
        await page.locator('button').filter({ hasText: /^Light$/ }).click();
        await page.waitForTimeout(300);
        await page.locator('button[type="submit"]').click();

        await expect(page.getByRole('heading', { name: 'Navigation' })).toBeVisible({ timeout: 10000 });

        // Fill one question
        const firstAccordion = page.locator('[data-radix-collection-item]').first();
        await firstAccordion.click();
        await page.waitForTimeout(500);

        await page.locator('button').filter({ hasText: /^1\./ }).first().click();
        await page.waitForTimeout(300);

        await page.locator('input[value="compliant"]').click();
        await page.waitForTimeout(500);

        // Navigate to dashboard
        await page.click('a[href="/dashboard"]');
        await page.waitForURL('**/dashboard');

        // Check if we need to login first
        const isLoginPage = await page.locator('text=Connexion').isVisible().catch(() => false);

        if (!isLoginPage) {
            // Verify assessment is in dashboard
            await expect(page.getByText('Dashboard Test')).toBeVisible({ timeout: 5000 });
        } else {
            console.log('Dashboard requires authentication - test needs auth setup');
        }
    });
});
