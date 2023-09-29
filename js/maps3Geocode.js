//Receiving the data in excel format

/*
let constructTableFromPastedInput = (pastedInput) => {
  let rawRows = pastedInput.split("\n");
  let headRow = "";
  let bodyRows = [];
  rawRows.forEach((rawRow, idx) => {
    let rawRowArray = rawRow.split("\t");
    bodyRows.push(`<tr><td>${rawRowArray.join("</td><td>")}</td></tr>`);
    
  });
  return `
                <table class="boostrap4_table_head_dark_striped_rounded_compact">
                    <thead>
                      <tr>
                        <th>Direcciones</th>
                        <th>Kilos</th>
                      </tr>
                    </thead>
                    <tbody>
                        ${bodyRows.join("")}
                    </tbody>
                </table>
            `;  //here returns the table
};

let constructJSONFromPastedInput = (pastedInput) => {
  let rawRows = pastedInput.split("\n");
  let headersArray = rawRows[0].split("\t");
  let output = [];
  rawRows.forEach((rawRow, idx) => {
    if (idx >= 0) {
      let rowObject = {};
      let values = rawRow.split("\t");
      headersArray.forEach((header, idx) => {
        rowObject.key = values[idx];
      });
      output.push(rowObject);
    }
  });
  return output;
};
*/

//array de elementos con direccion parcial, que hay que modificar
const arrayRestantes = [];
//array de direcciones
const arrayAddresses = [];

let constructTableFromPastedInput = (pastedInput) => {
  let rawRows = pastedInput.split("\n");
  let headRow = "";
  let bodyRows = [];
  rawRows.forEach((rawRow, idx) => {
    let rawRowArray = rawRow.split("\t");
    if (idx == 0) {
      headRow = `<tr><th>${rawRowArray.join("</th><th>")}</th></tr>`;
    } else {
      bodyRows.push(`<tr><td>${rawRowArray.join("</td><td>")}</td></tr>`);
    }
  });
  return `
                <table class="boostrap4_table_head_dark_striped_rounded_compact">
                    <thead>
                        ${headRow}
                    </thead>
                    <tbody>
                        ${bodyRows.join("")}
                    </tbody>
                </table>
            `;
};

let constructJSONFromPastedInput = (pastedInput) => {
  let rawRows = pastedInput.split("\n");
  let headersArray = rawRows[0].split("\t");
  let output = [];
  rawRows.forEach((rawRow, idx) => {
    if (idx > 0) {
      let rowObject = {};
      let values = rawRow.split("\t");
      headersArray.forEach((header, idx) => {
        rowObject[header] = values[idx];
      });
      output.push(rowObject);
    }
  });
  return output;
};

const theTextArea = document.getElementById("myDemoTextArea");

const inputHandler = function (e) {
  let inputText = e.target.value;
  let tableHTML = constructTableFromPastedInput(inputText);
  let tableAsJson = constructJSONFromPastedInput(inputText);
  let prettyJSON = JSON.stringify(tableAsJson, null, 2);
  console.log(prettyJSON);
  document.getElementById("table_container").innerHTML = tableHTML;
  document.getElementById("table_container").style.display = "block";
  document.getElementById("tableAsJSON").value = prettyJSON;
};

theTextArea.addEventListener("input", inputHandler);

document.getElementById("clear_link").addEventListener("click", () => {
  document.getElementById("myDemoTextArea").value = "";
  document.getElementById("table_container").innerHTML = "";
  document.getElementById("table_container").style.display = "none";
  document.getElementById("tableAsJSON").value = "";
});




// Initialize the map.
let map;
//Initialize the Promise
let firstPromise;

async function initMap() {

    const {Map} = await google.maps.importLibrary("maps")
    map = new Map(document.getElementById("map"), {
      zoom: 8,
      center: { lat: -39.8139, lng: -73.2458 },  //Valdivia
    });
    const geocoder = new google.maps.Geocoder();
    //const infowindow = new google.maps.InfoWindow();
    
    //the event is triggered when the user clicks the submit element
    /*
    document.getElementById("submit").addEventListener("click", () => {
      geocodePlaceId(geocoder, map, infowindow);
    });
    */

    document.getElementById("submit").addEventListener("click", ()=> {
      geocodePlaceId(geocoder, map);
    })

    document.getElementById("submitFinal").addEventListener("click", ()=>{
        geocodePlaceAll(geocoder, map)
    })

  }
  
  // This function is called when the user clicks the UI button requesting
  // a geocode of a place ID.
  /*
  function geocodePlaceId(geocoder, map, infowindow) {
    const address = document.getElementById("address").value;
  
    geocoder
      .geocode({ address: address })
      .then(({ results }) => {
        if (results[0]) {
          map.setZoom(11);
          map.setCenter(results[0].geometry.location);
  
          const marker = new google.maps.Marker({
            map,
            position: results[0].geometry.location,
          });
  
          infowindow.setContent(results[0].formatted_address);
          infowindow.open(map, marker);
        } else {
          window.alert("No results found");
        }
      })
      .catch((e) => window.alert("Geocoder failed due to: " + e));
  }  */

  function geocodePlaceId(geocoder, map) {
    const address = document.getElementById("tableAsJSON").value;
    let addressArray = JSON.parse(address)
    let indexExactos = 0;   //indice de direcciones exactas para el geocoder
    //este array ya existe
    addressArray.forEach(element=>{
        //modifica el elemento en su propiedad Direccion, añadiendo ,Valdivia
        element.Direccion = element.Direccion + ", Valdivia"
        //ahora si añade el element al array
        arrayAddresses.push(element)
    })
    arrayAddresses.pop();  //delete last element(empty element)

    console.log("Largo antes de quitar duplicados: "+arrayAddresses.length)

    //Eliminar duplicados
    console.log("Eliminando duplicados")
    let newArrayAddresses = arrayAddresses.filter((value, index, self) =>
    index === self.findIndex((t) => (
        //t.Cliente === value.Cliente && 
      t.Direccion === value.Direccion
    ))
  )
    console.log("Largo despues de quitar duplicados: "+arrayAddresses.length)
    console.log(newArrayAddresses)

    //for each address execute some code
    arrayAddresses.forEach((element, index)=>{
      geocoder
      .geocode({ address: element.Direccion })
      .then(({ results }) => {
        //&&!results[0].partial_match   no es partial match

        if (results[0] && !(results[0].partial_match)) {   //si hay un resultado y si ademas ese resultado NO es parcial(Es exacto), es decir es exacto, then..
          console.log("La Direccion " + element.Direccion + " tiene una direccion exacta")
          //print console y no hacer nada
        }
        // si hay un resultado parcial y ese resultado parcial ademas es "Valdivia, Los Ríos, Chile"
        // && results[0].formatted_address === "Valdivia, Los Ríos, Chile"
        else if(results[0].partial_match){
        console.log("La Direccion " + element.Direccion + " tiene una direccion parcial")
          let dirRectificada = null;
          while (dirRectificada == null){
            dirRectificada = window.prompt("Ha ocurrido un error, favor rectificar la direccion "+element.Direccion+":");
          }
          arrayAddresses[index].Direccion = dirRectificada
        }  //End if

        else if(!results[0]){   //si no existe results[0] tambien pasa aca. evito el error a toda costa
            console.log("La Direccion " + element.Direccion + " tiene una direccion parcial")
              let dirRectificada = null;
              while (dirRectificada == null){
                dirRectificada = window.prompt("Ha ocurrido un error, favor rectificar la direccion "+element.Direccion+":");
              }
              arrayAddresses[index].Direccion = dirRectificada
        }  //End if

        //Si no encuentra resultados
        else {
            console.log("La Direccion " + element.Direccion + " no tiene resultados")
            let dirRectificada = null;
            while (dirRectificada == null){
              dirRectificada = window.prompt("Ha ocurrido un error, favor rectificar la direccion "+element.Direccion+":");
            }
            arrayAddresses[index].Direccion = dirRectificada
        }
      })
      //catch errors
      .catch((e) => window.alert(element.Direccion +" Tuvo error, "+ "Geocoder failed due to: " + e));
    })

  }
  /*
function geocodePlaceAll(geocoder, map){
  arrayRestantes.forEach((element, index)=>{
    geocoder
    .geocode({ address: element.Direccion })
    .then(({ results }) => {
      //&&!results[0].partial_match   no es partial match
      if (results[0] &&!results[0].partial_match) {   //si hay un resultado y si ademas ese resultado NO es parcial(Es exacto), es decir es exacto, then..
        map.setZoom(11);
        map.setCenter(results[0].geometry.location);

        var marker = new google.maps.Marker({
          map,
          position: results[0].geometry.location,
          label: {
            color: 'black',
            fontSize: '20px',
            fontWeight: 'bold',
            text: String(index+1),
          },
        });

        var infoWindoww = new google.maps.InfoWindow({
          content: '<h1>'+String(element.indice)+"="+element.Direccion+": "+element.KG+"KG"+'</h1>'
        })
        //infowindow.setContent(results[0].formatted_address);
        //infowindow.open(map, marker);   dont want to open it now
        marker.addListener("click", ()=>{
          infoWindoww.open(map, marker)
        })
      }
      //Si no encuentra resultados
      else {
        window.alert("No encontre resultados para: "+element.Direccion+", favor especifique mejor la direccion");
      }
    })  //catch errors
    .catch((e) => window.alert("Geocoder failed due to: " + e));

    })

}
  */

//Posiciona los marcadores de todas las ubicaciones.
//Se supone que todas las direcciones son exactas, pues se rectificaron
function geocodePlaceAll(geocoder, map){
    arrayAddresses.forEach((element, index)=>{
        //console.log(element)
        geocoder
        .geocode({ address: element.Direccion })
        .then(({ results }) => {
          //&&!results[0].partial_match   no es partial match
          if (results[0] &&!results[0].partial_match) {   //si hay un resultado y si ademas ese resultado NO es parcial(Es exacto), es decir es exacto, then..
            map.setZoom(11);
            map.setCenter(results[0].geometry.location);
    
            var marker = new google.maps.Marker({
              map,
              position: results[0].geometry.location,
              label: {
                color: 'black',
                fontSize: '20px',
                fontWeight: 'bold',
                text: String(index+1),
              },
            });
    
            var infoWindoww = new google.maps.InfoWindow({
              content: '<h1>'+String(element.indice)+"="+element.Direccion+": "+element.KG+"KG"+'</h1>'
            })
            //infowindow.setContent(results[0].formatted_address);
            //infowindow.open(map, marker);   dont want to open it now
            marker.addListener("click", ()=>{
              infoWindoww.open(map, marker)
            })
          }
          //Si no encuentra resultados
          else {
            window.alert("No encontre resultados para: "+element.Direccion+", favor especifique mejor la direccion");
          }
        })  //catch errors
        .catch((e) => window.alert("Geocoder failed due to: " + e));
      })
}








  initMap();

//esta promesa se cumple una unica vez. array es el array de elementos restantes que fueron rectificados por el user
