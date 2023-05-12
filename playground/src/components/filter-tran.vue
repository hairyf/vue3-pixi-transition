<script lang="ts" setup>
import { ref } from 'vue'
import { EasePresets, PTransition } from 'vue3-pixi-transition'
import type { Graphics as GraphicsIns } from 'pixi.js'

defineProps<{ show: boolean }>()

function onDrawRounded(e: GraphicsIns) {
  e.beginFill('#00a3af')
  e.drawRoundedRect(0, 0, 60, 60, 10)
}
function easeOutElastic(n: number) {
  return n === 0
    ? 0
    : n === 1
      ? 1
      : (2 ** (-10 * n)) * Math.sin((n * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1
}
</script>

<template>
  <PTransition
    appear
    :duration="{ enter: 600, leave: 700 }"
    :before-enter="{
      alpha: 0,
      scaleX: 0.25,
      scaleY: 0.25,
    }"
    :enter="{
      ease: EasePresets.easeInCubic,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
    }"
    :leave="[
      { ease: easeOutElastic, x: 600 },
      { delay: 500, alpha: 0 },
    ]"
  >
    <graphics v-if="show" :scale="1" :pivot="30" :x="500" :y="290" @draw="onDrawRounded">
      <BlurFilter
        :before-enter="{ strength: 10, blur: 80 }"
        :enter="{ strength: 0, blur: 0 }"
        :leave="{ blur: 80 }"
        :strength="0"
      />
    </graphics>
  </PTransition>
</template>

<style lang="scss" scoped></style>
