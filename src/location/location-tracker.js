export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem("tasky_last_location", JSON.stringify(loc));
        resolve(loc);
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export function formatLocationLabel(loc) {
  if (!loc || loc.lat === undefined || loc.lng === undefined) return "Location unavailable";
  return `GPS ${loc.lat}, ${loc.lng}`;
}
