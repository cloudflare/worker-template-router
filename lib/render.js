const mime = require('./mime')

module.exports = {
  init: { status: 200, statusText: "OK", headers: {} },
  loadTemplate: async function() {
    let tmp = await require("html-loader!../public/template_core.html")
    const lib = await this.loadLibraries()
    return tmp
      .replace(/{{title}}/, this.title)
      .replace(/{{common_js}}/, lib.js)
      .replace(/{{common_css}}/, lib.css)
      .replace(/{{public_path}}/g, this.subPath + this.assetPath)
  },
  loadContent: async function(html) {
    let tmp = await require("html-loader!../public/template_content.html")
    return html.replace(/{{body}}/,tmp)
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
    if (type === 'redirect') {
      return Response.redirect(data, 301)
    }
    this.init.headers['content-type'] = mime[type]
    return new Response(data, this.init)
  },
  error: async function(err = "Unknown error", status = 500) {
    let ehtml = await this.loadTemplate()
    ehtml = ehtml
      .replace(/{{title}}/g, "Error : "+status)
      .replace(/{{body}}/g, "<h4>"+status+" : "+err+"</h4>")
    return new Response(ehtml, { status: status, headers: { 'content-type': mime['html'] } })
  }
}