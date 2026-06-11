import https from 'node:https'

function anthropicRequest(apiKey, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.anthropic.com',
        port: 443,
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 502,
            body: Buffer.concat(chunks).toString(),
          })
        })
      },
    )

    req.on('error', reject)
    req.setTimeout(30000, () => {
      req.destroy(new Error('Request to Anthropic timed out after 30s'))
    })
    req.write(body)
    req.end()
  })
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    req.on('error', reject)
  })
}

function networkHint(error) {
  if (error.code === 'ENOTFOUND') {
    return 'Could not resolve api.anthropic.com. Check your internet connection, VPN, or DNS settings.'
  }
  if (error.code === 'ETIMEDOUT' || error.message.includes('timed out')) {
    return 'Request timed out reaching Anthropic. Check VPN or try again.'
  }
  if (error.code === 'ECONNREFUSED') {
    return 'Connection to Anthropic was refused. Check firewall or VPN settings.'
  }
  return 'Could not reach Anthropic. Check your network or VPN.'
}

export function anthropicProxyPlugin(apiKey) {
  return {
    name: 'anthropic-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/anthropic/v1/messages')) {
          next()
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        if (!apiKey) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: {
                message:
                  'ANTHROPIC_API_KEY is not set. Create .env with your key, then restart npm run dev.',
              },
            }),
          )
          return
        }

        try {
          const body = await readRequestBody(req)
          const { status, body: responseBody } = await anthropicRequest(apiKey, body)
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(responseBody)
        } catch (error) {
          console.error('[anthropic proxy]', error.message)
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: {
                message: `${networkHint(error)} (${error.message})`,
              },
            }),
          )
        }
      })
    },
  }
}
