const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const socket = require('socket.io')
const _nano = require('nano')
const sha = require('js-sha256')

const IDs = {
  images: 'images',
  isCreated: 'isCreated',
  roomNo: 'roomNo',
  roomName: 'roomName',
  password: 'password',
  system: 'system',
  chatLog: 'chatLog',
  chits: 'chits',
  status: 'status',
  map: 'map'
}

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'
process.env.CONSOLA_LEVEL = 6

// 自作ライブラリはnuxtのあとに入れる必要がある。
// import dicebot
const dicebot = require('./dicebot').dicebot()
const systems = []

// import constants
// 変更される可能性があるオブジェクトはこちらで参照する
const constantsF = require('./constants.js').constants
// 変更されないリテラルなどはこちらから参照する
const constants = constantsF()

// db connection
const dbUrl = 'http://' + constants.DB_USERPASS + '@' + constants.DB_HOST + ':' + constants.DB_PORT
const nano = _nano(dbUrl)
let dbMaster
const rooms = []

// init db
function initDb () {
  /**
   * _rooms に各部屋の情報のセットアップをする
   * @param {Array} _rooms 部屋の配列
   * @param {Boolean} reCreate 初期化フラグ
   */
  const setRoom = async function (_rooms, reCreate) {
    for (let i = 0; i < constants.ROOM_TOTAL; i++) {
      const roomDbName = constants.DB_PREFIX + '_room_' + i
      let roomDb
      if (reCreate) {
        // init room DB
        consola.info(`create ${roomDbName}`)
        nano.db.destroy(roomDbName, () => {})
        await nano.db.create(roomDbName)
        roomDb = await nano.db.use(roomDbName)
        const initdata = constantsF().INITDATA
        // TODO : 配列にぶちこんで全部並列に実行する
        await roomDb.insert({ isCreated: initdata.room.isCreated }, IDs.isCreated)
        await roomDb.insert({ value: i }, IDs.roomNo)
        await roomDb.insert({ value: initdata.room.roomName }, IDs.roomName)
        await roomDb.insert({ value: initdata.room.password }, IDs.password)
        await roomDb.insert({ value: initdata.room.system }, IDs.system)
        await roomDb.insert({ value: initdata.room.chatLog }, IDs.chatLog)
        await roomDb.insert({ value: initdata.room.chits }, IDs.chits)
        await roomDb.insert({ value: initdata.room.status }, IDs.status)
        await roomDb.insert(initdata.room.map, IDs.map)
      } else {
        roomDb = await nano.db.use(roomDbName)
      }

      consola.info({
        message: 'chash room Data',
        badge: true
      })
      const roomData = {}
      const isCreated = roomDb.get(IDs.isCreated)
      const roomNo = roomDb.get(IDs.roomNo)
      const roomName = roomDb.get(IDs.roomName)
      const password = roomDb.get(IDs.password)
      const system = roomDb.get(IDs.system)
      const chatLog = roomDb.get(IDs.chatLog)
      const chits = roomDb.get(IDs.chits)
      const status = roomDb.get(IDs.status)
      const map = roomDb.get(IDs.map)

      roomData.isCreated = await isCreated
      roomData.roomNo = await roomNo
      roomData.roomName = await roomName
      roomData.password = await password
      roomData.system = await system
      roomData.chatLog = await chatLog
      roomData.chits = await chits
      roomData.status = await status
      roomData.map = await map
      rooms.push({ roomDb, member: [], roomData })
    }
  }
  consola.info('finding DB...')
  nano.db.get(constants.DB_PREFIX, async function (err, data) {
    if (err) {
      // マスターDBが無い場合、全DBの初期化をする。
      consola.error({
        message: `not found DB ${constants.DB_PREFIX}!`,
        badge: true
      })
      consola.info(`try to initial DB ${constants.DB_PREFIX}`)

      // master DB
      await nano.db.create(constants.DB_PREFIX)
      dbMaster = nano.db.use(constants.DB_PREFIX)
      dbMaster.insert({
        images: constantsF().INITDATA.master.images
      }, IDs.images)

      // rooms
      setRoom(rooms, true)
    } else {
      // マスターDBが見つかった場合は使用準備をする
      consola.info({
        message: `found DB ${constants.DB_PREFIX}`,
        badge: true
      })
      consola.info(data)
      dbMaster = nano.db.use(constants.DB_PREFIX)
      setRoom(rooms, false)
    }
  })
}

initDb()

/**
 * 部屋情報をクライアントが扱いやすい形に成型する
 * @param {部屋情報} roomRaw
 */
function moldRoomData (roomRaw) {
  const room = {}
  room.member = roomRaw.member
  room.isCreated = roomRaw.roomData.isCreated.value
  room.roomNo = roomRaw.roomData.roomNo.value
  room.roomName = roomRaw.roomData.roomName.value
  room.password = roomRaw.roomData.password.value
  room.system = roomRaw.roomData.system.value
  room.chatLog = roomRaw.roomData.chatLog.value
  room.chits = roomRaw.roomData.chits.value
  room.map = roomRaw.roomData.map // こいつだけ _id, _rev が残ってるけどまあいいか

  return room
}

async function start () {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server

  await nuxt.ready()
  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  const server = app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })

  const io = socket(server)
  let systems = null

  io.on('connection', (socket) => {
    const id = socket.id
    let roomNo

    /**
     * idを_roomNoのリストから消去する
     */
    const leaveRoom = function (_roomNo, id) {
      const roomMember = rooms[roomNo].member
      socket.leave(roomNo)
      roomMember.splice(roomMember.findIndex(m => m.id === id), 1)
    }

    consola.info(`user ${id} connected`)

    socket.on('enterRoom', (_roomNo, name) => {
      if (roomNo) {
        leaveRoom(roomNo, id)
      }
      roomNo = _roomNo
      socket.join(roomNo)
      rooms[roomNo].member.push({ id, name })
    })

    socket.on('disconnected', () => {
      consola.info(`user ${id} disconnected`)
      if (roomNo) {
        leaveRoom(roomNo, id)
      }
    })

    socket.on('chat.send', (msg) => {
      io.to(roomNo).emit('chat.receive', msg)
    })

    socket.on('systems', () => {
      if (systems) {
        io.to(id).emit('systems', systems)
      } else {
        dicebot.systems((err, data) => {
          if (err) {
            consola.err(err)
            return
          }
          systems = data
          io.to(id).emit('systems', systems)
        })
      }
    })

    socket.on('roomsinfo', () => {
      consola.info('send info to ' + id)
      io.to(id).emit('roomsinfo', rooms.map((r) => {
        const info = {
          roomNo: r.roomData.roomNo.value,
          isCreated: r.roomData.isCreated.value,
          text: r.roomData.roomName.value,
          password: r.roomData.password.value,
          system: r.roomData.system.value
        }
        consola.info(r)
        consola.info(info)
        return info
      }))
    })

    socket.on('createRoom', async function ({ roomId, roomName, password, system }) {
      consola.info(`create room ${roomId}`)
      const roomDb = rooms[roomId].roomDb
      let isCreated = await roomDb.get(IDs.isCreated)
      consola.info(isCreated)
      if (isCreated.value) {
        consola.error('failed make room')
        io.to(id).emit('createRoom.error', new Error('すでに部屋が作成されています'))
        return
      }
      const roomData = rooms[roomId].roomData
      isCreated = true
      roomData.isCreated.value = true
      roomData.roomName.value = roomName
      roomData.password.value = sha.sha256(password)
      roomData.system.value = system
      io.to(id).emit('createRoom.success')

      roomDb.insert(roomData.isCreated)
      roomDb.insert(roomData.roomName)
      roomDb.insert(roomData.password)
      roomDb.insert(roomData.system)
      consola.info('success create room')
    })
    socket.on('roomData', (roomNo) => {
      consola.info('req room data')
      const room = moldRoomData(rooms[roomNo])
      io.to(id).emit('roomData', room)
    })
  })
}
start()
