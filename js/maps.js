let map;

async function initMap() {

  const position = { lat: -39.8139, lng: -73.2458 };  //Center in Valdivia
  // Request needed libraries.
  //@ts-ignore
  const {Marker} = await google.maps.importLibrary("marker")
  const {Map} = await google.maps.importLibrary("maps")

  map = new Map(document.getElementById("map"), {
    center: position,
    zoom: 7,
    mapId: "DEMO_MAP_ID",
  });

  // The marker, positioned at Temuco
  const marker = new Marker({
    map: map,
    position: { lat: -38.4345, lng: -72.3400 },
    title: "Temuco",
  });

}

initMap();

console.log("I am reading the Maps API!")