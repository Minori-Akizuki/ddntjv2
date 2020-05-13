<template>
  <div>
    <nuxt />
  </div>
</template>
<script>
export default {
  computed: {
    socketMain () {
      return this.$store.getters.socket('main')
    }
  },
  beforeMount () {
    this.$store.commit('setSocket', { name: 'main' })
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
