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
      <div>
        <nuxt-link to="room/1">入室</nuxt-link>
        <b-form-select
          v-model="selectedRoom"
          :options="rooms"
          size="sm"
          class="w-50 mt-3"
        />
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
      socket: null,
      selectedRoom: null,
      rooms: [
        { value: 1, text: 'room1' }
      ]
    }
  },
  created () {
  },
  mounted () {
    const socket = io()
    this.$store.commit('setSocket', { socket, name: 'main' })
    this.socket = this.$store.getters.socket('main')
  },
  methods: {
    sendEve () {
      this.socket.emit('ev', 'hogehoge')
    }
  }
}
</script>

<style>
</style>
