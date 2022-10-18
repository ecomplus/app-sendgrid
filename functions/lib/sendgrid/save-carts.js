const { firestore } = require('firebase-admin')
const getCartById = require('./utils').getApiResourceById
const handleErr = require('./utils').handleErr

module.exports = async (res, appSdk, appData, trigger, storeId) => {
  console.log('# Carts')
  if (appData.is_abandoned_after_days) {
    const cartId = trigger.inserted_id
    try {
      const cart = await getCartById(appSdk, storeId, 'carts', cartId)
      if (cart) {
        const { customers, available, completed } = cart
        if (available && completed === false) {
          const afterDaysInMs = appData.is_abandoned_after_days * 24 * 60 * 60 * 1000
          const createAt = new Date()
          const sendIn = new Date(createAt.getTime() + afterDaysInMs)
          const customerId = customers[0]

          firestore()
            .collection('sg_abandoned_cart')
            .doc(cartId)
            .set({
              storeId,
              cartId,
              customerId,
              createAt,
              sendIn
            }, { merge: true })
            .then(() => {
              // console.log('>> Cart saved successfully')
              res.send('SUCCESS')
            })
        } else {
          // console.log('>> Cart already completed or available')
          res.send('SUCCESS')
        }
      } else {
        // console.error('>> Not Found Cart')
        res.status(404).send({ message: 'Not Found Cart' })
      }
    } catch (err) {
      handleErr(res, err)
    }
  } else {
    // console.error('>> Send email for abandoned carts not configured #s: ', storeId)
    res.status(400).send({ message: 'Send email for abandoned carts not configuredt' })
  }
}
