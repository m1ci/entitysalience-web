/* 
 * Created by Milan Dojchinovski
 * 
 * web:     http://www.dojchinovski.mk
 * twitter: @m1ci
 */
    
function handlepaste (elem, e) {
    var savedcontent = elem.innerHTML;
    if (e && e.clipboardData && e.clipboardData.getData) {// Webkit - get data from clipboard, put into editdiv, cleanup, then cancel event
        if (/text\/html/.test(e.clipboardData.types)) {
            elem.innerHTML = e.clipboardData.getData('text/html');
        }
        else if (/text\/plain/.test(e.clipboardData.types)) {
            elem.innerHTML = e.clipboardData.getData('text/plain');
        }
        else {
            elem.innerHTML = "";
        }
        waitforpastedata(elem, savedcontent);
        
        if (e.preventDefault) {
                e.stopPropagation();
                e.preventDefault();
        }
        
        return false;
    }
    else {// Everything else - empty editdiv and allow browser to paste content into it, then cleanup
        elem.innerHTML = "";
        waitforpastedata(elem, savedcontent);
        return true;
    }
}

var ongoingDyscovery = false;

$(document).ready(function(){
/*    
    $('.morespan').on('click',function() {
        // use content.
        console.log("sdjahdhjsh")
    });
    */
});

function invokeAPI2(form){
    $(".tooltipclass").tipTip({delay: 50, fadeIn: 150, fadeOut: 200});
    $('.morespan').on('click',function() {
        // use content.
        console.log("sdjahdhjsh")
    });
}
var lastResults = null;

function invokeAPI(form){
    // do not submit the form, we will use AJAX    
    //event.preventDefault();
    
    //console.log($('#textbox').text());
        
    if(!ongoingDyscovery){
        
        var query = $('textarea#textareacontainer').val();
        //query = query.replace(/(\r\n|\n|\r)/gm," ");
        
        //uncode the url
        //query = escape(query);
        query = encodeURIComponent(query);
        //var query = $('#textareacontainer').text();
        var maxResults = $("input.maxResults").val();
        var requestTimeout = $("input.requestTimeout").val();
        var lang = $("input.langchkbox:checked").val();
        var ne_switcher = $("input.ne_switcher:checked").val();
        var results_cache_switcher = $("input.results_cache_switcher:checked").val();
        
        if(typeof ne_switcher != 'undefined'){
            ne_switcher = 'all';
            console.log("ALL");
        }else{
            console.log("only NE");
            ne_switcher = 'named_entities';
        }
        
        if(typeof results_cache_switcher == 'undefined'){
            results_cache_switcher = 'live';
            console.log("live");
        }else{
            console.log("local");
            results_cache_switcher = 'local';
        }
        
        if(query != "" ){
            $(".tooltipclass").tipTip({delay: 50, fadeIn: 150, fadeOut: 4000});
            var start = new Date().getTime();
            ongoingDyscovery = true;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if(xhr.readyState == 1){
                    // loading
                }
                if(xhr.readyState == 2){          
                    // request sent
                }
                if(xhr.readyState == 3){
                    // "receiving" state
                }
                if(xhr.readyState == 4){
                    $("#loading-gif").fadeOut(function(){

                    });
                    clearTimeout(xmlHttpTimeout); 
                    //loaded state, data has been completely received
                    if(ongoingDyscovery){
                        ongoingDyscovery = false;
                        var end = new Date().getTime();
                        //console.log('milliseconds passed', end - start);
                        var response = JSON.parse(xhr.responseText);
                        lastResults = response;
                        console.log(response);
                       
                        var resultsPlaceHolder = $(".finalResults");
                        //resultsPlaceHolder.children().remove();      
                        // decode encoded query
                        // query = unescape(query);
                        query = decodeURIComponent(query);
                        resultsPlaceHolder.html(getFormatedResults(query, response));
                        // reload the tooltip plugin
                        $(".tooltipclass").tipTip({delay: 50, fadeIn: 150, fadeOut: 200});
                        var resStatus = $("div .status").html('<i>Results processed in '+(end - start)/1000+ ' seconds.</i>');
                        //$(".nifExport").html('<b><a href='+encodeURI('/thd/api/v1/extraction?input='+query+'&format=turtle'+'&prefix=http://example.org/'+'&numHypernyms='+maxResults)+'>Get the results in NIF</a></b>');                        
                    }
                }
            };
            xhr.open("GET", "/thd/api/v1/hypernyms?input="+query+"&offset=0&max_results="+maxResults+"&similarity=0.9"+"&lang="+lang+"&range="+ne_switcher+"&cached_results="+results_cache_switcher, true);
            xhr.setRequestHeader("Accept", "application/json");            
            xhr.send();
            $("#loading-gif").fadeIn(function(){
                
            });
            function ajaxTimeout(){
                ongoingDyscovery=false;
                console.log("Reached timeout!");
                xhr.abort();
                var resTable = $(".status");
                resTable.html('Reached requeste timed out of '+ requestTimeout+ ' seconds! Increase the timeout!');
                $("#loading-gif").fadeOut(function(){
                    //do something
                });
            }
            var xmlHttpTimeout = setTimeout(ajaxTimeout,requestTimeout*1000);
        }
    }else{
        alert("Wait");
    }
}

String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

function getFormatedResults(query, results){
    
    var ann = new Array();

    //console.log(query);
    //console.log(results.length);
    var counter = 0;
    for(i in results){
        //console.log("start: " + results[i].startOffset);
        //console.log("end: " + results[i].endOffset);
        
        if(typeof ann[results[i].startOffset] === 'undefined'){
            counter = 0;
            counter++;
            //console.log("first time");
            //console.log(results[i].startOffset);
            var content = "Hypernyms:<br/>#" + counter + ': <a href="'+results[i].typeURL+'" target="_blank">' + results[i].type + '</a> for entity disambiguated as <a href="' + results[i].entityURL + '" target="_blank">' + results[i].entity + ' </a>';
            ann[results[i].startOffset] = { start: results[i].startOffset, end: results[i].endOffset, content: content}
        }else{
            counter++;
            var content = ann[results[i].startOffset].content + "<br/>#"+counter+': <a href="'+results[i].typeURL+'" target="_blank">' +results[i].type + '</a> for entity disambiguated as <a href="' + results[i].entityURL + '" target="_blank">' + results[i].entity + ' </a>';
            //console.log("inserting "+content);
            ann[results[i].startOffset].content = content;
            //console.log(results[i].startOffset);
            //console.log(results[i].plainNaun);
        }
    }
    
    // sorting annotations by start offset.
    // solves the bug causing text/link overlapping.
    var ann2 = new Array();
    
    for(k in ann){
            //console.log(ann[k]);
        if(typeof ann[k] === 'undefined'){
        }else{
            ann2.push(ann[k]);            
        }
    }
    ann2.sort(function(a,b) {
        if (a.start < b.start)
            return -1;
        if (a.start > b.start)
            return 1;
        else
            return 0;
    });
    //console.log("Anotations length: " + ann.length);
    console.log(ann2);
    var currentOffset = 0;
    for(i in ann2){
        var localOffset = ann2[i].start + currentOffset;
        //var q = q.splice(localOffset, 0, "<span>");
        //console.log("Query:"+query);
        //console.log("inserting"+ann[i].start);
        
        query = query.splice(localOffset, 0, "<span class='tooltipclass offset"+ann2[i].start+"' title='"+ann2[i].content+"'>");
        //query = query.splice(localOffset, 0, "<span class='tooltipclass' title='"+ann2[i].content+"<span>Show more</span>"+"'>");
        var additionalStringLength = ann2[i].start+"";
        
        currentOffset += 34 + ann2[i].content.length + 2;
        var localOffset2 = ann2[i].end + currentOffset + additionalStringLength.length+7;
        query = query.splice(localOffset2, 0, "</span>");
        currentOffset += 7 + additionalStringLength.length+7;
        //console.log(query);
    }
    console.log(query);
    //console.log("yes");
    return query;
}

function selectOnlyThis(id) {
    for (var i = 1;i <= 3; i++){
        document.getElementById("Check" + i).checked = false;
    }
    switch(id) {
    case "Check1":
       $("textarea#textareacontainer").text("The Charles Bridge is a famous historic bridge that crosses the Vltava river in Prague, Czech Republic.");
      break;
    case "Check2":
       $("textarea#textareacontainer").text("Königin Beatrix der Niederlande (Bild) hat in einer Fernsehansprache ihre Abdankung zugunsten ihres ältesten Sohnes Willem-Alexander angekündigt.");
      break;
    case "Check3":
       $("textarea#textareacontainer").text("De Nijldelta is een grote rivierdelta van de rivier de Nijl in het noorden van Egypte. De naam delta voor een driehoekige riviermonding werd ingevoerd door de Griekse historicus Herodotus toen hij de Nijl beschreef en de opvallende vorm op de Griekse letter delta vond lijken.");
      break;
    default:
        break;
    }
    document.getElementById(id).checked = true;
    
}

var currentHoveredEntity = null;
var currentHoveredEntityOffset = null;
(function($){
    $.fn.tipTip = function(options) {
            var defaults = { 
                    activation: "hover",
                    keepAlive: true,
                    maxWidth: "900px",
                    edgeOffset: 3,
                    defaultPosition: "top",
                    delay: 400,
                    fadeIn: 200,
                    fadeOut: 200,
                    attribute: "title",
                    content: false, // HTML or String to fill TipTIp with
                    enter: function(){},
                    exit: function(){}
            };
            var opts = $.extend(defaults, options);

            // Setup tip tip elements and render them to the DOM
            if($("#tiptip_holder").length <= 0){
                    var tiptip_holder = $('<div id="tiptip_holder" style="max-width:'+ opts.maxWidth +';"></div>');
                    var tiptip_content = $('<div id="tiptip_content"></div>');
                    var tiptip_arrow = $('<div id="tiptip_arrow"></div>');
                    $("body").append(tiptip_holder.html(tiptip_content).prepend(tiptip_arrow.html('<div id="tiptip_arrow_inner"></div>')));
            } else {
                    var tiptip_holder = $("#tiptip_holder");
                    var tiptip_content = $("#tiptip_content");
                    var tiptip_arrow = $("#tiptip_arrow");
            }

            return this.each(function(){
                    var org_elem = $(this);
                    if(opts.content){
                            var org_title = opts.content;
                    } else {
                            var org_title = org_elem.attr(opts.attribute);
                    }
                    if(org_title != ""){
                            if(!opts.content){
                                    org_elem.removeAttr(opts.attribute); //remove original Attribute
                            }
                            var timeout = false;

                            if(opts.activation == "hover"){
                                    org_elem.hover(function(){
                                            active_tiptip();
                                            console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
                                            console.log(org_elem.text());
                                            currentHoveredEntity=org_elem.text();
                                            currentHoveredEntityOffset = org_elem.attr("class");
                                            console.log(currentHoveredEntityOffset.split(' ')[1]);
                                    }, function(){
                                            if(!opts.keepAlive){
                                                    deactive_tiptip();
                                            }
                                    });
                                    if(opts.keepAlive){
                                            tiptip_holder.hover(function(){}, function(){
                                                    //deactive_tiptip();
                                            });
                                    }
                            } else if(opts.activation == "focus"){
                                    org_elem.focus(function(){
                                            active_tiptip();
                                    }).blur(function(){
                                            deactive_tiptip();
                                    });
                            } else if(opts.activation == "click"){
                                    org_elem.click(function(){
                                            active_tiptip();
                                            return false;
                                    }).hover(function(){},function(){
                                            if(!opts.keepAlive){
                                                    deactive_tiptip();
                                            }
                                    });
                                    if(opts.keepAlive){
                                            tiptip_holder.hover(function(){}, function(){
                                                    deactive_tiptip();
                                            });
                                    }
                            }

                            function active_tiptip(){
                                    opts.enter.call(this);
                                    tiptip_content.html(org_title);
                                    tiptip_holder.hide().removeAttr("class").css("margin","0");
                                    tiptip_arrow.removeAttr("style");

                                    var top = parseInt(org_elem.offset()['top']);
                                    var left = parseInt(org_elem.offset()['left']);
                                    var org_width = parseInt(org_elem.outerWidth());
                                    var org_height = parseInt(org_elem.outerHeight());
                                    var tip_w = tiptip_holder.outerWidth();
                                    var tip_h = tiptip_holder.outerHeight();
                                    var w_compare = Math.round((org_width - tip_w) / 2);
                                    var h_compare = Math.round((org_height - tip_h) / 2);
                                    var marg_left = Math.round(left + w_compare);
                                    var marg_top = Math.round(top + org_height + opts.edgeOffset);
                                    var t_class = "";
                                    var arrow_top = "";
                                    var arrow_left = Math.round(tip_w - 12) / 2;
                                    tiptip_content.append('<div id="tiptip_close" />');
//                                    tiptip_content.append('<br/><br/><br/><span id="tiptip_showmore">Show more</span>');
                                    
                                    $('#tiptip_showmore').click( function (e) {
                                        
                                        var org_elem2 = $(this);
                                        var top = parseInt(org_elem2.offset()['top']);
                                        var left = parseInt(org_elem2.offset()['left']);
                                        $('#infobox div#showmore_results').empty();
                                        $('#infobox').css('visibility','visible');
                                        $('#infobox').css('top','50%');
                                        $('#infobox').css('left','50%');
                                        $('#infobox').css('margin-top','-300px');
                                        $('#infobox').css('margin-left','-300px');
                                        $('#infobox center h3').text("Detailed results for entity: "+currentHoveredEntity);
                                        
                                        var totalResults = "";
                                        
                                        if(lastResults !== null){
                                            totalResults+="<p id='thd_types'>THD types</p>";
                                            totalResults+="<ol id='thd_ol'>";
                                            //$('#infobox div#showmore_results').append("<p id='thd_types'>THD types</p>");                                            
                                            //$('#infobox div#showmore_results').append("<ol id='thd_ol'>");
                                            
                                            var thd_counter = 0;
                                            for(i in lastResults){
                                                if(lastResults[i].underlyingEntityText === currentHoveredEntity && lastResults[i].origin === "thd"){
                                                    var entityOffset = parseInt(currentHoveredEntityOffset.substring(19,currentHoveredEntityOffset.length));
                                                    //console.log(entityOffset);
                                                    //console.log(lastResults[i].startOffset)
                                                    if(entityOffset === lastResults[i].startOffset){
                                                        
                                                        totalResults+="<li><a href='"+lastResults[i].typeURL+"'>"+lastResults[i].type+"</a> for entity disambiguated as <a href='"+lastResults[i].entityURL+"'>" + lastResults[i].entity + "</a></li>";
                                                        //$('#infobox div#showmore_results ol').append("<li><a href='"+lastResults[i].typeURL+"'>"+lastResults[i].type+"</a> for entity disambiguated as <a href='"+lastResults[i].entityURL+"'>" + lastResults[i].entity + "</a></li>")
                                                        console.log("new thd hyp");
                                                        thd_counter++;
                                                        console.log("updating counter")
                                                        console.log("updating counter"+thd_counter);
                                                        
                                                    }
                                                }
                                            }
                                            
                                            totalResults+="</ol>";
                                            //$('#infobox div#showmore_results').append("</ol>");                                            
                                            totalResults+="<p id='dbpedia_types'>DBpedia types</p>";
                                            //$('#infobox div#showmore_results').append("<p id='dbpedia_types'>DBpedia types</p>");
                                            totalResults+="<ol id='dbpedia_ol'>";
                                            //$('#infobox div#showmore_results').append("<ol id='dbpedia_ol'>");
                                            
                                            var dbpedia_counter = 0;
                                            for(i in lastResults){
                                                if(lastResults[i].underlyingEntityText === currentHoveredEntity && lastResults[i].origin === "dbpedia"){                                                    
                                                    //$('#infobox div#showmore_results ol').append("<li><a href='"+lastResults[i].typeURL+"'>"+lastResults[i].type+"</a> for entity disambiguated as <a href='"+lastResults[i].entityURL+"'>" + lastResults[i].entity + "</a></li>")
                                                    var entityOffset = parseInt(currentHoveredEntityOffset.substring(19,currentHoveredEntityOffset.length));
                                                    if(entityOffset === lastResults[i].startOffset){
                                                        dbpedia_counter++;
                                                        totalResults+="<li><a href='"+lastResults[i].typeURL+"'>"+lastResults[i].type+"</a> for entity disambiguated as <a href='"+lastResults[i].entityURL+"'>" + lastResults[i].entity + "</a></li>";
                                                    }
                                                }
                                            }
                                            //$('#infobox div#showmore_results').append("</ol>");
                                            totalResults+="</ol>";
                                            $('#infobox div#showmore_results').append(totalResults);
                                            if(thd_counter === 0){
                                                console.log("THD counter" + thd_counter);
                                                $('#infobox div#showmore_results ol#thd_ol').append("<li>N/A</li>")
                                            }
                                            if(dbpedia_counter === 0){
                                                console.log("Db counter" + dbpedia_counter);                                                
                                                $('#infobox div#showmore_results ol#dbpedia_ol').append("<li>N/A</li>")
                                            }
                                        }
                                        //$('#infobox').css('top',e.pageX-this.offsetLeft-40);
                                        //$('#infobox').css('left',e.pageY-this.offsetTop+60);
                                        deactive_tiptip();
                                    });
                                    
                                    $('#tiptip_close').click( function () {
                                        deactive_tiptip();
                                    });
                                    $('#showmore_close').click( function () {
                                        $('#infobox').css('visibility','hidden');
                                    });

                if(opts.defaultPosition == "bottom"){
                    t_class = "_bottom";
                    } else if(opts.defaultPosition == "top"){ 
                            t_class = "_top";
                    } else if(opts.defaultPosition == "left"){
                            t_class = "_left";
                    } else if(opts.defaultPosition == "right"){
                            t_class = "_right";
                    }

                                    var right_compare = (w_compare + left) < parseInt($(window).scrollLeft());
                                    var left_compare = (tip_w + left) > parseInt($(window).width());

                                    if((right_compare && w_compare < 0) || (t_class == "_right" && !left_compare) || (t_class == "_left" && left < (tip_w + opts.edgeOffset + 5))){
                                            t_class = "_right";
                                            arrow_top = Math.round(tip_h - 13) / 2;
                                            arrow_left = -12;
                                            marg_left = Math.round(left + org_width + opts.edgeOffset);
                                            marg_top = Math.round(top + h_compare);
                                    } else if((left_compare && w_compare < 0) || (t_class == "_left" && !right_compare)){
                                            t_class = "_left";
                                            arrow_top = Math.round(tip_h - 13) / 2;
                                            arrow_left =  Math.round(tip_w);
                                            marg_left = Math.round(left - (tip_w + opts.edgeOffset + 5));
                                            marg_top = Math.round(top + h_compare);
                                    }

                                    var top_compare = (top + org_height + opts.edgeOffset + tip_h + 8) > parseInt($(window).height() + $(window).scrollTop());
                                    var bottom_compare = ((top + org_height) - (opts.edgeOffset + tip_h + 8)) < 0;

                                    if(top_compare || (t_class == "_bottom" && top_compare) || (t_class == "_top" && !bottom_compare)){
                                            if(t_class == "_top" || t_class == "_bottom"){
                                                    t_class = "_top";
                                            } else {
                                                    t_class = t_class+"_top";
                                            }
                                            arrow_top = tip_h;
                                            marg_top = Math.round(top - (tip_h + 5 + opts.edgeOffset));
                                    } else if(bottom_compare | (t_class == "_top" && bottom_compare) || (t_class == "_bottom" && !top_compare)){
                                            if(t_class == "_top" || t_class == "_bottom"){
                                                    t_class = "_bottom";
                                            } else {
                                                    t_class = t_class+"_bottom";
                                            }
                                            arrow_top = -12;						
                                            marg_top = Math.round(top + org_height + opts.edgeOffset);
                                    }

                                    if(t_class == "_right_top" || t_class == "_left_top"){
                                            marg_top = marg_top + 5;
                                    } else if(t_class == "_right_bottom" || t_class == "_left_bottom"){		
                                            marg_top = marg_top - 5;
                                    }
                                    if(t_class == "_left_top" || t_class == "_left_bottom"){	
                                            marg_left = marg_left + 5;
                                    }
                                    tiptip_arrow.css({"margin-left": arrow_left+"px", "margin-top": arrow_top+"px"});
                                    tiptip_holder.css({"margin-left": marg_left+"px", "margin-top": marg_top+"px"}).attr("class","tip"+t_class);

                                    if (timeout){ clearTimeout(timeout); }
                                    timeout = setTimeout(function(){ tiptip_holder.stop(true,true).fadeIn(opts.fadeIn); }, opts.delay);	
                            }

                            function deactive_tiptip(){
                                    opts.exit.call(this);
                                    if (timeout){ clearTimeout(timeout); }
                                    tiptip_holder.fadeOut(opts.fadeOut);
                            }

                    }				
            });
    }
})(jQuery);

