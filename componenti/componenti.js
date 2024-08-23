//#region ONLOAD

var jsonOpzioni = [];

window.addEventListener("load", async function () {
    $(".option").not(".addedOption").not(".cerca").each(function (i, ref) {
        let nome = $(ref).find("span").eq(0).text().split("-")[0].trim()
        $(ref).prop("nome", nome);
    });

    $("#symbol").prop("nome", "Microsoft");

    $("#sezioneLookup .pseudoSelect").on("click", ".option", async function () {
        let target = !!event;
        target = target ? $(event.target).text() != "close" : true;
        if(!$(this).text().includes("Cerca") && target)
        {
            chiudiElemento($(this), null);
            let nome = $(this).find("span").eq(0).text().split("-")[1];
            let data = await getGlobalQuotes(nome.trim());
            inserisciInTabella(data);
            $("#symbol").prop("nome", $(this).prop("nome"));
        }
    })

    $("#sezioneChart .pseudoSelect").on("click", ".option", async function () {
        chiudiElemento($(this), null);
        cambiaGrafico($(this));
    })

    $(".pseudoSelect").on("click", ".risultato", async function () {
        if(aggiungiOpzione($(this), $(this).parent().parent()))
        {
            chiudiElemento(null, $(this).parent().parent());
        }
        else chiudiElemento($(this), null);
        let symbol = $(this).text().split("-")[1].trim();
        let data = await getGlobalQuotes(symbol);
        inserisciInTabella(data);
        $("#symbol").prop("nome", $(this).prop("nome"));
    })
    $(".pseudoSearch").on("click", ".risultato", async function () {
        chiudiElemento(null, $(this).parent().parent());
        let symbol = $(this).text().split("-")[1].trim();
        let data = await getGlobalQuotes(symbol);
        inserisciInTabella(data);
        $(this).parent().parent().find("input").val(symbol).blur();
        $("#symbol").prop("nome", $(this).prop("nome"));
    });
    $(".selectBody").on("blur", function () {
        let select = $(this).parent();
        setTimeout(() =>{
            if(select.prop("isCerca"))
            {
                transformaSelect(select);
            }
            else chiudiElemento(null, select.find(".selectOptions"));
        },1);
    })
    $(".pseudoSearch .material-symbols-outlined").css("transition", "none")
    $(".pseudoSearch .material-symbols-outlined").css("transform", "translateY(-0.3rem) scale(0)");
    setTimeout(() => {$(".pseudoSearch .material-symbols-outlined").css("transition", "")}, 1);
    
    let segnoPrecedente = "";
    $(".pseudoSelect").on("mouseenter", ".addedOption", function () {
        let opzione = $(this);
        let _span = opzione.find(".selectChk").eq(0);
        segnoPrecedente = _span.text();
        _span.text("close");
    });
    $(".pseudoSelect").on("mouseleave", ".addedOption", function () {
        let opzione = $(this);
        let _span = opzione.find(".selectChk").eq(0);
        _span.text(segnoPrecedente);
    });
    $(".pseudoSelect").on("click", ".addedOption .selectChk", function () {
        let chk = $(this);
        let opzione = $(this).parent();
        let elenco = opzione.parent();
        if(chk.text() != "close") return;
        rimuoviJson(opzione, opzione.parent().parent());
        opzione.remove();
        setTimeout(() => {elenco.children(".option").eq(0).trigger("click")}, 1);
    });

    jsonOpzioni = localStorage.getItem("jsonOpzioni");
    jsonOpzioni = jsonOpzioni ? JSON.parse(jsonOpzioni) : [];
    if(jsonOpzioni) caricaOpzioni();
});

//#endregion

//#region CERCA E SELECT

function caricaOpzioni(){
    for(let elem of jsonOpzioni){
        let _dest = $(`#${elem["destinazione"]}`);
        for(let opt of elem["opzioni"]){
            let _opzione = $("<div>").addClass("addedOption").addClass("option");
            $("<span>").text(opt).appendTo(_opzione);
            $("<span>").addClass("selectChk").addClass("material-symbols-outlined").appendTo(_opzione);
            _opzione.insertBefore(_dest.find(".selectOptions").find(".option").last());
        }
    }
}

async function cercaSimbolo(input){
    let isValid = false;
    isValid |= event.which >= 65 && event.which <= 90;
    isValid |= event.which >= 48 && event.which <= 57;
    isValid |= event.which == 8 || event.which == 32;
    if(!isValid) return;
    let val = input.val();
    let sel = input.parent().parent();
    let labelRis = sel.find(".labelRis");
    sel.find(".risultato").remove();
    if(val.length < 3)
    {
        labelRis.text("Type something...")
        resizeOpzioni(sel, "risultato");
        return
    }
    labelRis.text("");
    labelRis.append($("<div>").addClass("race-by"))
    let info = await getResults(val);
    labelRis.remove("race-by");
    if(!info)
    {
        sel = sel.children("*:not(.selectOptions)");
        sel.css("color" , "#eb4034");
        setTimeout(() => {sel.css("color" , "")}, 250);
        sel.addClass("errore");
        setTimeout(() => {sel.removeClass("errore")}, 500);
        mostraErrore("API Limit Reached");
        setTimeout(() => {input.blur()}, 1);
    }
    else stampaRisultati(info, sel);
}

function stampaRisultati(info, sel){
    sel.find("img").remove();
    sel.find(".risultato").remove();
    let opt = sel.find(".selectOptions");
    let plur = info.length == 1 ? '' : 's';
    let cerca = sel.find("input").val();
    cerca = cerca.length > 10 ? cerca.substr(0, 7) + "..." : cerca;
    opt.find(".labelRis").text(`Found ${info.length} result${plur} for "${cerca}"`);
    for(let ris of info){
        let risultato = $("<div>").addClass("risultato").appendTo(opt)
        risultato.prop("nome", ris["2. name"])
        let nome = ris["2. name"];
        nome = nome.split(" ")[0] + " " + nome.split(" ")[1];
        nome = nome.length > 15 ? nome.substr(0, 15) + "..." : nome;
        let simbolo = ris["1. symbol"];
        if((simbolo + nome.replace("...", "")).length > 23) 
        {
            nome = nome.replace("...", "");
            nome = nome.substring(0, 23 - simbolo.length - 3) + "...";
        }
        $("<span>").text(`${nome} - ${simbolo}`).appendTo(risultato);
    }
    resizeOpzioni(sel, "risultato");
}

function resizeOpzioni(select, elem){
    let n = select.find(`.${elem}`).length;
    n = n < 3 ? n+2 : n;
    select.find(".selectOptions").css({height: `${n * 2.4}rem`});
}

function chiudiElemento(opzione = null, select = null){
    if(!!opzione)select = opzione;
    let i= 0
    while(!select.hasClass("pseudoSelect") && !select.hasClass("pseudoSearch")){
        select = select.parent();
    }
    if(!!opzione && opzione.hasClass("addedOption")) return select.find(".selectBody > .testoSelect").text(opzione.children("span").eq(0).text());
    if($(document.activeElement).text().includes("Cerca") && $(document.activeElement).hasClass("option")) return;
    if(!!opzione){
        
        select.find(".selectBody > .testoSelect").text(opzione.children("span").eq(0).text());
        select.find(".selectChk").text("");
        opzione.find(".selectChk").text("done");
    }
    select.find(".selectOptions").css({height: 0});
    if(select.hasClass("pseudoSearch"))return;
    select.find(".selectBody > .material-symbols-outlined").css("transform", "scale(1.3)  translateY(-0.3rem) rotate(0deg)");
}

//#endregion

//#region SELECT
function chkTrasforma(icona){
    trasformaSelect(icona.parent().parent())
}

async function aggiungiOpzione(opz, sel){
    let ret
    sel.find(".option").each((i, ref) => {
        if($(ref).find("span").eq(0).text() == opz.text())
        {
            ret = true;
        }
    });
    if(ret) return ret;
    inserisciJson(opz, sel)
    let data = await getGlobalQuotes(opz.text().split("-")[1].trim());
    inserisciInTabella(data)
    
    let clone = sel.find(".option").eq(0).clone();
    clone.find("span").eq(0).text(opz.text());
    sel.find(".selectChk").text("");
    sel.find(".testoSelect").text(opz.text())
    clone.find("span").eq(1).text("done");
    clone.insertBefore(sel.find(".option").last());
    clone.addClass("addedOption");
    clone.prop("nome", opz.prop("nome"))
    return false;
}

function inserisciJson(opz, sel){
    let vett = {};
    for(let i of jsonOpzioni){
        
        if(i["destinazione"] == sel.prop("id"))
        {
            vett = i;
            break;
        }
    }
    if(Object.keys(vett).length == 0)
    {
        vett["destinazione"] = sel.prop("id");
        vett["opzioni"] = [];
        jsonOpzioni.push(vett);
    }
    vett["opzioni"].push(opz.text());
    scriviInLocal();
}

function rimuoviJson(opz, sel){
    let opzioniAggiunte = sel.find(".addedOption");
    let indice = opzioniAggiunte.index(opz);
    for(let [i, dest] of jsonOpzioni.entries()){
        if(dest["destinazione"] == sel.prop("id"))
        {
            dest["opzioni"].splice(indice, 1);
            if(dest["opzioni"].length == 0)
            {
                jsonOpzioni.splice(i, 1);
            }
            scriviInLocal();
            break;
        }
    }
    return;
}

function scriviInLocal(){
    localStorage.setItem("jsonOpzioni", JSON.stringify(jsonOpzioni));
}

function espandiSelect(select){
    while(!select.hasClass("pseudoSelect")){
        select = select.parent();
    }
    let tar = $(event.target); 
    if(tar.hasClass("material-symbols-outlined") && tar.text() != "expand_more") return;
    let opzioni = select.find(".selectOptions");
    select.find(".selectBody > .material-symbols-outlined").css("transform", "scale(1.3)  translateY(-0.3rem) rotate(180deg)");
    if(opzioni.height() > 0) return select.find(".selectBody").blur();
    select.find(".selectBody")
    resizeOpzioni(select, "option");
}

function trasformaSelect(sel){
    while(!sel.hasClass("pseudoSelect")){
        sel = sel.parent();
    }
    sel.prop("isCerca", false)
    let desc = sel.find(".selectDesc")
    let body = sel.find(".selectBody")
    body.find(".testoSelect").css("display", "block")
    body.find("input").css("display", "none").val("");
    desc.text("Pick a symbol");
    setTimeout(() => {
        body.children(".material-symbols-outlined").text("expand_more")
    }, 100);
    setTimeout(() => {
        sel.find(".option").show();
        sel.find(".labelRis").hide().text("Type something...");
        sel.find(".risultato").remove();
    }, 500)
    chiudiElemento(null, sel);
}

//#endregion

//#region SEARCH

function trasformaCerca(opzione){
    searchedSymbol = {};
    while(!opzione.hasClass("pseudoSelect") && !opzione.hasClass("pseudoSearch")){
        opzione = opzione.parent();
    }
    opzione.prop("isCerca", true)
    let desc = opzione.find(".selectDesc")
    let body = opzione.find(".selectBody")
    let opt = opzione.find(".selectOptions")
    body.find(".testoSelect").css("display", "none")
    body.find("input").css("display", "block").val("").focus();
    desc.text("Insert the symbol...");
    setTimeout(() => {
        body.children(".material-symbols-outlined").text("close")
    }, 1);
    opt.find(".option").hide();
    opt.find(".labelRis").show();
    resizeOpzioni(opzione, "risultato");
}

function focusSearch(inp){
    inp.siblings("span").css("transform" , " translateY(-0.4rem) scale(1.3)");
    let search = inp.parent().parent();
    search.find(".selectBody").addClass("focus");
    resizeOpzioni(search, "risultato")
}

function blurSearch(inp){
    let search = inp.parent().parent();
    inp.siblings("span").css("transform" , " translateY(-0.4rem) scale(0)");
    search.find(".selectBody").removeClass("focus");
    try
    {
        chiudiElemento(null, $(event.target));
    }
    catch{}
}

//#endregion

function cambiaGrafico(opz){
    if(tipoGrafico == "bar")
    {
        const riferimenti = ["Real-Time", "1 Day", "5 Day", "1 Month", "3 Month", "YTD", "1 Year", "3 Year", "5 Year", "10 Year"];

        while(!opz.hasClass("pseudoSelect") && !opz.hasClass("pseudoSearch")){
            opz = opz.parent();
        }
        let perf = opz.find(".selectBody > .testoSelect").text() + " Performance";
        let i = riferimenti.findIndex(rif => perf.includes(rif));
        let lettera = String.fromCharCode(65 + i);
        indiceGrafico = `Rank ${lettera}: ${perf}`;
        creaGrafico();
    }
    else
    {
        let settore = opz.children().first().text();
        let chiavi = Object.keys(fakeSector).filter(key => key != "Meta Data" && key != "Rank F: Year-to-Date (YTD) Performance");
        let stats = chiavi.map(key => fakeSector[key][settore]);
        stats = stats.filter(stat => stat != undefined);
        stats = stats.map(stat => stat.replace("%", ""));
        let labels = chiavi.filter(key => key != "Meta Data")
        labels = labels.map(label => label.split(":")[1].replace("Performance", "").trim());
        return creaGrafico(stats, labels);
    }
    
}