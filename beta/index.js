require('isomorphic-fetch')

if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const { isBrowser } = require('browser-or-node')
const lazy = require('choo-lazy-view')

const choo = require('choo')
const plugins = require('@resonate/choo-plugins')

const app = choo({ hash: false })

app.use(lazy)

if (isBrowser) {
  require('web-animations-js/web-animations.min')

  window.localStorage.DISABLE_NANOTIMING = process.env.DISABLE_NANOTIMING === 'yes'
  window.localStorage.logLevel = process.env.LOG_LEVEL

  if (process.env.NODE_ENV !== 'production') {
    app.use(require('choo-devtools')())
    app.use(require('choo-service-worker/clear')())
  }
  app.use(require('choo-service-worker')('/sw.js', { scope: '/' }))
  app.use(require('choo-meta')())

  if ('Notification' in window) {
    app.use(require('choo-notification')())
  }

  app.use(plugins.theme())
  app.use(plugins.tabbing())
  app.use(plugins.offlineDetect())
  app.use(require('./plugins/onResize')())
}

app.use(require('./stores/app')())
app.use(require('./stores/labels')())
app.use(require('./stores/artists')())
app.use(require('./stores/tracks')())
app.use(require('./stores/consent')())
app.use(require('./stores/player')())
app.use(require('./stores/search')())
app.use(require('./stores/notifications')())

require('./routes')(app)

module.exports = app.mount('#app')
