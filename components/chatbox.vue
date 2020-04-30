<template>
  <div id="chatbox" class="resizable">
    <div id="chatmessages" @scroll="manageUpdateFlag()">
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
            <select v-model="selectedSystem" name="systems">
              <option selected />
              <option v-for="system in systems" :key="system.system" :value="system.system">{{system.name}}</option>
            </select>
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
        @keydown.enter="sendMessage"
      />
      <b-button
        id="button"
        v-model="inputColor"
        @click="sendMessage"
      >
        送信
      </b-button>
    </div>
  </div>
</template>

<script>

export default {
  components: {
  },
  data () {
    return {
      messages: [
        { id: 1, color: '#FF0000', text: 'testRed' },
        { id: 2, color: '#00FF00', text: 'testgreen\nmultiline' },
        { id: 3, color: '#00FF00', text: 'testgreen' },
        { id: 4, color: '#00FF00', text: 'testgreen' },
        { id: 5, color: '#00FF00', text: 'testgreen' }
      ],
      selectedSystem: '',
      systems: [
        { system: 'system', name: 'systemname' }
      ],
      name: 'name',
      inputbox: '',
      inputColor: '#000000'
    }
  },
  mounted () {
    window.$('.draggable').draggable()
    window.$('.resizable').resizable()
  },
  methods: {
    addMessage (msg) {
      console.log('addMessage')
    },
    sendMessage (event) {
      console.log('sendMessage')
    },
    manageUpdateFlag () {
      console.log('manageUpdateFlag')
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
  bottom: 0px;
  display: flex;
  flex-direction: column;
  left: 0px;
  padding: 0.5em;
  position: absolute;
  width: 100vw;
  z-index: 3;
}

#chatmessages{
  background: #fff;
  height: 5em;
  margin: 0 0 5px;
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
}

.input-area {
  align-items: stretch;
  display: flex;
  flex: 0 0 auto;
}

.input-box {
  align-items: flex-start;
  display: flex;
  flex: 1 0 0px;
  height: 3em;
  padding: 0;
  resize: none
}

.input-settings {
  flex: 0 0 auto;
  margin-bottom: 5px;
}
</style>
