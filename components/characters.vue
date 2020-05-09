<template>
  <div id="characters" class="draggable resizable">
    <div>
      <table id="list" border="1">
        <tr>
          <th>In</th>
          <th>名前</th>
          <th v-for="stat in statusName" :key="stat.name" class="stat">
            {{ stat.name }}
          </th>
          <th class="memo">
            メモ
          </th>
          <th />
        </tr>
        <tr v-for="chit in chits" :key="chit.id">
          <td>
            <b-input
              id="type-number input-small"
              v-model.number="chit.initiative"
              type="number"
              size="sm"
              @change="$emit('update:chit',chit)"
            />
          </td>
          <td>{{ chit.name }}</td>
          <td
            v-for="stat in chit.status"
            :key="stat.name"
          >
            <b-checkbox v-if="stat.type=='bool'" v-model="stat.value" @change="$emit('update:chit',chit)" />
            <b-input
              v-else
              id="type-number input-small"
              v-model.number="stat.value"
              type="number"
              size="sm"
              @change="$emit('update:chit',chit)"
            />
          </td>
          <td>
            <b-textarea
              v-model="chit.memo"
              size="sm"
              @change="$emit('update:chit',chit)"
            />
          </td>
          <td>
            <b-button v-b-modal="'edit'+chit.id" size="sm">
              編集
            </b-button>
            <b-modal
              :id="'edit'+chit.id"
              :ref="'edit'+chit.id"
              title="キャラ編集"
              ok-only
            >
              <b-modal
                :id="'img'+chit.id"
                :ref="'img'+chit.id"
                title="画像選択"
                size="lg"
                ok-only
              >
                <imagelist
                  selection-mode="true"
                  :selected-callback="decidedImageCallback"
                />
              </b-modal>
              <img
                :src="imgFromChit(chit)"
                @click="openImageList(chit)"
              >
              <table>
                <tr>
                  <th>In</th>
                  <th>名前</th>
                  <th>キャラ</th>
                  <th v-for="stat in statusName" :key="stat.name">
                    {{ stat.name }}
                  </th>
                  <th>メモ</th>
                  <th />
                </tr>
                <tr>
                  <td>
                    <b-input
                      id="type-number stat input-small"
                      v-model.number="chit.initiative"
                      type="number"
                      size="sm"
                    />
                  </td>
                  <td>
                    <b-input
                      v-model="chit.name"
                      size="sm"
                    />
                  </td>
                  <td>
                    <b-checkbox v-model="chit.character" />
                  </td>
                  <td
                    v-for="stat in chit.status"
                    :key="stat.name"
                  >
                    <b-checkbox
                      v-if="stat.type=='bool'"
                      v-model="stat.value"
                      :disabled="!chit.character"
                    />
                    <b-input
                      v-else
                      id="type-number stat input-small"
                      v-model.number="stat.value"
                      :disabled="!chit.character"
                      type="number"
                      size="sm"
                    />
                  </td>
                  <td><b-textarea v-model="chit.memo" size="sm" /></td>
                </tr>
              </table>
              <b-button v-b-modal="'delete'+chit.id" variant="danger">
                削除
              </b-button>
              <b-modal :id="'delete'+chit.id" @ok="deleteChit(chit)">
                本当に削除しますか？
              </b-modal>
            </b-modal>
          </td>
        </tr>
      </table>
    </div>
    <div id="addChit">
      <b-button
        v-b-modal.addCharcterModal
        size="sm"
      >
        チット追加
      </b-button>
      <b-modal
        id="addCharcterModal"
        ref="newChitModal"
        title="チット追加"
        size="lg"
        @ok="addNewChit"
      >
        <b-modal
          id="newimg"
          ref="newimg"
          title="画像選択"
          size="lg"
          ok-only
        >
          <imagelist
            ref="charImageWindow"
            selection-mode="true"
            :selected-callback="decidedImageCallback"
          />
        </b-modal>
        <img
          :src="imgFromChit(newChit)"
          @click="openImageListNew(newChit)"
        >

        <table>
          <tr>
            <th>In</th>
            <th>名前</th>
            <th>キャラ</th>
            <th v-for="stat in statusName" :key="stat.name">
              {{ stat.name }}
            </th>
            <th>メモ</th>
            <th />
          </tr>
          <tr>
            <td>
              <b-input
                id="type-number stat input-small"
                v-model.number="newChit.initiative"
                type="number"
                size="sm"
              />
            </td>
            <td>
              <b-input
                v-model="newChit.name"
                size="sm"
              />
            </td>
            <td>
              <b-checkbox v-model="newChit.character" />
            </td>
            <td
              v-for="stat in newChit.status"
              :key="stat.name"
            >
              <b-checkbox
                v-if="stat.type=='bool'"
                v-model="stat.value"
                :disabled="!newChit.character"
              />
              <b-input
                v-else
                id="type-number stat input-small"
                v-model.number="stat.value"
                :disabled="!newChit.character"
                type="number"
                size="sm"
              />
            </td>
            <td><b-textarea v-model="newChit.memo" size="sm" /></td>
          </tr>
        </table>
      </b-modal>
    </div>
    <div>
      <b-button v-b-modal.editStat size="sm">
        ステータス項目編集
      </b-button>
      <b-modal id="editStat" @ok="setStatusOwn">
        半角句切りでパラメータを入力してください。「*」をつけた項目はチェックボックスになります。
        <b-input v-model="statusStr" />
      </b-modal>
    </div>
  </div>
</template>

<script>
import imagelist from '~/components/imageList.vue'

class Vector2d {
  constructor (x, y) {
    this.x = x || 0
    this.y = y || 0
  }
}

export default {
  components: {
    imagelist
  },
  data () {
    return {
      statusName: [
        { name: 'HP', type: 'number', value: 0 },
        { name: 'MP', type: 'number', value: 0 },
        { name: 'poizon', type: 'bool', value: false }
      ],
      statusStr: 'HP MP *poizon',
      newChit: {},
      decidedImageCallback: null
    }
  },
  computed: {
    chits () {
      return this.$store.getters.chits
    },
    socketRoom () {
      return this.$store.getters.socket('room')
    }
  },
  watch: {
  },
  beforeMount () {
  },
  created () {
  },
  mounted () {
    const _this = this
    this.socketRoom.on('status.change', function (status) {
      console.log(`status changed from other player ${status}`)
      _this.setStatus(status)
    })
    this.socketRoom.on('status.init', (status) => {
      console.log(`status init ${status}`)
      _this.setStatus(status)
    })
    this.socketRoom.emit('status.init')
    this.socketRoom.on('chits.init', (chits) => {
      console.log(`chits init ${chits}`)
      this.$store.commit('setChits', { chits })
      // TODO: chit 変更イベントの追加
    })
    this.socketRoom.emit('chits.init')
    this.newChit = this.copyNewChit({})
  },
  methods: {
    copyNewChit (_chit) {
      const chit = {}
      chit.id = Date.now().toString(16)
      chit.name = _chit.name
      chit.position = _chit.position || new Vector2d()
      chit.character = _chit.character || true
      chit.initiative = _chit.initiative || 0
      chit.status = _chit.status
        ? _chit.status.map((s) => { return Object.assign({}, s) })
        : this.statusName.map((s) => { return Object.assign({}, s) })
      chit.memo = _chit.memo || ''
      chit.img = _chit.img || null
      chit.toString = function () {
        return `chit : ${this.id},${this.name},${this.position.x},${this.position.y}`
      }
      console.log('create chit ' + chit.toString())
      return chit
    },
    addNewChit () {
      console.log(this.newChit.toString())
      const chit = this.copyNewChit(this.newChit)
      this.$store.commit('addChit', { chit })
    },
    deleteChit (chit) {
      console.log(`delete chit ${chit.id}`)
      this.$store.commit('deleteChit', { id: chit.id })
    },
    setStatusOwn () {
      this.setStatus()
      this.socketio.emit('publish.statusChanged', this.statusStr)
    },
    setStatusOther (status) {
      this.setStatus(status)
    },
    setStatus (status) {
      if (status) {
        this.statusStr = status
      }
      console.log(`set status ${this.statusStr}`)
      const statusArr = this.statusStr.split(' ')
      // ステータス基本情報の生成
      const newStatus = statusArr.map(
        function (_name) {
          if (_name.charAt(0) === '*') {
            return {
              name: _name.slice(1),
              type: 'bool',
              value: false
            }
          } else {
            return {
              name: _name,
              type: 'number',
              value: 0
            }
          }
        }
      )
      this.statusName = newStatus
      // 全てのチットに新しいステータスをセット
      /**
       * 引数のパラメータ群をディープコピーする
       */
      const copyStatus = (_status) => {
        const status = []
        _status.foreach((s) => {
          status.push({
            name: String(s.name),
            type: String(s.type),
            value: Boolean(s.value)
          })
        })
        return status
      }
      for (const c in this.chits) {
        this.$store.commit(
          'updateChitStatus',
          {
            id: c.id,
            status: copyStatus(this.statusName)
          }
        )
      }
      // 雛形のセット
      this.newChit = this.copyNewChit({})
    },
    openImageList (chit) {
      this.decidedImageCallback = function (image) {
        console.log('--- decidedImageCallback')
        chit.img = image.id
        this.$store.commit('updateChit', { chit })
        console.log(chit)
        this.$refs['img' + chit.id][0].hide()
      }
      console.log(this.$refs['img' + chit.id])
      this.$refs['img' + chit.id][0].show()
      // this.$emit('openimagewindow', this.decidedImageCallback);
    },
    openImageListNew (chit) {
      const _this = this
      this.decidedImageCallback = function (image) {
        console.log('--- decidedImageCallback(new)')
        chit.img = image.id
        console.log(chit)
        _this.$refs.newimg.hide()
      }
      console.log(this.$refs.newimg)
      this.$refs.newimg.show()
      // this.$emit('openimagewindow', this.decidedImageCallback);
    },
    imgFromChit (chit) {
      console.log('--- imgFromChit')
      console.log(chit)
      const img = chit.img
        ? this.$store.getters.imageById(chit.img)
        : ''
      console.log(img)
      // TODO : このreturnを遅延させる必要がある
      return img.bin
    }
  }
}
</script>

<style scoped>
#characters{
  border: solid #808080;
  background: rgb(243, 243, 243);
  top: 100px;
  right: 10px;
  display: flex;
  flex-direction: column;
  height: fit-content;
  padding: 0.5em;
  position: absolute;
  overflow: scroll;
  z-index: 3;
  width: 600px;
}

th.memo{
    width: 150px;
}

#editcharcter{
    clear: both;
}
table#list {
    table-layout: fixed;
    width: 100%;
}
img{
    height: 50px;
    width: 50px;
}
</style>
