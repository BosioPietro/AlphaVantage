'use strict'

var c = console.log;
var localCacheSimboli = {};
var localChaceLocation = {};
var simboloCorrente = "MSFT";
var mobile = window.innerHeight > window.innerWidth;
var prevAltezza = window.innerHeight;
var prevLarghezza = window.innerWidth;

window.addEventListener("load", async function () {
    inserisciInTabella(await getGlobalQuotes("MSFT"))
    mainLoop();
    aggiustaFinestra()
    setInterval(mainLoop, 3000);
    setInterval(salta, 5000);
    creaGrafico();
    await caricaGoogleMaps();
    
})

window.addEventListener("resize", aggiustaFinestra)

async function getGlobalQuotes(symbol) {
    $("#quote tbody td").text("")
    $("#loadingTabella").show();
    $("#btnMappa").prop("disabled", true);
    if(symbol in localCacheSimboli)
    {
        c(`"${symbol}" è presente nella cache locale`)
        return localCacheSimboli[symbol]
    }
    let query = await sqlSimboli("GET", symbol);
    
    if(Object.keys(query).length > 0)
    {
        c(`"${symbol}" è presente nel database simboli`)
        localCacheSimboli[symbol] = query;
        return query
    }
    c(`"${symbol}" richiesto all'API`)
    let symbolData;
    let key = ALPHA_API_KEY;
    let url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key}`;
    await $.getJSON(url,
        function (data) {
            if("Note" in data) return mostraErrore("API limit reached");
            let arr = {[data["Global Quote"]["01. symbol"]] : data}
            sqlSimboli("POST", arr)
            symbolData = data;
        }
    );
    localCacheSimboli[symbol] = symbolData;
    return symbolData;
}

async function getResults(simbolo, ex = ""){
    let results = [];
    let key = ALPHA_API_KEY;
    let url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${simbolo}&apikey=${key}${ex}`;
    await $.getJSON(url,
        function (data) {
            results = data["bestMatches"];
        }
    );
    return results;
}

async function getLocation(simbolo){
    let result = {};
    let url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${simbolo}&apikey=${ALPHA_API_KEY}`;
    await $.getJSON(url,
        function (data) {
            if(Object.keys(data).length > 0)
            {
                result = data["Address"];
            }
        }
    );
    return result;
}

function inserisciInTabella(data) {
    if("Note" in data) return mostraErrore("API limit reached");
    $("#loadingTabella").hide();
    $("#btnMappa").prop("disabled", false);
    simboloCorrente = data["Global Quote"]["01. symbol"];
    $("#symbol").text(data["Global Quote"]["01. symbol"]);
    let globalQuoteData = data["Global Quote"];
    $("#previousClose").text(globalQuoteData["08. previous close"]);
    $("#open").text(globalQuoteData["02. open"]);
    $("#lastTrade").text(globalQuoteData["05. price"]);
    let date = new Date()
    date = date.toLocaleDateString("it-IT");
    $("#lastTradeTime").text(date);
    $("#change").text(globalQuoteData["09. change"]);
    $("#daysLow").text(globalQuoteData["04. low"]);
    $("#daysHigh").text(globalQuoteData["03. high"]);
    $("#volume").text(globalQuoteData["06. volume"]);
}

function mostraErrore(titolo){
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer);
          toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });
  
    Toast.fire({
        icon: 'error',
        title: titolo
    })
}

function mainLoop(){
    const loghi = {
        "Apple" : "#a8a8a8",
        "Microsoft" : "#00bfff",
        "Google" : "#009ce3",
        "Meta" : "#385490",
        "Amazon" : "#212d3b",
        "Tesla" : "#d61833",
        "Netflix" : "#d90913",
        "Intel" : "#00bcef",
        "IBM" : "#000000",
        "Oracle" : "#e12f34",
        "Nvidia" : "#72af00",
        "Nike" : "#000000",
        "Visa" : "#1434cb",
        "Mastercard" : "#ff5f00",
        "Samsung" : "#1529a0",
        "Sony" : "#000000",
        "Shell" : "#ffcd00",
        "Toyota" : "#ff0000",
        "Pfizer" : "#2b01be",
        "PayPal" : "#009cde",
    }
    let chiavi = Object.keys(loghi);
    let testo = chiavi[Math.floor(Math.random() * chiavi.length)];
    let bottom = $("#txtBottom")
    let top = $("#txtTop")

    bottom.text(testo)
    top.animate({opacity: 0, top : "-2rem"}, 300);
    bottom.animate({opacity: 1, top : 0}, 300);
    setTimeout(() => {
        top.text(testo)
        top.css({opacity: 1, top : 0});
        bottom.css({opacity: 0, top : ""});
        bottom.text(testo);
    }, 550)
}

function scrollBody(){
    let opz = {
        top: window.innerHeight + 5 * window.innerHeight/100,
        behavior: 'smooth',
    }
    window.scrollTo(opz)
}

function salta(){
    $("#mainIcona").addClass("salta");
    setTimeout(() => {
        $("#mainIcona").removeClass("salta");
    }, 2000);
}

async function mostraMappa(){
    let cont = $("#contMappa");
    let mappa = $("#mappa");
    let celle = $("#quote td");
    let dk = $("#darkOverlay")
    if(cont.css("height") != "0px") return chiudiMappa();
    celle.css("color", "transparent");
    $(".article").removeClass("lowerIndex")
    if(mappa.prop("simbolo") != simboloCorrente)
    {
        $("#loadingTabella").show(200);
        $("#btnMappa").prop("disabled", true);
        let indirizzo = await richiediMappa();
        if(!(await impostaMappa(indirizzo)))
        {
            $("#loadingTabella").hide(200);
            celle.css("color", "");
            $(".article").addClass("lowerIndex")
            return mostraErrore("No location found");
        }
        let pegmanIcon = $(".gm-svpc > div:first-child > div:first-child");
        pegmanIcon.css({ top: "10px", left: "10px" });
        $("#loadingTabella").hide(200);
        $("#btnMappa").prop("disabled", false);
    }
    $("body").addClass("noScroll")
    dk.css("display", "block");
    dk.animate({opacity : 1}, 500).focus();
    setTimeout(() => {
        let luogoScroll = distanza($("#quote")[0]);
        luogoScroll = luogoScroll - window.innerHeight + $("#quote")[0].offsetHeight;
        luogoScroll += mobile ? window.innerHeight/100 * 2 : window.innerHeight/10;
        scrollToPoint(luogoScroll, 500)
        mappa.animate({opacity : 1}, 500);
        cont.css({height : mobile ? "70svh" : "80vh"});
        if(mobile)
        {
            setTimeout(() => {cont.parent().parent().parent().css({width : "90vw"});}, 400);
        }
    }, 200);
}

function remToPx(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

async function richiediMappa(){
    return new Promise(async (resolve) => {
        let simbolo = simboloCorrente;  
        if(simbolo in localChaceLocation){ 
            resolve(localChaceLocation[simbolo]);
            c("Posizione salvata nella cache locale")
        }
        else
        {
            let indirizzo = await sqlLocation("GET", simbolo);
            if(indirizzo.length > 0){
                indirizzo = indirizzo[0]["data"]
                localChaceLocation[simbolo] = indirizzo;
                c("Posizione richiesta al database")
                resolve(indirizzo);
            }
            else
            {
                indirizzo = await getLocation(simbolo);
                if(Object.keys(indirizzo).length == 0)
                {
                    indirizzo = `Sede ${$("#symbol").prop("nome")}`;
                }
                else sqlLocation("POST", {[simbolo] : indirizzo});
                localChaceLocation[simbolo] = indirizzo;
                c("Posizione richiesta alla API e memorizzata")
                resolve(indirizzo);
            }
        }
    });
}

async function impostaMappa(indirizzo){
    let coord = await geocode(indirizzo);
    let cont = $("#mappa")
    cont.prop("simbolo", simboloCorrente);
    const mappa = creaMappa(coord, cont.get(0), {zoom : 17});
    let marker = piazzaMarker(coord, mappa);
    return !!coord;
}

function chiudiMappa(){
    let cont = $("#contMappa");
    let mappa = $("#mappa");
    if(cont.css("height") == "0px") return;
    mappa.animate({"opacity" : 0}, 500, () => {
        mappa.css("display", "block")
        setTimeout(() => {cont.css("opacity", "1")}, 1000)
    });
    setTimeout(()=>{cont.css({height : "0px"});}, 300)
    cont.parent().parent().parent().css({width : ""}) 
    setTimeout(() => {
        
        let dk = $("#darkOverlay")
        $("body").removeClass("noScroll")
        dk.animate({opacity : 0}, 500, function(){
            dk.css("display", "none").blur();
        });
        let celle = $("#quote td");
        setTimeout(() => {
            celle.css("color", "white");
            $(".article").removeClass("lowerIndex")
        }, 500); 
    }, 400);
}

function distanza(elem) {
    let location = 0;
    if (elem.offsetParent) {
        do {
            location += elem.offsetTop;
            elem = elem.offsetParent;
        } while (elem);
    }
    return location >= 0 ? location : 0;
};

function scrollToPoint(y, time) {
    const startingY = window.pageYOffset;
    const diffY = y - startingY;
    let start;
  
    window.requestAnimationFrame(function step(timestamp) {
      if (!start) start = timestamp;
      const timeElapsed = timestamp - start;
      const progress = Math.min(timeElapsed / time, 1);
      window.scrollTo(0, startingY + (diffY * progress));
      if (timeElapsed < time) 
      {
        window.requestAnimationFrame(step);
      }
    });
}

function caricaGoogleMaps(){
	let promise =  new Promise(function(resolve, reject){
		var script = document.createElement('script');
		script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
		script.src ="https://maps.googleapis.com/maps/api/js?v=3&key=" + MAP_KEY + "&callback=init";
		document.body.appendChild(script);
		script.onload = resolve;  // non inietta alcun dato
		script.onerror = reject;  // non inietta alcun errore
		script.onerror = function (){
			throw new Error("Errore caricamento GoogleMaps")
		} 
	})
	return promise
}

function geocode(indirizzo) {
    return new Promise((resolve) => {
        let geocoder = new google.maps.Geocoder()
        geocoder.geocode({ "address": indirizzo }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                let latLng = results[0].geometry.location
                resolve(latLng)
            } else resolve(null)
        })
    })
}

function creaMappa(latLng, container, options) {
    const defaults = {
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.TERRAIN
    };
  
    const settings = $.extend({}, defaults, options);
  
    const map = new google.maps.Map(container, {
        center: latLng,
        zoom: settings.zoom,
        mapTypeId: settings.mapTypeId,
        styles: stileMappa,
        mapTypeControl: true,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
        },
        fullscreenControl: true,
    });
    
    return map;
  }
  

function piazzaMarker(coord, map, params = {}) {
    let opz = {
        "position": coord,
        "map": map,
        "title" : simboloCorrente,
        "icon" : "./img/marker.png",
        "size" : "100px"
    }
    let markerOptions = $.extend(opz, params);
    return new google.maps.Marker(markerOptions)
}
  
function aggiustaFinestra(){
    mobile = window.matchMedia("(max-width: 950px)").matches;
    aggiustaCarte();
    aggiustaGrafici();
    if($("#darkOverlay").css("opacity") == "0")return;
    if(prevAltezza == window.innerHeight)
    {
        let luogoScroll = distanza($("#quote")[0]);
        luogoScroll = luogoScroll - window.innerHeight + $("#quote")[0].offsetHeight;
        luogoScroll += mobile ? 0 : window.innerHeight/10;
        window.scrollTo(0, luogoScroll);
    }
    else chiudiMappa();
    prevAltezza = window.innerHeight
    prevLarghezza = window.innerWidth
}

function aggiustaGrafici(){
    let alt = parseInt($(".contCarte").css("height"))
    let sfondo = $(".cntSfondo").eq(0)
    let altSfondo = parseInt($(".testo").css("height"))
    let icone = $("#headerMenu .material-symbols-outlined")
    if(altSfondo > alt)
    {
        sfondo.css("height", "")
        icone.css("font-size", "")
        return;
    } 
    alt = alt * 6 / 5;
    sfondo.css("height", `${alt}px`)
    icone.css("font-size", "1.5rem")
}

function aggiustaCarte(){
    if(!window.matchMedia("(max-width: 1200px)").matches)
    {
        return $(".contCarte > div").eq(1).css("transform", `translateY(${0}px)`)
    }
    let altCont = $("div.cellaCarte").eq(1).css("height");
    let grafico = $(".contCarte").get(0)
    let spazio = parseInt(getComputedStyle(grafico).getPropertyValue("--gap"))
    altCont = parseInt(altCont) + remToPx(spazio) + (mobile ? remToPx(0.4) : 0);
    altCont *= -1;
    $(".contCarte > div").eq(1).css("transform", `translateY(${altCont}px)`)
}
//#endregion
function init(){}