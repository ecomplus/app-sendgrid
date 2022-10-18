// read configured E-Com Plus app data
const getAppData = require('./../../lib/store-api/get-app-data')
const handleOrder = require('./../../lib/sendgrid/handle-order')
const saveCarts = require('./../../lib/sendgrid/save-carts')

const SKIP_TRIGGER_NAME = 'SkipTrigger'
const ECHO_SKIP = 'SKIP'
const ECHO_API_ERROR = 'STORE_API_ERR'

exports.post = ({ appSdk }, req, res) => {
  console.log('>> Webhook API ')
  // receiving notification from Store API
  const { storeId } = req

  /**
   * Treat E-Com Plus trigger body here
   * Ref.: https://developers.e-com.plus/docs/api/#/store/triggers/
   */
  const trigger = req.body
  const { resource, subresource, action } = trigger

  // get app configured options
  getAppData({ appSdk, storeId })
    .then(async (appData) => {
      if (
        Array.isArray(appData.ignore_triggers) &&
        appData.ignore_triggers.indexOf(trigger.resource) > -1
      ) {
        // ignore current trigger
        const err = new Error()
        err.name = SKIP_TRIGGER_NAME
        throw err
      }

      if (!appData.sendgrid_api_key || appData.sendgrid_api_key === '') {
        const msg = `Webhook for ${storeId}, SendGrid API key not configured`
        res.status(412).send(msg)
      }

      if (!appData.sendgrid_mail || appData.sendgrid_mail === '') {
        const msg = `Webhook for ${storeId}, SendGrid Merchant email not configured`
        res.status(412).send(msg)
      }

      console.log('> ', action, ': ', resource, '[', subresource, '] <')
      switch (resource) {
        case 'carts': // abandoned cart
          await saveCarts(res, appSdk, appData, trigger, storeId)
          break
        case 'orders':
          await handleOrder(res, appSdk, appData, trigger, storeId)
          break
      }
    })
    .catch(err => {
      if (err.name === SKIP_TRIGGER_NAME) {
        // trigger ignored by app configuration
        res.send(ECHO_SKIP)
      } else if (err.appWithoutAuth === true) {
        const msg = `Webhook for ${storeId} unhandled with no authentication found`
        const error = new Error(msg)
        error.trigger = JSON.stringify(trigger)
        console.error(error)
        res.status(412).send(msg)
      } else {
        // console.error(err)
        // request to Store API with error response
        // return error status code
        res.status(500)
        const { message } = err
        res.send({
          error: ECHO_API_ERROR,
          message
        })
      }
    })
}
