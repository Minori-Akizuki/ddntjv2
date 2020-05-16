<template>
  <div class="container">
    <div class="centering">
      <logo />
      <h1 class="title">
        ddntjv2
      </h1>
      <h2 class="subtitle">
        Online TRPG platform
      </h2>
      <div class="links">
        <a
          href="https://github.com/Minori-Akizuki/ddntjv2"
          target="_blank"
          class="button--grey"
        >
          GitHub
        </a>
      </div>
      <div>
        <b-form-select
          v-model="selectedRoom"
          :options="roomsSelectForm"
          size="sm"
          class="w-50 mt-3"
        />
        <b-row>
          <b-col cols="5">
            名前
          </b-col>
          <b-col cols="7">
            <b-form-input
              id="name"
              v-model="userName"
              type="text"
              size="sm"
            />
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="5">
            パスワード(あれば)
          </b-col>
          <b-col cols="7">
            <b-form-input
              id="password"
              v-model="password"
              type="password"
              size="sm"
              :state="checkPassword"
            />
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-button
              :disabled="enterRoomButtonDisabled"
              @click="enterRoom"
            >
              入室/作成
            </b-button>
          </b-col>
        </b-row>
      </div>
    </div>
    <b-modal
      id="crateRoom"
      ref="createRoom"
      title="部屋作成"
      @ok="createRoom"
    >
      <b-row>
        <b-col sm="3">
          部屋名
        </b-col>
        <b-col sm="9">
          <b-form-input
            v-model="newRoomName"
            type="text"
          />
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="3">
          名前
        </b-col>
        <b-col sm="9">
          <b-form-input
            v-model="userName"
            type="text"
          />
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="3">
          パスワード
        </b-col>
        <b-col sm="9">
          <b-form-input
            v-model="newRoomPassword"
            type="text"
          />
        </b-col>
      </b-row>
      <b-row>
        <b-col sm="3">
          システム
        </b-col>
        <b-col sm="9">
          <b-form-select
            v-model="selectedSystem"
            :options="systems"
          />
        </b-col>
      </b-row>
    </b-modal>
    <b-modal ref="error" ok-only>
      {{ error.message }}
    </b-modal>
  </div>
</template>

<script>
import Logo from '~/components/Logo.vue'

const sha = require('js-sha256')

export default {
  components: {
    Logo
  },
  data () {
    return {
      socket: null,
      selectedRoom: null,
      rooms: [],
      selectedSystem: null,
      roomName: '',
      userName: '',
      password: '',
      showPasswordError: false,
      newRoomPassword: '',
      newRoomName: '',
      error: ''
    }
  },
  computed: {
    roomsSelectForm () {
      const ret = this.rooms.map((r) => {
        return {
          value: r.roomNo,
          text: r.isCreated ? `${r.roomNo} : ${r.text}(${r.system})` : `${r.roomNo} : 未作成`
        }
      })
      ret.unshift({ value: null, text: '部屋を選択してください' })
      return ret
    },
    enterRoomButtonDisabled () {
      return !Number.isInteger(this.selectedRoom)
    },
    checkPassword () {
      if (this.selectedRoom === null) {
        return true
      }
      if (this.rooms[this.selectedRoom].password === '') {
        return true
      }
      const hash = sha.sha256(this.password)
      return hash === this.rooms[this.selectedRoom].password
    },
    systems () {
      return this.$store.getters.systemsToSelection
    }
  },
  created () {
  },
  mounted () {
    const _this = this
    this.socket = this.$store.getters.socket('main')
    this.socket.on('roomsinfo', (data) => {
      _this.rooms = data
    })
    this.socket.emit('roomsinfo')
    this.socket.on('createRoom.success', () => {
      console.log('roomCreated')
      _this.$router.push(`/room/${_this.selectedRoom}?password=${_this.newRoomPassword}&name=${_this.userName}`)
    })
    this.socket.on('createRoom.error', (err) => {
      console.log('error in create room')
      _this.error = err
      _this.$refs.error.show()
    })
  },
  methods: {
    roomsinfo () {
      this.socket.emit('roomsinfo')
    },
    enterRoom () {
      const room = this.rooms[this.selectedRoom]
      if (!room.isCreated) {
        this.$refs.createRoom.show()
        return
      }
      if (room.isCreated && this.checkPassword) {
        this.$router.push(`/room/${this.selectedRoom}?password=${this.password}&name=${this.userName}`)
      }
    },
    createRoom () {
      const password = this.newRoomPassword
      const roomName = this.newRoomName
      const system = this.selectedSystem
      const roomId = this.selectedRoom
      this.socket.emit('createRoom', {
        roomId,
        roomName,
        password,
        system
      })
    }
  }
}
</script>

<style scoped>
.container{
  text-align: center;
  width: 100%;
}
.centering{
  text-align: center;
  max-width: 500px;
  margin: auto;
}

#passwprd{
  max-width: 70vw;
}
</style>
