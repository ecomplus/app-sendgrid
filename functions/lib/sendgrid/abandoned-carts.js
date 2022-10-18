// const { firestore } = require('firebase-admin')
const getAppData = require('../../lib/store-api/get-app-data')
const parseCartToSend = require('../../lib/sendgrid/parse-data-to-send')
const getApiResourceById = require('../../lib/sendgrid/utils').getApiResourceById
const sendEmail = require('../../lib/sendgrid/utils').sgSendMail

module.exports = async (appSdk, admin) => {
  console.log('# Check acandoned carts')
  const abandonedCarts = await admin.firestore().collection('sg_abandoned_cart')
    .where('sendIn', '<', admin.firestore.Timestamp.fromDate(new Date()))
    .limit(400) // https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/rate-limits
    .get()

  const allDocsCarts = abandonedCarts.docs

  if (allDocsCarts && Array.isArray(allDocsCarts)) {
    allDocsCarts.forEach(snapshot => {
      const doc = snapshot.data()
      // console.log('>>Doc: ', doc)
      const storeId = doc.storeId
      const cartId = doc.cartId
      const customerId = doc.customerId
      console.log(`>> Preparing to send email: s:${storeId}, cart:${cartId} `)
      // get app configured options
      getAppData({ appSdk, storeId })
        .then(async (appData) => {
          const apiKey = appData.sendgrid_api_key
          const merchantEmail = appData.sendgrid_mail
          if (apiKey && merchantEmail) {
            const [store, cart, customer] = await Promise.all([
              getApiResourceById(appSdk, storeId, 'stores', 'me'),
              getApiResourceById(appSdk, storeId, 'carts', cartId),
              getApiResourceById(appSdk, storeId, 'customers', customerId)
            ])
            if (cart && store && customer) {
              if (cart.available && cart.completed === false) {
                const emailData = parseCartToSend(appData, 'abandoned_cart', cart, store, customer)
                if (emailData) {
                  sendEmail(emailData, apiKey)
                    .then((data) => {
                      console.log('>> Email sent ', data)
                      snapshot.ref.delete()
                        .catch(console.error)
                    })
                    .catch(err => {
                      console.error(`>>#${storeId} Error send email => `, err)
                    })
                } else {
                  console.log(`>> Do not send email, email data not found or trigger not configured #${storeId}`)
                }
              } else {
                console.log('>> Cart already completed or available')
              }
            } else {
              console.error(`>> Not found Cart, Store or Customer #${storeId}`)
            }
          } else {
            console.error(`>> Store #${storeId}, SendGrid API key or Merchant email not configured`)
          }
        })
        .catch(err => {
          console.error(`>> Store #${storeId} Error => `, err)
        })
    })
  }
}
