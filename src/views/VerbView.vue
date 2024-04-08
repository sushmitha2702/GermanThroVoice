<template>
  <div>
    <textarea v-model="inputText" placeholder="Enter text to speak"></textarea>
    <button @click="speak">Speak</button>
    <div v-if="speaking">Speaking...</div>
    <div v-if="error">{{ error }}</div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const inputText = ref('');
    const speaking = ref(false);
    const error = ref('');
    inputText.value = 'singular The Door singular Die Tür plural Die Türen'

    const speak = () => {
      speaking.value = true;
      const words = inputText.value.split(' ');
      let index = 0;
      
      const speakWord = () => {
        if (index < words.length) {
          console.log(words)
          let text = words[index] + ' ' + words[index+1] + ' ' + words[index+2] + ' ' 
          console.log(text)
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = index == 0 ? 'en-US' : 'de-DE' //'de-DE' ; // Set German language
          utterance.rate = 0.5; // Adjust rate (1.0 is default)
          utterance.pitch = 1.0; // Adjust pitch (1.0 is default)
          utterance.onend = () => {
            setTimeout(() => {
              speakWord(); // Speak next word after delay
            }, 500); // Delay in milliseconds (5000 ms = 5 sec)
          };
          utterance.onerror = event => {
            error.value = `Error speaking: ${event.error}`;
          };
          speechSynthesis.speak(utterance);
          index = index+3;
        } else {
          speaking.value = false;
        }
      };

      speakWord(); // Start speaking
    };

    return {
      inputText,
      speak,
      speaking,
      error
    };
  }
}
</script>