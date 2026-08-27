import { test, expect } from '@playwright/test';
import { loginViaLocalStorage } from './helpers.js';

test.describe('Vista del Panel de Control (Dashboard)', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaLocalStorage(page);
  });

  test('debería mostrar correctamente los componentes principales del dashboard', async ({ page }) => {
    // Verificar que los textos principales estén
    await expect(page.getByText(/Supervisión Ejecutiva/i).first()).toBeVisible();
    await expect(page.getByText(/Histórico General/i).first()).toBeVisible();
    await expect(page.getByText(/Panorama de proyectos/i).first()).toBeVisible();

    // Navegar usando la barra lateral a otra vista para asegurar que el router funciona
    const proyMenu = page.getByRole('button', { name: /Proyectos/i }).first();
    await proyMenu.click();
    await expect(page.getByText('+ Asignar Nuevo Proyecto').first()).toBeVisible();
  });
});
