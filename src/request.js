const { requestFactory } = require('cozy-konnector-libs')
const merge = require('lodash/merge')

const baseUrl = 'https://ael.eauxdegrenoblealpes.fr/webapi'
const baseHeaders = {
  Host: 'ael.eauxdegrenoblealpes.fr',
  Referer: 'https://ael.eauxdegrenoblealpes.fr/'
}

const headers = extra => merge(baseHeaders, extra)

const request = requestFactory({
  // debug: true,
  simple: false,
  jar: true,
  json: true
})

module.exports = {
  baseUrl,
  headers,
  request
}
