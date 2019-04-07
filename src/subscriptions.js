const { log, Document, hydrateAndFilter } = require('cozy-konnector-libs')
const { baseUrl } = require('./request')
const Paginator = require('./paginator.js')

const subscriptionsUrl = baseUrl + '/Abonnement/contrats'
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
