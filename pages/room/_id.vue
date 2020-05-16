<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="info">
      <b-navbar-brand>
        どどんてぃ
      </b-navbar-brand>
      <b-navbar-toggle target="nav-collapse" />
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item-dropdown text="部屋" right>
            <b-dropdown-item
              @click="openMapConfig"
            >
              マップ変更
            </b-dropdown-item>
            <b-dropdown-item
              href="/"
            >
              退室
            </b-dropdown-item>
            <b-dropdown-item
              @click="openDeleteWindow"
            >
              部屋削除
            </b-dropdown-item>
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
      v-if="roomReady"
      ref="mainImageWindow"
    />
    <trpgmap
      v-if="roomReady"
      ref="trpgmap"
    />
    <mapconfig
      v-if="roomReady"
      ref="mapconfig"
    />
    <characters
      v-if="roomReady"
    />
    <chatbox
      v-if="roomReady"
      ref="chatbox"
    />
    <b-modal
      ref="mainError"
      ok-only
      @ok="returnMainPage"
    >
      {{ errorMessage }}
    </b-modal>
    <b-modal
      ref="deleteRoom"
      @ok="deleteRoom"
    >
      <div class="danger">
        本当に部屋を削除しますか?
      </div>
    </b-modal>
  </div>
</template>

<script>
import _ from 'lodash'
import mapconfig from '~/components/mapConfig'
import chatbox from '~/components/chatbox.vue'
import trpgmap from '~/components/map.vue'
import imagelist from '~/components/imageList.vue'
import characters from '~/components/characters.vue'

export default {
  validate ({ params }) {
    return /^\d+$/.test(params.id)
  },
  components: {
    mapconfig,
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
      roomDataReady: false,
      imagesReady: false,
      errorMessage: '不明なエラーです'
    }
  },
  computed: {
    map () {
      return this.$stoer.getters.map
    },
    socketRoom () {
      return this.$store.getters.socket('room')
    },
    roomReady () {
      return this.enterdRoom &&
        this.roomDataReady &&
        this.imagesReady
    }
  },
  beforeMount () {
    const _this = this
    this.roomNo = this.$route.params.id
    const password = this.$route.query.password || ''
    this.$store.commit('setSocket', { name: 'room' })
    this.socketRoom.on('enterRoom.success', () => {
      _this.enterdRoom = true
      _this.socketRoom.on('roomData', (data) => {
        _this.setRoomData(data)
        _this.roomDataReady = true
      })
      _this.socketRoom.emit('roomData', _this.roomNo)

      _this.socketRoom.on('images', (images) => {
        _this.$store.commit('setImages', { images })
        _this.imagesReady = true
      })
      _this.socketRoom.emit('images')
      _this.socketRoom.on('images.add', (image) => {
        _this.$store.commit('addImage', { image })
      })
      _this.socketRoom.on('images.delete', (id) => {
        _this.$store.commit('deleteImage', { id })
      })
      _this.socketRoom.on('room.delete', () => {
        _this.$router.push('/')
      })
      _this.socketRoom.on('reconnect', () => {
        _this.socketRoom.emit('enterRoom', { tryRoomNo: this.roomNo, name: this.$route.query.name, password })
      })
    })
    this.socketRoom.on('enterRoom.failed', ({ msg }) => {
      this.errorMessage = msg
      this.$refs.mainError.show()
    })
    this.socketRoom.emit('enterRoom', { tryRoomNo: this.roomNo, name: this.$route.query.name, password })
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
    },
    imageSelectCallback (i) {
    },
    openImageWindow () {
      this.$refs.mainImageWindow.show()
    },
    openMapConfig () {
      this.$refs.mapconfig.show()
    },
    openDeleteWindow () {
      this.$refs.deleteRoom.show()
    },
    deleteRoom () {
      this.socketRoom.emit('room.delete')
    },
    returnMainPage () {
      this.$router.push('/')
    }
  }
}
</script>

<style>
.danger{
  color: red;
}
</style>
