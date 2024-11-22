<template>
    <div>
      <h4>History</h4>
      <p class="reset">Reset upon logging out.</p>
      <div v-for="(log, index) in logs.slice().reverse()" :key="index">
        <span>{{ formatTimestamp(log.timestamp) }}</span>
        <p v-if="log.winProbability" :class="[log.winProbability > 50 ? 'green' : 'red']">{{ log.winProbability }}%</p>
        <img v-if="log.imageUrl" :src="log.imageUrl" alt="Uploaded Image" style="max-width: 100px;" />
        <hr>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      logs: {
        type: Array,
        required: true,
      },
    },
    methods: {
      formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const options = {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        };
        return date.toLocaleString('en-US', options);
      },
    },
  };
  </script>
  
<style scoped>
*{
  font-family: 'Poppins', sans-serif;
}

.reset {
  font-size: small;
}

img {
  max-width: 100%;
  max-height: 100px;
}

.green {
  color: #28a745;
  font-weight: 600;
}

.red {
  color: #dc3545;
  font-weight: 600;
}

</style>
