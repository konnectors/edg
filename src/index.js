const {
  log,
  BaseKonnector,
  mkdirp,
  addData,
  saveFiles
} = require('cozy-konnector-libs')
const { authenticate } = require('./auth')
const { fetchSubscriptions } = require('./subscriptions')

module.exports = new BaseKonnector(start)

// The start function is run by the BaseKonnector instance only when it got all the account
// information (fields). When you run this connector yourself in "standalone" mode or "dev" mode,
// the account information come from ./konnector-dev-config.json file
async function start(fields) {
  log('debug', { fields })
  const token = await authenticate(fields.login, fields.password)

  return (await fetchSubscriptions(token)).map(async sub => {
    const folderPath = [fields.folderPath, sub.folderPath()].join('/')
    log('debug', { folderPath })

    await mkdirp(folderPath)

    await sub.fetchBills()

    const entries = await sub.newEntries()
    await addData(entries, 'io.cozy.files')
    await saveFiles(
      entries,
      { folderPath: folderPath },
      { contentType: 'application/pdf' }
    )
  })
}
