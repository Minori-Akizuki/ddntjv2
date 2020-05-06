const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()
const socket = require('socket.io')
const _nano = require('nano')

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

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
        roomDb.insert({ isCreated: initdata.room.isCreated }, 'isCreated')
        roomDb.insert({ roomName: initdata.room.roomName }, 'roomName')
        roomDb.insert({ password: initdata.room.password }, 'password')
        roomDb.insert({ system: initdata.room.system }, 'system')
        roomDb.insert({ chatLog: initdata.room.chatLog }, 'log')
        roomDb.insert({ chits: initdata.room.chits }, 'chits')
        roomDb.insert({ status: initdata.room.status }, 'status')
        roomDb.insert(initdata.room.map, 'map')
      } else {
        roomDb = await nano.db.use(roomDbName)
      }
      rooms.push({ roomDb, member: [] })
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
      }, 'images')

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

  io.on('connection', (socket) => {

    const id = socket.id

    consola.info(`user ${id} connected`)
  })
}
start()
