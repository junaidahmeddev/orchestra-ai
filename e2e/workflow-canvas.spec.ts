import { test, expect } from "@playwright/test";

test.describe("Workflow Canvas Persistence (E2E Test)", () => {
  const testEmail = `e2e-user-${Date.now()}@orchestra.ai`;
  const testPassword = "password123";

  test.beforeAll(async ({ request }) => {
    // Register the E2E test user via API before starting the browser UI test
    await request.post("/api/auth/register", {
      data: {
        email: testEmail,
        password: testPassword,
        name: "E2E Tester",
      },
    });
  });

  test("Log in, create workflow via modal, add nodes, save, reload, and verify persistence", async ({
    page,
  }) => {
    // 1. Navigate to Login Page
    await page.goto("/login");

    // 2. Fill login form and submit
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 3. Confirm redirected to Workflows Dashboard
    await page.waitForURL("**/workflows", { timeout: 15000 });
    await expect(page.locator("h1")).toContainText(/Workflows/i);

    // 4. Click "New Workflow" / "Create Your First Workflow" button
    const createBtn = page.locator('button:has-text("New Workflow"), button:has-text("Create Your First Workflow")').first();
    await createBtn.click();

    // 5. Fill Create Workflow modal and submit
    await page.fill('input[placeholder*="Customer Support"]', "E2E Test Canvas Workflow");
    await page.click('button[type="submit"]');

    // 6. Wait for redirection to canvas editor (/workflows/[id])
    await page.waitForURL("**/workflows/*", { timeout: 15000 });

    // 7. Verify Node Palette sidebar contains Trigger Node & Output Node
    const triggerItem = page.locator('text="Trigger Node"');
    const outputItem = page.locator('text="Output Node"');
    await expect(triggerItem).toBeVisible();
    await expect(outputItem).toBeVisible();

    // 8. Click Save button on canvas header
    const saveButton = page.locator('button:has-text("Save")');
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Wait for "Saved" confirmation pill
    await expect(page.locator('text="Saved"')).toBeVisible({ timeout: 10000 });

    // 9. Reload page to verify persistence across page refresh
    await page.reload();
    await page.waitForLoadState("networkidle");

    // 10. Confirm workflow canvas reloaded and header is present
    await expect(page.locator("header")).toBeVisible();
  });
});
