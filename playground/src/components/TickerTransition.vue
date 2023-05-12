<script lang="ts" setup>
import { ref } from 'vue'
import { Transition as Tn } from 'vue3-pixi-transition'
import { Text } from 'pixi.js'

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
const show = ref(true)
</script>

<template>
  <Text :position="60" :style="{ fill: '#fff' }" @click="show = !show">
    Toggle
  </Text>

  <Tn
    :appear="true"
    :enter="typewriter"
    :leave="typewriter"
  >
    <Text v-if="show" :position="150" :style="{ fill: '#fff' }">
      The quick brown fox jumps over the lazy dog
    </Text>
  </Tn>
</template>

<style lang="scss" scoped></style>
