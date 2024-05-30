import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLngExpression } from "leaflet";

const Map = ({
  placeName,
  placeLocation,
}: {
  placeName: string;
  placeLocation: {
    lat: number;
    long: number;
  };
}) => {
  const position: LatLngExpression = [placeLocation.lat, placeLocation.long];
  return (
    <MapContainer
      center={[placeLocation.lat, placeLocation.long]} // Initial map center coordinates
      zoom={16} // Initial zoom level
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>{placeName}</Popup>
        <Tooltip>{placeName}</Tooltip>
      </Marker>
    </MapContainer>
  );
};

export default Map;
