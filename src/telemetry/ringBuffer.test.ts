import { describe, expect, it } from 'vitest'
import { RingBuffer } from './ringBuffer'

describe('RingBuffer', () => {
  it('retains only the newest values within its fixed capacity', () => {
    const buffer = new RingBuffer<number>(3)
    buffer.push(1)
    buffer.push(2)
    buffer.push(3)
    buffer.push(4)

    expect(buffer.length).toBe(3)
    expect(buffer.toArray()).toEqual([2, 3, 4])
  })

  it('clears without changing capacity', () => {
    const buffer = new RingBuffer<number>(2)
    buffer.push(1)
    buffer.clear()
    buffer.push(9)

    expect(buffer.capacity).toBe(2)
    expect(buffer.toArray()).toEqual([9])
  })
})

