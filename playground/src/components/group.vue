<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import { EasePresets, PTransitionGroup } from 'vue3-pixi-transition'
import type { Graphics as GraphicsIns } from 'pixi.js'

const props = defineProps<{ show: boolean }>()
const show2 = ref(true)
const show3 = ref(true)

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

watchEffect(() => {
  props.show
    ? setTimeout(() => {
      show2.value = true
    }, 300)
    : setTimeout(() => {
      show2.value = false
    }, 300)
})
watchEffect(() => {
  show2.value
    ? setTimeout(() => {
      show3.value = true
    }, 300)
    : setTimeout(() => {
      show3.value = false
    }, 300)
})
</script>

<template>
  <PTransitionGroup
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
      { ease: easeOutElastic, x: 350, y: 290 },
      { delay: 100, alpha: 0 },
    ]"
    @before-enter="() => 1231"
  >
    <graphics v-if="show" :scale="1" :pivot="30" :x="200" :y="290" @draw="onDrawRounded" />
    <graphics v-if="show2" :scale="1" :pivot="30" :x="200" :y="450" @draw="onDrawRounded" />
    <graphics v-if="show3" :scale="1" :pivot="30" :x="500" :y="450" @draw="onDrawRounded" />
  </PTransitionGroup>
</template>

<style lang="scss" scoped></style>
