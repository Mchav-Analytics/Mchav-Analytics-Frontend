import { test, expect } from '@playwright/test';
import { loginViaLocalStorage } from './helpers.js';

test.describe('Vista del Dashboard de Proyectos', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaLocalStorage(page);
    await page.goto('/proyectos');
  });

  test('debería mostrar el Dashboard de Proyectos sin errores', async ({ page }) => {
    // Navegar a proyectos
    await page.getByRole('button', { name: /Ver todos los proyectos/i }).click();
    await expect(page.getByText('+ Asignar Nuevo Proyecto').first()).toBeVisible();
  });
});
