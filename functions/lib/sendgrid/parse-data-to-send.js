const listTemplates = [
  {
    trigger: 'Carrinho Abandonado',
    status: 'abandoned_cart'
  },

  {
    trigger: 'Novo Pedido',
    status: 'new_order'
  },
  {
    trigger: 'Pendente',
    status: 'pending'
  },

  {
    trigger: 'Sobre Analise',
    status: 'under_analysis'
  },

  {
    trigger: 'Autorizado',
    status: 'authorized'
  },

  {
    trigger: 'Não Autorizado',
    status: 'unauthorized'
  },

  {
    trigger: 'Pago',
    status: 'paid'
  },

  {
    trigger: 'Em Disputa',
    status: 'in_dispute'
  },

  {
    trigger: 'Devolvido',
    status: 'refunded'
  },

  {
    trigger: 'Cancelado',
    status: 'canceled'
  },

  {
    trigger: 'Fatura Emitida',
    status: 'invoice_issued'
  },

  {
    trigger: 'Em Produção',
    status: 'in_production'
  },

  {
    trigger: 'Em Separação',
    status: 'in_separation'
  },

  {
    trigger: 'Pronto para Envio',
    status: 'ready_for_shipping'
  },

  {
    trigger: 'Enviado',
    status: 'shipped'
  },

  {
    trigger: 'Entregue',
    status: 'delivered'
  },

  {
    trigger: 'Voltou para Troca',
    status: 'returned_for_exchange'
  },

  {
    trigger: 'Recebido para Troca',
    status: 'received_for_exchange'
  },

  {
    trigger: 'Retornado',
    status: 'returned'
  },

  {
    trigger: 'Parcialmente pago',
    status: 'partially_paid'
  },

  {
    trigger: 'Parcialmente ressarcido',
    status: 'partially_refunded'
  },

  {
    trigger: 'Sem Status',
    status: 'voided'
  },

  {
    trigger: 'Enviado Parcialmente',
    status: 'partially_shipped'
  },

  {
    trigger: 'Parcialmente Entregue',
    status: 'partially_delivered'
  }
]

const addTotalPriceItem = (orderOrCart) => {
  orderOrCart.items.forEach(item => {
    item.total_price = item.quantity * (item.final_price || item.price)
  })
}

module.exports = (appData, status, orderOrCart, store, customer) => {
  if (orderOrCart) {
    // Sendgrid does not perform calculations
    addTotalPriceItem(orderOrCart)
  }

  console.log('>> to: ', customer.main_email, ' from: ', appData.sendgrid_mail)
  const body = {
    from: {
      email: appData.sendgrid_mail,
      name: store.name
    },
    personalizations: [
      {
        to: [
          {
            email: customer.main_email,
            name: customer.display_name
          }
        ],
        dynamic_template_data: {
          // Objects for email customization
          store: {
            name: store.name,
            logo: store.logo
          },
          customer: {
            display_name: customer.display_name
          },
          ...orderOrCart
        }
      }
    ]
  }

  const templates = appData.sendgrid_templates
  const nameTemplate = listTemplates.find(type => type.status === status)
  const template = templates.find(templateFind => templateFind.trigger === nameTemplate.trigger)

  if (template && !template.disable) {
    // console.log('> Template found and active <')
    body.template_id = `${template.id}`
    return body
  }
  return null
}
