const { log, Document, hydrateAndFilter } = require('cozy-konnector-libs')
const merge = require('lodash/merge')
const { baseUrl, baseHeaders, request } = require('./request')
const { generateConversationId } = require('./auth')

const subscriptionsUrl = baseUrl + '/Abonnement/listeAbonnements'
const billsUrl = baseUrl + '/Facture/listeFactures/'
const pdfUrl = baseUrl + '/Facture/telechargePdf/'

class Subscription {
  constructor(
    token,
    {
      numeroContrat,
      typeContrat: { libelle },
      adresseLivraisonConstruite
    }
  ) {
    this.token = token
    this.id = numeroContrat
    this.type = libelle
    this.address = adresseLivraisonConstruite
    this.bills = []
  }

  async fetchBills() {
    log('info', 'Fetching bills...')

    try {
      const response = await request({
        method: 'GET',
        uri: billsUrl + this.id,
        headers: merge(baseHeaders, {
          ConversationId: generateConversationId(),
          token: this.token
        }),
        body: {}
      })

      log('debug', `Results count: ${response.resultats.length}`)
      this.bills = response.resultats.map(result => new Bill(result))
    } catch (e) {
      log('error', e.toString())
      this.bills = []
    }
  }

  async newEntries() {
    const newBills = await hydrateAndFilter(this.bills, 'io.cozy.files', {
      keys: ['id']
    })

    return newBills.map(bill => {
      return {
        id: bill.id,
        fileurl: bill.fileurl(),
        filename: bill.filename(),
        requestOptions: {
          qs: { token: this.token }
        }
      }
    })
  }

  folderPath() {
    const re = /^(.+)\d{5}/
    const street = re.exec(this.address)[1].trim()
    return `${street}/${this.type}`
  }
}

class Bill extends Document {
  constructor({
    numeroContrat,
    identifiantInterneFacture,
    numeroFactureClient
  }) {
    super({})
    this.id = identifiantInterneFacture
    this.subscriptionId = numeroContrat
    this.label = numeroFactureClient
  }

  fileurl() {
    return pdfUrl + `${this.id}/${this.subscriptionId}/${this.label}`
  }

  filename() {
    return `${this.subscriptionId}-Facture_${this.label}.pdf`
  }
}

async function fetchSubscriptions(token) {
  log('info', 'Fetching subscriptions...')

  try {
    const response = await request({
      method: 'GET',
      uri: subscriptionsUrl,
      headers: merge(baseHeaders, {
        ConversationId: generateConversationId(),
        token: token
      }),
      body: {}
    })

    log('debug', `Results count: ${response.resultats.length}`)
    return response.resultats.map(result => new Subscription(token, result))
  } catch (e) {
    log('error', e.toString())
    return []
  }
}

module.exports = {
  fetchSubscriptions
}
