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
let arrayAddresses = new Array();
//clone of arrayAddresses
let clonedArray = [];
//array of markers displayed in map
let arrayMarkers = [];


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
    //Listeners
    //geocoder populates array of inexact
    document.getElementById("validate").addEventListener("click", ()=> {
      //call geocodePlaceId and save the array in a variable
      geocodePlaceId(geocoder, map);
      console.log("Aca haciendo print");
      console.log(arrayAddresses);
      //use this variable to rectify addresses
      //redefineInexactAddresses(arrayAddresses)

    })
    //user rectifica direcciones mal ingresadas (no exactas)
    document.getElementById("rectify").addEventListener("click", ()=> {
      //I am using arrayAddresses, which is a global variable 
      redefineInexactAddresses();
    })
    //Geolocalizacion de puntos en el mapa
    document.getElementById("searchFinal").addEventListener("click", ()=>{
        geocodePlaceAll(geocoder, map);
    })
    //Asignacion de ruta
    document.getElementById("assign").addEventListener("click", ()=>{
      //asigna una nueva ruta a los elementos añadidos al array de objetos seleccionados por el user
      assignNewRuta();
    })
    //Muestra rutas exportables
    document.getElementById("show").addEventListener("click", ()=>{
      //muetra la tabla con los actualmente asignados
      showArray();
    })
    //Exporta rutas
    document.getElementById("export").addEventListener("click", ()=>{
      //Exporta el array completo de direcciones con sus rutas ya asignadas por el usuario
      exportArray();
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
    addressArray.forEach((element, ind)=>{
        //modifica el elemento en su propiedad Direccion, añadiendo ,Valdivia
        console.log(element.Direccion)
        element.Direccion = element.Direccion + ", Valdivia"
        //ahora agrega a cada elemento un nuevo feature. By default every element has not exact address for maps
        element.isExact = false
        //ahora agrega a cada elemento un nuevo feature, que es un id que servira mas adelante
        element.id = ind;
        //ahora si añade el element al array
        arrayAddresses.push(element)
    })
    arrayAddresses.pop();  //delete last element(empty element)

    //create a copy(clone) of arrayAddresses and then modify this copy to later export it
    //method slice to clone the array
    //clone the array only if it exists(is defined), but is empty yet. BUT I NEED THE COPY OF THE OLD ARRAY WITH ADDRESSES WITHOUT MODIFY
    if (typeof clonedArray !== 'undefined' && clonedArray.length == 0) {
      // the array is defined and has zero elements
      //arrayAddresses is of type Array. therefore i can use structuredClone() to clone the array
      clonedArray = structuredClone(arrayAddresses);
      console.log("Aca estoy clonando arrayAddresses!");
      console.log(clonedArray);
    }

    console.log("raw array cloned!");
    console.log(arrayAddresses);

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

    //alert the user the number of addresses
    alert("Se registraron "+arrayAddresses.length+" direcciones(puntos de entrega). Ahora rectifique las inexactas");
    //alert("Las Direcciones se han validado, ahora rectifique las inexactas")
    //console.log("Returning!!")
    //console.log(arrayAddresses)

  }
  //POPULATE TABLE WITH AN ARRAY CALLED result
  function populateOverallOverview(currentMarker){
    //currentMarker is the current array of objects with all the elements the user wants to assign
    console.log("Limpiando tabla")
    //jquery clear table rows
    $("#testBody").empty();
    //get the sum of the columns
    let sumKG = 0;
    currentMarker.forEach(el =>{
      sumKG = sumKG + parseFloat(el.KG);
    })
    //push the grand total element to array (temporal) to see the row in table
    //HAS ONLY KG attribute
    currentMarker.push({CLIENTE:"Total", Direccion:"-", DESPACHO:"-", KG: sumKG, id:"Total"})

    function loadTableData(items) {
      //get the table
      const table = document.getElementById("testBody");
      //clear current table
      //table.innerHTML = "";
      //for each element or item do something
      //clear table body before
      
      items.forEach( item => {
        let row = table.insertRow();   //insert arow of data with values
        //adding id to the td (called row in this case)
        row.id = item.id;  //each element (item) has alredy the attribute id
        let cliente = row.insertCell(0);   //column 0
        cliente.innerHTML = item.CLIENTE;
        let direccion = row.insertCell(1); //column 1
        direccion.innerHTML = item.Direccion;
        let formatoEntrega = row.insertCell(2); //column 2
        formatoEntrega.innerHTML = item.DESPACHO;
        let totalKG = row.insertCell(3); //column 3
        totalKG.id = "td" + item.id
        totalKG.innerHTML = item.KG;

        //add a listener for all the tr

        document.getElementById(item.id).addEventListener("click", ()=>{
          //Removes all child nodes of the set of matched elements from the DOM.
          console.log("trying to delete item!")
          $("#"+item.id).empty();
          //Descontar del total de KG in the table
          sumKG = sumKG - item.KG;
          $('#tdTotal').html(sumKG);
          //now remove the element with the same id from the currentMarker array
          //first find the index of the element, then delete the object in that position
          const indexToDelete = currentMarker.indexOf(item);
          if (indexToDelete > -1) { // only splice array when item is found
            currentMarker.splice(indexToDelete, 1); // 2nd parameter means remove one item only
          }
          console.log("Removing item from array!");
      })


      });
    }
    loadTableData(currentMarker);
    currentMarker.pop()  //delete last item which is grand total. (i dont want it here) 
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
            //use element.id to identify later each marker
            if(element.DESPACHO ==="CAJA"){
              var marker = new google.maps.Marker({
                map,
                position: results[0].geometry.location,
                //img name
                //icon: '../img/orange_MarkerV.png',
                icon: 'https://Rickard996.github.io/Rutero-Logistica/img/darkgreen_MarkerC.png',
                id: element.id,
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
                icon: 'https://Rickard996.github.io/Rutero-Logistica/img/orange_MarkerV.png',
                id: element.id,
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

            //no matter if CAJA o VARA add the marker to array of markers to use later
            arrayMarkers.push(marker);

            var infoWindoww = new google.maps.InfoWindow({
              content: '<h1>'+String(index+1)+"="+element.Direccion+": "+element.KG+"KG"+'</h1>'
            })
            //infowindow.setContent(results[0].formatted_address);
            //infowindow.open(map, marker);   dont want to open it now
            marker.addListener("click", ()=>{
              //infoWindoww.open(map, marker)
              //le paso a mi function todo el element respectivo. Asi tengo toda la info necesaria
              //console.log(marker);
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
    
    //only push to array if not in the current array of objects. Use containsObject function
    if(!containsObject(element, dataCurrentTable)){
      console.log("Pushing element to array");
      dataCurrentTable.push(element);
    }else{
      alert("Punto ya incluido en la ruta");
    }
    //populate the table of objects
    populateOverallOverview(dataCurrentTable);
}

//To see if an object is in array of objects
function containsObject(obj, list) {
  var i;
  for (i = 0; i < list.length; i++) {
      if (list[i] === obj) {
          return true;
      }
  }
  return false;
}

//funcion para que el user le asigne el numero de ruta a cada direccion
function assignNewRuta(){
  //dataCurrentTable is a global variable, containing what the user is selecting to assign curerntly
  //arrayAddresses is also a global variable, and contains all the data at this point already rectified
  let nroRuta = parseInt(window.prompt("Asigne numero de ruta"), 10);
  //console.log(nroRuta);
  if(Number.isInteger(nroRuta)){    //if is an integer number then assign la ruta
    //At this point I have the clonedArray with all the old addresses
    console.log("Aca estoy leyendo!");
    console.log(clonedArray);
    //Call assignCloned, with a foreach in dataCurrentTable
    dataCurrentTable.forEach((el, index) =>{
        console.log("The index of table td is: "+index);
        console.log("The element of table is: ");
        console.log(el);
        assignCloned(el, nroRuta);

      //Clear the markers already assigned
      //set clickable and visible attributes to false
      arrayMarkers.forEach((marker, index)=>{
        if(marker.id == el.id){  //if the ids match
          marker.setMap(null);
        }
      })
    })
    //ahora borrar table of assigned and clear the markers of assigned
    //jquery clear table rows
    $("#testBody").empty();
    dataCurrentTable = [];  //clear current table array

    console.log("El array cloned con rutas asignadas actualmente es:")
    //deberia tener menos elementos que el array completo
    console.log(clonedArray);

    alert("Puntos de entrega asignados correctamente!");
  }else{
    alert("Ingrese un numero valido");
  }
}

//Debo llamar la siguiente funcion por cada elemento de tabla a asignar ruta
//Example, find array and do something
//In this case, we assign the n° de ruta al respectivo elemento del array
function assignCloned(assignedElement, nroRuta){
  //if the elements match(table el vs array el) by its id, then assign the route 
  clonedArray.forEach((el, index)=>{
    if(el.id == assignedElement.id){   //si el id esta entre los asignados, entonces le asigna el nro de ruta correspondiente
      el.assignedRuta = nroRuta;
      return true;
    }
  })
  return false;
}

//use cloned array which is ready to create a table and be exported
function exportArray(){
  //populate the table with the cloned array
  //create other populate function for this step 
  //and also use other table
  populateExportableTable(clonedArray);
  //export to excel
  htmlTableToExcel('xlsx');
}

//function to only show the user the current exportable table 
function showArray(){
  //populate the table with the cloned array
  //create other populate function for this step 
  //and also use other table
  populateExportableTable(clonedArray);
  //show hidden table
  document.getElementById("tableToExport").hidden = false;
}

//function to export table to excel workbook
function htmlTableToExcel(type){   //type .xlsx
  var data = document.getElementById('tableToExport');
  var excelFile = XLSX.utils.table_to_book(data, {sheet: "sheet1"});
  XLSX.write(excelFile, { bookType: type, bookSST: true, type: 'base64' });
  XLSX.writeFile(excelFile, 'Ruta_Valdivia.' + type);
 }

//POPULATE TABLE tableToExport (last step)
function populateExportableTable(clonedArray){

  //currentMarker is the current array of objects with all the elements the user wants to assign
  console.log("Limpiando tabla")
  //jquery clear table rows
  $("#exportBody").empty();
  //get the sum of the columns
  let sumKG = 0;
  clonedArray.forEach(el =>{
    sumKG = sumKG + parseFloat(el.KG);
  })
  //push the grand total element to array (temporal) to see the row in table
  //HAS ONLY KG attribute
  clonedArray.push({CLIENTE:"Total", Direccion:"-", DESPACHO:"-", KG: sumKG, assignedRuta: "-"})

  function loadTableData(items) {
    //get the table
    const table = document.getElementById("exportBody");
    //clear current table
    //table.innerHTML = "";
    //for each element or item do something
    //clear table body before
    
    items.forEach( item => {
      let row = table.insertRow();   //insert arow of data with values
      let grupoRuta = row.insertCell(0);   //column 0
      grupoRuta.innerHTML = item.assignedRuta;
      let cliente = row.insertCell(1);   //column 0
      cliente.innerHTML = item.CLIENTE;
      let direccion = row.insertCell(2); //column 1
      direccion.innerHTML = item.Direccion;
      let formatoEntrega = row.insertCell(3); //column 2
      formatoEntrega.innerHTML = item.DESPACHO;
      let totalKG = row.insertCell(4); //column 3
      totalKG.innerHTML = item.KG;
    });
  }
  loadTableData(clonedArray);
  clonedArray.pop()  //delete last item which is grand total. (i dont want it here) 
  //loadTableData(items2);
  loadTableData([]);
  
}













  initMap();

//esta promesa se cumple una unica vez. array es el array de elementos restantes que fueron rectificados por el user
