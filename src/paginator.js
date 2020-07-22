const { log } = require('cozy-konnector-libs')
const merge = require('lodash/merge')
const { baseHeaders, request } = require('./request')
const { generateConversationId } = require('./auth')

module.exports = function Paginator(url, token, params) {
  const nbElements = 25
  let indexPage = 0
  let resultsCount = 0
  let retries = 3

  return {
    async next() {
      try {
        const response = await request({
          method: 'GET',
          uri: url,
          headers: merge(baseHeaders, {
            ConversationId: generateConversationId(),
            token
          }),
          qs: merge(params, {
            indexPage,
            nbElements
          }),
          body: {}
        })
        const { resultats = [], nbTotalResultats = 0 } = response

        resultsCount += resultats.length
        indexPage++

        return { items: resultats, last: resultsCount >= nbTotalResultats }
      } catch (e) {
        this.retries--
        log('error', e.toString() + `[retries left: ${retries}]`)
        return { items: [], last: retries === 0 }
      }
    }
  }
}
