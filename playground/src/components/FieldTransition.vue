<script lang="ts" setup>
import { ref } from 'vue'
import { EasePresets, Transition as Tn } from 'vue3-pixi-transition'
import type { Graphics as GraphicsIns } from 'pixi.js'

const show = ref(true)

function onDrawRounded(e: GraphicsIns) {
  e.beginFill('#00a3af')
  e.drawRoundedRect(0, 0, 60, 60, 10)
}
</script>

<template>
  <Text :position="60" :style="{ fill: '#fff' }" @click="show = !show">
    Toggle
  </Text>
  <Tn
    :appear="true"
    :duration="{ enter: 2000, leave: 700 }"
    :before-enter="{ alpha: 0, scaleX: 0, scaleY: 0 }"
    :enter="{ delay: 0, alpha: 1 }"
    :before-leave="{}"
    :leave="[
      { ease: EasePresets.easeInExpo, scaleX: 0, scaleY: 0 },
      { alpha: 0 },
    ]"
    @before-enter="() => 1231"
  >
    <graphics v-if="show" :scale="1" :pivot="30" :x="200" :y="60" @draw="onDrawRounded" />
  </Tn>
</template>

<style lang="scss" scoped></style>
