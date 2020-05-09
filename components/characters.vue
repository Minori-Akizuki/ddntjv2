<template>
  <div>
    <imagelist
      :selection-mode="true"
      :selected-callback="decidedImageCallback"
    />
    <vue-resizable
      id="characters"
      drag-selector=".c-dselector"
      :active="['r','b','rb']"
      width="50vw"
      left="50%"
      top="60%"
    >
      <div class="c-dselector" />
      <b-table
        :items="chitsData"
        :fields="tableFields"
      >
        <template v-slot:cell(id)>
          <b-button
            :v-b-modal="'edit_'+id"
          >
            編集
          </b-button>
          <b-modal
            :id="'edit_'+id"
          >
            {{ id }}
          </b-modal>
        </template>
      </b-table>
      <b-button
        v-b-modal.addChar
      >
        キャラ追加
      </b-button>
      <b-modal
        id="addChar"
        size="xl"
        title="新規キャラクター追加"
      >
        <table>
          <tr>
            <th>名前</th>
            <th>in</th>
            <th v-for="stat in statusName" :key="stat.name" class="stat">
              {{ stat.name }}
            </th>
            <th>メモ</th>
          </tr>
          <tr>
            <td>
              <b-input
                v-model="newChit.name"
                size="sm"
              />
            </td>
            <td>
              <b-input
                id="type-number stat input-small"
                v-model.number="newChit.initiative"
                type="number"
                size="sm"
              />
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
            <td>
              <b-textarea
                v-model="newChit.memo"
                size="sm"
              />
            </td>
          </tr>
        </table>
      </b-modal>
    </vue-resizable>
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
    },
    tableFieldsNew () {
      const fields = [
        { key: 'name', label: '名前' },
        { key: 'initiative', sortable: true, label: 'In' }
      ]
      for (const s of this.statusName) {
        fields.push({ key: s.name, label: s.name })
      }
      fields.push({ key: 'memo', label: 'メモ' })
      return fields
    },
    tableFields () {
      const fields = this.tableFieldsNew.concat()
      fields.push({ key: 'id', label: '' })
      return fields
    },
    chitsData () {
      const datas = this.chits.map((c) => {
        const tmp = {
          name: c.name,
          initiative: c.initiative,
          id: c.id
        }
        for (const s in c.status) {
          tmp[s] = c.status[s]
        }
      })
      return datas
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
      for (const c of this.chits) {
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
    },
    openChitEdit (id) {
      console.log(id)
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
  padding: 0em;
  position: absolute;
  overflow: scroll;
  z-index: 3;
  width: 600px;
}

.c-dselector{
  width: 100%;
  height: 10px;
  background-color: #808080;
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
