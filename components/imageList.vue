<template>
  <div id="imageWindow" class="draggable">
    <div id="image-list">
      <img
        v-for="image in imageList.list"
        :key="image.id"
        :src="image.bin"
        class="preview-item-file"
        @click="selectImage(image)"
      >
    </div>
    <img
      :src="selectedImage.bin"
      class="preview-item-file"
    >
    {{ selectedImage.name }}
    <b-button
      v-if="selection"
      @click="decidedImage"
    >
      画像決定
    </b-button>
    <b-button
      v-else
      @click="deleteImage"
    >
      画像削除
    </b-button>
    <hr>
    <div id="uploadform">
      <div class="preview-item">
        <img
          v-show="uploadedImage"
          class="preview-item-file"
          :src="uploadedImage"
          alt=""
        >
        <div
          v-show="uploadedImage"
          class="preview-item-btn"
        >
          <p class="preview-item-name">
            {{ img_name }}
          </p>
          <b-button size="sm" variant="success" @click="add">
            追加
          </b-button>
          <b-button size="sm" @click="remove">
            キャンセル
          </b-button>
        </div>
      </div>
      <b-form-file
        accept="image/jpeg, image/png, image/gif"
        size="sm"
        @change="onFileChange"
      />
    </div>
    <b-button @click="$emit('closeImageWindow')">
      閉じる
    </b-button>
  </div>
</template>

<script>
export default {
  components: {
  },
  props: {
    selectionMode: {
      type: Boolean,
      default: false
    },
    selectedCallback: {
      type: Function,
      default: () => {}
    }
  },
  data () {
    return {
      selectedImage: null,
      imageName: ''
    }
  },
  computed: {
    images () {
      return this.$store.getters.images
    }
  },
  mounted () {
  },
  methods: {
    selectImage (i) {
      this.selectedImage = i
    },
    onFileChange (e) {
      const files = e.target.files || e.dataTransfer.files
      this.createImage(files[0])
      this.img_name = files[0].name
    },
    createImage (file) {
      const reader = new FileReader()
      reader.onload = (e) => { this.uploadedImage = e.target.result }
      reader.readAsDataURL(file)
    },
    deleteImage () {
    },
    add () {},
    remobe () {},
    decidedImage () {}
  }
}
</script>

<style>
#imageWindow{
    position: absolute;
    border: 1px solid black;
    height: 300px;
    width: 500px;
    overflow: scroll;
    z-index: 2;
}

img.preview-item-file{
    height: 50px;
    width: 50px;
}
</style>
