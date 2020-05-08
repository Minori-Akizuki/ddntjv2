<template>
  <div
    id="map-config-window"
    class="draggable"
  >
    <div id="map-preview">
      <img id="map-image" :src="mapImage(map)"><br>
      <b-button
        @click="openImageWindow"
      >
        画像変更
      </b-button>
    </div>
    <div>
      <imageList
        v-if="showImageWindow"
        :selection="true"
        @closeImageWindow="closeImageWindow"
        @decidedImage="decidedImage"
      />
    </div>
    <hr>
    <div id="map-config">
      <b-row>
        <b-col sm="3">
          縦マス
          <b-input
            v-model.number="map.height"
            type="number"
            size="sm"
          />
        </b-col>
        <b-col sm="3">
          横マス
          <b-input
            v-model.number="map.width"
            type="number"
            size="sm"
          />
        </b-col>
        <b-col sm="6">
          チットをスナップする
          <b-checkbox
            v-model="map.snapping"
            @change="$emit('snappingChange')"
          />
        </b-col>
      </b-row>
      <b-button @click="$emit('closeMapConfig',map)">
        閉じる
      </b-button>
    </div>
  </div>
</template>

<script>
import imageList from './imageList'
export default {
  components: {
    imageList
  },
  data () {
    return {
    }
  },
  computed: {
    map () {
      return this.$store.getters.map
    }
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style>
</style>
