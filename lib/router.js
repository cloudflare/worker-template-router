/**
 * Helper functions that when passed a request will return a
 * boolean indicating if the request uses that HTTP method,
 * header, host or referrer.
 */
const Method = method => req =>
  req.method.toLowerCase() === method.toLowerCase()
const Connect = Method('connect')
const Delete = Method('delete')
const Get = Method('get')
const Head = Method('head')
const Options = Method('options')
const Patch = Method('patch')
const Post = Method('post')
const Put = Method('put')
const Trace = Method('trace')

const Header = (header, val) => req => req.headers.get(header) === val
const Host = host => Header('host', host.toLowerCase())
const Referrer = host => Header('referrer', host.toLowerCase())
const AddSlash = s => s.replace(/\/$/, "") + "/"

const Path = regExp => req => {
  const url = new URL(req.url)
  const path = AddSlash(url.pathname)
  const match = path.match(regExp) || []
  return match[0] === path
}

/**
 * The Router handles determines which handler is matched given the
 * conditions present for each request.
 */
class Router {
  constructor(base) {
    this.base = base ? base.replace(/\/$/, "") : ""
    this.routes = []
  }

  handle(conditions, handler) {
    this.routes.push({
      conditions,
      handler,
    })
    return this
  }

  connect(url, handler) {
    return this.handle([Connect, Path(this.base + AddSlash(url))], handler)
  }

  delete(url, handler) {
    return this.handle([Delete, Path(this.base + AddSlash(url))], handler)
  }

  get(url, handler) {
    return this.handle([Get, Path(this.base + AddSlash(url))], handler)
  }

  head(url, handler) {
    return this.handle([Head, Path(this.base + AddSlash(url))], handler)
  }

  options(url, handler) {
    return this.handle([Options, Path(this.base + AddSlash(url))], handler)
  }

  patch(url, handler) {
    return this.handle([Patch, Path(this.base + AddSlash(url))], handler)
  }

  post(url, handler) {
    return this.handle([Post, Path(this.base + AddSlash(url))], handler)
  }

  put(url, handler) {
    return this.handle([Put, Path(this.base + AddSlash(url))], handler)
  }

  trace(url, handler) {
    return this.handle([Trace, Path(this.base + AddSlash(url))], handler)
  }

  all(handler) {
    return this.handle([], handler)
  }

  /**
   * resolve returns the matching route for a request that returns
   * true for all conditions (if any).
   */
  resolve(req) {
    return this.routes.find(r => {
      if (!r.conditions || (Array.isArray(r) && !r.conditions.length)) {
        return true
      }

      if (typeof r.conditions === 'function') {
        return r.conditions(req)
      }

      return r.conditions.every(c => c(req))
    })
  }
}

module.exports = Router
