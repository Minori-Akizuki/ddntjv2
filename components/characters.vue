<template>
  <div>
    <imagelist
      ref="chitImagelist"
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
        :items="chitsDataBuf"
        :fields="tableFields"
      >
        <template v-slot:cell(name)="data">
          {{ data.value }}
        </template>
        <template v-slot:cell()="data">
          <b-checkbox
            v-if="data.value===true || data.value===false"
            v-model="data.value"
            @change="updateChit({ event:$event, field:data.field.key, value:data.value, id:data.item.id })"
          />
          <b-input
            v-else
            v-model="data.value"
            size="sm"
            type="number"
            @change="updateChit({ event:$event, field:data.field.key, value:data.value, id:data.item.id })"
          />
        </template>
        <template v-slot:cell(memo)="data">
          <b-textarea
            v-model="data.value"
            size="sm"
            @change="updateChit({ event:$event, field:data.field.key, value:data.value, id:data.item.id })"
          />
        </template>
        <template v-slot:cell(id)="data">
          <b-button
            :v-b-modal="'edit_'+data.value"
            size="sm"
            @click="openChitEdit(data.value)"
          >
            編集
          </b-button>
          <b-modal
            :id="'edit_'+data.value"
            :ref="'edit_'+data.value"
          >
            <img
              :src="data.item.img ? imgFromChit(data.img) : ''"
              @click="openImageList(data.item)"
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
                    v-model="data.item.name"
                    size="sm"
                  />
                </td>
                <td>
                  <b-input
                    id="type-number stat input-small"
                    v-model.number="data.item.initiative"
                    type="number"
                    size="sm"
                  />
                </td>
                <td
                  v-for="stat in statusName"
                  :key="stat.name"
                >
                  <b-checkbox
                    v-if="stat.type=='bool'"
                    v-model="data.item[stat.name]"
                  />
                  <b-input
                    v-else
                    id="type-number stat input-small"
                    v-model.number="data.item[stat.name]"
                    type="number"
                    size="sm"
                  />
                </td>
                <td>
                  <b-textarea
                    v-model="data.item.memo"
                    size="sm"
                  />
                </td>
              </tr>
            </table>
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
        @ok="addNewChit"
      >
        <img
          :src="newChit.img ? imgFromChit(newChit) : ''"
          @click="openImageListNew(newChit)"
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
import _ from 'lodash'
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
      decidedImageCallback: null,
      chitsDataBuf: []
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
      this.buffaChitsData()
    })
    this.socketRoom.on('chit.add', (chit) => {
      console.log('chit add')
      this.$store.commit('addChit', { chit })
      this.buffaChitsData()
    })
    this.socketRoom.on('chit.update', (chit) => {
      this.$store.commit('updateChit', { chit })
      this.buffaChitsData()
    })
    this.socketRoom.emit('chits.init')
    this.newChit = this.copyNewChit({})
  },
  methods: {
    buffaChitsData () {
      this.chitsDataBuf = _.cloneDeep(this.chitsData())
    },
    /**
     * b-table で扱いやすいようにデータを成型
     */
    chitsData () {
      console.log('chitsData -----')
      const datas = _.map(this.chits, (c) => {
        console.log(c)
        const tmp = {
          name: c.name,
          initiative: c.initiative,
          id: c.id,
          memo: c.memo,
          img: c.img
        }
        for (const s in c.status) {
          tmp[c.status[s].name] = c.status[s].value
        }
        return tmp
      })
      return datas
    },
    /**
     * chit のディープコピーをとってIDを振る
     */
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
    /**
     * 新規チットの追加をソケットへ通知
     */
    addNewChit () {
      console.log(this.newChit.toString())
      const chit = this.copyNewChit(this.newChit)
      this.socketRoom.emit('chit.add', chit)
    },
    updateChit ({ event, field, value, id }) {
      console.log('update.chit')
      const rawChit = _.find(this.chits, { id })
      console.log(field)
      console.log(value)
      if (field === 'initiative' ||
        field === 'id' ||
        field === 'name' ||
        field === 'memo' ||
        field === 'img'
      ) {
        console.log('default status')
        rawChit[field] = value
      } else {
        const status = rawChit.status
        console.log('findstatus')
        console.log(status[_.findIndex(status, { name: field })])
        console.log(value)
        console.log('event', event)
        status[_.findIndex(status, { name: field })].value = event
      }
      console.log(rawChit)
      this.socketRoom.emit('chit.update', rawChit)
    },
    /**
     * チットの削除とソケットへの通知
     */
    deleteChit (chit) {
      console.log(`delete chit ${chit.id}`)
      this.$store.commit('deleteChit', { id: chit.id })
    },
    /**
     * 自分でステータスを更新してそれをソケットに通知する
     */
    setStatusOwn () {
      this.setStatus()
      this.socketio.emit('publish.statusChanged', this.statusStr)
    },
    /**
     * 他プレイヤーがステータス項目を更新した時
     */
    setStatusOther (status) {
      this.setStatus(status)
    },
    /**
     * ステータス項目を更新する
     */
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
        for (const s of _status) {
          status.push({
            name: String(s.name),
            type: String(s.type),
            value: Boolean(s.value)
          })
        }
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
    /**
     * 既存チット用の画像ウィンドウを開く
     */
    openImageList (chit) {
      this.decidedImageCallback = function (image) {
        console.log('--- decidedImageCallback')
        chit.img = image.id
        console.log(chit)
      }
      console.log(this.$refs['img' + chit.id])
      this.$refs.chitImagelist.show()
    },
    /**
     * 新規チット用の画像ウィンドウを開く
     */
    openImageListNew (chit) {
      this.decidedImageCallback = function (image) {
        console.log('--- decidedImageCallback(new)')
        chit.img = image.id
        console.log(chit)
      }
      console.log(this.$refs.newimg)
      this.$refs.chitImagelist.show()
    },
    /**
     * チットに対応する画像の検索
     */
    imgFromChit (chit) {
      console.log('--- imgFromChit')
      console.log(chit)
      if (!chit) { return '' }
      const img = chit.img
        ? this.$store.getters.imageById(chit.img)
        : { img: '' }
      console.log(img)
      // TODO : このreturnを遅延させる必要がある
      return img.bin
    },
    /**
     * チット編集画面を開く
     */
    openChitEdit (id) {
      console.log(id)
      this.$refs['edit_' + id].show()
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
  height: 15px;
  background-color: #808080;
  position: absolute;
  top: 0px;
  left:0px;
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
