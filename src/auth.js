const { log } = require('cozy-konnector-libs')
const merge = require('lodash/merge')
const { baseUrl, baseHeaders, request } = require('./request')

const authenticationUrl = baseUrl + '/Utilisateur/authentification'
const tokenGenerationUrl = baseUrl + '/Acces/generateToken'
const accessKey = 'Bh!66-EDGA-GRE-MP1-PRD'
const clientId = 'AEL-TOKEN-EDGA-PRD'
const LOGIN_FAILED = 'LOGIN_FAILED'

module.exports = {
  authenticate,
  requestToken,
  generateConversationId
}

async function authenticate(login, password) {
  log('info', 'Authenticating...')

  const token = await requestToken()

  try {
    const response = await request({
      method: 'POST',
      uri: authenticationUrl,
      headers: merge(baseHeaders, {
        ConversationId: generateConversationId(),
        token: token
      }),
      body: {
        identifiant: login,
        motDePasseMD5: password
      }
    })

    if (!response.tokenAuthentique) {
      log('debug', response)
      throw new Error('Missing token from response')
    }

    log('debug', `tokenAuthentique: ${response.tokenAuthentique}`)
    return response.tokenAuthentique
  } catch (e) {
    log('error', e.toString())
    throw new Error(LOGIN_FAILED)
  }
}

async function requestToken() {
  log('info', 'Requesting token...')

  try {
    const response = await request({
      method: 'POST',
      uri: tokenGenerationUrl,
      headers: merge(baseHeaders, {
        ConversationId: generateConversationId(),
        Token: accessKey
      }),
      body: {
        ConversationId: generateConversationId(),
        ClientId: clientId,
        AccessKey: accessKey
      }
    })

    log('debug', `token: ${response.token}`)
    return response.token
  } catch (e) {
    log('error', e.toString())
    return null
  }
}

function generateConversationId() {
  log('info', 'Generating conversation id...')

  const prefix = 'JS-WEB-Netscape'
  const now = new Date().getTime()
  const randomPattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  const rand = randomPattern.replace(/[xy]/g, a => {
    const b = (16 * Math.random()) | 0,
      c = 'x' === a ? b : (3 & b) | 8
    return c.toString(16)
  })

  const id = `${prefix}-${now}-${rand}`

  log('debug', `ConversationId: ${id}`)
  return id
}
