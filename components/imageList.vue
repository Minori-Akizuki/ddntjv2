<template>
  <div
    v-if="isShow"
    id="imageWindow"
    class="draggable"
  >
    <div id="image-list">
      <img
        v-for="image in images"
        :key="image.id"
        :src="image.bin"
        class="preview-item-file"
        @click="selectImage(image)"
      >
    </div>
    <img
      v-if="selectedImage"
      :src="selectedImage.bin"
      class="preview-item-file"
    >
    <div v-if="selectedImage">
      {{ selectedImage.name }}
    </div>
    <b-button
      v-if="selectionMode"
      variant="primary"
      @click="decidedImage"
    >
      画像決定
    </b-button>
    <b-button
      v-if="selectedImage"
      variant="danger"
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
            {{ imageName }}
          </p>
          <b-button
            size="sm"
            variant="primary"
            @click="add"
          >
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
    <b-button @click="hide()">
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
      imageName: '',
      uploadedImage: false,
      isShow: false
    }
  },
  computed: {
    images () {
      return this.$store.getters.images
    },
    socketRoom () {
      return this.$store.getters.socket('room')
    }
  },
  mounted () {
    window.$('draggable').draggable()
  },
  methods: {
    selectImage (i) {
      this.selectedImage = i
    },
    onFileChange (e) {
      const files = e.target.files || e.dataTransfer.files
      this.createImage(files[0])
      this.imageName = files[0].name
    },
    createImage (file) {
      const reader = new FileReader()
      reader.onload = (e) => { this.uploadedImage = e.target.result }
      reader.readAsDataURL(file)
    },
    deleteImage () {
      this.socketRoom.emit('images.delete', this.selectedImage.id)
      this.selectedImage = null
    },
    add () {
      const _this = this
      this.socketRoom.emit('images.add', {
        name: _this.imageName,
        bin: _this.uploadedImage,
        id: Date.now().toString(16)
      })
      this.img_name = ''
      this.uploadedImage = ''
    },
    remove () {
      this.uploadedImage = false
    },
    decidedImage () {
      this.selectedCallback(this.selectedImage)
      this.hide()
    },
    show () {
      this.isShow = true
      this.$nextTick(
        () => { window.$('.draggable').draggable() }
      )
    },
    hide () {
      this.isShow = false
    },
    toggle () {
      if (this.isShow) {
        this.hide()
      } else {
        this.show()
      }
    }
  }
}
</script>

<style>
#imageWindow{
    background-color: #888888;
    position: absolute;
    border: 1px solid black;
    height: 300px;
    width: 500px;
    overflow: scroll;
    z-index: 2000;
}
img.preview-item-file{
    height: 50px;
    width: 50px;
}
</style>
