// Returns distance between two coordinates in KM
function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  // distance between latitudes
  // and longitudes
  let dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  let dLon = ((lon2 - lon1) * Math.PI) / 180.0;

  // convert to radiansa
  lat1 = (lat1 * Math.PI) / 180.0;
  lat2 = (lat2 * Math.PI) / 180.0;

  // apply formulae
  let a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  let rad = 6371;
  let c = 2 * Math.asin(Math.sqrt(a));
  return parseFloat((rad * c).toFixed(1));
}

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const extractTimeFromDate = (date: Date): string => {
  let hours = date.getHours().toString();
  let minutes = date.getMinutes().toString();
  let seconds = date.getSeconds().toString();

  // Pad single-digit numbers with a leading zero
  hours = parseInt(hours) < 10 ? "0" + hours : hours;
  minutes = parseInt(minutes) < 10 ? "0" + minutes : minutes;
  seconds = parseInt(seconds) < 10 ? "0" + seconds : seconds;

  // Return formatted time string
  return `${hours}:${minutes}:${seconds}`;
};

export { haversine };
