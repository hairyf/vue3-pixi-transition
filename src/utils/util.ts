import { isObject } from '@antfu/utils'
import { camelize } from 'vue-demi'

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function linear(p: number) {
  return p
}

export function lerp(a: number, b: number, alpha: number) {
  return a + alpha * (b - a)
}
export type Deferred<T = void> = Promise<T> & { resolve: (value: T) => void; reject: Function }

export function createDeferred<T = void>(): Deferred<T> {
  let resolve: any, reject: any
  const promise = new Promise<any>((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  }) as unknown as any
  promise.resolve = (v: any) => {
    resolve(v)
  }
  promise.reject = reject
  return promise
}

export function resolveProps<T>(props: T) {
  const baseProps: any = {}
  for (const key in props)
    baseProps[camelize(key)] = props[key]
  return baseProps as T
}

export function normalizeDuration(
  duration: number | { enter: number; leave: number },
): null | Record<string, number> {
  if (duration == null) {
    return null
  }
  else if (isObject(duration)) {
    return duration
  }
  else {
    const n = Number(duration)
    return { enter: n, leave: n }
  }
}
