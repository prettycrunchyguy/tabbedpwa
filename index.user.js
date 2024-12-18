// ==UserScript==
// @name         TabbedPWA
// @namespace    https://github.com/prettycrunchyguy/tabbedpwa
// @version      2024-11-06
// @description  Enables tab strips for ALL pwas
// @author       You
// @match        */*
// @icon         data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🗂️</text></svg>
// @grant        unsafeWindow
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.registerMenuCommand
// @noframes
// ==/UserScript==
let title, start, icon, png;
function editPWA(){
    // revise html element
    /*if (title == null){
        title = document.title
    }
    if (start == null){
        start = location.href
    }
    if (icon == null){
        icon = "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://"+location.hostname
    }*/
    console.log("[TabbedPWA] using for manifest: "+title+" "+start+" "+icon+" "+png)
    let mani = document.createElement('link')
    mani.rel = 'manifest'
    if (document.querySelectorAll('link[rel="manifest"]').length>0){
        document.querySelector('link[rel="manifest"]').remove() // temporary
    }
    /*
    Includes a web app manifest that includes:
    - short_name or name
            - icons - must include a 192px and a 512px icon
            - start_url
            - display - must be one of fullscreen, standalone, minimal-ui, or window-controls-overlay
            */
    // use https://github.com/falconshark/image-resize-api
    let b =icon
    let c = new Image()
    let a
    c.onload = function(){
        // the entirety of this needs to be rewritten :(
        if (c.width<144){
            //a = {"display":"standalone","display_override":["tabbed"],"name":title,"start_url":start,"icons":[{"type":"image/png","src":"https://cdn.glitch.global/563b0136-ef02-47aa-9600-7da28abe691c/card-index-dividers_1f5c2-fe0f.png?v=1670196760807","sizes":"160x160"}]}
            a = {"display":"standalone","display_override":["tabbed"],"name":title,"start_url":start} //its a stupid looking icon, but this is still temporary
        }else if (b.startsWith("https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://")){
            a = {"display":"standalone","display_override":["tabbed"],"name":title,"start_url":start,"icons":[{"type":"image/png","src":b+"&size=256","sizes":Math.min(256,c.width)+"x"+Math.min(256,c.height)},{"type":"image/png","src":b+"&size=128","sizes":Math.min(128,c.width)+"x"+Math.min(128,c.height)},{"type":"image/png","src":b+"&size=64","sizes":Math.min(64,c.width)+"x"+Math.min(c.height,64)}]}
        }else{
            a = {"display":"standalone","display_override":["tabbed"],"name":title,"start_url":start,"icons":[{"type":"image/"+png,"src":b,"sizes":c.width+"x"+c.height}]}
        }
        // look out for favicons
        /*if (c.width==16){
                    a = {"display":"standalone","display_override":["tabbed"],"name":document.title,"start_url":location.href,"icons":[{"type":"image/png","src":"https://cdn.glitch.global/563b0136-ef02-47aa-9600-7da28abe691c/card-index-dividers_1f5c2-fe0f.png?v=1670196760807","sizes":"160x160"}]}
                }else if (c.width<144){
                    a = {"display":"standalone","display_override":["tabbed"],"name":document.title,"start_url":location.href,"icons":[{"type":"image/png","src":"https://image-resizing-api.deno.dev/?image="+b+"&width=144&height=144&quality=0","sizes":"144x144"}]}
                }else{
                    a = {"display":"standalone","display_override":["tabbed"],"name":document.title,"start_url":location.href,"icons":[{"type":"image/png","src":b,"sizes":c.width+"x"+c.height}]}
                }*/
        mani.href="data:application/json,"+encodeURIComponent(JSON.stringify(a))
    }
    c.src = b//+"&size=256"
    document.head.appendChild(mani)
}

(function() {
    'use strict';

    window.addEventListener("load",function(){
        if (document.querySelectorAll('meta[name="tabbedpwa"][content="false"]').length>0){
            return;
        }
        // Check if manifest file already exists
        title = document.title
        start = location.href
        icon = "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://"+location.hostname+"&size=256"
        png = true
        if (document.querySelectorAll('link[rel="manifest"]').length==0){
            console.log("[TabbedPWA] no manifest.json")
            editPWA()
        }else{
            // it exists
            // request for manifest file
            let mani = document.createElement('link')
            mani.rel = 'manifest'
            let xhr = new XMLHttpRequest();
            let d;
            let e = document.querySelector('link[rel="manifest"]').href
            xhr.onreadystatechange = function() {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    d = xhr.responseText;
                    d = JSON.parse(d);
                    if (Object.keys(d).includes("display_override")){
                        if (!(d["display_override"].includes("tabbed"))){
                            d["display_override"].push('tabbed')
                        }
                    }else{
                        d["display_override"] = ["tabbed"]
                    }
                    if (!(Object.keys(d).includes("name"))){
                        d.name=title
                    }
                    if (Object.keys(d).includes("start_url")){
                        if (d["start_url"].startsWith("/") && !(d["start_url"].startsWith("//"))){
                            d["start_url"] = d["start_url"].replace("/",new URL(e).origin+"/")
                        }
                    }else{
                        d["start_url"]=start
                    }
                    if (Object.keys(d).includes("icons")){
                        for (var i = 0; i < d.icons.length; i++){
                            if (d.icons[i].src.startsWith("/") && !(d.icons[i].src.startsWith("//"))){
                                d.icons[i].src = d.icons[i].src.replace("/",new URL(e).origin+"/")
                            }
                        }
                    }else{
                        let c = new Image()
                        c.onload = function(){
                            // rewrite this too
                            if (c.width<144){
                                //d.icons = [{"type":"image/png","src":"https://cdn.glitch.global/563b0136-ef02-47aa-9600-7da28abe691c/card-index-dividers_1f5c2-fe0f.png?v=1670196760807","sizes":"160x160"}]
                                d.icons = []
                            }else if (b.startsWith("https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://")){
                                d.icons = [{"type":"image/png","src":icon+"&size=256","sizes":Math.min(256,c.width)+"x"+Math.min(256,c.height)},{"type":"image/png","src":icon+"&size=128","sizes":Math.min(128,c.width)+"x"+Math.min(128,c.height)},{"type":"image/png","src":icon+"&size=64","sizes":Math.min(64,c.width)+"x"+Math.min(c.height,64)}]
                            }else{
                                d.icons = [{"type":"image/"+png,"src":icon,"sizes":c.width+"x"+c.height}]
                            }
                            // look out for favicons
                            mani.href="data:application/json,"+encodeURIComponent(JSON.stringify(d))
                        }
                        c.src = icon
                    }
                    if (Object.keys(d).includes("shortcuts")){
                        // i is already defined FUCKING WHAT?
                        for (var j = 0; j < d.shortcuts.length; j++){
                            if (d.shortcuts[j].url.startsWith("/") && !(d.shortcuts[j].url.startsWith("//"))){
                                d.shortcuts[j].url = d.shortcuts[j].url.replace("/",new URL(e).origin+"/")
                            }
                        }
                    }
                    mani.href="data:application/json,"+encodeURIComponent(JSON.stringify(d))
                }
            }
            xhr.open('GET', e, true);
            xhr.send(null);
            // delete manifest element
            document.querySelector('link[rel="manifest"]').remove()
            // edit file
            document.head.appendChild(mani)
        }
        console.log("[TabbedPWA] appended patched manifest")
    })
    GM.registerMenuCommand("Edit TabbedPWA title",function(){
        title = prompt("Title of app",document.title)
        editPWA()
    })
    GM.registerMenuCommand("Edit TabbedPWA start url",function(){
        start = prompt("Start url",location.href)
        editPWA()
    })
    GM.registerMenuCommand("Edit TabbedPWA icon (grabs favicon automatically)",function(){
        icon = "https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://"+prompt("Url to grab favicon",location.hostname)+"&size=256"
        png = true
        editPWA()
    })
    GM.registerMenuCommand("Edit TabbedPWA icon (url to image/icon file)",function(){
        icon = prompt("Url to grab favicon",location.host+"/favicon.ico")
        let a = icon.split(".")
        png = a[a.length-1]
        editPWA()
    })
    //GM.setValue("editPWA",editPWA)
})();
