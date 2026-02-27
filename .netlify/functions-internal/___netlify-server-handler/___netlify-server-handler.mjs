import {
  createRequestContext,
  runWithRequestContext,
} from '/var/task/FinalScrath/dsa-tracker/.netlify/dist/run/handlers/request-context.cjs'
import { getTracer, withActiveSpan } from '/var/task/FinalScrath/dsa-tracker/.netlify/dist/run/handlers/tracer.cjs'

process.chdir('/var/task/FinalScrath/dsa-tracker')

// Set feature flag for regional blobs
process.env.USE_REGIONAL_BLOBS = 'true'

let cachedHandler
export default async function (req, context) {
  const requestContext = createRequestContext(req, context)
  const tracer = getTracer()

  const handlerResponse = await runWithRequestContext(requestContext, () => {
    return withActiveSpan(tracer, 'Next.js Server Handler', async (span) => {
      span?.setAttributes({
        'account.id': context.account.id,
        'deploy.id': context.deploy.id,
        'request.id': context.requestId,
        'site.id': context.site.id,
        'http.method': req.method,
        'http.target': req.url,
        isBackgroundRevalidation: requestContext.isBackgroundRevalidation,
        monorepo: true,
        cwd: '/var/task/FinalScrath/dsa-tracker',
      })
      if (!cachedHandler) {
        const { default: handler } = await import('/var/task/FinalScrath/dsa-tracker/.netlify/dist/run/handlers/server.js')
        cachedHandler = handler
      }
      const response = await cachedHandler(req, context, span, requestContext)
      span?.setAttributes({
        'http.status_code': response.status,
      })
      return response
    })
  })

  if (requestContext.serverTiming) {
    handlerResponse.headers.set('server-timing', requestContext.serverTiming)
  }

  return handlerResponse
}

export const config = {
  path: '/*',
  preferStatic: true,
}
