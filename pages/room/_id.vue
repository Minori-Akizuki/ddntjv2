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
            <b-dropdown-item @click="openImageWindow">画像</b-dropdown-item>
            <b-dropdown-item disabled>動画</b-dropdown-item>
            <b-dropdown-item disabled>音源</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <imagelist
      ref="mainImageWindow"
      selection-mode="true"
      :selected-callback="imageSelectCallback"
    />
    <characters />
    <trpgmap />
    <chatbox />
  </div>
</template>

<script>
import io from 'socket.io-client'
import chatbox from '~/components/chatbox.vue'
import trpgmap from '~/components/map.vue'
import imagelist from '~/components/imageList.vue'
import characters from '~/components/characters.vue'

export default {
  validate ({ params }) {
    return /^\d+$/.test(params.id)
  },
  components: {
    chatbox,
    trpgmap,
    imagelist,
    characters
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
  beforeMount () {
    const _this = this
    this.roomNo = this.$route.params.id
    const socket = io()
    this.$store.commit('setSocket', { socket, name: 'room' })
    this.socket = this.$store.getters.socket('room')
    this.socket.on('roomData', (data) => {
      _this.setRoomData(data)
    })
    this.socket.emit('roomData', this.roomNo)
    this.socket.emit('enterRoom', this.roomNo, 'plh')
    this.socket.on('images', (images) => {
      _this.$store.commit('setImages', { images })
    })
    this.socket.emit('images')
    this.socket.on('images.add', (image) => {
      _this.$store.commit('addImage', { image })
    })
    this.socket.on('images.delete', (id) => {
      _this.$store.commit('deleteImage', { id })
    })
  },
  mounted () {

  },
  methods: {
    setRoomData (data) {
      this.roomData = data
      this.$store.commit('setMap', data.map)
      delete this.roomData.map
    },
    imageSelectCallback (i) {
      console.log(i)
    },
    openImageWindow () {
      this.$refs.mainImageWindow.show()
    }
  }
}
</script>

<style>

</style>
