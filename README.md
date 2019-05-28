## Router

Selects the logic to respond to requests based on the `request` method and URL. Can be used with REST APIs or apps that require basic routing logic.

[`index.js`](https://github.com/cloudflare/worker-template-router/blob/master/router.js) is the content of the Workers script.

Live Demos are hosted on `workers-tooling.cf/demos/router`:
[Demo /bar](http://workers-tooling.cf/demos/router/bar) | [Demo /foo](http://workers-tooling.cf/demos/router/foo)

#### Run with node
To run locally with just node:
```
git clone https://github.com/cloudflare/worker-template-router
# change just `name` in the package.json to valid string
# put logic in index.js
npm install
webpack index.js
```
minified Workersscript will live in `dist/main.js`

#### Wrangler
To generate using [wrangler](https://github.com/cloudflare/wrangler)

```
wrangler generate myApp https://github.com/cloudflare/worker-template-router
```

#### Serverless
To deploy using serverless add a [`serverless.yml`](https://serverless.com/framework/docs/providers/cloudflare/) file.
