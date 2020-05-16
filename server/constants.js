exports.constants = () => {
  const _constatnts = {
    DB_HOST: 'localhost', // CouchDBのホスト
    DB_PORT: '5984', // CouchDBのポート
    DB_USERPASS: 'admin:admin', // CouchDBのパスワード
    DB_PREFIX: 'dtj', // 作成されるDBにつく名前
    ROOM_TOTAL: 3, // 部屋数上限
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
