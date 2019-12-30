const Router = require('./lib/router')
const Render = require('./lib/render')
Render.subPath = '/html' // Base path
Render.assetPath = '/public' // Path of assets to load
Render.title = "Hello World!"

/* Custom GET Paths and their Handlers */
const paths = [
  ['/', () => htmlLoader()],
  ['/json', () => jsonLoader()],
  ['/robot.txt', () => Render.res("User-agent: *\nAllow: /html", 'txt')],
  ['/secret', () => Render.error("Access Restricted", 403)],
  ['/cf', () => Render.res("https://cloudflare.com", 'redirect')],
  ['/request', req => Render.res(JSON.stringify(req), 'json')],
  ['/q', req => { // /q?id=12345&name=foo&color=blue&style=bar
    const params = (new URL(req.url)).searchParams
    let pm = {}
    for (let p of params) {
      pm[p[0]] = p[1]
    }
    return Render.res(JSON.stringify(pm), 'json')
  }]
]

/* Event Listener */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/* Custom Loaders */
async function htmlLoader() {
  try {
    const template = await Render.loadTemplate()
    const html = await Render.loadContent(template)
    return Render.res(html, 'html')
  } catch (err) {
    return Render.error(err)
  }
}

function jsonLoader() {
  const json = {
    test: "Hello World!",
    array: [1, 2, 3, 4, 5],
    object: {
      newArray: ['a', 'b', 'c', 'd']
    }
  }
  return Render.res(JSON.stringify(json), 'json')
}

/* Request Handler */
async function handleRequest(request) {
  try {
    const route = new Router(Render.subPath)
    const path = (new URL(request.url)).pathname
    if (path.includes(Render.assetPath)) {
      await Render.loadAssets(route)
    } else {
      /* Loading GET Paths */
      await Render.loadPaths(route, paths)
      /* Loading Other Paths */
      route.post('/', () => Render.res())
      route.post('.*/foo', () => Render.res("foo")) // Accepts RegEx as path
    }
    const result = await route.resolve(request)
    if (result) {
      return result.handler(request)
    }
    return Render.error("Page Not Found", 404)
  } catch (err) {
    return Render.error(err)
  }
}