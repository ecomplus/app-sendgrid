/* eslint-disable comma-dangle, no-multi-spaces, key-spacing */

/**
 * Edit base E-Com Plus Application object here.
 * Ref.: https://developers.e-com.plus/docs/api/#/store/applications/
 */

const app = {
  app_id: 129856,
  title: 'SendGrid',
  slug: 'sendgrid',
  type: 'external',
  state: 'active',
  authentication: true,
  github_repository: 'https://github.com/ecomplus/app-sendgrid',

  /**
   * Uncomment modules above to work with E-Com Plus Mods API on Storefront.
   * Ref.: https://developers.e-com.plus/modules-api/
   */
  modules: {
    /**
     * Triggered to calculate shipping options, must return values and deadlines.
     * Start editing `routes/ecom/modules/calculate-shipping.js`
     */
    // calculate_shipping:   { enabled: true },

    /**
     * Triggered to validate and apply discount value, must return discount and conditions.
     * Start editing `routes/ecom/modules/apply-discount.js`
     */
    // apply_discount:       { enabled: true },

    /**
     * Triggered when listing payments, must return available payment methods.
     * Start editing `routes/ecom/modules/list-payments.js`
     */
    // list_payments:        { enabled: true },

    /**
     * Triggered when order is being closed, must create payment transaction and return info.
     * Start editing `routes/ecom/modules/create-transaction.js`
     */
    // create_transaction:   { enabled: true },
  },

  /**
   * Uncomment only the resources/methods your app may need to consume through Store API.
   */
  auth_scope: {
    'stores/me': [
      'GET'            // Read store info
    ],
    procedures: [
      'POST'           // Create procedures to receive webhooks
    ],
    products: [
      // 'GET',           // Read products with public and private fields
      // 'POST',          // Create products
      // 'PATCH',         // Edit products
      // 'PUT',           // Overwrite products
      // 'DELETE',        // Delete products
    ],
    brands: [
      // 'GET',           // List/read brands with public and private fields
      // 'POST',          // Create brands
      // 'PATCH',         // Edit brands
      // 'PUT',           // Overwrite brands
      // 'DELETE',        // Delete brands
    ],
    categories: [
      // 'GET',           // List/read categories with public and private fields
      // 'POST',          // Create categories
      // 'PATCH',         // Edit categories
      // 'PUT',           // Overwrite categories
      // 'DELETE',        // Delete categories
    ],
    customers: [
      'GET',           // List/read customers
      // 'POST',          // Create customers
      // 'PATCH',         // Edit customers
      // 'PUT',           // Overwrite customers
      // 'DELETE',        // Delete customers
    ],
    orders: [
      'GET',           // List/read orders with public and private fields
      // 'POST',          // Create orders
      // 'PATCH',         // Edit orders
      // 'PUT',           // Overwrite orders
      // 'DELETE',        // Delete orders
    ],
    carts: [
      'GET',           // List all carts (no auth needed to read specific cart only)
      // 'POST',          // Create carts
      // 'PATCH',         // Edit carts
      // 'PUT',           // Overwrite carts
      // 'DELETE',        // Delete carts
    ],

    /**
     * Prefer using fulfillments and payment_history subresources to manipulate update order status.
     */
    'orders/fulfillments': [
      // 'GET',           // List/read order fulfillment and tracking events
      // 'POST',          // Create fulfillment event with new status
      'PATCH'
      // 'DELETE',        // Delete fulfillment event
    ],
    'orders/payments_history': [
      // 'GET',           // List/read order payments history events
      // 'POST',          // Create payments history entry with new status
      'PATCH'
      // 'DELETE',        // Delete payments history entry
    ],

    /**
     * Set above 'quantity' and 'price' subresources if you don't need access for full product document.
     * Stock and price management only.
     */
    'products/quantity': [
      // 'GET',           // Read product available quantity
      // 'PUT',           // Set product stock quantity
    ],
    'products/variations/quantity': [
      // 'GET',           // Read variaton available quantity
      // 'PUT',           // Set variation stock quantity
    ],
    'products/price': [
      // 'GET',           // Read product current sale price
      // 'PUT',           // Set product sale price
    ],
    'products/variations/price': [
      // 'GET',           // Read variation current sale price
      // 'PUT',           // Set variation sale price
    ],

    /**
     * You can also set any other valid resource/subresource combination.
     * Ref.: https://developers.e-com.plus/docs/api/#/store/
     */
  },

  admin_settings: {
    sendgrid_mail: {
      schema: {
        type: 'string',
        title: 'E-mail configurado no SendGrid',
        description: 'Seu e-mail de remetente configurado no SendGrid ( https://app.sendgrid.com/settings/sender_auth/senders )'
      },
      hide: true,
    },
    sendgrid_api_key: {
      schema: {
        type: 'string',
        title: 'SendGrid key',
        description: 'API key do SendGrid ( https://app.sendgrid.com/settings/api_keys )'
      },
      hide: true,
    },
    abandoned_cart_delay: {
      schema: {
        type: 'integer',
        title: 'Carrinho Abandonado',
        description: 'Após quantas horas avisar ao comprador sobre o carrinho abandonado'
      },
      hide: false,
    },
    sendgrid_templates: {
      schema: {
        type: 'array',
        title: 'Templantes dos e-mails',
        description: 'Selecione para quais tipos de gatilhos os e-mails serão enviados',
        uniqueItems: true,
        items: {
          type: 'object',
          required: ['trigger', 'id'],
          properties: {
            trigger: {
              type: 'string',
              enum: [
                'Carrinho Abandonado',
                'Novo Pedido',
                'Pendente',
                'Sobre Analise',
                'Autorizado',
                'Não Autorizado',
                'Pago',
                'Em Disputa',
                'Devolvido',
                'Cancelado',
                'Fatura Emitida',
                'Em Produção',
                'Em Separação',
                'Pronto para Envio',
                'Enviado',
                'Entregue',
                'Voltou para Troca',
                'Recebido para Troca',
                'Retornado',
                'Parcialmente Pago',
                'Parcialmente Ressarcido',
                'Sem Status',
                'Enviado Parcialmente',
                'Parcialmente Entregue'
              ],
              title: 'Gatilhos',
              description: 'Gatilho de e-mail'
            },
            id: {
              type: 'string',
              title: 'ID do Template',
              description: 'Id do templante no SendGrid para o gatilho escolhido.'
            },
            disable: {
              type: 'boolean',
              title: 'Desativar envio de e-mail',
              default: false,
              description: 'Desativar envio de e-mail para o gatilho escolhido.'
            }
          }
        }
      },
      hide: true,
    }
  }
}

/**
 * List of Procedures to be created on each store after app installation.
 * Ref.: https://developers.e-com.plus/docs/api/#/store/procedures/
 */

const procedures = []

//  * Uncomment and edit code above to configure `triggers` and receive respective `webhooks`:

const { baseUri } = require('./__env')

procedures.push({
  title: app.title,

  triggers: [
    // Receive notifications when new order is created:
    {
      resource: 'carts',
      action: 'create'
    },

    // Receive notifications when order financial/fulfillment status are set or changed:
    // Obs.: you probably SHOULD NOT enable the orders triggers below and the one above (create) together.
    {
      resource: 'orders',
      subresource: 'payments_history',
    },
    {
      resource: 'orders',
      subresource: 'fulfillments',
    },
  ],

  webhooks: [
    {
      api: {
        external_api: {
          uri: `${baseUri}/ecom/webhook`
        }
      },
      method: 'POST'
    }
  ]
})

//  * You may also edit `routes/ecom/webhook.js` to treat notifications properly.

exports.app = app

exports.procedures = procedures
