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
      :selection-mode="true"
      :selected-callback="imageSelectCallback"
    />
    <characters />
    <trpgmap />
    <chatbox
      ref="chatbox"
    />
  </div>
</template>

<script>
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
    },
    socketRoom () {
      return this.$store.getters.socket('room')
    }
  },
  beforeMount () {
    const _this = this
    this.roomNo = this.$route.params.id
    this.$store.commit('setSocket', { name: 'room' })
    this.socketRoom.on('roomData', (data) => {
      _this.setRoomData(data)
      _this.$refs.chatbox.selectedSystem = _this.roomData.system
    })
    this.socketRoom.emit('roomData', this.roomNo)
    this.socketRoom.emit('enterRoom', this.roomNo, 'plh')
    this.socketRoom.on('images', (images) => {
      _this.$store.commit('setImages', { images })
    })
    this.socketRoom.emit('images')
    this.socketRoom.on('images.add', (image) => {
      _this.$store.commit('addImage', { image })
    })
    this.socketRoom.on('images.delete', (id) => {
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
