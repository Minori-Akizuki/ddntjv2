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
    state.sockets[name] = socket
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
  }
}
