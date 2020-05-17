<template>
  <no-ssr placeholder="Loading...">
    <vue-resizable
      id="chatbox"
      drag-selector=".draggable_vue"
      left="0"
      top="50vh"
      width="90vw"
      :active="['rb','r','b']"
    >
      <div class="draggable_vue" />
      <div id="chatmessages" @scroll="manageAutoScrollFlag()">
        <pre
          v-for="message in messages"
          v-cloak
          :key="message.id"
          :style="{color:message.color}"
          class="message"
        >{{ message.name }} : {{ message.text }}</pre>
      </div>
      <div class="input-settings">
        <b-container fluid>
          <!-- 名前 -->
          <b-row>
            <b-col sm="5">
              <input
                v-model="name"
                type="text"
                name="name"
                list="name-list"
                autocomplete="off"
              >
                <datalist id="name-list">
                  <option
                    v-for="name in charNameList"
                    :key="name"
                    :value="name"
                  />
                </datalist>
              </input>
            </b-col>
            <!-- システム選択 -->
            <b-col sm="5">
              <b-form-select
                v-model="selectedSystem"
                :options="systems"
              />
            </b-col>
            <b-col sm="2">
              <b-form-input
                id="textcolor"
                v-model="inputColor"
                type="color"
              />
            </b-col>
          </b-row>
        </b-container>
      </div>
      <div class="input-area">
        <b-form-textarea
          v-model="inputbox"
          size="sm"
          placeholder="input message here"
          class="input-box"
          @keyup.ctrl.enter="sendMessage"
          @keyup.alt.enter="sendMessage"
          @keyup.ctrl.up="beforeMessage"
          @keyup.alt.up="beforeMessage"
          @keyup.ctrl.down="afterMessage"
          @keyup.alt.down="afterMessage"
        />
        <b-button
          id="button"
          v-model="inputColor"
          @click="sendMessage"
        >
          送信
        </b-button>
      </div>
    </vue-resizable>
  </no-ssr>
</template>

<script>
import _ from 'lodash'
export default {
  components: {
  },
  props: {
  },
  data () {
    return {
      messages: [],
      selectedSystem: '',
      name: 'name',
      inputbox: '',
      inputColor: '#000000',
      autoScroll: true,
      beforeCount: 0
    }
  },
  computed: {
    systems () {
      return this.$store.getters.systemsToSelection
    },
    socketRoom () {
      return this.$store.getters.socket('room')
    },
    charNameList () {
      return _.map(this.$store.getters.chits, 'name')
    },
    myMaessage () {
      return this.messages.filter(msg => this.name === msg.name)
    }
  },
  watch: {
    inputColor () {
      window.localStorage.setItem('inputColor', this.inputColor)
    },
    name () {
      window.localStorage.setItem('name', this.name)
    }
  },
  mounted () {
    const _this = this
    this.socketRoom.on('chat.init', function (logs) {
      _this.messages = logs
    })
    this.socketRoom.emit('chat.init')
    this.socketRoom.on('chat.receive', function (msg) {
      _this.addMessage(msg)
    })
    this.selectedSystem = this.$store.getters.room.system
    this.name = this.$route.query.name || window.localStorage.getItem('name') || ''
    this.inputColor = window.localStorage.getItem('inputColor') || '#000000'
    this.beforeCount = 0
  },
  methods: {
    addMessage (msg) {
      this.messages.push(msg)
      if (this.autoScroll) {
        this.$nextTick(() => {
          const messageBox = document.getElementById('chatmessages')
          messageBox.scrollTop = messageBox.scrollHeight - messageBox.clientHeight
        })
      }
    },
    sendMessage (event) {
      const text = this.inputbox.trimEnd()
      const message = {
        id: Date.now(),
        color: this.inputColor,
        name: this.name,
        text
      }
      this.socketRoom.emit('chat.send', { msg: message, system: this.selectedSystem })
      this.inputbox = ''
      this.beforeCount = 0
    },
    manageAutoScrollFlag () {
      const messageBox = document.getElementById('chatmessages')
      if (messageBox.scrollTop >= messageBox.scrollHeight - messageBox.clientHeight) {
        this.autoScroll = true
      } else {
        this.autoScroll = false
      }
    },
    messageHeight (msg) {
      return (msg.split('\n').length) + 'em'
    },
    beforeMessage () {
      const userMessages = this.myMaessage
      if (userMessages.length <= this.beforeCount) {
        return
      }
      this.beforeCount++
      this.inputbox = userMessages[userMessages.length - this.beforeCount].text
    },
    afterMessage () {
      if (this.beforeCount === 1) {
        return
      }
      const userMessages = this.myMaessage
      this.beforeCount--
      if (userMessages.length <= this.beforeCount) {
        return
      }
      this.inputbox = userMessages[userMessages.length - this.beforeCount].text
    }
  }
}
</script>

<style>
#chatbox{
  border: solid #808080;
  background-color: lightblue;
  display: flex;
  flex-direction: column;
  padding: 0em;
  width: 80vw;
  z-index: 3;
}

.draggable_vue{
  height: 10px;
  width: 100%;
  background-color: #808080;
  position: absolute;
}

#chatmessages{
  background: #fff;
  height: 100em;
  margin: 5px;
  margin-top: 18px;
  overflow-y: scroll;
  overflow-x: scroll;
  position: relative;
  white-space: pre-line;
}

.message {
  font-size: 12px;
  padding: 0;
  margin: 0;
  line-height: 1;
  overflow: hidden;
}

.input-area {
  align-items: stretch;
  display: flex;
  flex: 0 0 auto;
  margin: 2px;
}

.input-box {
  align-items: flex-start;
  display: flex;
  flex: 1 0 0px;
  padding: 0;
  margin: 2px;
  resize: none
}

.input-settings {
  flex: 0 0 auto;
}
</style>
