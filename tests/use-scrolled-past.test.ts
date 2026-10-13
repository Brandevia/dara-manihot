import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useScrolledPast } from '@/hooks/use-scrolled-past'

const setY = (y: number) =>
  act(() => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
    window.dispatchEvent(new Event('scroll'))
  })

describe('useScrolledPast', () => {
  it('flips at the threshold', () => {
    setY(0)
    const { result } = renderHook(() => useScrolledPast(100))
    expect(result.current).toBe(false)
    setY(100)
    expect(result.current).toBe(false)
    setY(101)
    expect(result.current).toBe(true)
    setY(0)
    expect(result.current).toBe(false)
  })

  it('re-renders only when the boolean flips, not on every scroll event', () => {
    setY(0)
    let renders = 0
    renderHook(() => {
      renders++
      return useScrolledPast(100)
    })
    const before = renders
    for (const y of [5, 20, 40, 60, 80, 99]) setY(y)
    expect(renders).toBe(before)
    setY(500)
    expect(renders).toBe(before + 1)
  })

  it('removes its scroll listener on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useScrolledPast(10))
    unmount()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
