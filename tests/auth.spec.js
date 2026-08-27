import { test, expect } from '@playwright/test';
import { loginViaLocalStorage } from './helpers.js';

test.describe('Flujo de Autenticación', () => {
  test('debería iniciar sesión a través de localStorage y ver el dashboard', async ({ page }) => {
    await loginViaLocalStorage(page);

    // Esperar la redirección al dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Verificar que el contenido del dashboard sea visible
    await expect(page.getByText(/Supervisión Ejecutiva/i).first()).toBeVisible();
  });
});
