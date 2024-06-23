import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet";
import * as L from "leaflet";
import { LatLngExpression } from "leaflet";

import { useAppSelector } from "../../hooks";
import MyLocation from "../../assets/my-location.webp";

function ChangeView({
  center,
  zoom,
}: {
  center: LatLngExpression;
  zoom: number;
}) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function FindPlacesMap({
  places,
  mapCenter,
  activePlaceId,
}: {
  places: any;
  mapCenter: LatLngExpression;
  activePlaceId: string;
}) {
  const LeafIcon = L.Icon.extend({
    options: {},
  });
  //@ts-ignore
  const greenIcon = new LeafIcon({
    iconUrl: MyLocation,
    iconSize: [25, 37],
  });

  const userLocation = useAppSelector((state) => state.location);

  if (places == undefined) {
    return <h2>Load</h2>;
  }

  return (
    <MapContainer
      center={mapCenter} // Initial map center coordinates
      zoom={13} // Initial zoom level
      style={{ height: "100vh", width: "100%" }}
    >
      <ChangeView center={mapCenter} zoom={13} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[userLocation.lat, userLocation.long]}>
        <Tooltip permanent>You!</Tooltip>
      </Marker>
      {places.map((place: any) => {
        return (
          <Marker
            key={place.id}
            position={[place.lat, place.long]}
            icon={greenIcon}
          >
            {activePlaceId == place.id ? (
              <Tooltip permanent>{place.name.split(",")[0]}</Tooltip>
            ) : (
              <h2></h2>
            )}
          </Marker>
        );
      })}
    </MapContainer>
  );
}
