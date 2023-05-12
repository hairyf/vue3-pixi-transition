import type { Container } from 'pixi.js'
import type { FunctionalComponent } from 'vue-demi'
import { BaseTransition, h } from 'vue-demi'

import { isFunction, toArray } from '@antfu/utils'
import type { Fn, Hook, TransitionTicker, TransitionVars } from './types'
import {
  createDeferred,
  createEasingFunction,
  delay,
  getValue,
  lerp,
  linear,
  normalizeDuration,
  resolveProps,
  setProps,
  setValue,
} from './utils'

export interface TransitionProps {
  duration?: number | {
    enter: number
    leave: number
  }
  beforeEnter?: Hook<(el: any) => void>
  enter?: Hook<(el: any, done: Fn) => TransitionTicker | void>
  afterEnter?: Hook<(el: any) => void>
  enterCancelled?: Hook<(el: any) => void>
  beforeLeave?: Hook<(el: any) => void>
  leave?: Hook<(el: any, done: Fn) => TransitionTicker | void>
  afterLeave?: Hook<(el: any) => void>

  onBeforeEnter?: (el: any) => void
  onEnter?: (el: any, done: Fn) => void
  onAfterEnter?: (el: any) => void
  onEnterCancelled?: (el: any) => void
  onBeforeLeave?: (el: any) => void
  onLeave?: (el: any, done: Fn) => void
  onAfterLeave?: (el: any) => void

  appear?: boolean
}

export const Transition: FunctionalComponent<TransitionProps> = (props, { slots }) =>
  h(BaseTransition, resolveTransitionProps(props), slots)

Transition.displayName = 'PixiTransition'

export function resolveTransitionProps(rawProps: TransitionProps) {
  rawProps = resolveProps(rawProps)
  const ids = {
    enter: 0,
    leave: 0,
    time: 0,
  }
  function onBeforeEnter(el: Container) {
    callSetterHook(el, rawProps, 'beforeEnter')
  }
  function onEnter(el: any, done: Fn) {
    callAnimHook(el, rawProps, 'enter', { done, ids })
  }
  function onAfterEnter(el: Container) {
    callSetterHook(el, rawProps, 'afterEnter')
  }
  function onEnterCancelled(el: Container) {
    callSetterHook(el, rawProps, 'afterEnter')
  }
  function onBeforeLeave(el: Container) {
    callSetterHook(el, rawProps, 'beforeLeave')
  }
  async function onLeave(el: Container, done: Fn) {
    callAnimHook(el, rawProps, 'leave', { done, ids })
  }
  function onAfterLeave(el: Container) {
    callSetterHook(el, rawProps, 'afterLeave')
  }

  return {
    css: false,
    onBeforeEnter,
    onEnter,
    onAfterEnter,
    onEnterCancelled,
    onBeforeLeave,
    onLeave,
    onAfterLeave,
  }
}

interface TransitionOptions {
  ids: Record<string, number>
  done: Fn
}

export async function executeTransition(instance: any, duration: number, transition: TransitionVars, abort?: Fn) {
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

export async function executeInTicker(ticker: TransitionTicker | void, done: Fn, abort: Fn, ids: TransitionOptions['ids']) {
  if (!ticker)
    return
  const { duration, tick } = ticker
  const startedAt = Date.now()
  const endAt = Date.now() + duration

  function tickFn() {
    if (abort())
      return done?.()
    const now = Date.now()
    tick((now - startedAt) / duration)
    if (endAt > now) {
      requestAnimationFrame(tickFn)
    }
    else {
      done?.()
      ids.time = 0
    }
  }
  tickFn()
}

export async function executeOutTicker(ticker: TransitionTicker | void, done: Fn, abort: Fn, ids: TransitionOptions['ids']) {
  if (!ticker)
    return
  const { duration, tick } = ticker
  const endAt = Date.now() + duration - ids.time
  function tickFn() {
    if (abort?.())
      return done?.()
    const now = Date.now()
    tick((endAt - now) / duration)
    if (endAt > now) {
      requestAnimationFrame(tickFn)
    }
    else {
      done?.()
      ids.time = 0
    }
  }
  tickFn()
}

export async function callSetterHook(instance: any, props: any, name: string) {
  const eventName = `on${name.charAt(1).toLocaleUpperCase()}${name.slice(1)}`
  const hook = props[name] || props[eventName]
  if (!hook)
    return
  if (isFunction(hook)) {
    hook(instance)
    return
  }
  setProps(instance, toArray(hook))
}

export async function callAnimHook(instance: any, props: any, name: string, options: TransitionOptions) {
  const eventName = `on${name.charAt(1).toLocaleUpperCase()}${name.slice(1)}`
  const hook = props[name] || props[eventName]

  if (!hook)
    return

  const { done, ids } = options
  const id = ++ids[name]
  const abort = () => id !== ids[name]

  if (isFunction(hook)) {
    return name === 'enter'
      ? executeInTicker(hook(instance, done), done, abort, ids)
      : executeOutTicker(hook(instance, done), done, abort, ids)
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
