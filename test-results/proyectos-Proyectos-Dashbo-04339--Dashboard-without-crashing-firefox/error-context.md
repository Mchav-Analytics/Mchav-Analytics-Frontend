# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: proyectos.spec.js >> Proyectos Dashboard View >> should render Proyectos Dashboard without crashing
- Location: tests\proyectos.spec.js:10:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Test timeout of 30000ms exceeded.
Call log:
  - navigating to "http://localhost:5173/dashboard", waiting until "load"

```

# Test source

```ts
  1  | // Helper to login via localStorage bypass
  2  | export async function loginViaLocalStorage(page) {
  3  |   await page.addInitScript(() => {
  4  |     window.localStorage.setItem('mock_user_session', JSON.stringify({
  5  |       id: 1,
  6  |       nombre: 'Admin Test',
  7  |       rol: 'ADMIN',
  8  |       email: 'admin@mchav.com'
  9  |     }));
  10 |     window.localStorage.setItem('custom_user_projects', JSON.stringify([
  11 |       { id: 'PROJ-01', key: 'PROJ-01', name: 'Proyecto Test', progreso: 50, color: '#000000', tasksCompleted: 5, tasksTotal: 10 }
  12 |     ]));
  13 |   });
  14 |   // Navigate directly to dashboard now that we are logged in
> 15 |   await page.goto('/dashboard');
     |              ^ Error: page.goto: Test timeout of 30000ms exceeded.
  16 | }
  17 | 
```