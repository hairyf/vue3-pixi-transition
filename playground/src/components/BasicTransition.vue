<script lang="ts" setup>
import { Container } from 'pixi.js'
import type { Graphics as GraphicsIns } from 'pixi.js'
import gsap, { Elastic } from 'gsap'
import PixiPlugin from 'gsap/PixiPlugin'
import { nextTick, ref } from 'vue'
import * as PIXI from 'pixi.js'

gsap.registerPlugin(PixiPlugin)
PixiPlugin.registerPIXI(PIXI)

// 在元素被插入到 DOM 之前被调用
// 用这个来设置元素的 "enter-from" 状态
async function onBeforeEnter(el: Container) {
  await nextTick()
  gsap.set(el, {
    pixi: {
      alpha: 1,
      scaleX: 0.25,
      scaleY: 0.25,
    },
  })
}

function onEnter(el: Container, done: () => void) {
  gsap.to(el, {
    duration: 1,
    ease: 'elastic.inOut(2.5, 1)',
    onComplete: done,
    delay: 0,
    pixi: {
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
    },
  })

  return {
    duration: 1000,
    tick: (t) => {

    },
  }
}
function onAfterEnter(el: Container) {}
function onEnterCancelled(el: Container) {}
function onBeforeLeave(el: Container) {}
function onLeave(el: Container, done: () => void) {
  gsap.to(el, {
    duration: 0.7,
    pixi: {
      scaleX: 1,
      scaleY: 1,
      x: 300,
    },
    ease: 'elastic.inOut(2.5, 1)',
  })
  gsap.to(el, {
    duration: 0.6,
    delay: 0.5,
    pixi: {
      alpha: 0,
    },
    onComplete: done,
  })
}
function onAfterLeave(el: Container) {}
function onLeaveCancelled(el: Container) {}

function onDrawRounded(e: GraphicsIns) {
  e.beginFill('#00a3af')
  e.drawRoundedRect(0, 0, 60, 60, 10)
}

const show = ref(true)
</script>

<template>
  <Container>
    <Text :position="60" :style="{ fill: '#fff' }" @click="show = !show">
      Toggle
    </Text>
    <Transition
      :css="false"
      @before-enter="onBeforeEnter"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @enter-cancelled="onEnterCancelled"
      @before-leave="onBeforeLeave"
      @leave="onLeave"
      @after-leave="onAfterLeave"
      @leave-cancelled="onLeaveCancelled"
    >
      <graphics v-if="show" :scale="1" :pivot="30" :x="200" :y="60" @draw="onDrawRounded" />
    </Transition>

    <Transition
      :duration="{ enter: 1000, leave: 700 }"
      :before-enter="{ alpha: 0, scaleX: 0, scaleY: 0 }"
      :enter="{ ease: 'elastic.inOut(2.5, 1)', delay: 0, alpha: 1 }"
      :before-leave="{}"
      :leave="[
        { ease: 'elastic.inOut(2.5, 1)', scaleX: 1, scaleY: 1 },
        { delay: 0.5, alpha: 0 },
      ]"
    >
      -
    </Transition>
  </Container>
</template>

