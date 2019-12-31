const Router = require('./lib/router')
const Render = require('./lib/render')
Render.subPath = '/html' // Base path
Render.assetPath = '/public' // Path of assets to load
Render.title = "{{ project-name }}"

/* Custom GET Paths and their Handlers */
const paths = [
  ['/', () => htmlLoader({ name: 'login' })],
  ['/json', () => jsonLoader()],
  ['/robot.txt', () => Render.res("User-agent: *\nAllow: /html", 'txt')],
  ['/secret', () => Render.error("Access Restricted", 403)],
  ['/cf', () => Render.redirect("https://cloudflare.com")],
  ['/profile', req => profile(req)]
]

/* Event Listener */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/* Custom Loaders */
async function htmlLoader(handle) {
  try {
    const html = await Render.loadContent(handle)
    return Render.res(html, 'html')
  } catch (err) {
    return Render.error(err)
  }
}

function hash(str) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
}

function profile(req) {
  const params = (new URL(req.url)).searchParams
  let pm = {}
  for (let p of params) {
    pm[p[0]] = p[1]
  }
  if (pm.login && pm.token) {
    return htmlLoader({ name: 'profile', params: pm })
  }
  return Render.error("Invalid Login", 403)
}

async function validate(req) {
  try {
    let body = {}
    const formData = await req.formData()
    for (let entry of formData.entries()) {
      body[entry[0]] = entry[1]
    }
    const hashed = await hash(body.password)
    return Render.redirect("/profile" +
      "?login=" + true +
      "&email=" + body.email +
      "&token=" + btoa(hashed), 'redirect')
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
    Render.base = (request.url).replace(/\/html.*/, "")
    if (path.includes(Render.assetPath)) {
      await Render.loadAssets(route)
    } else {
      /* Loading GET Paths */
      await Render.loadPaths(route, paths)
      /* Loading Other Paths */
      route.post('/auth', req => validate(req))
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