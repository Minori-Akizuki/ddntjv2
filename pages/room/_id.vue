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
            <b-dropdown-item @click="openImageWindow">
              画像
            </b-dropdown-item>
            <b-dropdown-item disabled>
              動画
            </b-dropdown-item>
            <b-dropdown-item disabled>
              音源
            </b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
    <imagelist
      ref="mainImageWindow"
      :selection-mode="true"
      :selected-callback="imageSelectCallback"
    />
    <characters
      v-if="enterdRoom"
    />
    <trpgmap
      v-if="enterdRoom"
      ref="trpgmap"
    />
    <chatbox
      v-if="enterdRoom"
      ref="chatbox"
    />
    <b-modal
      ref='mainError'
      ok-only
      @ok="returnMainPage"
    >
    {{ errorMessage }}
    </b-modal>
  </div>
</template>

<script>
import _ from 'lodash'
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
      roomData: null,
      enterdRoom: false,
      errorMessage: '不明なエラーです'
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
    const password = this.$route.query.password || ''
    this.$store.commit('setSocket', { name: 'room' })
    this.socketRoom.on('enterRoom.success', () => {
      console.log('enterRoom.success')
      _this.enterdRoom = true
      _this.socketRoom.on('roomData', (data) => {
        console.log('setRoomData')
        _this.setRoomData(data)
      })
      _this.socketRoom.emit('roomData', _this.roomNo)

      _this.socketRoom.on('images', (images) => {
        _this.$store.commit('setImages', { images })
      })
      _this.socketRoom.emit('images')
      _this.socketRoom.on('images.add', (image) => {
        _this.$store.commit('addImage', { image })
      })
      _this.socketRoom.on('images.delete', (id) => {
        _this.$store.commit('deleteImage', { id })
      })
    })
    this.socketRoom.on('enterRoom.failed', ({ msg }) => {
      console.log('enterRoom.failed')
      this.errorMessage = msg
      this.$refs.mainError.show()
    })
    this.socketRoom.emit('enterRoom', { tryRoomNo: this.roomNo, name: 'plh', password })
  },
  mounted () {
    // URLコピペのために名前部分を削除
    const splitUrl = location.href.split('?')
    const passwordQ = _.reject(splitUrl[1].split('&'), s => s.startsWith('name')).join('&')
    history.replaceState('', '', `${this.roomNo}?${passwordQ}`)
  },
  methods: {
    setRoomData (data) {
      this.roomData = data
      this.$store.commit('setRoom', { data })
      this.$store.commit('setMap', { map: data.map })
      delete this.roomData.map
      this.$refs.chatbox.selectedSystem = this.$store.getters.room.system
    },
    imageSelectCallback (i) {
      console.log(i)
    },
    openImageWindow () {
      this.$refs.mainImageWindow.show()
    },
    returnMainPage () {
      this.$router.push('/')
    }
  }
}
</script>

<style>

</style>
