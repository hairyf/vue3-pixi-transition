import { isFunction, noop, toArray } from '@antfu/utils'
import type { Container } from 'pixi.js'
import type { Fn, TransitionTicker, TransitionVars } from '../types'
import {
  createDeferred,
  createEasingFunction,
  delay,
  getValue,
  lerp,
  linear,
  normalizeDuration,
  setProps,
  setValue,
} from '../utils'

export interface TransitionOptions {
  context: Record<string, number>
  done: Fn
}

export async function callSetterHook(instance: any, props: any, name: string) {
  const eventName = `on${name[0].toLocaleUpperCase()}${name.slice(1)}`
  const hook = props[name] || props[eventName]

  if (!hook)
    return
  if (isFunction(hook)) {
    hook(instance)
    return
  }
  for (const filter of instance.filters || [])
    callSetterHook(filter, filter, name)
  setProps(instance, toArray(hook))
}

export async function callAnimationHook(instance: any, props: any, name: string, options: TransitionOptions) {
  const eventName = `on${name[0].toLocaleUpperCase()}${name.slice(1)}`
  const hook = props[name] || props[eventName]

  for (const filter of instance.filters || []) {
    filter._v_transition_context ??= { id: 0, time: 0 }
    callAnimationHook(filter, filter, name, {
      context: filter._v_transition_context,
      done: noop,
    })
  }

  if (!hook)
    return

  const { done, context } = options
  const id = ++context.id
  const abort = () => id !== context.id

  if (isFunction(hook)) {
    return name === 'enter'
      ? executeInTicker(hook(instance, done), done, abort, context)
      : executeOutTicker(hook(instance, done), done, abort, context)
  }

  const transitions = toArray(hook).filter(Boolean)

  await Promise.all(transitions.map((transition) => {
    const duration = normalizeDuration(props.duration || transition.duration)?.[name] ?? 1000
    return executeTransition(
      instance,
      duration,
      transition,
      abort,
    )
  }))

  done()
}

async function executeTransition(instance: Container, duration: number, transition: TransitionVars, abort?: Fn) {
  if (transition.delay)
    await delay(transition.delay)
  const optionsKeys = ['delay', 'duration', 'ease']
  const fields = Object.keys(transition).filter(i => !optionsKeys.includes(i))

  const startedAt = Date.now()
  const endAt = Date.now() + duration
  transition.ease ??= linear
  const ease = !isFunction(transition.ease)
    ? createEasingFunction(transition.ease)
    : transition.ease
  function exec(key: string) {
    const from = getValue(instance, key)
    const to = transition[key]
    const deferred = createDeferred<void>()
    function tick() {
      if (abort?.())
        return deferred.resolve()

      const now = Date.now()
      const alpha = ease((now - startedAt) / duration)
      setValue(instance, key, lerp(from, to, alpha))

      if (now < endAt)
        requestAnimationFrame(tick)
      else
        deferred.resolve()
    }
    tick()
    return deferred
  }

  await Promise.all(fields.map(exec))
}

async function executeInTicker(ticker: TransitionTicker | void, done: Fn, abort: Fn, context: TransitionOptions['context']) {
  if (!ticker)
    return
  const { duration, tick } = ticker
  const startedAt = Date.now() - context.time
  const endAt = Date.now() + duration - context.time
  function exec() {
    if (abort())
      return done?.()
    const now = Date.now()

    const progress = (now - startedAt) / duration
    context.time = now - startedAt
    tick(progress)
    endAt > now
      ? requestAnimationFrame(exec)
      : done?.()
  }
  exec()
}

async function executeOutTicker(ticker: TransitionTicker | void, done: Fn, abort: Fn, context: TransitionOptions['context']) {
  if (!ticker)
    return
  const { duration, tick } = ticker
  const endAt = Date.now() + duration
  function exec() {
    const now = Date.now()

    if (abort?.())
      return done?.()

    const progress = (endAt - now) / duration
    context.time = endAt - now

    tick(progress)

    endAt > now
      ? requestAnimationFrame(exec)
      : done?.()
  }
  exec()
}

