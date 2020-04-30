<template>
  <div id="chatbox" class="draggable resizable ui-widget-content">
    <div id="chatmessages" @scroll="manageUpdateFlag()">
      <div class="spacer" />
      <div
        v-for="message in messages"
        v-cloak
        :key="message.id"
        v-bind:style="{color:message.color}"
        class="message"
      >
        {{ message.text }}
      </div>
      <div class="input-settings">
        <b-container fluid>
          <!-- 名前 -->
          <b-row>
            <b-col sm="3">
              <input
                v-model="name"
              >
            </b-col>
            <!-- システム選択 -->
            <b-col sm="5">
              <select v-model="selectedSystem" name="systems" size="1">
                <option selected />
                <option v-for="system in systems" :key="system.system" :value="system.system">{{system.name}}</option>
              </select>
            </b-col>
            <b-col sm="1">
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
        <textarea
          v-model="inputbox"
          placeholder="input message here"
          class="input-box"
          @keydown.enter="sendMessage"
        />
        <b-button
          id="button"
          v-model="inputColor"
          class="enter-button"
          @click="sendMessage"
        >
          send Message
        </b-button>
      </div>
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
        { id: 2, color: '#00FF00', text: 'testgreen' }
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
    }
  }
}
</script>

<style>
#chatbox{
  border: solid #808080;
  bottom: 5px;
  display: flex;
  flex-direction: column;
  height: 200px;
  left: 10px;
  padding: 0.5em;
  position: absolute;
  width: 800px;
  z-index: 3;
}

#chatmessages{
  background: #fff;
  display: flex;
  flex: 1 0 0px;
  flex-direction: column;
  font-size: 12px;
  margin: 0 0 5px;
  overflow-y: scroll;
  position: relative;
  white-space: pre-line;
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
  height: 50px;
  padding: 0;
  resize: none
}

.enter-button {
  flex: 0 0 auto;
}

.input-settings {
  flex: 0 0 auto;
  margin-bottom: 5px;
}

.message {
  flex: 0 0 auto;
}

.spacer {
  flex: 1 0 0px;
}
</style>
