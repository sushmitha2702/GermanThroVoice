import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const noun_min_count = ref(0)
  const noun_count_per_call = ref(10)
  const verb_min_count = ref(0)
  const verb_count_per_call = ref(10)
  const sentence_count = ref(0)
  function noun_max_count() {
    return noun_min_count.value + noun_count_per_call.value
  }

  function verb_max_count() {
    return verb_min_count.value + verb_count_per_call.value
  }

  return { noun_min_count, noun_count_per_call, verb_min_count, verb_count_per_call, sentence_count, noun_max_count, verb_max_count }
})
