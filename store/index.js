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
    img: ''
  }
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
  }
}
