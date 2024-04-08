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
const { noun_min_count, noun_count_per_call } = storeToRefs(counterStore);

let currentUtterance = null;
const stopSpeech = () => {
  if (currentUtterance) {
    console.log(currentUtterance)
    currentUtterance.onend = null; // Clear onend handler
    speechSynthesis.cancel();
    // speaking.value = false;
  }
};

const toggleSpeech = () => {
  if (currentUtterance && !currentUtterance.paused) {
    speechSynthesis.pause();
  } else {
    if (currentUtterance && currentUtterance.paused) {
      speechSynthesis.resume();
    } else {
      const words = inputText.value.split(' ');
      speakWord(words, 0); // Start speaking from the first word
    }
  }
};

onMounted(async () => {
  await loadNouns();
})

const loadNouns = async () => {
  const res = await supabase.from('nouns').select().gt('id', noun_min_count.value).lte('id', counterStore.noun_max_count())
  data.value = res.data
  for (let i = 0; i < data.value.length; i++) {
    formatDataForSpeak(data.value[i])
  }
}

const formatDataForSpeak = (data) => {
  finalSentence.value = finalSentence.value + getNounObj(data.eng_noun, data.eng_noun_lang, "singular")
  finalSentence.value = finalSentence.value + getNounObj(data.de_noun_singular, data.de_noun_singular_lang, "singular")
  finalSentence.value = finalSentence.value + getNounObj(data.de_noun_plural, data.de_noun_plural_lang, "plural")
}

const getNounObj = (text, lang, type) => {
  //return lang + ' ' + type + ' ' + text + ' ' // with singular / plural
  return lang + ' ' + text + ' '
}

const speak = () => {
  const words = finalSentence.value.split(' ');
  console.log(finalSentence)
  let index = 0;

  const speakWord = () => {
    if (index < words.length) {
      let text = '';
      if (words[index] === 'en-US') {
        // text = words[index + 1] + ' ' + words[index + 2] // with singular plural attached
        text = words[index + 1]
      } else if (words[index] === 'de-DE') {
        text = words[index + 1] + ' ' + words[index + 2]
        //text = words[index + 1] + ' ' + words[index + 2] + ' ' + words[index + 3] // with singular plural attached
      }
      console.log(text)
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
        error.value = `Error speaking: ${event.error}`;
      };
      speechSynthesis.speak(utterance);
      //words[index] === 'en-US' ? index = index + 3 : index = index + 4 // with singular plural attached

      words[index] === 'en-US' ? index = index + 2 : index = index + 3
      console.log(index)
      currentUtterance = utterance;
    }
  };
  speakWord(); // Start speaking
};

const loadPrev = () => {
  if (noun_min_count.value > 9){
    noun_min_count.value = noun_min_count.value - noun_count_per_call.value
    finalSentence.value=''
  }
}
const loadNext = () => {
  noun_min_count.value = noun_min_count.value + noun_count_per_call.value
  finalSentence.value=''
}

watch(noun_min_count, async (newCount, oldCount) => {
  await loadNouns();
});

</script>
<template>
  <main class="sentence">
    <div class="content">
    <div class="left-content">
      <h1>Noun</h1>
      <table>
        <tr v-for="d in data">
          <td>
            <h1>{{ d.id }}</h1>
          </td>
          <td>
            <h1>{{ d.eng_noun }}</h1>
          </td>
          <td>
            <h1>{{ d.de_noun_singular }}</h1>
          </td>
          <td>
            <h1>{{ d.de_noun_plural }}</h1>
          </td>
        </tr>
      </table>
    </div>
    <div class="right-content">
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
      <button @click="toggleSpeech">{{ speaking ? 'Pause' : 'Speak' }}</button>
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
</style>
