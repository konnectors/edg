const { requestFactory } = require('cozy-konnector-libs')

const baseUrl = 'https://ael.eauxdegrenoblealpes.fr/webapi'
const baseHeaders = {
  Host: 'ael.eauxdegrenoblealpes.fr',
  Referer: 'https://ael.eauxdegrenoblealpes.fr/'
}
const request = requestFactory({
  // debug: true,
  simple: false,
  jar: true,
  json: true
})

module.exports = {
  baseUrl,
  baseHeaders,
  request
}
