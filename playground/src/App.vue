<script lang="ts" setup>
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import Basic from './components/basic.vue'
import Fields from './components/fields.vue'
import Ticker from './components/ticker.vue'
import FilterTran from './components/filter-tran.vue'
import Group from './components/group.vue'

const enabled = ref(true)

const { width, height } = useWindowSize()
</script>

<template>
  <div>
    <p>
      <button @click="enabled = !enabled">
        Toggle
      </button>
      <span style="margin-left: 10px"> visible: {{ enabled }} </span>
    </p>
    <Stage
      :style="{ width: `${width / 2}px` }"
      :width="width - 80"
      :height="height"
      background="#fff"
    >
      <Basic :show="enabled" />
      <Fields :show="enabled" />
      <Ticker :show="enabled" />
      <FilterTran :show="enabled" />
      <Group :show="enabled" />
    </Stage>
  </div>
</template>
