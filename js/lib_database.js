const urlBase = "js/server/";

async function sqlSimboli(mod, simbolo){
  let url = urlBase + `symbol.php`;
  let req = $.ajax({
      url: url,
      type: "GET",
      data: {
        mod : mod,
        tabella : "symbol", // Database == tabella per semplicità
        where : mod == "GET" ? simbolo : null,
        data : mod == "POST" ? simbolo : null,
      }
  });
  if(mod != "GET")return;
  let array = await req;
  if(array.length > 0)
    array = JSON.parse(array[0]["data"])
  return array;
}

async function sqlLocation(mod, location){
  let url = urlBase + `location.php`;
  let req = $.ajax({
      url: url,
      type: "GET",
      data: {
        mod : mod,
        tabella : "location", // Database == tabella per semplicità
        where : mod == "GET" ? location : null,
        data : mod == "POST" ? location : null,
      }
  });
  if(mod != "GET")return;
  let array = await req;
  return array;
}

async function richiediConfigurazioneGrafico(){
  const root = "https://api.jsonbin.io/v3/b/"
  const bin = "642fdac6ebd26539d0a62abc";
  let req = $.ajax({
    url: root + bin,
    type: "GET",
    headers: {
      "X-Master-Key": JSON_MASTER_KEY,
      "x-Access-Key": JSON_ACCESS_KEY,
      "X-Bin-Meta": "false",
    },
  })
  return await req;
}