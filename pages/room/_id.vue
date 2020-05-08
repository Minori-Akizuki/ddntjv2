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
    <trpgmap />
    <chatbox />
  </div>
</template>

<script>
import chatbox from '~/components/chatbox.vue'
import trpgmap from '~/components/map.vue'

export default {
  validate ({ params }) {
    return /^\d+$/.test(params.id)
  },
  components: {
    chatbox,
    trpgmap
  },
  data () {
    return {
      socket: {},
      roomNo: null,
      roomData: null
    }
  },
  computed: {
    map () {
      return this.$stoer.getters.map
    }
  },
  mounted () {
    const _this = this
    this.roomNo = this.$route.params.id
    this.socket = this.$store.getters.socket('main')
    this.socket.on('roomData', (data) => {
      _this.setRoomData(data)
    })
  },
  methods: {
    setRoomData (data) {
      this.roomData = data
      this.$store.commit('setMap', data.map)
      delete this.roomData.map
    }
  }
}
</script>

<style>

</style>
