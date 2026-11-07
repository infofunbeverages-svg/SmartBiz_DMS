/** Distance in metres between two GPS points (haversine). */
export const distanceMeters = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371000, rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

export const getPosition = () =>
  new Promise<GeolocationPosition>((res, rej) => {
    if (!navigator.geolocation) return rej(new Error('GPS is not supported on this device'));
    navigator.geolocation.getCurrentPosition(res, () => rej(new Error('Please turn on GPS / allow location access')),
      { enableHighAccuracy: true, timeout: 15000 });
  });
