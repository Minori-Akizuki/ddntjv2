const BCDice = require('bcdice')

// TODO: BCDice-js にしたからコールバックにする必要がなくなった。リファクタリングする。
exports.dicebot = function () {
  const bcdice = new BCDice.default()
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
      require(`bcdice/lib/diceBot/${system}`)
      const [result, _] = bcdice.roll(command, system)
      if (result === '') {
        callback(new Error('cant perse command', { ok: false }))
        return
      }
      callback(null, { ok: true, result })
    },

    /**
     * システムの一覧を取得する
     * @param {DiceCallback} callback
     */
    systems (callback) {
      const infoList = BCDice.default.infoList.map((info) => {
        const obj = {}
        obj.system = info.gameType
        obj.name = info.gameName
        return obj
      })
      callback(null, { names: infoList })
    },

    /**
     * system の詳細説明を取得する
     * @param {Function} callback
     * @param {String} system
     */
    systeminfo (callback, system) {
      callback(null, BCDice.default.infoList.find(info => info.gameType === system))
    }
    /**
     * @callback DiceCallback
     * @param err
     * @param body
     */
  }
  return _dicebot
}
