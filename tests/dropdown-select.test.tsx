import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type DropdownOption,
  DropdownSelect,
} from '@/components/ui/dropdown-select'

const OPTIONS: DropdownOption[] = [
  { value: 'general', label: 'General enquiry', group: 'General' },
  { value: 'farm', label: 'Farm planning', group: 'Sustainable Agriculture' },
  {
    value: 'cassava',
    label: 'Cassava processing',
    group: 'Sustainable Agriculture',
  },
  {
    value: 'solar',
    label: 'Solar and renewables',
    group: 'Sustainable Energy',
  },
  { value: 'hydrogen', label: 'Green hydrogen', group: 'Sustainable Energy' },
]

/** A controlled host, the way the enquiry form uses it. */
function Host({
  initial = '',
  onChange = () => {},
  ...rest
}: {
  initial?: string
  onChange?: (v: string) => void
  disabled?: boolean
  invalid?: boolean
}) {
  const [value, setValue] = useState(initial)
  return (
    <form>
      <label htmlFor="svc">Service of interest</label>
      <DropdownSelect
        id="svc"
        name="service"
        placeholder="Select a service"
        options={OPTIONS}
        value={value}
        disabled={rest.disabled}
        aria-invalid={rest.invalid}
        aria-describedby="svc-error"
        onValueChange={(v) => {
          setValue(v)
          onChange(v)
        }}
      />
      <button type="button">after</button>
    </form>
  )
}

function EndAligned() {
  const [value, setValue] = useState('')
  return (
    <DropdownSelect
      id="svc"
      placeholder="Select a service"
      options={OPTIONS}
      value={value}
      onValueChange={setValue}
      align="end"
    />
  )
}

const trigger = () => screen.getByRole('combobox')
const listbox = () => screen.getByRole('listbox')
const closed = () =>
  waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
const key = (k: string, init: object = {}) =>
  fireEvent.keyDown(trigger(), { key: k, ...init })
const activeLabel = () => {
  const id = trigger().getAttribute('aria-activedescendant')
  return id ? document.getElementById(id)?.textContent : null
}

describe('DropdownSelect on a touch device', () => {
  it('keeps the native picker, grouped, with a placeholder', () => {
    const onChange = vi.fn()
    render(<Host onChange={onChange} />)
    const select = screen.getByLabelText(/service of interest/i)
    expect(select.tagName).toBe('SELECT')
    expect(document.querySelector('button#svc')).toBeNull()
    expect(
      [...document.querySelectorAll('optgroup')].map((g) => g.label),
    ).toEqual(['General', 'Sustainable Agriculture', 'Sustainable Energy'])
    expect(
      screen.getByRole('option', { name: 'Select a service' }),
    ).toBeTruthy()

    fireEvent.change(select, { target: { value: 'solar' } })
    expect(onChange).toHaveBeenCalledWith('solar')
    expect((select as HTMLSelectElement).value).toBe('solar')
  })

  it('forwards the aria attributes to the native control', () => {
    render(<Host invalid />)
    const select = screen.getByLabelText(/service of interest/i)
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select).toHaveAttribute('aria-describedby', 'svc-error')
  })
})

describe('DropdownSelect with a mouse', () => {
  beforeEach(() => {
    window.__finePointer = true
  })
  afterEach(() => {
    window.__finePointer = false
  })

  describe('structure and accessibility', () => {
    it('is a labelled combobox button that shows the placeholder, with the list closed', () => {
      render(<Host />)
      const t = screen.getByLabelText(/service of interest/i)
      expect(t).toBe(trigger())
      expect(t.tagName).toBe('BUTTON')
      expect(t).toHaveAttribute('type', 'button') // must never submit the form
      expect(t).toHaveAttribute('id', 'svc')
      expect(t).toHaveAttribute('aria-haspopup', 'listbox')
      expect(t).toHaveAttribute('aria-expanded', 'false')
      expect(t).not.toHaveAttribute('aria-controls')
      expect(t).toHaveTextContent('Select a service')
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('shows the chosen option instead of the placeholder', () => {
      render(<Host initial="hydrogen" />)
      expect(trigger()).toHaveTextContent('Green hydrogen')
      expect(trigger()).toHaveAttribute('data-value', 'hydrogen')
      expect(trigger()).not.toHaveTextContent('Select a service')
    })

    it('forwards aria-invalid and aria-describedby', () => {
      render(<Host invalid />)
      expect(trigger()).toHaveAttribute('aria-invalid', 'true')
      expect(trigger()).toHaveAttribute('aria-describedby', 'svc-error')
    })

    it('lists every option under its group heading', () => {
      render(<Host />)
      fireEvent.click(trigger())
      expect(trigger()).toHaveAttribute('aria-expanded', 'true')
      expect(trigger()).toHaveAttribute('aria-controls', listbox().id)
      expect(within(listbox()).getAllByRole('option')).toHaveLength(
        OPTIONS.length,
      )
      const groups = within(listbox()).getAllByRole('group')
      expect(groups.map((g) => g.getAttribute('aria-labelledby'))).toSatisfy(
        (ids: (string | null)[]) =>
          ids.every((id) => id && document.getElementById(id)),
      )
      for (const heading of [
        'General',
        'Sustainable Agriculture',
        'Sustainable Energy',
      ])
        expect(within(listbox()).getByText(heading)).toBeTruthy()
    })

    it('marks the chosen row as selected and starts on it', () => {
      render(<Host initial="cassava" />)
      fireEvent.click(trigger())
      const options = within(listbox()).getAllByRole('option')
      expect(options.map((o) => o.getAttribute('aria-selected'))).toEqual([
        'false',
        'false',
        'true',
        'false',
        'false',
      ])
      expect(activeLabel()).toBe('Cassava processing')
    })
  })

  describe('mouse', () => {
    it('opens on click and closes on a second click', async () => {
      render(<Host />)
      fireEvent.click(trigger())
      expect(listbox()).toBeTruthy()
      fireEvent.click(trigger())
      await closed()
      expect(trigger()).toHaveAttribute('aria-expanded', 'false')
    })

    it('chooses an option, reports it, closes, and keeps focus on the field', async () => {
      const onChange = vi.fn()
      render(<Host onChange={onChange} />)
      fireEvent.click(trigger())
      fireEvent.click(
        screen.getByRole('option', { name: 'Solar and renewables' }),
      )
      expect(onChange).toHaveBeenCalledExactlyOnceWith('solar')
      await closed()
      expect(trigger()).toHaveTextContent('Solar and renewables')
      expect(trigger()).toHaveFocus()
    })

    it('highlights the row under the pointer', () => {
      render(<Host />)
      fireEvent.click(trigger())
      fireEvent.pointerMove(
        screen.getByRole('option', { name: 'Green hydrogen' }),
      )
      expect(activeLabel()).toBe('Green hydrogen')
    })

    it('does not steal focus from the field when pressing a row', () => {
      render(<Host />)
      fireEvent.click(trigger())
      const notPrevented = fireEvent.mouseDown(
        screen.getByRole('option', { name: 'Farm planning' }),
      )
      expect(notPrevented).toBe(false) // default prevented
    })

    it('closes on a press outside, but not inside the list', async () => {
      render(<Host />)
      fireEvent.click(trigger())
      fireEvent.pointerDown(listbox())
      expect(screen.getByRole('listbox')).toBeTruthy()
      fireEvent.pointerDown(document.body)
      await closed()
    })

    it('a click on the field’s label toggles the list once (it is not closed then reopened)', async () => {
      render(<Host />)
      const label = screen.getByText('Service of interest')
      fireEvent.click(label)
      expect(screen.getByRole('listbox')).toBeTruthy()
      fireEvent.pointerDown(label)
      fireEvent.click(label)
      await closed()
    })
  })

  describe('keyboard', () => {
    it.each(['ArrowDown', 'ArrowUp', 'Enter', ' '])(
      '%j opens the list',
      (k) => {
        render(<Host />)
        key(k)
        expect(listbox()).toBeTruthy()
        expect(activeLabel()).toBe('General enquiry')
      },
    )

    it('Home and End open on the first and last row', () => {
      const { unmount } = render(<Host />)
      key('End')
      expect(activeLabel()).toBe('Green hydrogen')
      unmount()
      render(<Host />)
      key('Home')
      expect(activeLabel()).toBe('General enquiry')
    })

    it('arrows move the highlight and stop at the ends', () => {
      render(<Host />)
      key('ArrowDown')
      key('ArrowUp')
      expect(activeLabel()).toBe('General enquiry')
      for (let i = 0; i < 10; i++) key('ArrowDown')
      expect(activeLabel()).toBe('Green hydrogen')
      key('Home')
      expect(activeLabel()).toBe('General enquiry')
      key('End')
      expect(activeLabel()).toBe('Green hydrogen')
    })

    it('moves through rows in the order they are drawn, across groups', () => {
      render(<Host />)
      key('ArrowDown')
      const seen = [activeLabel()]
      for (let i = 0; i < 4; i++) {
        key('ArrowDown')
        seen.push(activeLabel())
      }
      expect(seen).toEqual([
        'General enquiry',
        'Farm planning',
        'Cassava processing',
        'Solar and renewables',
        'Green hydrogen',
      ])
    })

    it.each(['Enter', ' '])('%j chooses the highlighted row', async (k) => {
      const onChange = vi.fn()
      render(<Host onChange={onChange} />)
      key('ArrowDown')
      key('ArrowDown')
      key(k)
      expect(onChange).toHaveBeenCalledExactlyOnceWith('farm')
      await closed()
      expect(trigger()).toHaveTextContent('Farm planning')
    })

    it('Alt+ArrowUp chooses and closes', async () => {
      const onChange = vi.fn()
      render(<Host onChange={onChange} />)
      key('End')
      key('ArrowUp', { altKey: true })
      expect(onChange).toHaveBeenCalledWith('hydrogen')
      await closed()
    })

    it('Escape closes without changing the value', async () => {
      const onChange = vi.fn()
      render(<Host initial="solar" onChange={onChange} />)
      key('ArrowDown')
      key('ArrowDown')
      key('Escape')
      await closed()
      expect(onChange).not.toHaveBeenCalled()
      expect(trigger()).toHaveTextContent('Solar and renewables')
    })

    it('Tab closes without changing the value', async () => {
      const onChange = vi.fn()
      render(<Host onChange={onChange} />)
      key('ArrowDown')
      key('ArrowDown')
      key('Tab')
      await closed()
      expect(onChange).not.toHaveBeenCalled()
    })

    describe('type-ahead', () => {
      afterEach(() => vi.useRealTimers())

      it('jumps to a label by its first letters, and opens the list to show it', () => {
        render(<Host />)
        key('g')
        expect(activeLabel()).toBe('General enquiry')
        key('r')
        expect(activeLabel()).toBe('Green hydrogen') // "gr", not "general"
      })

      it('searches on from the highlighted row when the list is already open', () => {
        render(<Host />)
        fireEvent.click(trigger())
        key('s') // Solar and renewables
        expect(activeLabel()).toBe('Solar and renewables')
      })

      it('starts a new search after a pause', () => {
        vi.useFakeTimers()
        render(<Host />)
        key('g')
        key('r')
        expect(activeLabel()).toBe('Green hydrogen')
        vi.advanceTimersByTime(700)
        key('c')
        expect(activeLabel()).toBe('Cassava processing')
      })

      it('ignores a letter that matches nothing', () => {
        render(<Host />)
        key('z')
        expect(screen.queryByRole('listbox')).toBeNull()
      })

      it('ignores shortcuts such as Ctrl+C', () => {
        render(<Host />)
        key('c', { ctrlKey: true })
        expect(screen.queryByRole('listbox')).toBeNull()
      })
    })
  })

  describe('where the list opens', () => {
    afterEach(() => vi.restoreAllMocks())

    /** jsdom has no layout, so say where the field is on a 768px tall screen. */
    const fieldAt = (top: number, bottom: number) =>
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
        top,
        bottom,
        left: 0,
        right: 200,
        width: 200,
        height: bottom - top,
        x: 0,
        y: top,
        toJSON: () => ({}),
      })
    const panel = () => listbox().parentElement as HTMLElement

    it('opens below, as tall as the content needs, when there is room', () => {
      fieldAt(100, 148)
      render(<Host />)
      fireEvent.click(trigger())
      expect(panel()).toHaveClass('top-full')
      expect(listbox().style.maxHeight).toBe('416px')
    })

    it('opens below but never taller than the room left under the field', () => {
      // 768 - 500 = 268px below, less the 16px gap from the screen edge.
      fieldAt(452, 500)
      render(<Host />)
      fireEvent.click(trigger())
      expect(panel()).toHaveClass('top-full')
      expect(listbox().style.maxHeight).toBe('252px')
    })

    it('opens upwards when the field is near the bottom of the screen', () => {
      fieldAt(652, 700)
      render(<Host />)
      fireEvent.click(trigger())
      expect(panel()).toHaveClass('bottom-full')
      expect(panel()).not.toHaveClass('top-full')
      expect(listbox().style.maxHeight).toBe('416px')
    })

    it('stays below when it is cramped but there is even less room above', () => {
      fieldAt(100, 560)
      render(<Host />)
      fireEvent.click(trigger())
      expect(panel()).toHaveClass('top-full')
    })

    it('is wider than a narrow field, never narrower, and never wider than the screen', () => {
      fieldAt(100, 148)
      render(<Host />)
      fireEvent.click(trigger())
      expect(panel()).toHaveClass(
        'w-88',
        'min-w-full',
        'max-w-[calc(100vw-2rem)]',
      )
    })

    it('can line up with the right edge instead, for a field at the edge of its card', () => {
      render(<EndAligned />)
      fireEvent.click(trigger())
      expect(panel()).toHaveClass('right-0')
      expect(panel()).not.toHaveClass('left-0')
    })

    it('lines up with the field’s left edge by default', () => {
      fieldAt(100, 148)
      render(<Host />)
      fireEvent.click(trigger())
      expect(panel()).toHaveClass('left-0')
    })
  })

  describe('disabled', () => {
    it('does not open by click or keyboard', () => {
      render(<Host disabled />)
      expect(trigger()).toBeDisabled()
      fireEvent.click(trigger())
      key('ArrowDown')
      expect(screen.queryByRole('listbox')).toBeNull()
    })
  })

  it('switches to the native picker if the mouse goes away (e.g. tablet detached from a keyboard)', () => {
    const { rerender } = render(<Host />)
    expect(document.getElementById('svc')?.tagName).toBe('BUTTON')
    window.__finePointer = false
    // useSyncExternalStore re-reads the snapshot on the next render.
    rerender(<Host />)
    expect(document.getElementById('svc')?.tagName).toBe('SELECT')
  })
})
