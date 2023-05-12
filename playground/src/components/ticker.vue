<script lang="ts" setup>
import { ref } from 'vue'
import { PixiTransition } from 'vue3-pixi-transition'
import { Text } from 'pixi.js'

defineProps<{ show: boolean }>()

function typewriter(el: Text) {
  const speed = 1
  const text = el.text
  const duration = text.length / (speed * 0.01)
  function tick(t: number) {
    const i = ~~(text.length * t)
    el.text = text.slice(0, i)
  }
  return {
    duration,
    tick,
  }
}
</script>

<template>
  <PixiTransition
    :enter="typewriter"
    :leave="typewriter"
  >
    <Text v-if="show" :position="150" :style="{ fill: '#fff' }">
      The quick brown fox jumps over the lazy dog
    </Text>
  </PixiTransition>
</template>

<style lang="scss" scoped></style>
