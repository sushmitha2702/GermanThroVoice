<script setup>
import { storeToRefs } from 'pinia';
import { useCounterStore } from '@/stores/counter';
import { supabase } from '../supabase';
import { ref, onMounted, watch } from 'vue';

const finalSentence = ref('')
const data = ref(null)
const rate= ref(0.3)
const pitch= ref(1)
const counterStore = useCounterStore()
let currentUtterance = null
let inc = 1
let recursiveResponse = "";
const repetition = ref(1)
const { verb_min_count, verb_count_per_call } = storeToRefs(counterStore);

const stopSpeech = () => {
  if (currentUtterance) {
    currentUtterance.onend = null; // Clear onend handler
    speechSynthesis.cancel();
    // speaking.value = false;
  }
};

onMounted(async () => {
  await loadVerbs();
})

const loadVerbs = async () => {
  const res = await supabase.from('verbs').select().gt('id', verb_min_count.value).lte('id', counterStore.verb_max_count()) // 'id',counterStore.verb_max_count()
  data.value = res.data
  for (let i = 0; i < data.value.length; i++) {
    formatDataForSpeak(data.value[i])
  }
}

const formatDataForSpeak = (data) => {
  let sentence = getVerbObj(data.en_verb, data.en_lang)
  sentence = sentence + getVerbObj(data.de_verb, data.de_lang)
  checkForRepetition(sentence)
  console.log(finalSentence.value)
}

const checkForRepetition = (sen) => {
  for (let i = 0; i < parseInt(repetition.value); i++) {
    finalSentence.value = finalSentence.value + sen
  }
};

const getVerbObj = (text, lang) => {
  //return lang + ' ' + type + ' ' + text + ' ' // with singular / plural
  return lang + ':' + text + ':'
}

const speak = () => {
console.log(finalSentence.value)
  const words = finalSentence.value.split(':');
  let index = 0;

  const speakWord = () => {
    if (index < words.length) {
      let text = '';
      if (words[index] === 'en_US') {
        words[index] = 'en-US'
        // text = words[index + 1] + ' ' + words[index + 2] // with singular plural attached
        text = words[index + 1]
      } else if (words[index] === 'de_DE') {
        words[index] = 'de-DE'
        text = words[index + 1] 
        //text = words[index + 1] + ' ' + words[index + 2] + ' ' + words[index + 3] // with singular plural attached
      }
      console.log(text)
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = words[index]; //'de-DE' ; // Set German language
      utterance.rate = words[index] === 'en-US' ? '0.3' : rate.value; // Adjust rate (0.1 is default)
      utterance.pitch = pitch.value; // Adjust pitch (1.0 is default)
      utterance.onend = () => {
        setTimeout(() => {
          speakWord(); // Speak next word after delay
        }, 500); // Delay in milliseconds (5000 ms = 5 sec)
      };
      utterance.onerror = event => {
        error.value = `Error speaking: ${event.error}`;
      };
      speechSynthesis.speak(utterance);
      //words[index] === 'en-US' ? index = index + 3 : index = index + 4 // with singular plural attached

      index = index + 2
      console.log(index)
      currentUtterance = utterance;
    }  else {
      setTimeout(() => {}, 1000);
      loadNext();
    }
  };
  speakWord(); // Start speaking
};

const loadPrev = () => {
  if (verb_min_count.value > 9){
    verb_min_count.value = verb_min_count.value - verb_count_per_call.value
    finalSentence.value=''
  }
}
const loadNext = async() => {
  verb_min_count.value = verb_min_count.value + verb_count_per_call.value
  finalSentence.value=''
}

const handleChange = async () => {
  finalSentence.value=''
  await loadVerbs();
}

watch(verb_min_count, async (newCount, oldCount) => {
  await loadVerbs();
  speak()
});

</script>
<template>
  <main class="sentence">
    <div class="content">
    <div class="left-content">
      <h1>Verb</h1>
      <table>
        <tr v-for="d in data">
          <td>
            <h1>{{ d.id }}</h1>
          </td>
          <td>
            <h1>{{ d.en_verb }}</h1>
          </td>
          <td>
            <h1>{{ d.de_verb }}</h1>
          </td>
        </tr>
      </table>
    </div>
    <div class="right-content">
      <select name="repetition" v-model="repetition" @change="handleChange">
        <option value="1" > 1 </option>
        <option value="2" > 2 </option>
        <option value="3" > 3 </option>
        <option value="4" > 4 </option>
        <option value="5" > 5 </option>
        <option value="6" > 6 </option>
      </select>
      <button @click="loadPrev">Prev</button>
      <button @click="speak">Read</button>
      <button @click="loadNext">Next</button>
      <!-- <p>play button, pause button, pitch bar, rate bar, with/without spelling check box</p> -->
      <div class="slidecontainer">
        <p>Rate / speed</p>
        <input type="range" min="0" max="2" value="0" step="0.1" v-model="rate" id="myRange">
        {{ rate }}
      </div>
      <div class="">
        <p>Pitch</p>
        <input type="range" min="0" max="2" step="0.1" value="0" v-model="pitch" id="myRange">
        {{ pitch }}
      </div>
      <button @click="stopSpeech">Stop</button>
    </div>
  </div>
  </main>
</template>
<style scoped>
.sentence {
  padding: 16px;
}

td {
  padding-right: 20px;
}
.content {
  display: flex;
  justify-content: center;
  align-items: center;
}
.left-content, .right-content {
width:50%
}
button {
  background-color: hsl(190, 100%, 50%); /* Green */
  border: none;
  color: black;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px; /* Added margin */
  cursor: pointer;
  border-radius: 10px;
  transition: background-color 0.3s;
  
}

button:hover {
  background-color: hsl(190, 100%, 30%); /* Darker green on hover */
}


/* Select style */
select {
  background-color: hsl(190, 100%, 50%);
  border: none;
  color: black;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 10px;
  transition: background-color 0.3s;
}

/* Styling options within the select */
select option {
  background-color: hsl(190, 100%, 50%);
  color: black;
  font-size: 16px;
}

/* Darker color on hover for select */
select:hover {
  background-color: hsl(190, 100%, 30%);
}
</style>
