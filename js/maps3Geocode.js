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
let arrayAddresses = [];

//This is the data currently appended to the table
let dataCurrentTable = [];

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

    document.getElementById("validate").addEventListener("click", ()=> {
      //call geocodePlaceId and save the array in a variable
      geocodePlaceId(geocoder, map);
      console.log("Aca haciendo print");
      console.log(arrayAddresses);
      //use this variable to rectify addresses
      //redefineInexactAddresses(arrayAddresses)

    })

    document.getElementById("rectify").addEventListener("click", ()=> {
      //I am using arrayAddresses, which is a global variable 
      redefineInexactAddresses();
    })

    document.getElementById("searchFinal").addEventListener("click", ()=>{
        geocodePlaceAll(geocoder, map);
    })

  }
  

  //this first function uses the geocoder to see the non exact addresses
  //recording them in an object to use later

  function geocodePlaceId(geocoder, map) {
    const address = document.getElementById("tableAsJSON").value;
    let addressArray = JSON.parse(address);
    let indexExactos = 0;   //indice de direcciones exactas para el geocoder
    console.log(addressArray)
    console.log("Antes de añadir isExact")
    console.log(arrayAddresses)
    //este array ya existe
    addressArray.forEach(element=>{
        //modifica el elemento en su propiedad Direccion, añadiendo ,Valdivia
        console.log(element.Direccion)
        element.Direccion = element.Direccion + ", Valdivia"
        //ahora agrega a cada elemento un nuevo feature. By default every element has not exact address for maps
        element.isExact = false
        //ahora si añade el element al array
        arrayAddresses.push(element)
    })
    arrayAddresses.pop();  //delete last element(empty element)

    //console.log("Luego de añadir isExact")
    console.log(arrayAddresses)

    //Eliminar duplicados
    /*
    console.log("Eliminando duplicados")
    let newArrayAddresses = arrayAddresses.filter((value, index, self) =>
    index === self.findIndex((t) => (
        //t.Cliente === value.Cliente && 
      t.Direccion === value.Direccion
    ))
  )
  */
    //console.log("Largo despues de quitar duplicados: "+arrayAddresses.length)
    //console.log(newArrayAddresses)

    //for each address execute some code
    arrayAddresses.forEach((element, index)=>{
      geocoder
      .geocode({ address: element.Direccion })
      .then(({ results }) => {
        //&&!results[0].partial_match   no es partial match

        if (results[0] && !(results[0].partial_match)) {   //si hay un resultado y si ademas ese resultado NO es parcial(Es exacto), es decir es exacto, then..
          console.log("La Direccion " + element.Direccion + " tiene una direccion exacta")
          //change parameter isExact
          arrayAddresses[index].isExact = true
          //print console y no hacer nada
        }
        // si hay un resultado parcial y ese resultado parcial ademas es "Valdivia, Los Ríos, Chile"
        // && results[0].formatted_address === "Valdivia, Los Ríos, Chile"
        else if(results[0].partial_match){
        console.log("La Direccion " + element.Direccion + " tiene una direccion parcial")
          //change parameter isExact
          arrayAddresses[index].isExact = false
        }  //End if

        else if(!results[0]){   //si no existe results[0] tambien pasa aca. evito el error a toda costa
            console.log("La Direccion " + element.Direccion + " tiene una direccion parcial")
              //change parameter isExact
              arrayAddresses[index].isExact = false
        }  //End if

        //Si no encuentra resultados
        else {
          console.log("La Direccion " + element.Direccion + " no tiene resultados")
          //change parameter isExact
          arrayAddresses[index].isExact = false
        }
      })
      //catch errors
      .catch((e) => window.alert(element.Direccion +" Tuvo error, "+ "Geocoder failed due to: " + e));
    })
    //return the array object
    alert("Las Direcciones se han validado, ahora rectifique las inexactas")
    //console.log("Returning!!")
    //console.log(arrayAddresses)

  }
  //POPULATE TABLE WITH AN ARRAY CALLED result
  function populateOverallOverview(currentMarker){

    console.log("Limpiando tabla")
    $("#testBody").empty();

    function loadTableData(items) {
      const table = document.getElementById("testBody");
      //clear current table
      //table.innerHTML = "";
      //for each element or item do something
      //clear table body before
      
      items.forEach( item => {
        let row = table.insertRow();
        let cliente = row.insertCell(0);
        cliente.innerHTML = item.CLIENTE;
        let direccion = row.insertCell(1);
        direccion.innerHTML = item.Direccion;
      });
    }
    loadTableData(currentMarker);
    //loadTableData(items2);
    loadTableData([]);
    
}

//allAddresses contains all the addresses, and say if it is exact of not
function redefineInexactAddresses(){
  console.log("Dentro de redefine!!")
  //console.log(allAddresses)
  console.log(arrayAddresses)

  arrayAddresses.forEach((element, index)=>{
    if(element.isExact){    //if address is not exact then ask for rectification
      console.log("Exact address!")
    }else{
      let dirRectificada = null;
      while (dirRectificada == null){
        dirRectificada = window.prompt("Ha ocurrido un error, favor rectificar la direccion "+element.Direccion+":");
      }
      arrayAddresses[index].Direccion = dirRectificada
    }
  })
  alert("Se han rectificado las direcciones inexactas!: Proceda a geolocalizar")
  //return the array of objects
}


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
            //set the marker. orange for varas, green for cajas
            if(element.DESPACHO ==="CAJA"){
              var marker = new google.maps.Marker({
                map,
                position: results[0].geometry.location,
                //img name
                
                icon: '../img/darkgreen_MarkerC.png',
                /*
                label: {
                  color: 'black',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  text: String(index+1),
                },
                */
              });
            }else{ // VARA
              var marker = new google.maps.Marker({
                map,
                position: results[0].geometry.location,
                //img name
                icon: '../img/orange_MarkerV.png',
                /*
                label: {
                  color: 'black',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  text: String(index+1),
                },
                */
              });
            }

            var infoWindoww = new google.maps.InfoWindow({
              content: '<h1>'+String(index+1)+"="+element.Direccion+": "+element.KG+"KG"+'</h1>'
            })
            //infowindow.setContent(results[0].formatted_address);
            //infowindow.open(map, marker);   dont want to open it now
            marker.addListener("click", ()=>{
              //infoWindoww.open(map, marker)
              //le paso a mi function todo el element respectivo. Asi tengo toda la info necesaria
              addInfoToTable(element);
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

//this function triggers when you click a Marker element previously created
function addInfoToTable(element){
    console.log("Getting element from a marker!")
    console.log(element)
    console.log("Pushing element to array")
    //push to some array
    dataCurrentTable.push(element)
    populateOverallOverview(dataCurrentTable)
}

function clearRowFromTable(someArray, element){
    var filtered = someArray.filter(function(element) { return element.Name != "Kristian"; }); 
}





  initMap();

//esta promesa se cumple una unica vez. array es el array de elementos restantes que fueron rectificados por el user
