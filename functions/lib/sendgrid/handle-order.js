const parseOrderToSend = require('./parse-data-to-send')
const getApiResourceById = require('./utils').getApiResourceById
const sendEmail = require('./utils').sgSendMail
const updateOrderSubresource = require('./utils').updateOrderSubresource
const handleErr = require('./utils').handleErr

const orderStatus = [
  'pending',
  'under_analysis',
  'authorized',
  'unauthorized',
  'partially_paid',
  'paid',
  'in_dispute',
  'partially_refunded',
  'refunded',
  'canceled',
  'voided',
  'invoice_issued',
  'in_production',
  'in_separation',
  'ready_for_shipping',
  'partially_shipped',
  'shipped',
  'partially_delivered',
  'delivered',
  'returned_for_exchange',
  'received_for_exchange',
  'returned'
]

module.exports = async (res, appSdk, trigger, appData, storeId) => {
  const apiKey = appData.sendgrid_api_key
  console.log('# Order')
  const { subresource, action } = trigger
  if (action !== 'delete') {
    const resourceId = trigger.resource_id || null
    const insertedId = trigger.inserted_id || null
    const orderId = resourceId || insertedId

    const [store, order] = await Promise.all([
      getApiResourceById(appSdk, storeId, 'stores', 'me'),
      getApiResourceById(appSdk, storeId, 'orders', orderId)
    ])

    if (order && store) {
      let status = order.status
      let lastValidRecord
      const customerId = order.buyers[0]._id
      const customer = await getApiResourceById(appSdk, storeId, 'customers', customerId)
      if (customer) {
        // if (subresource === 'fulfillments' || subresource === 'payments_history')
        let isCustomerNotified, lastNotifiedStatus

        if (Array.isArray(order[subresource])) {
          const sortedRecords = order[subresource]
            .sort((a, b) => a.date_time > b.date_time ? -1 : 1)

          lastValidRecord = sortedRecords.find(({ status }) => orderStatus.includes(status))

          if (lastValidRecord) {
            status = lastValidRecord.status
          }

          isCustomerNotified = Boolean(order[subresource]
            .find(entry => entry._id === trigger.inserted_id && entry.customer_notified))

          if (!isCustomerNotified) {
            const lastNotification = sortedRecords.find(entry => entry.customer_notified)

            if (lastNotification) {
              lastNotifiedStatus = lastNotification.status
            }
          }
        }

        if (!isCustomerNotified && lastNotifiedStatus !== status) {
          console.log('> Notify the customer <')
          let emailData

          if (subresource === 'payments_history') {
            if (!order.financial_status) {
              order.financial_status = {
                current: status
              }
            }

            if (
              !lastNotifiedStatus &&
              order.status !== 'cancelled' &&
              status !== 'unauthorized' &&
              status !== 'in_dispute' &&
              status !== 'refunded' &&
              status !== 'voided'
            ) {
              // new order
              emailData = parseOrderToSend(appData, 'new_order', order, store, customer)
            } else if (
              status !== 'under_analysis' ||
              Date.now() - new Date(order.created_at).getTime() > 180000
            ) {
              emailData = parseOrderToSend(appData, status, order, store, customer)
            }
          } else {
            if (!order.fulfillment_status) {
              order.fulfillment_status = {
                current: status
              }
            }
            emailData = parseOrderToSend(appData, status, order, store, customer)
          }

          if (emailData) {
            try {
              await sendEmail(emailData, apiKey)
              if (subresource === 'payments_history' || subresource === 'fulfillment') {
                await updateOrderSubresource(appSdk, storeId, orderId, subresource, lastNotifiedStatus, insertedId)
              }
              res.send('SUCCESS')
            } catch (e) {
              console.error(e)
              handleErr(res, e)
            }
          } else {
            console.log('>> Do not send email, email data not found or trigger not configured')
            res.send('SUCCESS')
          }
        } else {
          console.log('>> Customer already notified of this status')
          res.send('SUCCESS')
        }
      } else {
        console.error('>> Not Found Customer')
        res.status(404).send({ message: 'Not Found Customer' })
      }
    } else {
      console.error('>> Not found Order or Store')
      res.status(404).send({ message: 'Not found Order or Store' })
    }
  } else {
    console.log('>> Not send Email, ', action)
    res.send('SUCCESS')
  }
}
