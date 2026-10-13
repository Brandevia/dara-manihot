import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CopyButton } from '@/components/copy-button'

afterEach(() => vi.restoreAllMocks())

describe('CopyButton', () => {
  it('copies the value and announces success', async () => {
    const user = userEvent.setup()
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue()
    render(<CopyButton value="info@example.com" label="email address" />)
    await user.click(screen.getByRole('button', { name: 'Copy email address' }))
    expect(writeText).toHaveBeenCalledWith('info@example.com')
    expect(await screen.findByRole('status')).toHaveTextContent(
      'email address copied',
    )
  })

  it('does not claim success when the clipboard is unavailable', async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new Error('denied'),
    )
    render(<CopyButton value="x" label="email address" />)
    await user.click(screen.getByRole('button', { name: 'Copy email address' }))
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })
})
