let selectText = false;
let selectShape = false;
let selectDrawing = false;
let selectImage = false;
let unselectText = false;
let unselectShape = false;
let unselectDrawing = false;
let unselectImage = false;
let trimmedPages = [];
let untrimmedPages = [];
let selectLocked = false;
let selectUnlocked = false;
let unselectLocked = false;
let unselectUnlocked = false;
let nothingSelected = true;


const selAll = document.getElementById("selectall");
selAll.addEventListener("click", function() {
    resetAllModes();
    groupMark("layer_unselected", "layer_selected", selectText, selectDrawing, selectImage, selectShape, selectLocked, selectUnlocked);
}, false);

async function groupMark(removeState, addState, selectStateT, selectStateD, selectStateI, selectStateS, selectStateL, selectStateU) {
    const layercontainers = document.getElementsByClassName("layercontainer");
    const pagelist = document.getElementsByClassName("pagelist")[0];
    if (!selectText && !selectShape && !selectDrawing && !selectImage && !selectLocked && !selectUnlocked && pagelist.value.trim() === "") {
        nothingSelected = true;
    } else {
        nothingSelected = false;
    }
    if (nothingSelected) {
        for (let i = 0; i < layercontainers.length; i++) {   
            if (layercontainers[i].classList.contains("layer_unselected")) {
                layercontainers[i].classList.remove("layer_unselected");
                layercontainers[i].classList.add("layer_selected");
            }
            layercontainers[i].style.backgroundColor = "rgba(218, 189, 182, 0.8)";
            layercontainers[i].style.borderStyle = "none";
            if (layercontainers[i].classList.contains("locked")) {
                layercontainers[i].style.borderStyle = "solid";
                layercontainers[i].style.borderWidth = "5px";
                layercontainers[i].style.borderColor = "rgba(255, 255, 255, 0.8)";
            }
        } 
    } else {
        for (let i = 0; i < layercontainers.length; i++) {
            if (layercontainers[i].classList.contains("layer_selected")) {
                layercontainers[i].classList.remove("layer_selected");
                layercontainers[i].classList.add("layer_unselected");
            }
        }
        for (let i = 0; i < layercontainers.length; i++) {
            markOnState(layercontainers[i]);
        }
        await extractPages(pagelist);  
        for (let i = 0; i < layercontainers.length; i++) {
            filterSelect(layercontainers[i], removeState, addState, selectStateT, selectStateD, selectStateI, selectStateS, selectStateL, selectStateU);
        }
        for (let i = 0; i < layercontainers.length; i++) {
            markOnState(layercontainers[i]);
        }
    }
}

const pagelist = document.getElementsByClassName("pagelist")[0];
pagelist.addEventListener("change", function() {
    trimmedPages = [];
}, false);

async function extractPages(list) {
    let input = list.value;
    if (input.trim() !== "") {
        const pdfDoc = await PDFLib.PDFDocument.load(pdfState.originalPDFBytes);
        if (input.includes(",")) {
            const pages = input.split(",");
            for (let i = 0; i < pages.length; i++) {
                let singlePage = parseInt(pages[i].trim());
                if (singlePage > 0 && singlePage <= pdfDoc.getPages().length) {
                    trimmedPages.push(singlePage);
                }
            }
        } else {
            let singlePage = parseInt(input.trim());
            if (singlePage > 0 && singlePage <= pdfDoc.getPages().length) {
                trimmedPages.push(singlePage);
            }
        }
    }
}

function filterSelect(layercon, removeState, addState, selectStateT, selectStateD, selectStateI, selectStateS, selectStateL, selectStateU) {
    if (trimmedPages.length > 0) {
        const layerPage = parseInt(layercon.getAttribute("data-page"));
        for (let i = 0; i < trimmedPages.length; i++) {
            let inputPage = trimmedPages[i];
            if (layerPage === inputPage) {
                filterForType(layercon, removeState, addState, selectStateT, selectStateD, selectStateI, selectStateS, selectStateL, selectStateU);
            }
        }
    } else {
        filterForType(layercon, removeState, addState, selectStateT, selectStateD, selectStateI, selectStateS, selectStateL, selectStateU);
    }
}

function filterForType(layercon, removeState, addState, selectStateT, selectStateD, selectStateI, selectStateS, selectStateL, selectStateU) {
    if (selectStateT || selectStateD || selectStateI || selectStateS) {
        const type = layercon.getAttribute("data-type");
        if (selectStateT && type === "text") {
            filterForLockedStatus(layercon, removeState, addState, selectStateL, selectStateU);
        }
        if (selectStateD && type === "drawing") {
            filterForLockedStatus(layercon, removeState, addState, selectStateL, selectStateU);
        }
        if (selectStateS && type === "shape") {
            filterForLockedStatus(layercon, removeState, addState, selectStateL, selectStateU);
        }
        if (selectStateI && type === "image") {
            filterForLockedStatus(layercon, removeState, addState, selectStateL, selectStateU);
        }
    } else {
        filterForLockedStatus(layercon, removeState, addState, selectStateL, selectStateU);
    }
}

function filterForLockedStatus(layercon, removeState, addState, selectStateL, selectStateU) {
    if (selectStateL && layercon.classList.contains("locked")) {
        layercon.classList.remove(removeState);
        layercon.classList.add(addState);
    } else if (selectStateU && layercon.classList.contains("unlocked")) {
        layercon.classList.remove(removeState);
        layercon.classList.add(addState);
    } else if ((selectStateL && selectStateU) || (!selectStateL && !selectStateU)) {
        layercon.classList.remove(removeState);
        layercon.classList.add(addState);
    }
}

function markOnState(layercon) {
    if (layercon.classList.contains("layer_unselected")) {
        layercon.style.borderStyle = "none";
        if (layercon.classList.contains("locked")) {
            layercon.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
        } else if (layercon.classList.contains("unlocked")) {
            layercon.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        }
    } else if (layercon.classList.contains("layer_selected")) {
        layercon.style.backgroundColor = "rgba(218, 189, 182, 0.8)";
        if (layercon.classList.contains("locked")) {
            layercon.style.borderStyle = "solid";
            layercon.style.borderWidth = "5px";
            layercon.style.borderColor = "rgba(255, 255, 255, 0.8)";
        } else if (layercon.classList.contains("unlocked")) {
            layercon.style.borderStyle = "none";
        }
    }
}


const unselAll = document.getElementById("deselectall");
unselAll.addEventListener("click", function() {
    resetAllModes();
    groupUnmark("layer_selected", "layer_unselected", unselectText, unselectDrawing, unselectImage, unselectShape, unselectLocked, unselectUnlocked);
}, false);

async function groupUnmark(removeState, addState, selectStateT, selectStateD, selectStateI, selectStateS, selectStateL, selectStateU) {
    const layercontainers = document.getElementsByClassName("layercontainer");
    const unpagelist = document.getElementsByClassName("un_pagelist")[0];
    if (!unselectText && !unselectShape && !unselectDrawing && !unselectImage && !unselectLocked && !unselectUnlocked && unpagelist.value.trim() === "") {
        nothingSelected = true;
    } else {
        nothingSelected = false;
    }
    if (nothingSelected) {
        for (let i = 0; i < layercontainers.length; i++) {   
            if (layercontainers[i].classList.contains("layer_selected")) {
                layercontainers[i].classList.remove("layer_selected");
                layercontainers[i].classList.add("layer_unselected");
            }
            layercontainers[i].style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            layercontainers[i].style.borderStyle = "none";
            if (layercontainers[i].classList.contains("locked")) {
                layercontainers[i].style.backgroundColor = "rgba(255, 255, 255, 0.8)";
            }
        } 
    } else {
        await unextractPages(unpagelist);   
        for (let i = 0; i < layercontainers.length; i++) {
            if (layercontainers[i].classList.contains("layer_selected")) {
                filterUnselect(layercontainers[i], removeState, addState, selectStateT, selectStateD, selectStateI, selectStateS, selectStateL, selectStateU);
            }
        }
        for (let i = 0; i < layercontainers.length; i++) {
            markOnState(layercontainers[i]);
        }
    }
}

function filterUnselect(layercon, removeState, addState, selectStateT, selectStateD, selectStateI, selectStateS, selectStateL, selectStateU) {
    if (untrimmedPages.length > 0) {
        const layerPage = parseInt(layercon.getAttribute("data-page"));
        for (let i = 0; i < untrimmedPages.length; i++) {
            let inputPage = untrimmedPages[i];
            if (layerPage === inputPage) {
                filterForType(layercon, removeState, addState, selectStateT, selectStateD, selectStateI, selectStateS, selectStateL, selectStateU);
            }
        }
    } else {
        filterForType(layercon, removeState, addState, selectStateT, selectStateD, selectStateI, selectStateS, selectStateL, selectStateU);
    }
}

const unpagelist = document.getElementsByClassName("un_pagelist")[0];
unpagelist.addEventListener("change", function() {
    untrimmedPages = [];
}, false); 

async function unextractPages(list) {
    let input = list.value;
    if (input.trim() !== "") {
        const pages = input.split(",");
        for (let i = 0; i < pages.length; i++) {
            let singlePage = parseInt(pages[i].trim());
            const pdfDoc = await PDFLib.PDFDocument.load(pdfState.originalPDFBytes);
            if (singlePage > 0 && singlePage <= pdfDoc.getPages().length) {
                untrimmedPages.push(singlePage);
            }
        }
    }
}


const textType = document.getElementsByClassName("texttype")[0];
textType.addEventListener("click", function() {
    if (!selectText) {
        selectText = true;
        textType.classList.remove("btn-light");
        textType.classList.add("btn-success");
    } else {
        selectText = false;
        textType.classList.remove("btn-success");
        textType.classList.add("btn-light");
    }
}, false);

const shapeType = document.getElementsByClassName("shapetype")[0];
shapeType.addEventListener("click", function() {
    if (!selectShape) {
        selectShape = true;
        shapeType.classList.remove("btn-light");
        shapeType.classList.add("btn-success");
    } else {
        selectShape = false;
        shapeType.classList.remove("btn-success");
        shapeType.classList.add("btn-light");
    }
}, false);

const drawingType = document.getElementsByClassName("drawingtype")[0];
drawingType.addEventListener("click", function() {
    if (!selectDrawing) {
        selectDrawing = true;
        drawingType.classList.remove("btn-light");
        drawingType.classList.add("btn-success");
    } else {
        selectDrawing = false;
        drawingType.classList.remove("btn-success");
        drawingType.classList.add("btn-light");
    }
}, false);

const imageType = document.getElementsByClassName("imagetype")[0];
    imageType.addEventListener("click", function() {
    if (!selectImage) {
        selectImage = true;
        imageType.classList.remove("btn-light");
        imageType.classList.add("btn-success");
    } else {
        selectImage = false;
        imageType.classList.remove("btn-success");
        imageType.classList.add("btn-light");
    }
}, false);

const untextType = document.getElementsByClassName("un_texttype")[0];
untextType.addEventListener("click", function() {
    if (!unselectText) {
        unselectText = true;
        untextType.classList.remove("btn-light");
        untextType.classList.add("btn-success");
    } else {
        unselectText = false;
        untextType.classList.remove("btn-success");
        untextType.classList.add("btn-light");
    }
}, false);

const unshapeType = document.getElementsByClassName("un_shapetype")[0];
unshapeType.addEventListener("click", function() {
    if (!unselectShape) {
        unselectShape = true;
        unshapeType.classList.remove("btn-light");
        unshapeType.classList.add("btn-success");
    } else {
        unselectShape = false;
        unshapeType.classList.remove("btn-success");
        unshapeType.classList.add("btn-light");
    }
}, false);

const undrawingType = document.getElementsByClassName("un_drawingtype")[0];
undrawingType.addEventListener("click", function() {
    if (!unselectDrawing) {
        unselectDrawing = true;
        undrawingType.classList.remove("btn-light");
        undrawingType.classList.add("btn-success");
    } else {
        unselectDrawing = false;
        undrawingType.classList.remove("btn-success");
        undrawingType.classList.add("btn-light");
    }
}, false);

const unimageType = document.getElementsByClassName("un_imagetype")[0];
unimageType.addEventListener("click", function() {
    if (!unselectImage) {
        unselectImage = true;
        unimageType.classList.remove("btn-light");
        unimageType.classList.add("btn-success");
    } else {
        unselectImage = false;
        unimageType.classList.remove("btn-success");
        unimageType.classList.add("btn-light");
    }
}, false);


const lockedBtn = document.getElementsByClassName("lockedBTN")[0];
lockedBtn.addEventListener("click", function() {
    if (!selectLocked) {
        selectLocked = true;
        lockedBtn.classList.remove("btn-light");
        lockedBtn.classList.add("btn-success");
    } else {
        selectLocked = false;
        lockedBtn.classList.remove("btn-success");
        lockedBtn.classList.add("btn-light");
    }
}, false);

const unlockedBtn = document.getElementsByClassName("unlockedBTN")[0];
unlockedBtn.addEventListener("click", function() {
    if (!selectUnlocked) {
        selectUnlocked = true;
        unlockedBtn.classList.remove("btn-light");
        unlockedBtn.classList.add("btn-success");
    } else {
        selectUnlocked = false;
        unlockedBtn.classList.remove("btn-success");
        unlockedBtn.classList.add("btn-light");
    }
}, false);

const un_lockedBtn = document.getElementsByClassName("un_lockedBTN")[0];
un_lockedBtn.addEventListener("click", function() {
    if (!unselectLocked) {
        unselectLocked = true;
        un_lockedBtn.classList.remove("btn-light");
        un_lockedBtn.classList.add("btn-success");
    } else {
        unselectLocked = false;
        un_lockedBtn.classList.remove("btn-success");
        un_lockedBtn.classList.add("btn-light");
    }
}, false);

const un_unlockedBtn = document.getElementsByClassName("un_unlockedBTN")[0];
un_unlockedBtn.addEventListener("click", function() {
    if (!unselectUnlocked) {
        unselectUnlocked = true;
        un_unlockedBtn.classList.remove("btn-light");
        un_unlockedBtn.classList.add("btn-success");
    } else {
        unselectUnlocked = false;
        un_unlockedBtn.classList.remove("btn-success");
        un_unlockedBtn.classList.add("btn-light");
    }
}, false);