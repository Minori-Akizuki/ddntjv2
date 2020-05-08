<template>
  <div>
    <nuxt />
  </div>
</template>
<script>
import io from 'socket.io-client'
export default {
  computed: {
    socketMain () {
      return this.$store.getters.socket('main')
    }
  },
  beforeMount () {
    const socket = io()
    this.$store.commit('setSocket', { socket, name: 'main' })
    this.socketMain.on('systems', (systems) => {
      console.log('recieve systems', systems)
      this.$store.commit('setSystems', { systems: systems.names })
    })
    this.socketMain.emit('systems')
  }
}
</script>
<style>

</style>
