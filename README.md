<h1 align="center">Vue 3 Pixi Transition</h1>

<p align="center">
  <strong>Vue Transition for PixiJS based on <a href="https://github.com/hairyf/vue3-pixi-renderer">vue3-pixi-renderer</a> </strong>
</p>

<br />

<p align="center">
  <img src="https://img.shields.io/github/forks/hairyf/vue3-pixi-transition.svg?style=flat-square" />
  <img src="https://img.shields.io/github/stars/hairyf/vue3-pixi-transition.svg?style=flat-square" />
  <img src="https://img.shields.io/npm/dm/vue3-pixi-transition.svg?style=flat-square" />
  <img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="license" />
  <img src="https://img.shields.io/badge/pixi-v7+-ff69b4.svg?style=flat-square" alt="pixi version" />
</p>

> !Before using this framework, you need to install [https://github.com/hairyf/vue3-pixi-renderer](vue3-pixi-renderer)


> under development...

## Try it Online

> TODO

## Install

```sh
# with pnpm
pnpm add vue3-pixi-transition

# with yarn
yarn add vue3-pixi-transition
```

## Usage

`vue3-pixi-transition` is used to control the transition effects of Pixi objects, similar to the [Vue Transition](https://cn.vuejs.org/guide/built-ins/transition.html#javascript-hooks) component (except for CSS mode).

```html
<script setup lang="ts">
import { Transition } from "vue3-pixi-transition";
import { Container } from 'pixi.js'
function onBeforeEnter(el: Container) {}
function onEnter(el: Container, done: Function) {}
function onLeave(el: Container, done: Function) {}
// ....
const show = ref(true)
</script>

<template>
  <Transition
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @leave="onLeave"
  >
    <container v-if="show"><!-- pixi-element --><container>
  </Transition>
</template>
```

> Note that `after-leave` and `leave-cancelled` are invalid due to the lack of CSS mode.

## difference

Unlike the Vue Transition, you can achieve transition effects by setting different properties:

```html
<script setup lang="ts">
import { Transition } from "vue3-pixi-transition";
</script>

<template>
  <Transition
    :duration="{ enter: 1000, leave: 700 }"
    :before-enter="{ alpha: 0, scaleX: 0.25, scaleY: 0.25 }"
    :enter="{ alpha: 1, scaleX: 1, scaleY: 1 }"
    :before-leave="{/* ... */}"
    :leave="[
      { scaleX: 0.25, scaleY: 0.25 },
      { delay: 500, duration: 500, alpha: 0 },
    ]"
  >
    <!-- ... -->
  </Transition>
</template>
```

> The `delay` and `duration` are used to individually control the delay and duration of each animation node (the `item-duration` uses the `duration` property by default).

## Transition Ease

By default, all transition effects are linear. You can customize the transition easing by using custom cubic-bezier curves.

```html
<script setup lang="ts">
import { Transition } from "vue3-pixi-transition";
function easeOutElastic(n: number) {
  return  n === 0
    ? 0 : n === 1
      ? 1
      : (2 ** (-10 * n)) * Math.sin((n * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1
}

</script>

<template>
  <Transition
    :before-enter="{ x: -50 }"
    :enter="{ ease: [.42, 0, 1, 1], x: 0 }"
    :level="{ ease: easeOutElastic, x: -50 }"
  >
    <!-- ... -->
  </Transition>
</template>
```

## Transition Custom

You can also control the transition effects by setting `enter` and `level` to functions:

```html
<script setup lang="ts">
import { Transition } from "vue3-pixi-transition";
import { Text } from 'pixi.js'
function typewriter(el: Text) {
  const speed = 1
	const text = el.text;
	const duration = text.length / (speed * 0.01);
  function tick(t: number) {
		const i = ~~(text.length * t);
		el.text = text.slice(0, i);
  }
	return {
		duration,
		tick
	};
}
</script>

<template>
  <Transition :enter="typewriter" :level="typewriter">
    <Text>...</Text>
  </Transition>
</template>
```

## License

[MIT](./LICENSE) License © 2022-PRESENT [hairyf](https://github.com/hairyf)
