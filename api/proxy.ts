export const config = { runtime: 'edge' }

const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254'])

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url).searchParams.get('url') ?? ''

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return new Response('Invalid URL', { status: 400 })
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return new Response('Only HTTP(S) allowed', { status: 400 })
  }

  const { hostname } = parsed
  if (
    BLOCKED_HOSTS.has(hostname) ||
    hostname.endsWith('.local') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.16.')
  ) {
    return new Response('Blocked', { status: 403 })
  }

  let res: Response
  try {
    res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ImageAnalyzer/1.0)' },
      redirect: 'follow',
    })
  } catch {
    return new Response('Failed to fetch', { status: 502 })
  }

  const contentType = res.headers.get('content-type') ?? ''
  if (!contentType.startsWith('image/')) {
    return new Response('Not an image', { status: 422 })
  }

  const body = await res.arrayBuffer()
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
