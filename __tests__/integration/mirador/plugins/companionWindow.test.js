describe('add plugins for companion windows', () => {
  beforeAll(async () => {
    await page.goto('http://127.0.0.1:4488/__tests__/integration/mirador/plugins/companionWindow.html');
    await expect(page).toMatchElement('.mirador-viewer');
  });

  it.skip('added a plugin to the window sidebar and companion window', async () => {
    await expect(page).toClick('button[aria-label="Toggle sidebar"]');

    await expect(page).toMatchElement('.mirador-companion-window-left.mirador-window-sidebar-info-panel');
    await expect(page).toMatchElement('#add-plugin-companion-window-button');

    await expect(page).toClick('#add-plugin-companion-window-button');
    await expect(page).toMatchElement('#add-plugin-companion-window', { timeout: 20000 });
  }, 20000);
});
