<template>
  <div
    id="map"
    class="draggable"
    :style="mapStyle"
  >
    <div
      id="map-background-color"
      class="draggable-map"
      :style="mapColorStyle"
    >
      <img
        v-if="map.type==='image'"
        :style="mapImageStyle"
        :src="mapImageBin"
      >
      <!-- チット -->
      <div
        v-for="chit in chitsBuf"
        :id="'chit_'+chit.id"
        :key="chit.id"
        class="chit draggable-chit"
      >
        <img
          :id="'chitimg_'+chit.id"
          :src="chitImage(chit)"
          class="chit"
        >
        {{ chit.name }}
        <b-tooltip
          v-if="chit.memo!=''"
          :target="'chit_'+chit.id"
          triggers="hover"
        >
          {{ chit.memo }}
        </b-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

class Vector2d {
  constructor (x, y) {
    this.x = x || 0
    this.y = y || 0
  }
}

export default {
  components: {
  },
  data () {
    return {
      chitsBuf: []
    }
  },
  computed: {
    socketRoom () {
      return this.$store.getters.socket('room')
    },
    map () {
      return this.$store.getters.map
    },
    chits () {
      return this.$store.getters.chits
    },
    mapStyle () {
      return {
        height: this.map.height * 50 + 'px',
        width: this.map.width * 50 + 'px'
      }
    },
    mapColorStyle () {
      return {
        height: this.map.height * 50 + 'px',
        width: this.map.width * 50 + 'px',
        'background-color': this.map.color
      }
    },
    mapImageStyle () {
      return {
        height: this.map.height * 50 + 'px',
        width: this.map.width * 50 + 'px'
      }
    },
    mapImageBin () {
      return this.$store.getters.imageById(this.map.img).bin
    }
  },
  watch: {
    chits () {
      this.buffaChits()
    }
  },
  beforeMount () {

  },
  mounted () {
    const _this = this
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'updateChit') {
        _this.buffaChits()
        return
      }
      if (mutation.type === 'setMap') {
        // _this.setmap()
      }
    })
    this.socketRoom.on('map.change', ({ map }) => {
      _this.$store.commit('setMap', { map })
    })
  },
  methods: {
    buffaChits () {
      const _this = this
      this.chitsBuf = _.cloneDeep(this.chits)
      this.$nextTick(() => {
        _this.reAttachDraggable()
        _this.chitsBuf.map((chit) => {
          window.$('#chit_' + chit.id).css({
            top: chit.position.y,
            left: chit.position.x
          })
        })
      })
    },
    chitImage (c) {
      const img = this.$store.getters.imageById(c.img)
      return img.bin
    },
    reAttachDraggable () {
      if (this.map.snapping) {
        this.chits.map(
          (c) => {
            c.position.x = Math.floor(c.position.x / 50) * 50
            c.position.y = Math.floor(c.position.y / 50) * 50
          }
        )
      }
      const _this = this
      window.$('.draggable-map').draggable()
      const option = this.map.snapping ? { grid: [50, 50] } : { grid: [1, 1] }
      window.$('.draggable-chit')
        .draggable(option)
        .off('dragstop')
        .on(
          'dragstop',
          function (event, ui) {
            const chit = _this.convertUitoChit(ui)
            _this.socketRoom.emit('chit.update', chit)
          }
        )
    },
    convertUitoChit (ui) {
      const _helper = ui.helper
      const id = _helper[0].id.slice(5)
      const chit = this.chitsBuf.find((_chit) => { return _chit.id === id })
      chit.position = new Vector2d(ui.position.left, ui.position.top)
      return chit
    }
  }
}
</script>

<style>
#map{
  position: absolute;
}

#map-background-color {
  background-color: lightgray;
}

.chit {
  border-width: 1px;
  height: 50px;
  width: 50px;
  object-fit: contain;
  font-size: 9pt;
}

.memo{
  color: white;
}

vue-resizavle[id^=chit]{
  text-align: bottom;
}
</style>
