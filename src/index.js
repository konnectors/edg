const { log, BaseKonnector, mkdirp, saveFiles } = require('cozy-konnector-libs')
const { posix } = require('path')
const { authenticate } = require('./auth')
const { fetchSubscriptions } = require('./subscriptions')

module.exports = new BaseKonnector(start)

// The start function is run by the BaseKonnector instance only when it got all the account
// information (fields). When you run this connector yourself in "standalone" mode or "dev" mode,
// the account information come from ./konnector-dev-config.json file.
async function start(fields) {
  await this.deactivateAutoSuccessfulLogin()
  const token = await authenticate(fields.login, fields.password)
  await this.notifySuccessfulLogin()

  return Promise.all(
    (await fetchSubscriptions(token)).map(async sub => {
      await sub.fetchAddress()
      const folderPath = posix.join(fields.folderPath, sub.folderPath())
      log('debug', { folderPath })

      await mkdirp(folderPath)

      await sub.fetchBills()

      const entries = await sub.newEntries()
      await saveFiles(
        entries,
        { folderPath: folderPath },
        {
          contentType: 'application/pdf',
          fileIdAttributes: ['vendorRef'],
          sourceAccount: this.accountId,
          sourceAccountIdentifier: fields.login
        }
      )
    })
  )
}
