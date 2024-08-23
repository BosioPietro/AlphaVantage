'use strict'

var canScroll = true;
var fineEffetto = true

window.addEventListener("resize", resizeGrafico);

window.addEventListener('wheel', (event) => {rallentaScroll(event)}, { passive: false });

window.addEventListener('load', () => {
    impostaCerchi();
    impostaBarre()
    impostaCandele()
    impostaArea()
    effettiScroll(false)
    window.addEventListener("scroll", () => {effettiScroll()});
});

//#region GraficoTorta 
function effettoGraficoTorta(passa = true){
    let cont = $(".card").get(0)
    let dist = -(cont.getBoundingClientRect().bottom - window.innerHeight);
    
    const maxScende = 400;
    const minSale = 900;
    const max = minSale + maxScende;
    if((dist < 0 || dist > max) && passa) return;
    dist = dist > maxScende && dist < minSale ? maxScende : dist;
    dist = dist > minSale ? maxScende - dist + minSale  : dist;
    dist /= 4;
    let mod = dist / 7;
    mod = Math.floor(mod * 100) / 100;
    if(mod < 0 && passa)return;
    if(mod > 7 && passa)return;
    mod = mod > 7 ? 7 : mod;
    mod = mod < 0 ? 1.001 : mod;
    applicaTorta(passa, mod);
}

function applicaTorta(passa, mod){
    let graficoTorta = $(".graficoTorta");
    let clipTorta;
    if(!passa && mod > 7){
        mod = 6 + mod - Math.floor(mod);
    }
    if(mod > 1 && mod <= 2){
        mod -= 1;
        clipTorta = `polygon(0% 0%, 50% 0%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 0% ${50 * mod}%)`
    }
    if(mod > 2 && mod <= 3){
        mod -= 2;
        clipTorta =  `polygon(0% 0%, 50% 0%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%, 0%  ${50 + 50 * mod}%)`;
    }
    if(mod > 3 && mod <= 4){
        mod -= 3;
        clipTorta = `polygon(0% 0%, 50% 0%, 50% 50%, 50% 50%, 50% 50%, ${50 * mod}% 100%, 0% 100%)`
    }
    if(mod > 4 && mod <= 5){
        mod -= 4;
        clipTorta = `polygon(0% 0%, 50% 0%, 50% 50%, 50% 50%, 50% 50%, ${50 + 50 * mod}% 100%, 0% 100%)`
    }
    if(mod > 5 && mod <= 6){
        mod -= 5;
        clipTorta = `polygon(0% 0%, 50% 0%, 50% 50%, 50% 50%, 100% ${100 - 50 * mod}%, 100% 100%, 0% 100%)`
    }
    if(mod > 6 && mod <= 7){
        mod -= 6;
        clipTorta = `polygon(0% 0%, 50% 0%, 50% 50%, 50% 50%, 100% ${50 - 50 * mod}%, 100% 100%, 0% 100%)`
    }
    graficoTorta.css("clipPath", clipTorta);
}
//#endregion

//#region GraficoBarre
function impostaBarre() {
    const nBarre = 6;
    const spazio = 6;
    const accentuazione = 2;

    let barre = $(".barra");
    let grafico = $(".graficoBarre").eq(0);
    for(let i = 0; i < nBarre; i++){
        let barra = $("<div>").addClass("barra");
        grafico.append(barra);
        barre = barre.add(barra)
    }
    const larg = (100 - spazio * nBarre) / nBarre;
    barre.css("width", `${larg}%`)
    let gradient = generaGradient("#1b4965", "#049692",barre.length)
    const maxAltezza = 100 - larg;
    const fattore = maxAltezza / Math.pow(barre.length - 1, accentuazione);
    barre.each((i, ref) => {
        let altezza = Math.pow(i, accentuazione) * fattore;
        altezza += larg;
        $(ref).css({
            "background-color" : gradient[i],
            "height" : `${larg}%`
        });
        $(ref).prop("alt", altezza)
        $(ref).prop("min", larg)
    })
}

function effettoGraficoBarre(passa = true){
    let cont = $(".card").get(1)
    let dist = -(cont.getBoundingClientRect().bottom - window.innerHeight);

    const maxScende = 400;
    const minSale = 600;
    const max = minSale + maxScende;
    
    if(dist < 0 || dist > max && passa) return;
    dist = dist > maxScende && dist < minSale ? maxScende : dist;
    dist = dist > minSale ? maxScende - dist + minSale  : dist;
    dist /= 4;
    let mod = dist / 7;
    mod = Math.floor(mod * 100) / 100;
    if(Math.round($(window).scrollTop() / window.innerHeight) == 2 && !passa)
    {
        mod = 7;
    }
    if(mod < 0)return;
    if(mod > 7 && passa)return;
    mod = !passa && mod > 7 ? 7 : mod;
    applicaBarre(passa, mod);
}

function applicaBarre(passa, mod){
    let barre = $(".graficoBarre").eq(0).find(".barra");
    barre.each((i, ref) => {
        let alt = ($(ref).prop("alt") + "").replace("%", "");
        let inc = alt / 7
        let min = ($(ref).prop("min") + "").replace("%", "");
        let val = inc * mod < min ? min : inc * mod;
        $(ref).css("height", `${val}%`)
    });
}
//#endregion

//#region GraficoCandele
function impostaCandele(){
    const nCandele = 20;
    const spazio = 1;
    const larg = (100 - spazio * nCandele) / nCandele;

    function altezzaBottom(max, min){
        let num = generaNumero(max, min);
        let padding = 100 - num;
        padding = generaNumero(max, min);
        return [num, padding]
    }
    
    let candele = $(".candela");
    let grafico = $("#graficoCandele").eq(0); 
    let lastAltezza = 0;
    let lastBottom = 0;
    let gradient = generaGradient("#049692","#1b4965", nCandele)
    for(let i = 0; i < nCandele; i++){
        let candela = $("<div>").addClass("candela");
        let [altezza, bottom] = altezzaBottom(15, 4);
        let colore;
        if(i != 0)
        {
            let mod = Math.random() > 0.35 ? true : false;
            if(mod)
            {
                bottom = lastBottom + lastAltezza;
                bottom = bottom + altezza < 90 ? bottom : lastBottom - altezza;
            }
            else
            {
                bottom = lastBottom - altezza;
                bottom = bottom > 0 ? bottom : lastBottom + lastAltezza;
            }
            bottom /= 2;
            colore = mod ? "#049692" : "#1b4965";
        }
        else
        {
            bottom = 0
            colore = "#049692"
        }
        lastAltezza = altezza;
        lastBottom = bottom * 2;
        candela.css({
            "height" : `${altezza}%`,
            "margin-bottom" : `${bottom}%`,
            "background-color" : colore,
            "background-image" : `linear-gradient(${gradient[i]}, ${gradient[i]})`
        })
        grafico.append(candela);
        candele = candele.add(candela)
    }
    candele.css("width", `${larg}%`)
}

function effettoGraficoCandele(passa = true){
    let cont = $(".card").get(2)
    let dist = -(cont.getBoundingClientRect().bottom - window.innerHeight);
    dist = (dist / window.innerHeight) * 100 + 10;
    const maxScende = 15
    const minSale = 80;
    const max = minSale + maxScende;
    
    if(dist < 0 || dist > max) return;
    dist = dist > maxScende && dist < minSale ? maxScende : dist;
    dist = dist > minSale ? maxScende - dist + minSale  : dist;

    dist *= 100 / 15;
    let mod = dist / 7;
    mod = Math.floor(mod * 100) / 100;
    if(mod < 0)return;
    if(mod > 7 && passa)return;
    mod = mod > 7 ? 7 : mod;
    applicaCandele(passa, mod)
}

function applicaCandele(passa, mod){
    if(mod > 6.8) mod = 7;
    if(mod < 0.2) mod = 0;
    let grafico = $("#graficoCandele").eq(0);
    let inc = 1 / 7;
    inc = inc * mod;
    let clip = `polygon(0% 0%, ${100 * inc}% 0%, ${100 * inc}% 100%, 0% 100%)`
    grafico.css("clip-path", clip)
}
//#endregion

//#region GraficoArea
const punti = 100;

function impostaArea(){
    const offset = 3;
    let clip = "polygon("
    let altezze = []
    let val = 50;
    for(let i = 0; i <= 100; i += 100 / punti)
    {
        let alt;
        if(i != 0)
        {
            val = altezze[altezze.length - 1];
            alt = Math.random() > 0.55 ? offset : -offset;
            if(val + alt > 95) alt = -offset;
            if(val + alt < 5) alt = offset;
            alt = val + alt;
        }
        else alt = val;
        altezze.push(alt)
        clip += `${i}% ${alt}%, `
    }
    clip += "100% 100%, 0% 100%)"
    $(".graficoArea").css("clip-path", clip).prop("alt", altezze)
    applicaArea(false, 7)
}

function effettoGraficoArea(passa){
    let cont = $(".card").get(5)
    let dist = -(cont.getBoundingClientRect().bottom - window.innerHeight);
    dist = (dist / window.innerHeight) * 100 + 10;
    const maxScende = 15
    const minSale = 80;
    const max = minSale + maxScende;
    
    if((dist < 0 || dist > max) && passa) return;
    dist = dist > maxScende && dist < minSale ? maxScende : dist;
    dist = dist > minSale ? maxScende - dist + minSale  : dist;

    dist *= 100 / 15;
    let mod = dist / 7;
    mod = Math.floor(mod * 100) / 100;
    if(mod < 0 && passa)return;
    if(mod > 7 && passa)return;
    mod = mod > 7 ? 7 : mod;
    mod = mod < 0 ? 0 : mod;
    applicaArea(passa, mod)
}

function applicaArea(passa, mod){
    if(mod > 6.8) mod = 7;
    if(mod < 0.2) mod = 0;
    mod = 1 / 7 * mod;
    let grafico = $(".graficoArea").eq(0);
    let altezze = $(".graficoArea").prop("alt")
    let clip = "polygon("
    for(let [i, alt] of altezze.entries())
    {
        clip += `${i * 100 / punti}% ${100 - alt * mod}%, `
    }
    clip += "100% 100%, 0% 100%)";
    grafico.css("clip-path", clip)
}
//#endregion

//#region GraficoNumero
function effettoGraficoNumero(passa){
    let cont = $(".card").get(3)
    let dist = -(cont.getBoundingClientRect().bottom - window.innerHeight);
    dist = (dist / window.innerHeight) * 100 + 10;
    const maxScende = 15
    const minSale = 80;
    const max = minSale + maxScende;
    
    if(dist < 0 || dist > max) return;
    dist = dist > maxScende && dist < minSale ? maxScende : dist;
    dist = dist > minSale ? maxScende - dist + minSale  : dist;

    dist *= 100 / 15;
    let mod = dist / 7;
    mod = Math.floor(mod * 100) / 100;
    if(mod < 0)return;
    if(mod > 7 && passa)return;
    mod = mod > 7 ? 7 : mod;
    applicaNumero(passa, mod)
}

function applicaNumero(passa, mod){
    if(mod > 6.8) mod = 7;
    if(mod < 0.2) mod = 0;
    let grafico = $("#graficoNumero");
    let inc = 1 / 7;
    inc = inc * mod;
    grafico.text(`${Math.floor(100 * inc)}%`)
}
//#endregion

//#region GraficoCerchi
function impostaCerchi(){
    let barre = $(".barra1");
    let grafico = $("#graficoCerchi").get(0)
    let spazio = getComputedStyle(grafico).getPropertyValue("--spazio")
    barre.prop("spessore", spazio)
    barre.each((i, ref) => {
        $(ref).css("transform", `translateY(-50%) rotate(${360 / 3 * i}deg)`)
    }) 
}

function effettoGraficoCerchi(passa = true){
    let cont = $(".card").get(4)
    let dist = -(cont.getBoundingClientRect().bottom - window.innerHeight);

    const maxScende = 15
    const minSale = 80;
    const max = minSale + maxScende;
    if(dist < 0 || dist > max) return;
    dist = dist > maxScende && dist < minSale ? maxScende : dist;
    dist = dist > minSale ? maxScende - dist + minSale  : dist;
    dist /= 4;
    let mod = dist / 7;
    mod = Math.floor(mod * 100) / 100;
    if(mod < 0)return;
    if(mod > 7 && passa)return;
    mod = mod > 7 ? 7 : mod;
    applicaCerchi(passa, mod);
}

function applicaCerchi(passa, mod){
    mod = 1 / 7 * mod;
    let barra = $(".barra1");
    let max;
    let udm;
    try
    {
        max = parseFloat(barra.prop("spessore"));
        udm = barra.prop("spessore").replace(max, "").trim();
    }
    catch
    {
        setTimeout(() => applicaCerchi(passa, mod), 50);
        return;
    }
    let val = mod * max;
    val = val < 0.1 ? 0 : val;
    let grafico = $("#graficoCerchi").get(0)
    grafico.style.setProperty("--spazio", val + udm);
    barra.each((i, ref) => {
        $(ref).css("transform", `translateY(-50%) rotate(${-360 / 3 * i * mod}deg)`)
    }) 
}
//#endregion

function generaNumero(max, min){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
  
function effettiScroll(passa = true){
    if (!canScroll || !fineEffetto) return;
    effettoGraficoTorta(passa);
    effettoGraficoBarre(passa);
    effettoGraficoCandele(passa);
    effettoGraficoNumero(passa);
    effettoGraficoArea(passa);
    effettoGraficoCerchi(passa);
}

function generaGradient(colorA, colorB, n) {
    let gradient = [];
    let step = 1 / (n - 1);
  
    for (let i = 0; i < n; i++) {
      let percent = i * step;
      let r = parseInt(colorA.substring(1, 3), 16) * (1 - percent) + parseInt(colorB.substring(1, 3), 16) * percent;
      let g = parseInt(colorA.substring(3, 5), 16) * (1 - percent) + parseInt(colorB.substring(3, 5), 16) * percent;
      let b = parseInt(colorA.substring(5, 7), 16) * (1 - percent) + parseInt(colorB.substring(5, 7), 16) * percent;
      let hexColor = "#" + Math.floor(r).toString(16).padStart(2, "0") + Math.floor(g).toString(16).padStart(2, "0") + Math.floor(b).toString(16).padStart(2, "0");
      gradient.push(hexColor);
    }
    
    return gradient;
}

var arrayTimeout = [];
var lastValue = 0;

function rallentaScroll(event){
    if(mobile)return;
    let esci = false;
    $(".selectOptions").each((i, ref) => {
        esci |= $.contains(ref, event.target);
    })
    if(esci)return;
    if(mobile || $("body").hasClass("noScroll")) return;
    event.preventDefault();
    if(!canScroll) return;

    canScroll = false;
    const tempoScroll = 500;
    const fps = 120;
    const tempoAnimazione = 750;

    const frame = tempoAnimazione / fps;
    const nRipetizioni = 7 / fps;

    function applicaEffetti(mod){
        applicaTorta(true, mod);
        applicaBarre(true, mod);
        applicaCandele(true, mod);
        applicaNumero(true, mod);
        applicaArea(true, mod);
        applicaCerchi(true, mod);
        lastValue = mod;
    }
    let punto;
    const isOnFooter = Math.floor($(window).scrollTop() / window.innerHeight * 100) / 100 > 3;
    const cs = Math.round($(window).scrollTop() / window.innerHeight) * window.innerHeight;
    let delta = (-event.wheelDelta || event.detail) / 120;
    if(isOnFooter && delta < 0)
    {
        punto = window.innerHeight * 3;
    }
    else punto = cs + window.innerHeight * delta;

    let i = 0;
    fineEffetto = false;
    if(arrayTimeout.length > 0)
    {
        arrayTimeout.forEach((ref) => clearTimeout(ref));
        c("s")
    }
    arrayTimeout = [];
    if(punto / window.innerHeight == 2)
    {
        
        setTimeout(() => {
            for(let mod = lastValue; mod < 7; mod += nRipetizioni)
            {
                let a = setTimeout(() => {
                    applicaEffetti(mod)
                }, i++ * frame);
                arrayTimeout.push(a);
            }
            
            setTimeout(() =>{fineEffetto = true; arrayTimeout = [];}, i * frame)
        }, tempoScroll * 0.75);
    }
    else if(punto / window.innerHeight == 3 || punto / window.innerHeight == 1)
    {
        for(let mod = lastValue; mod >= 0; mod -= nRipetizioni)
        {
            let a = setTimeout(() => {
                applicaEffetti(mod)
            }, i++ * frame);
            arrayTimeout.push(a);
        }
        setTimeout(() =>{arrayTimeout = [];}, i * frame)
    }
    smoothScrollTo(punto, tempoScroll)
}

function smoothScrollTo(to, duration) {
    if(!to)to = 0.1;
    const element = document.body;
    if (duration <= 0)
    {
        canScroll = true
        return;
    }
    var difference = to - element.scrollTop;
    var perTick = difference / duration * 10;
    setTimeout(function() {
        element.scrollTop = element.scrollTop + perTick;
        if (element.scrollTop === to)
        {
            canScroll = true
            return;
        }
        scrollTo(element, to, duration - 10);
        setTimeout(() => {canScroll = true}, duration - 10);
    }, 10);
}

//#region Grafico

var grafico = null;
var tipoGrafico = "bar";
var indiceGrafico = "Rank H: 3 Year Performance"
var configGrafico = null;

async function creaGrafico(stats = null, labels = null){
    
    let ctx = $("canvas").get(0).getContext("2d");
    let canvas = $("canvas").get(0);
    canvas.width = $(canvas).width();
    canvas.height = $(canvas).height();

    let dataGrafico = !!stats ? stats : fakeSector[indiceGrafico];
    labels = !!labels ? labels : Object.keys(dataGrafico);
    let valori = Object.values(dataGrafico).map(valore => valore.replace("%", ""));
    let colori = generaGradient("#1b4965", "#049692", labels.length);
    if(tipoGrafico == "bar")
    {
        labels = labels.filter((x) => x != "Energy")
        labels.unshift("Energy")
    }

    const gradient = ctx.createLinearGradient(0, 0, canvas.height, 0);
    gradient.addColorStop(0, "#1b4965"); 
    gradient.addColorStop(1, "#049692");
    ctx.strokeStyle = gradient;

    const plugin = {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart, args, options) => {
          const {ctx} = chart;
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = options.color || '#FFFFFF';
          ctx.fillRect(0, 0, chart.width, chart.height);
          ctx.restore();
        }
      };

    let data = {
        labels: labels,
        datasets: [{
            label: '',
            data: valori,
            backgroundColor: colori,
            borderColor: tipoGrafico == "bar" ? colori : gradient,
            borderWidth: 1,
            showLabel: false
        }]
    };

    if(tipoGrafico != "bar")
    {
        data.datasets[0].borderWidth = 20;
        data.datasets[0].pointRadius = 0;
    }

    let config = configGrafico ? configGrafico : await richiediConfigurazioneGrafico();
    configGrafico = config;
    config["data"] = data;
    config["plugins"] = [plugin];
    config["type"] = tipoGrafico;
    config.options.scales.y.ticks.callback = function(value, index, ticks) {
        return value + "%";
    }
    Chart.defaults.backgroundColor = '#9BD0F5';
    Chart.defaults.color = '#2c3639';
    Chart.defaults.font.family = 'PoppinsBold';
    Chart.defaults.font.size = 16;

    if(!!grafico) grafico.destroy();
    grafico = new Chart(ctx, config);
}

function cambiaModGrafico(button){
    let select = $(button).siblings(".pseudoSelect").find(".selectOptions");
    let cont = $("#switchGrafico > div").find("span")
    select.empty();
    let opzioni;
    if(cont.text() == "area_chart")
    {
        opzioni = ["Real-Time", "1 Day", "5 Day", "1 Month", "3 Month", "Year-to-Date (YTD)", "1 Year", "3 Year", "5 Year", "10 Year"];
        cont.text("equalizer");
        tipoGrafico = "bar";
    }
    else
    {
        opzioni = ["Energy", "Consumer Staples", "Industrials", "Health Care", "Information Technology", "Utilities", "Materials", "Financials",  "Communication Services", "Consumer Discretionary", "Real Estate"];
        cont.text("area_chart");
        tipoGrafico = "line";
    }
    for(let opz of opzioni)
    {
        let div = $("<div>").addClass("option").appendTo(select);
        div.append($("<span>").text(opz));
        div.append($("<span>").addClass("selectChk material-symbols-outlined"));
    }
    
    select.find(".option").eq(tipoGrafico == "bar" ? 7 : 0).click();
}

function downloadGrafico(button){
    let select = $(button).siblings(".pseudoSelect").find(".testoSelect");
    const dataURL = $("canvas").get(0).toDataURL();
    const a = document.createElement('a');
    a.href = dataURL;
    let nome = tipoGrafico == "bar" ? "Sectors_" : "";
    nome += select.text().replace(" ", "_").toLowerCase();
    a.download = `${nome}_chart.png`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function resizeGrafico(){
    if(!grafico) return;
    let canvas = $("canvas");
    let container = canvas.parent()
    canvas = canvas.get(0)
    canvas.width = container.width();
    canvas.height = container.height();
    grafico.update();
}
//#endregion