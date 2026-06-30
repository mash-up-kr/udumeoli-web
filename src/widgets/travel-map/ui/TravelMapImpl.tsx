import "maplibre-gl/dist/maplibre-gl.css"
import { Map } from "react-map-gl/maplibre"
import type { StyleSpecification } from "maplibre-gl"

// 한국 중심 초기 뷰
const KOREA_VIEW = { longitude: 127.8, latitude: 36.2, zoom: 6 }

// keyless raster OSM (키 없는 시작점). 추후 MapTiler 벡터로 교체해 커스텀 스타일링.
const RASTER_OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
}

export function TravelMapImpl() {
  return (
    <Map
      initialViewState={KOREA_VIEW}
      mapStyle={RASTER_OSM_STYLE}
      style={{ width: "100%", height: "100%" }}
    />
  )
}
