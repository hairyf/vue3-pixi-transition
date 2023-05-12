<script lang="ts" setup>
import type { Container, Graphics as GraphicsIns, Text } from 'pixi.js'

import { PTransition } from 'vue3-pixi-transition'
import gsap from 'gsap'
import PixiPlugin from 'gsap/PixiPlugin'
import { nextTick, ref } from 'vue'
import * as PIXI from 'pixi.js'

defineProps<{ show: boolean }>()
gsap.registerPlugin(PixiPlugin)
PixiPlugin.registerPIXI(PIXI)

async function onBeforeEnter(el: Text) {
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
</script>

<template>
  <PTransition
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
  </PTransition>
</template>

