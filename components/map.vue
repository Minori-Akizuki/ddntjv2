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
        <div
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
export default {
  components: {
  },
  data () {
    return {
      chits: this.$store.getters.chits,
      map: this.$store.getters.map
    }
  },
  computed: {
    mapStyle () {
      return {
        height: this.map.height * 50 + 'px',
        width: this.map.width * 50 + 'px'
      }
    }
  },
  mounted () {
    window.$('.draggable').draggable()
  },
  methods: {
    chitImage (c) {
      return ''
    },
    eHandler (e) {
      console.log(e)
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
  background-color: lightsalmon;
  border-width: 1px;
  height: 50px;
  width: 50px;
}

vue-resizavle[id^=chit]{
  text-align: bottom;
}
</style>
