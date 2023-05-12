<script lang="ts" setup>
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'

import BasicTransition from './components/BasicTransition.vue'
import FieldTransition from './components/FieldTransition.vue'
import TickerTransition from './components/TickerTransition.vue'

const enabled = ref(true)

const { width, height } = useWindowSize()
</script>

<template>
  <div>
    <p>
      <button @click="enabled = !enabled">
        Toggle
      </button>
      <span style="margin-left: 10px"> Sprite visible: {{ enabled }} </span>
    </p>
    <Stage
      :style="{ width: `${width / 2}px` }"
      :width="width - 80"
      :height="height"
    >
      <template v-if="enabled">
        <TickerTransition />
      </template>
    </Stage>
  </div>
</template>
