export class RingBuffer<T> {
  private readonly values: Array<T | undefined>
  private start = 0
  private count = 0

  constructor(public readonly capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new Error('RingBuffer capacity must be a positive integer')
    }
    this.values = new Array<T | undefined>(capacity)
  }

  get length(): number {
    return this.count
  }

  push(value: T): void {
    const index = (this.start + this.count) % this.capacity
    this.values[index] = value
    if (this.count < this.capacity) {
      this.count += 1
    } else {
      this.start = (this.start + 1) % this.capacity
    }
  }

  clear(): void {
    this.values.fill(undefined)
    this.start = 0
    this.count = 0
  }

  toArray(): T[] {
    return Array.from({ length: this.count }, (_, index) => {
      return this.values[(this.start + index) % this.capacity] as T
    })
  }
}

