import Vue from 'vue'
import io from 'socket.io-client'
export const strict = false
export const state = () => ({
  sockets: {},
  systems: [],
  chits: [],
  map: {
    width: 10,
    height: 10,
    type: 'color',
    color: '#880000',
    img: '0',
    snap: false
  },
  images: []
})

export const mutations = {
  setSocket (state, { name }) {
    if (state.sockets[name]) {
      return
    }
    const socket = io()
    Vue.set(state.sockets, name, socket)
  },
  setSystems (state, { systems }) {
    state.systems.splice(0)
    state.systems.push(...systems)
  },
  setImages (state, { images }) {
    state.images = images
  },
  addImage (state, { image }) {
    state.images.push(image)
  },
  deleteImage (state, { id }) {
    state.images.splice(state.images.findIndex(i => i.id === id), 1)
  },
  setMap (state, { map }) {
    state.map = map
  },
  setChits (state, { chits }) {
    state.chits = chits
  },
  addChit (state, { chit }) {
    console.log('state.addChit', chit.toString())
    if (state.chits.findIndex(c => c.id === chit.id) !== -1) {
      throw new Error('duplicate chit id')
    }
    state.chits.push(chit)
  },
  deleteChit (state, { id }) {
    state.chits.splite(state.chits.findIndex(c => c.id === id), 1)
  },
  updateChitStatus (state, { id, status }) {
    const index = state.chits.findIndex(c => c.id === id)
    if (index === -1) {
      throw new Error('chit not found')
    }
    state.chits[index].status = status
  },
  updateChit (state, { chit }) {
    const index = state.chits.findIndex(c => c.id === chit.id)
    if (index === -1) {
      throw new Error('chit not found')
    }
    state.chits[index] = chit
  }
}

export const actions = {

}

export const getters = {
  socket (state) {
    return (name) => { return state.sockets[name] }
  },
  map (state) {
    return state.map
  },
  chits (state) {
    return state.chits
  },
  chit: state => (id) => {
    return state.chits[state.chits.findIndex(c => c.id === id)]
  },
  images (state) {
    return state.images
  },
  imageById: state => (id) => {
    return state.images[state.images.findIndex(i => i.id === id)]
  },
  systems (state) {
    return state.systems
  },
  systemsToSelection (state) {
    return state.systems.map((s) => {
      return {
        value: s.system,
        text: s.name
      }
    })
  }
}
