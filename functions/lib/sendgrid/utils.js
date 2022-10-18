const axios = require('axios')

const getApiResourceById = (appSdk, storeId, resource, resourceId) => {
  const url = `/${resource}/${resourceId}.json`
  return new Promise(resolve => {
    appSdk
      .apiRequest(storeId, url, 'GET')
      .then((result) => {
        resolve(result.response.data)
      })
      .catch(e => {
        console.error(e)
        resolve(null)
      })
  })
}

const sgAxios = axios.create({
  baseURL: 'https://api.sendgrid.com/v3/mail',
  headers: {
    'Content-Type': 'application/json'
  }
})

const sgSendMail = (bodyMail, apiKey) => {
  // console.log('>> Sending email... ')
  return sgAxios.post('/send', bodyMail, {
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  })
}

const updateOrderSubresource = (appSdk, storeId, orderId, subresource, lastValidRecord, insertedId) => {
  const statusRecordId = lastValidRecord ? lastValidRecord._id : insertedId
  const url = `orders/${orderId}/${subresource}/${statusRecordId}.json`
  const data = {
    customer_notified: true
  }
  // console.log(`>> Email Send: #${storeId} ${statusRecordId}`)
  return appSdk.apiRequest(storeId, url, 'PATCH', data)
}

const handleErr = (res, err) => {
  console.error(err)
  // request to Store API with error response
  // return error status code
  if (axios.isAxiosError(err)) {
    let message = 'Axios error '
    if (err.message || err.code) {
      message += ` ${err.code}: ${err.message}`
      if (err.response?.data) {
        message += `\n\n${JSON.stringify(err.response.data)}`
      }
    }
    res.status(err.response.status || 500)
    res.send({
      error: 'STORE_API_ERR',
      message
    })
  } else {
    res.status(500)
    const { message } = err
    res.send({
      error: 'STORE_API_ERR',
      message
    })
  }
}

module.exports = {
  getApiResourceById,
  updateOrderSubresource,
  sgSendMail,
  handleErr
}
