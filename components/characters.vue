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
      :active="['r','b','rb','l']"
      width="50vw"
      left="50%"
      top="60%"
    >
      <div class="c-dselector" />
      <div class="c-spacer" />
      <b-table
        :items="chitsDataBuf"
        :fields="tableFields"
        responsive
        sticky-header
      >
        <template v-slot:cell(img)="data">
          <img
            :src="data.item.img ? imgFromChit(data.item) : ''"
            @click="openImageList(data.item)"
          >
        </template>
        <template v-slot:cell(name)="data">
          <b-form-input
            v-model="data.value"
            size="sm"
            type="text"
            @change="updateChit({ event:$event, field:data.field.key, value:data.value, id:data.item.id })"
          />
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
        <template v-slot:cell(delete)="data">
          <b-button
            size="sm"
            variant="danger"
            @click="$refs['delete_'+data.item.id].show()"
          >
            削除
          </b-button>
          <b-modal
            :ref="'delete_'+data.item.id"
            @ok="deleteChit(data.item.id)"
          >
            本当に「{{ data.item.name }}」を削除しますか?
          </b-modal>
        </template>
      </b-table>
      <b-button
        v-b-modal.addChar
        size="sm"
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
        { key: 'img', label: 'アイコン' },
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
      fields.push({ key: 'delete', label: '' })
      return fields
    }
  },
  watch: {
  },
  beforeMount () {
    const _this = this
    this.socketRoom.on('status.change', function (status) {
      _this.setStatus(status)
    })
    this.socketRoom.on('status.init', (status) => {
      _this.setStatus(status)
    })
    this.socketRoom.emit('status.init')
    this.socketRoom.on('chits.init', (chits) => {
      this.$store.commit('setChits', { chits })
      this.buffaChitsData()
    })
    this.socketRoom.on('chit.add', (chit) => {
      this.$store.commit('addChit', { chit })
      this.buffaChitsData()
    })
    this.socketRoom.on('chit.update', (chit) => {
      this.$store.commit('updateChit', { chit })
      this.buffaChitsData()
    })
    this.socketRoom.on('chit.delete', (id) => {
      this.$store.commit('deleteChit', { id })
      this.buffaChitsData()
    })
    this.socketRoom.emit('chits.init')
    this.newChit = this.copyNewChit({})
  },
  created () {
  },
  mounted () {
  },
  methods: {
    buffaChitsData () {
      this.chitsDataBuf = _.cloneDeep(this.chitsData())
    },
    /**
     * b-table で扱いやすいようにデータを成型
     */
    chitsData () {
      const datas = _.map(this.chits, (c) => {
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
      return chit
    },
    /**
     * 新規チットの追加をソケットへ通知
     */
    addNewChit () {
      const chit = this.copyNewChit(this.newChit)
      this.socketRoom.emit('chit.add', chit)
    },
    updateChit ({ event, field, value, id }) {
      const rawChit = _.find(this.chits, { id })
      if (field === 'initiative' ||
        field === 'id' ||
        field === 'name' ||
        field === 'memo' ||
        field === 'img'
      ) {
        rawChit[field] = value
      } else {
        const status = rawChit.status
        status[_.findIndex(status, { name: field })].value = event
      }
      this.socketRoom.emit('chit.update', rawChit)
    },
    /**
     * チットの削除とソケットへの通知
     */
    deleteChit (id) {
      this.socketRoom.emit('chit.delete', id)
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
      const _this = this
      this.decidedImageCallback = function (image) {
        chit.img = image.id
        _this.updateChit({ value: chit.img, field: 'img', id: chit.id })
      }
      this.$refs.chitImagelist.show()
    },
    /**
     * 新規チット用の画像ウィンドウを開く
     */
    openImageListNew (chit) {
      this.decidedImageCallback = function (image) {
        chit.img = image.id
      }
      this.$refs.chitImagelist.show()
    },
    /**
     * チットに対応する画像の検索
     */
    imgFromChit (chit) {
      if (!chit) { return '' }
      const img = chit.img
        ? this.$store.getters.imageById(chit.img)
        : { img: '' }
      // TODO : このreturnを遅延させる必要がある
      return img.bin
    },
    /**
     * チット編集画面を開く
     */
    openChitEdit (id) {
      this.$refs['edit_' + id].show()
    }
  }
}
</script>

<style>
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
  z-index: 3;
}

.c-dselector{
  width: 100%;
  height: 15px;
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
    object-fit: contain;
}
</style>
