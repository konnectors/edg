const { log, Document, hydrateAndFilter } = require('cozy-konnector-libs')
const { posix } = require('path')
const { baseUrl, headers, request } = require('./request')
const Paginator = require('./paginator.js')
const { generateConversationId } = require('./auth')

const subscriptionsUrl = baseUrl + '/Abonnement/contrats'
const subscriptionUrl = baseUrl + '/Abonnement/detailAbonnement/'
const billsUrl = baseUrl + '/Facture/listeFactures'
const pdfUrl = baseUrl + '/Facture/telecharger/'

class Subscription {
  constructor(
    token,
    {
      numeroContrat,
      typeContrat: { libelle }
    }
  ) {
    this.token = token
    this.id = numeroContrat
    this.type = libelle
    this.street = ''
    this.bills = []
  }

  async fetchAddress() {
    try {
      const { adresseLivraison } = await request({
        method: 'GET',
        uri: subscriptionUrl + this.id,
        headers: headers({
          ConversationId: generateConversationId(),
          token: this.token
        })
      })
      // We only keep the street address for now
      this.street = adresseLivraison.adresse
    } catch (e) {
      log('error', e.toString())
    }
  }

  async fetchBills() {
    log('info', 'Fetching bills...')

    const params = {
      numeroContrat: this.id,
      recherche: '',
      tri: '',
      triDecroissant: false,
      dateDebut: '',
      dateFin: '',
      listeColonnes: ''
    }
    const pages = new Paginator(billsUrl, this.token, params)

    let page = { items: [], last: false }
    do {
      page = await pages.next()
      log('debug', `Results count: ${page.items.length}`)
      this.bills = this.bills.concat(page.items.map(item => new Bill(item)))
    } while (!page.last)
  }

  async newEntries() {
    const newBills = await hydrateAndFilter(this.bills, 'io.cozy.files', {
      keys: ['id']
    })

    return newBills.map(bill => {
      return {
        id: bill.id,
        vendorRef: bill.id,
        fileurl: bill.fileurl(),
        filename: bill.filename(),
        requestOptions: {
          headers: { ConversationId: generateConversationId() },
          qs: { token: this.token }
        }
      }
    })
  }

  folderPath() {
    return posix.join(this.street, this.type)
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

  const params = {
    userWebId: '',
    recherche: '',
    tri: '',
    triDecroissant: false
  }
  const pages = new Paginator(subscriptionsUrl, token, params)

  let page = { items: [], last: false }
  do {
    page = await pages.next()
    log('debug', `Results count: ${page.items.length}`)
    return page.items.map(item => new Subscription(token, item))
  } while (!page.last)
}

module.exports = {
  fetchSubscriptions
}
