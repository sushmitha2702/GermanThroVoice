<script setup>
import { ref, onMounted, watch } from 'vue';
import { supabase } from '../supabase';

const data = ref(null)
const id = ref(1)
const line = ref(null)
const rate = ref(0.3)
const pitch = ref(1)
const error = ref(null)
const repetition = ref(1)
const totalCount = ref(null)
const start_id = ref(id.value)

let currentUtterance = null;

onMounted(async () => {
  await loadNouns();
})

const getCount = async () => {
    const count = await supabase
  .from('A1-word-list')
  .select('*', { count: 'exact' })
  if (count.data) {
    totalCount.value = count.count
  } else if (count.error) {
    error.value = count.error.details;
    data.value = null
    totalCount.value = null
    return;
  }
}

const loadNouns = async () => {
  if(totalCount.value == null) await getCount()
 
  const res = await supabase
    .from('A1-word-list')
    .select().eq('id', id.value).single()
  if (res.data) {
    error.value = "";
    data.value = res.data
  } else if (res.error) {
    error.value = res.error.details;
    data.value = null
  }
  await formLine()
}

const formLine = () => {
  line.value = data.value.de_lang + ':' + data.value.de_word + ':' + data.value.eng_lang + ':' + data.value.eng_word
}

const next = () => {
  id.value = id.value + 1;
}

const previous = () => {
    if (id.value > 1) id.value = id.value - 1;
}

const reset = () => {
  id.value = 1;
}

watch(id, async () => {
  start_id.value = id.value
  await loadNouns();
  speak()
})

watch(start_id, async() => {
    if (id.value !== start_id.value) id.value = start_id.value
})

watch(repetition, (oldVal, newVal) => {
    if (oldVal !== newVal) repetitionDisable = !repetitionDisable
})

const stopSpeech = () => {
  if (currentUtterance) {
    currentUtterance.onend = null; // Clear onend handler
    speechSynthesis.cancel();
    // speaking.value = false;
  }
};

const speak = () => {
  const words = line.value.split(':');
  let index = 0;

  const speakWord = () => {
    if (index < words.length) {
      let text = '';
      if (words[index] === 'en-US' || words[index] === 'de-DE') {
        text = words[index + 1]
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = words[index]; //'de-DE' ; // Set German language
      utterance.rate = rate.value; // Adjust rate (0.1 is default)
      utterance.pitch = pitch.value; // Adjust pitch (1.0 is default)
      utterance.onend = () => {
        setTimeout(() => {
          speakWord(); // Speak next word after delay
        }, 500); // Delay in milliseconds (5000 ms = 5 sec)
      };
      utterance.onerror = event => {
        console.log('Error speaking:', event);
      };
      speechSynthesis.speak(utterance);
      //words[index] === 'en-US' ? index = index + 3 : index = index + 4 // with singular plural attached

      index = index + 2
      currentUtterance = utterance;
    } else {
      setTimeout(() => {

      }, 1000);
      next();
    }
  };
  speakWord(); // Start speaking
};
</script>

<template>
  <div class="word-list">
    <h1>A1 Word List({{ totalCount }})</h1>
    {{ repetitionDisable }}
    <select name="repetition" id="repetition" v-model="repetition">
        <option value="1">1</option>              
        <option value="2">2</option>
        <option value="3">3</option>
    </select>
    <div v-if="data" class="content">
        <h1 v-if="data">{{ data.id }}</h1>
      <h1 v-if="data">{{ data.de_word }}</h1>
      <h1 v-if="data">{{ data.eng_word }}</h1>
      <div class="buttons">
        <button @click="speak">Read</button>
        <button @click="previous">Previous</button>
        <button @click="next">Next</button>
        <button @click="stopSpeech">Stop</button>
      </div>
      <div>
        <span>Start from: </span>
        <input type="number" v-model="start_id" />
      </div>
    </div>
    <div v-if="error">
      <p>{{ error }}</p>
      <button @click="reset">Reset</button>
    </div>
  </div>
</template>

<style scoped>
.word-list {
  padding: 16px;
}
.content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.content h1,.buttons {
  padding: 30px;
}
button {
  background-color: hsl(190, 100%, 50%);
  /* Green */
  border: none;
  color: black;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px;
  /* Added margin */
  cursor: pointer;
  border-radius: 10px;
  transition: background-color 0.3s;

}

button:hover {
  background-color: hsl(190, 100%, 30%);
  /* Darker green on hover */
}</style>
