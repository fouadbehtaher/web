const { test, expect } = require("@playwright/test");

test("dashboard admin controls work end-to-end", async ({ page }) => {
  const ruleName = `Playwright UI Block ${Date.now()}`;

  await page.goto("http://localhost:3000/dashboard");

  await expect(page.getByRole("heading", { name: "Sign In To Manage The WAF" })).toBeVisible();

  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("Admin123!");
  await page.getByRole("button", { name: "Sign In" }).click();

  await expect(page.locator("#auth-overlay")).toBeHidden();
  await expect(page.locator("#auth-state")).toContainText("Admin: admin");

  await page.getByLabel("Rule Name").fill(ruleName);
  await page.getByLabel("Action").selectOption("block");
  await page.getByLabel("Field").selectOption("path");
  await page.getByLabel("Operator").selectOption("startsWith");
  await page.getByLabel("Value").fill("/playwright-admin");
  await page.getByRole("button", { name: "Add Policy" }).click();

  await expect(page.locator("#policy-feedback")).toContainText("Policy added successfully.");
  await expect(page.locator("#policy-list")).toContainText(ruleName);

  await page.locator("#lab-url").fill("/playwright-admin/panel");
  await page.getByRole("button", { name: "Classify Request" }).click();

  await expect(page.locator("#lab-summary")).toContainText("Decision: BLOCK");
  await expect(page.locator("#lab-output")).toContainText("\"matchedPolicy\"");

  await page.locator("#policy-filter").fill(ruleName);
  await expect(page.locator("#policy-list")).toContainText(ruleName);

  const policyCard = page.locator(".policy-item", { hasText: ruleName });
  await policyCard.getByRole("button", { name: "Disable" }).click();
  await expect(policyCard).toContainText("inactive");

  await policyCard.getByRole("button", { name: "Delete" }).click();
  await expect(page.locator("#policy-list")).not.toContainText(ruleName);

  await page.getByRole("button", { name: "Clear Logs" }).click();
  await expect(page.locator("#events-table")).toContainText("No matching events found.");

  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByRole("heading", { name: "Sign In To Manage The WAF" })).toBeVisible();
});
