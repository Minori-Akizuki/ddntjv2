<template>
  <div
    id="map"
    class="draggable"
    :style="mapStyle"
  >
    <div
      id="map-background"
      class="draggable-map"
      :style="mapStyle"
    >
      <!-- チット -->
      <div
        v-for="chit in chits"
        :id="'chit_'+chit.id"
        :key="chit.id"
        class="chit draggable"
      >
        <img
          :id="'chitimg_'+chit.id"
          :src="chitImage(chit)"
          class="chit"
        />
        {{ chit.name }}
        <b-tooltip
          v-if="chit.memo!=''"
          :target="'chit_'+chit.id"
          triggers="hover"
        >
          <pre>{{ chit.memo }}</pre>
        </b-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  components: {
  },
  data () {
    return {
      chitsBuf: []
    }
  },
  computed: {
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
    }
  },
  mounted () {
    this.chitsBuf = _.cloneDeep(this.chits)
    this.$nextTick(() => {
      window.$('.draggable').draggable()
    })
  },
  methods: {
    chitImage (c) {
      const img = this.$store.getters.imageById(c.img)
      return img.bin
    }
  }
}
</script>

<style>
#map{
  position: absolute;
}

#map-background {
  background-color: lightgray;
}

.chit {
  border-width: 1px;
  height: 50px;
  width: 50px;
}

vue-resizavle[id^=chit]{
  text-align: bottom;
}
</style>
