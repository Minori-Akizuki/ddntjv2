import Vue from 'vue'
export const strict = false
export const state = () => ({
  sockets: {},
  systems: [],
  chits: [
    { id: 1, img: null, name: 'testChit', initiative: 0, status: {}, memo: 'hogehoge' },
    { id: 2, img: null, name: 'testChit2', initiative: 0, status: {}, memo: 'hugahuga' }
  ],
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
  setSocket (state, { socket, name }) {
    Vue.set(state.sockets, name, socket)
  },
  setSystems (state, { systems }) {
    state.systems.splice(0)
    state.systems.push(...systems)
  },
  setImages (state, { images }) {
    state.images = images
  },
  setMap (state, { map }) {
    state.map = map
  }
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
