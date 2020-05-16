<template>
  <div
    v-if="appear"
    id="map-config-window"
    class="draggable-map-config"
  >
    <imageList
      ref="mapImageWindow"
      :selection-mode="true"
      :selected-callback="imageSelectCallback"
    />
    <b-form-group label="背景種別">
      <b-form-radio
        v-model="mapdataBuf.type"
        name="map-type"
        value="color"
      >
        一色
      </b-form-radio>
      <b-form-radio
        v-model="mapdataBuf.type"
        name="map-type"
        value="image"
      >
        画像
      </b-form-radio>
    </b-form-group>
    <div
      v-if="mapdataBuf.type=='image'"
      id="map-preview"
    >
      <img
        id="map-image"
        :src="mapImage"
        :style="mapPrev"
      ><br>
      <b-button
        @click="openImageWindow"
      >
        画像変更
      </b-button>
    </div>
    <div v-else>
      <b-form-input
        v-model="mapdataBuf.color"
        type="color"
        sm="4"
      />
    </div>
    <hr>
    <div id="map-config">
      <b-row>
        <b-col sm="3">
          縦マス
          <b-input
            v-model.number="mapdataBuf.height"
            type="number"
            size="sm"
          />
        </b-col>
        <b-col sm="3">
          横マス
          <b-input
            v-model.number="mapdataBuf.width"
            type="number"
            size="sm"
          />
        </b-col>
        <b-col sm="6">
          チットをスナップする
          <b-checkbox
            v-model="mapdataBuf.snapping"
          />
        </b-col>
      </b-row>
      <div class="right">
        <b-button
          variant="danger"
          @click="hide"
        >
          キャンセル
        </b-button>
        <b-button
          variant="primary"
          @click="changeMap"
        >
          決定
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import imageList from '~/components/imageList.vue'
export default {
  components: {
    imageList
  },
  data () {
    return {
      appear: false,
      mapdataBuf: {},
      socketRoom: this.$store.getters.socket('room'),
      mapImage: ''
    }
  },
  computed: {
    map () {
      return this.$store.getters.map
    },
    mapPrev () {
      return {
        height: this.mapdataBuf.height * 5 + 'px',
        width: this.mapdataBuf.width * 5 + 'px'
      }
    }
  },
  mounted () {
    const _this = this
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'setMap') {
        _this.mapdataBuf = _.cloneDeep(this.$store.getters.map)
        if (_this.mapdataBuf.img && _this.mapdataBuf.img.id) {
          const img = this.$store.getters.imageById(_this.mapdataBuf.img)
          _this.mapImage = img ? img.bin : ''
        }
      }
    })
    this.socketRoom.on('map.change', ({ map }) => {
      _this.$store.mutations('setMap', { map })
    })
  },
  methods: {
    show () {
      const _this = this
      this.appear = true
      this.mapdataBuf = _.cloneDeep(this.$store.getters.map)
      this.$nextTick(() => {
        window.$('.draggable-map-config').draggable()
        _this.mapImage = _this.$store.getters.imageById(_this.mapdataBuf.img).bin
      })
    },
    hide () {
      this.appear = false
    },
    openImageWindow () {
      this.$refs.mapImageWindow.show()
    },
    imageSelectCallback (img) {
      this.mapdataBuf.img = img.id
      this.mapImage = this.$store.getters.imageById(img.id).bin
    },
    changeMap () {
      this.socketRoom.emit('map.change', { map: this.mapdataBuf })
      this.hide()
    }
  }
}
</script>

<style>
.draggable-map-config{
  background-color: #cccccc;
  position: absolute;
  border: 1px solid black;
  overflow: visible;
  z-index: 2;
}

#map-image{
  height: 50px;
  width: 50px;
}

.right{
  width: 100%;
  text-align: right;
}
</style>
