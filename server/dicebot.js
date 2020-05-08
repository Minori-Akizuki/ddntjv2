const https = require('http')
const consola = require('consola')
const $ = require('jquery')

const BOTURL = 'http://localhost:9292/v1/'

exports.dicebot = function () {
  const _dicebot = {
    /**
     * systemでcommandのダイスを振る。
     * @param {DiceCallback} callback
     * @param {String} system
     * @param {String} command
     */
    roll (callback, system, command) {
      // 半角英数字で始まらない文字列はAPIに送らない
      if (!command.match(/^[A-Za-z0-9]/)) {
        callback(null, { ok: false })
        return
      }
      const _command = encodeURIComponent(command)
      const reqUrl = `${BOTURL}diceroll?system=${system}&command=${_command}`
      consola.debug(`requrl : ${reqUrl}`)
      const options = {
        headers: {
          // todo: ヘッダで強制的にjson返すようにしたい
        }
      }
      https.get(
        reqUrl,
        options,
        (res) => {
          let body = ''
          if (res.headers['content-type'] === 'text/html') {
            callback(new Error('incorrect response'), { ok: false })
            return
          }
          res.setEncoding('utf8')
          res.on('data', (chunk) => {
            body += chunk
          })
          res.on('end', (res) => {
            const _res = JSON.parse(body)
            callback(_res)
          })
        }
      )
    },

    /**
     * システムの一覧を取得する
     * @param {DiceCallback} callback
     */
    systems (callback) {
      const reqUrl = BOTURL + 'names'
      https.get(
        reqUrl,
        {},
        (res) => {
          let body = ''
          if (res.headers['content-type'] === 'text/html') {
            callback(new Error('incorrect response'), { ok: false })
            return
          }
          res.setEncoding('utf8')
          res.on('data', (chunk) => {
            body += chunk
          })
          res.on('end', (res) => {
            const _res = JSON.parse(body)
            callback(null, _res)
          })
        }
      )
    },

    /**
     * system の詳細説明を取得する
     * @param {Function} callback
     * @param {String} system
     */
    systeminfo (callback, system) {
      $.getJSON(
        BOTURL + '/systeminfo?system=' + system
      ).done(
        callback
      )
    }
    /**
     * @callback DiceCallback
     * @param err
     * @param body
     */
  }
  return _dicebot
}
