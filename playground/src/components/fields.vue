<script lang="ts" setup>
import { ref } from 'vue'
import { EasePresets, PixiTransition } from 'vue3-pixi-transition'
import type { Graphics as GraphicsIns } from 'pixi.js'

defineProps<{ show: boolean }>()
function onDrawRounded(e: GraphicsIns) {
  e.beginFill('#00a3af')
  e.drawRoundedRect(0, 0, 60, 60, 10)
}
</script>

<template>
  <PixiTransition
    :duration="{ enter: 800, leave: 700 }"
    :before-enter="{ alpha: 0, scaleX: 0.25, scaleY: 0.25 }"
    :enter="{ ease: EasePresets.easeInOutQuart, alpha: 1, scaleX: 1, scaleY: 1 }"
    :before-leave="{}"
    :leave="[
      { ease: EasePresets.easeOutExpo, x: 300 },
      { delay: 500, alpha: 0 },
    ]"
    @before-enter="() => 1231"
  >
    <graphics v-if="show" :scale="1" :pivot="30" :x="200" :y="300" @draw="onDrawRounded" />
  </PixiTransition>
</template>

<style lang="scss" scoped></style>
