const mime = require('./mime')

module.exports = {
  init: { headers: {}, status: 200, statusText: "OK" },

  loadTemplate: async function() {
    let tmp = await require("html-loader!../public/template_core.html")
    const lib = await this.loadLibraries()
    return tmp
      .replace(/{~ common_js ~}/, lib.js)
      .replace(/{~ common_css ~}/, lib.css)
      .replace(/{~ public_path ~}/g, this.subPath + this.assetPath)
  },

  loadContent: async function(handle) {
    const tmp = await require(`html-loader!../public/html/${handle.name}.html`)
    let template = await this.loadTemplate()
    let params = []
    if ("params" in handle) {
      for (let key in handle.params) {
        params.push({ r: new RegExp("{~ r_" + key + " ~}", 'g'), x: handle.params[key] })
      }
    }
    params.push({ r: new RegExp("{~ r_sub_path ~}", 'g'), x: this.subPath })
    params.push({ r: new RegExp("{~ r_title ~}", 'g'), x: this.title })
    template = template.replace(/{~ body ~}/, tmp)
    params.forEach(function(e) {
      console.log(e)
      template = template.replace(e.r, e.x)
    })
    return template
  },

  loadLibraries: async function() {
    const lib = await require('../public/library.json')
    let js = ''
    await lib.js.forEach(function(link) {
      js += '<script type="text/javascript" src="' + link + '"></script>\n  '
    })
    let css = ''
    await lib.css.forEach(function(link) {
      css += '<link rel="stylesheet" href="' + link + '">\n  '
    })
    return { js: js, css: css }
  },

  loadAssets: async function(router) {
    const css = await require("html-loader!../public/css/style.css")
    const js = await require("html-loader!../public/js/script.js")
    router.get(this.assetPath + '/style.css', () => this.res(css, 'css'))
    router.get(this.assetPath + '/script.js', () => this.res(js, 'js'))
  },

  loadPaths: function(router, paths) {
    paths.forEach(function(path) {
      router.get(path[0], path[1])
    })
  },

  res: function(data = "<h1>HTML Template failed to loaded</h1>", type = "html") {
    this.init.headers['content-type'] = mime[type]
    return new Response(data, this.init)
  },

  redirect: function(path) {
    if (path.includes(this.subPath)) {
      return Response.redirect(this.base + path, 301)
    } else if (path.includes(this.base)) {
      return Response.redirect(this.subPath + path, 301)
    } else if (path.includes("https://")) {
      return Response.redirect(path, 302)
    } else {
      return Response.redirect(this.base + this.subPath + path, 301)
    }
  },

  error: async function(err = "Unknown error", status = 500) {
    let ehtml = await this.loadTemplate()
    ehtml = ehtml
      .replace(/{~ body ~}/, "<h4>" + status + " : " + err + "</h4>")
      .replace(/{~ title ~}/g, "Error : " + status)
    return new Response(ehtml, { status: status, headers: { 'content-type': mime.html } })
  }
}