import type { PropType } from 'vue-demi'
import { BaseTransition, defineComponent, h, reactive } from 'vue-demi'

import { isFunction, toArray } from '@antfu/utils'
import type { Container } from 'pixi.js'
import type { Fn, Hook, TransitionTicker, TransitionVars } from './types'
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

export const PTransition = defineComponent({
  name: 'PTransition',
  props: {
    duration: [Number, Object] as PropType<number | { enter: number;leave: number }>,
    beforeEnter: [Function, Object, Array] as PropType<Hook<(el: any) => void>>,
    enter: [Function, Object, Array] as PropType< Hook<(el: any, done: Fn) => TransitionTicker | void>>,
    afterEnter: [Function, Object, Array] as PropType<Hook<(el: any) => void>>,
    enterCancelled: [Function, Object, Array] as PropType< Hook<(el: any) => void>>,
    beforeLeave: [Function, Object, Array] as PropType< Hook<(el: any) => void>>,
    leave: [Function, Object, Array] as PropType< Hook<(el: any, done: Fn) => TransitionTicker | void>>,
    afterLeave: [Function, Object, Array] as PropType< Hook<(el: any) => void>>,
    onBeforeEnter: Function as PropType<(el: any) => void>,
    onEnter: Function as PropType<(el: any, done: Fn) => void>,
    onAfterEnter: Function as PropType<(el: any) => void>,
    onEnterCancelled: Function as PropType<(el: any) => void>,
    onBeforeLeave: Function as PropType<(el: any) => void>,
    onLeave: Function as PropType<(el: any, done: Fn) => void>,
    onAfterLeave: Function as PropType<(el: any) => void>,
    appear: Boolean,
  },

  setup(props, { slots, emit }) {
    const context = reactive({ id: 0, time: 0 })
    function onBeforeEnter(el: any) {
      callSetterHook(el, props, 'beforeEnter')
    }
    function onEnter(el: any, done: Fn) {
      callAnimationHook(el, props, 'enter', { done, context })
    }
    function onAfterEnter(el: any) {
      callSetterHook(el, props, 'afterEnter')
    }
    function onEnterCancelled(el: any) {
      callSetterHook(el, props, 'afterEnter')
    }
    function onBeforeLeave(el: any) {
      callSetterHook(el, props, 'beforeLeave')
    }
    async function onLeave(el: any, done: Fn) {
      callAnimationHook(el, props, 'leave', { done, context })
    }
    function onAfterLeave(el: any) {
      emit('afterLeave', el)
      callSetterHook(el, props, 'afterLeave')
    }

    return () => h(BaseTransition, {
      css: false,
      onBeforeEnter,
      onEnter,
      onAfterEnter,
      onEnterCancelled,
      onBeforeLeave,
      onLeave,
      onAfterLeave,
    }, slots)
  },
})

interface TransitionOptions {
  context: Record<string, number>
  done: Fn
}

async function callSetterHook(instance: any, props: any, name: string) {
  const eventName = `on${name[0].toLocaleUpperCase()}${name.slice(1)}`
  const hook = props[name] || props[eventName]
  if (!hook)
    return
  if (isFunction(hook)) {
    hook(instance)
    return
  }
  setProps(instance, toArray(hook))
}

async function callAnimationHook(instance: any, props: any, name: string, options: TransitionOptions) {
  const eventName = `on${name[0].toLocaleUpperCase()}${name.slice(1)}`
  const hook = props[name] || props[eventName]

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

