import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Props {
  lat: number
  lng: number
}

export default function GpsMap({ lat, lng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [lng, lat],
      zoom: 13,
      attributionControl: { compact: true },
      interactive: true,
    })

    new maplibregl.Marker({ color: '#d79921' })
      .setLngLat([lng, lat])
      .addTo(map)

    return () => map.remove()
  }, [lat, lng])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-sm overflow-hidden border border-rim"
      style={{ height: '180px' }}
    />
  )
}
