<template>
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
</template>

<script>
export default {
  components: {
  },
  props: {
    deleatkey: {
      type: Boolean,
      default: false
    },
    chit: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
    }
  },
  computed: {
  }
}
</script>

<style>

</style>
