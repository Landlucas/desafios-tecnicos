import { expect, test, type Page } from '@playwright/test'

async function addTask(page: Page, id: string, title: string) {
  await page.getByRole('textbox', { name: 'Task ID' }).fill(id)
  await page.getByRole('textbox', { name: 'Task title' }).fill(title)
  await page.getByRole('button', { name: 'Add task' }).click()
}

async function moveTask(page: Page, title: string, destination: string) {
  const task = page.getByRole('listitem').filter({
    has: page.getByRole('heading', { name: title, exact: true }),
  })
  await task.getByRole('combobox', { name: 'Move to' }).selectOption({ label: destination })
  await task.getByRole('button', { name: 'Move', exact: true }).click()
}

test('Undo skips a rejected move and reverses a move before a creation', async ({ page }) => {
  await page.goto('/')
  const limit = page.getByRole('spinbutton', { name: 'In Progress limit' })
  await expect(limit).toHaveValue('2')
  await limit.fill('1')
  await page.getByRole('button', { name: 'Start board' }).click()

  const todo = page.getByRole('region', { name: 'To Do', exact: true })
  const progress = page.getByRole('region', { name: 'In Progress', exact: true })
  const undo = page.getByRole('button', { name: 'Undo', exact: true })
  const feedback = page.getByRole('status')

  await expect(undo).toBeDisabled()
  await expect(progress).toContainText('0 / 1')
  await addTask(page, 'DOC-01', 'Docs')
  await addTask(page, 'REV-02', 'Review')
  await expect(todo.getByRole('list').getByRole('heading', { level: 3 })).toHaveText(['Docs', 'Review'])
  await expect(undo).toBeEnabled()

  await moveTask(page, 'Review', 'In Progress')
  await expect(progress.getByRole('heading', { name: 'Review' })).toBeVisible()
  await expect(progress).toContainText('1 / 1')
  await moveTask(page, 'Docs', 'In Progress')
  await expect(feedback).toContainText(/failed.*In Progress is full/i)
  await expect(todo.getByRole('heading', { name: 'Docs' })).toBeVisible()
  await expect(progress.getByRole('heading', { name: 'Review' })).toBeVisible()

  await undo.click()
  await expect(feedback).toContainText(/success.*undid the move/i)
  await expect(todo.getByRole('list').getByRole('heading', { level: 3 })).toHaveText(['Docs', 'Review'])
  await expect(progress).toContainText('0 / 1')

  await undo.click()
  await expect(feedback).toContainText(/success.*undid the creation/i)
  await expect(page.getByRole('heading', { name: 'Review', exact: true })).toHaveCount(0)
  await expect(todo.getByRole('heading', { name: 'Docs' })).toBeVisible()
  await expect(undo).toBeEnabled()
  await undo.click()
  await expect(undo).toBeDisabled()
})

test('keyboard submission, no-change feedback, and refresh reset', async ({ page }) => {
  await page.goto('/')
  const limit = page.getByRole('spinbutton', { name: 'In Progress limit' })
  await limit.press('Enter')
  const id = page.getByRole('textbox', { name: 'Task ID' })
  const title = page.getByRole('textbox', { name: 'Task title' })
  await expect(id).toBeFocused()
  await id.fill('K-01')
  await id.press('Tab')
  await expect(title).toBeFocused()
  await page.keyboard.type('Keyboard task')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('status')).toContainText('Success')
  await expect(id).toHaveValue('')
  await expect(title).toHaveValue('')
  await expect(id).toBeFocused()

  await addTask(page, 'K-01', 'Duplicate draft')
  await expect(page.getByRole('status')).toContainText(/failed.*already in use/i)
  await expect(id).toHaveValue('K-01')
  await expect(title).toHaveValue('Duplicate draft')

  await id.clear()
  await title.clear()
  await page.getByRole('button', { name: 'Add task' }).click()
  await expect(page.getByRole('status')).toContainText(/failed.*enter a task ID and title/i)
  await expect(page.getByRole('heading', { name: 'Keyboard task' })).toHaveCount(1)
  await moveTask(page, 'Keyboard task', 'To Do')
  await expect(page.getByRole('status')).toContainText(/no change.*already/i)
  const moveTo = page.getByRole('combobox', { name: 'Move to' })
  await moveTo.selectOption({ label: 'In Progress' })
  await page.getByRole('button', { name: 'Move', exact: true }).press('Enter')
  const progress = page.getByRole('region', { name: 'In Progress', exact: true })
  await expect(progress.getByRole('heading', { name: 'Keyboard task' })).toBeVisible()
  await expect(progress.getByRole('combobox', { name: 'Move to' })).toBeFocused()
  await page.reload()
  await expect(limit).toHaveValue('2')
  await page.getByRole('button', { name: 'Start board' }).click()
  await expect(page.getByRole('heading', { name: 'Keyboard task' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Undo' })).toBeDisabled()
})
