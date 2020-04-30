<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand href="/">
        どどんてぃ
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse" />
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item-dropdown text="部屋" right>
            <b-dropdown-item>マップ変更</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
        <b-navbar-nav>
          <b-nav-item-dropdown text="画像類" right>
            <b-dropdown-item>画像</b-dropdown-item>
            <b-dropdown-item disabled>動画</b-dropdown-item>
            <b-dropdown-item disabled>音源</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <chatbox />
  </div>
</template>

<script>
import io from 'socket.io-client'
import chatbox from '~/components/chatbox.vue'

export default {
  components: {
    chatbox
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

</style>
