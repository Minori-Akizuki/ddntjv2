exports.constants = () => {
  const _constatnts = {
    DB_HOST: 'localhost',
    DB_PORT: '5984',
    DB_USERPASS: 'admin:admin',
    DB_PREFIX: 'dtj',
    ROOM_TOTAL: 3,
    INITDATA: {
      master: {
        mages: []
      },
      room: {
        isCreated: false,
        roomNo: null,
        roomName: '',
        password: '',
        system: '',
        chatLog: [],
        chits: [],
        status: 'HP MP *毒',
        map: {
          height: 10,
          width: 10,
          type: 'color',
          color: '#888888',
          image: 0,
          snapping: false
        }
      }
    }
  }
  return _constatnts
}
