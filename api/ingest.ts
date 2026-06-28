export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const slug = url.searchParams.get('__path') ?? ''
  url.searchParams.delete('__path')

  const isStatic = slug.startsWith('static/')
  const host = isStatic
    ? 'https://eu-assets.i.posthog.com'
    : 'https://eu.i.posthog.com'

  const target = `${host}/${slug}${url.search}`

  const res = await fetch(target, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  })

  return new Response(res.body, { status: res.status, headers: res.headers })
}
