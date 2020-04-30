<template>
  <div class="container">
    <div>
      <logo />
      <h1 class="title">
        ddntjv2
      </h1>
      <h2 class="subtitle">
        Online TRPG platform
      </h2>
      <div class="links">
        <a
          href="https://nuxtjs.org/"
          target="_blank"
          class="button--green"
        >
          Documentation
        </a>
        <a
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
          class="button--grey"
        >
          GitHub
        </a>
        <a
          class="button--grey"
          @click="sendEve"
        >
          sendEv
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client'
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  },
  data () {
    return {
      socket: io()
    }
  },
  mounted () {
    this.socket.on('news', (data) => {
      console.log(data)
    })
  },
  methods: {
    sendEve () {
      this.socket.emit('ev', 'hogehoge')
    }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
