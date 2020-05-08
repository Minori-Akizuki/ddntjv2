<template>
  <no-ssr placeholder="Loading...">
    <vue-resizable
      id="chatbox"
      dragSelector=".draggable"
      left="0"
      top="80vw"
      width="500"
      active="['rb']"
    >
      <div class="draggable" />
      <div id="chatmessages" @scroll="manageAutoScrollFlag()">
        <pre
          v-for="message in messages"
          v-cloak
          :key="message.id"
          v-bind:style="{color:message.color, height:messageHeight(message.text)}"
          class="message"
        >
  {{ message.text }}
        </pre>
      </div>
      <div class="input-settings">
        <b-container fluid>
          <!-- 名前 -->
          <b-row>
            <b-col sm="5">
              <b-form-input
                size="sm"
                v-model="name"
              />
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
          @keyup.enter="sendMessage"
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
export default {
  components: {
  },
  data () {
    return {
      messages: [],
      selectedSystem: '',
      name: 'name',
      inputbox: '',
      inputColor: '#000000',
      autoScroll: true
    }
  },
  computed: {
    systems () {
      return this.$store.getters.systemsToSelection
    }
  },
  mounted () {
  },
  methods: {
    addMessage (msg) {
      this.messages.push(msg)
      this.inputbox = ''
      if (this.autoScroll) {
        this.$nextTick(() => {
          const messageBox = document.getElementById('chatmessages')
          messageBox.scrollTop = messageBox.scrollHeight - messageBox.clientHeight
        })
      }
    },
    sendMessage (event) {
      if (!event.getModifierState('Shift')) {
        return
      }
      const text = `${this.name} : ${this.inputbox.trimEnd()}`
      const message = { id: Date.now(), color: this.inputColor, text }
      this.addMessage(message)
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

.draggable{
  height: 10px;
  width: 100%;
  background-color: #808080;
}

#chatmessages{
  background: #fff;
  height: 5em;
  margin: 5px;
  overflow-y: scroll;
  position: relative;
  white-space: pre-line;
}

.message {
  flex: 0 0 auto;
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
