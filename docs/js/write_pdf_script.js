const { PDFDocument, rgb, degrees, StandardFonts } = PDFLib

let userText = {
    pdfDoc: null,
    pdfBytes: null,
    text: '',
    x: 1,
    y: 1,
    size: 1,
    fontKey: null,
    font: null,
    lineHeight: 24,
    color: rgb(0, 0, 0),
    page: 1,
    renderPage: 0,
    opacity: 1.0,
    rotation: degrees(0),
    setTextElem() {
        this.pdfDoc.getPages()[this.renderPage].drawText(this.text, {
            x: this.x,
            y: this.y,
            size: this.size,
            font: this.font,
            color: this.color,
            lineHeight: this.lineHeight,
            rotate: this.rotation
        });
    }
}

let controlPoint = {
    controlBox: null,
    editImg: null,
    elementToControl: null,
    type: '',
    layer: null,
    page: 1,
    x: 0,
    y: 0,
    index: 0,
    setControlPoint() {
        let div = document.createElement("div");
        div.style.position = "absolute";
        div.style.left = this.x + "px";
        div.style.top = this.y + "px";
        div.setAttribute('data-page', this.layer.getAttribute("data-write"));
        div.setAttribute('data-index', this.index);
        div.classList.add(this.type);
        div.classList.add("box");
        this.controlBox = div;
    }
}

const colorPickerFont = new Alwan('#colorpicker', {
    theme: 'dark',
    toggle: 'false',
    popover: 'false',
    color: '#000',
    default: '#000',
    format: 'rgb',
    singleInput: false,
    opacity: true,
    preview: true,
    closeOnScroll: false,
    copy: true
});

let x = 0;
let y = 0;
let textControllerPointCounter = 0;
let userFontColor;
let userFontOpacity;
let userTextField;
let fontSizeSelectorTriggered = false;
let fontSizeInputFieldTriggered = false;
let rotateTextSelectorTriggered = false;
let rotateTextInputFieldTriggered = false;
let lineheightSelectorTriggered = false;
let lineheightInputFieldTriggered = false;

const textarea = document.getElementById('applytextarea');
const fontSelector = document.querySelector('#fontsel');
const fontSizeSelector = document.querySelector('#fontsizesel');
let sizeInput = document.querySelector('#textsize_input');
let textRotationSelector = document.querySelector('#rotatetextsel');
let textRotationInput = document.querySelector('#textrotation_input');
let lineheightSelector = document.querySelector('#lineheightsel');
let lineheightInput = document.querySelector("#lineheight_input");


document.getElementById('addtext').addEventListener("click", async function() {
    resetAllModes();
    userModes[0] = true;
    for(let i = 0; i < writeLayerStack.length; i++) {
        writeLayerStack[i].onclick = async function(e) {
            await addText(e, writeLayerStack[i]);
        }
    }
}, false);

async function addText(event, writeLayer) {
    if (userModes[0]) {
        const currentUserText = Object.create(userText);
        const controlP = Object.create(controlPoint);
        const pdfLayer = await PDFDocument.create();
        const font = await pdfLayer.embedFont(StandardFonts.TimesRoman);
        const pageLayer = pdfLayer.addPage([writeLayer.width, writeLayer.height]);
        let rect = writeLayer.getBoundingClientRect();
        let mousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        let writePage = parseInt(writeLayer.getAttribute("data-write"));

        currentUserText.pdfDoc = pdfLayer;
        currentUserText.text = "dummy";
        currentUserText.x = mousePos.x / pdfState.zoom;
        currentUserText.y = writeLayer.height - mousePos.y / pdfState.zoom;
        currentUserText.size = 30;
        currentUserText.fontKey = StandardFonts.TimesRoman;
        currentUserText.font = font;
        currentUserText.lineHeight = 24;
        currentUserText.color = rgb(0, 0, 0);
        currentUserText.page = writePage;
        currentUserText.renderPage = 0;
        currentUserText.opacity = 1.0;
        currentUserText.rotation = degrees(0);
        currentUserText.setTextElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentUserText.pdfBytes = pdfLayerBytes;
        
        controlP.x = mousePos.x;
        controlP.y = mousePos.y;
        controlP.elementToControl = currentUserText;
        controlP.type = "text";
        controlP.layer = writeLayer;
        controlP.page = writePage;
        controlP.index = textControllerPointCounter;
        textControllerPointCounter++;
        controlP.setControlPoint();
        controlP.x = mousePos.x/pdfState.zoom;
        controlP.y = mousePos.y/pdfState.zoom;
        const canvasContainer = createUserLayer("text", writePage, controlP, writeLayer, pdfLayerBytes);
        controlP.editImg = canvasContainer;
        userTextList.push(controlP);
    }
}


document.getElementById('deletetext').addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[1] = true;
        let textboxes = document.querySelectorAll("div.text");
        for (let i = 0; i < textboxes.length; i++) {
            textboxes[i].onclick = function(e) {
                const deleteBox = e.currentTarget;
                let disable = checkForLockStatus(deleteBox);
                if (disable) {
                    userModes[1] = false;
                }
                if (userModes[1]) {
                    let deleteIndex = parseInt(deleteBox.getAttribute('data-index'));
                    let deletePage = parseInt(deleteBox.getAttribute("data-page"));
                    deleteText(deleteBox, deletePage, deleteIndex);
                    deleteLayerByElement(deletePage, deleteIndex, "text");
                }
            }
        }
    } 
    if (layerApplyMode) {
        deleteLayer();
    }
}, false);

function deleteText(controlP, page, boxIndex) {
    const textToDelete = userTextList[boxIndex];
    userTextList.splice(boxIndex, 1);
    const writeLayer = document.getElementsByClassName("write_layer")[page-1];
    const groupImages = writeLayer.getElementsByClassName("editimg_group")[0];
    textToDelete.editImg.parentNode.removeChild(textToDelete.editImg);
    controlP.parentNode.removeChild(controlP);
    textControllerPointCounter--;
    for (let i = boxIndex; i < userTextList.length; i++) {
        userTextList[i].index = i;
        userTextList[i].controlBox.dataset.index = i.toString();
        userTextList[i].editImg.dataset.index = i.toString();
    }

    if (groupImages.children.length === 0) {
        groupImages.parentNode.removeChild(groupImages);
        const groupControlP = writeLayer.getElementsByClassName("control_group")[0];
        groupControlP.parentNode.removeChild(groupControlP);
        layerNameCounterText = 1;
    }
}


document.getElementById('movetext').addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[2] = true;
        for(let i = 0; i < userTextList.length; i++) {
            moveText(userTextList[i]);
        }
    }
    if (layerApplyMode) {
        const boxes = document.getElementsByClassName("box");
        for(let i = 0; i < boxes.length; i++) {
            relocateLayers(boxes[i]);
        }  
    }
}, false);

function moveText(textBox) {
    clicked = false;
    short = false;
    textBox.controlBox.onclick = detectClick;
    textBox.controlBox.onmousedown = startMovingText;    
    
    function detectClick() {
        if (userModes[2]) {
            clicked = true;
            short = true;
        }
    }

    function startMovingText(e) {
        let disable = checkForLockStatus(e.currentTarget);
        if (disable) {
            userModes[2] = false;
        }
        if (userModes[2] && !clicked) {
            mouseIsDown = true;
            markSingleLayerOnEdit(textBox);
            x = e.currentTarget.offsetLeft - e.clientX;
            y = e.currentTarget.offsetTop - e.clientY;
            e.currentTarget.onmouseup = stopMovingText;
            e.currentTarget.onmousemove = movingText;
        }
    }

    function movingText(e) {
        if (userModes[2] && mouseIsDown && !clicked) {
            short = false;
            e.currentTarget.style.left = (e.clientX + x) + "px";
            e.currentTarget.style.top = (e.clientY + y) + "px"; 
            textBox.x = (e.clientX + x)/pdfState.zoom;
            textBox.y = (e.clientY + y)/pdfState.zoom;
        }
    }

    async function stopMovingText(e) {
        if (userModes[2] && !clicked && !short) {
            mouseIsDown = false;
            const pdfLayer = await PDFDocument.create();
            pdfLayer.registerFontkit(fontkit);
            const currentText = textBox.elementToControl;
            currentText.font = await pdfLayer.embedFont(currentText.fontKey);
            let pdfCanvases = document.getElementsByClassName("render_context");
            const pageLayer = pdfLayer.addPage([pdfCanvases[textBox.page-1].width, pdfCanvases[textBox.page-1].height]);
            currentText.pdfDoc = pdfLayer;
            currentText.x = textBox.x;
            currentText.y = textBox.layer.height - textBox.y;
            currentText.setTextElem();
            const pdfLayerBytes = await pdfLayer.save();
            currentText.pdfBytes = pdfLayerBytes;
            await updateUserLayer(textBox, pdfLayerBytes);
            clicked = false;
            short = false;
            e.currentTarget.onmouseup = null;
            e.currentTarget.onmousemove = null;
            e.currentTarget.onclick = null;
        }
    }
}


document.getElementById('applytext').addEventListener("click", async function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[3] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = async function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[3] = false;
                }
                if (userModes[3]) {
                    await applyText(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                await applyText(userTextList[index]);
            }
        }
    }
}, false);

async function applyText(controlP) {
    const pdfLayer = await PDFDocument.create();
    pdfLayer.registerFontkit(fontkit);
    const currentText = controlP.elementToControl;
    currentText.font = await pdfLayer.embedFont(currentText.fontKey);
    let pdfCanvases = document.getElementsByClassName("render_context");
    const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
    currentText.pdfDoc = pdfLayer;
    currentText.text = textarea.value.replace(/\n\r?/g, '\n');
    currentText.setTextElem();
    const pdfLayerBytes = await pdfLayer.save();
    currentText.pdfBytes = pdfLayerBytes;
    await updateUserLayer(controlP, pdfLayerBytes);
}


document.getElementById('applyfont').addEventListener('click', function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[4] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[4] = false;
                }
                if (userModes[4]) {
                    applyFont(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                applyFont(userTextList[index]);
            }
        }
    }
}, false);

async function applyFont(controlP) {
    const pdfLayer = await PDFDocument.create();
    const currentText = controlP.elementToControl;
    currentText.fontKey = fontSelector.value;
    currentText.font = await pdfLayer.embedFont(fontSelector.value);
    let pdfCanvases = document.getElementsByClassName("render_context");
    const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
    currentText.pdfDoc = pdfLayer;
    currentText.setTextElem();
    const pdfLayerBytes = await pdfLayer.save();
    currentText.pdfBytes = pdfLayerBytes;
    await updateUserLayer(controlP, pdfLayerBytes);
}


document.getElementById("inputfont").addEventListener("change", function(e) {
    resetAllModes();
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.addEventListener(
        "load",
        () => { 
            let fontAsBytes = reader.result;
            fontBytes.push(fontAsBytes);
        },
        false,
    );

    if (file) {
        reader.readAsArrayBuffer(file);
    }
    
    const currentFilename = file.name;
    createFileListEntry(false, currentFilename, fontBytes.length, 'filelisting_font', document.getElementById("listpoint_font_con"));
}, false);

document.getElementById("clearlist_text").addEventListener("click", function(e) {
    clearFileList(document.getElementById("listpoint_font_con"));
    fontBytes = [];
}, false);

document.getElementById("applycustomfont").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[5] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[5] = false;
                }
                if (userModes[5]) {
                    applyCustomFont(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                applyCustomFont(userTextList[index]);
            }
        }
    }
}, false);

async function applyCustomFont(controlP) {
    const listedFonts = document.getElementsByClassName("filelisting_font");
    let checkedIndex;
    if (listedFonts.length > 0) {
        for (let i = 0; i < listedFonts.length; i++) {
            if (listedFonts[i].checked) {
                checkedIndex = i;
            }
        }
        const pdfLayer = await PDFDocument.create();
        pdfLayer.registerFontkit(fontkit);
        const currentText = controlP.elementToControl;
        currentText.fontKey = fontBytes[checkedIndex];
        currentText.font = await pdfLayer.embedFont(fontBytes[checkedIndex]);
        let pdfCanvases = document.getElementsByClassName("render_context");
        const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
        currentText.pdfDoc = pdfLayer;
        currentText.setTextElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentText.pdfBytes = pdfLayerBytes;
        await updateUserLayer(controlP, pdfLayerBytes);
    }
}


fontSizeSelector.addEventListener('change', function() {
    fontSizeSelectorTriggered = true;
    fontSizeInputFieldTriggered = false;
}, false);

sizeInput.addEventListener('change', function() {
    fontSizeInputFieldTriggered = true;
    fontSizeSelectorTriggered = false;
}, false);

document.getElementById('applysize').addEventListener('click', function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[6] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[6] = false;
                }
                if (userModes[6]) {
                    applyFontSize(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                applyFontSize(userTextList[index]);
            }
        }
    }
}, false);

async function applyFontSize(controlP) {
    let triggerFontSize = false;
    let fontSizeValueToSet;
    if (fontSizeSelectorTriggered) {
        fontSizeValueToSet = parseInt(fontSizeSelector.value); 
        triggerFontSize = true;
    } else if (fontSizeInputFieldTriggered) {
        fontSizeValueToSet = sizeInput.value;
        while (fontSizeValueToSet.search(" ") > -1) {
            fontSizeValueToSet = fontSizeValueToSet.replace(" ", "");
        }
        if (!isNaN(fontSizeValueToSet)) {
            fontSizeValueToSet = Number(fontSizeValueToSet);
            if (Number.isInteger(fontSizeValueToSet)) {
                triggerFontSize = true;
            } else {
                triggerFontSize = false;
            }
        } else {
            triggerFontSize = false;
        }
    } else {
        fontSizeValueToSet = sizeInput.value;
        while (fontSizeValueToSet.search(" ") > -1) {
            fontSizeValueToSet = fontSizeValueToSet.replace(" ", "");
        }
        if (!isNaN(fontSizeValueToSet)) {
            fontSizeValueToSet = Number(fontSizeValueToSet);
            if (Number.isInteger(fontSizeValueToSet)) {
                triggerFontSize = true;
            } else {
                triggerFontSize = false;
            }
        } else {
            triggerFontSize = false;
        }
    }
    if (triggerFontSize && fontSizeValueToSet >= 3 && fontSizeValueToSet <= 400) {
        const pdfLayer = await PDFDocument.create();
        pdfLayer.registerFontkit(fontkit);
        const currentText = controlP.elementToControl;
        currentText.font = await pdfLayer.embedFont(currentText.fontKey);
        let pdfCanvases = document.getElementsByClassName("render_context");
        const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
        currentText.pdfDoc = pdfLayer;
        currentText.size = fontSizeValueToSet;
        currentText.setTextElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentText.pdfBytes = pdfLayerBytes;
        await updateUserLayer(controlP, pdfLayerBytes);
    }
}


colorPickerFont.on('change', function(color) {
    userFontColor = rgb(color.r/255, color.g/255, color.b/255);
    userFontOpacity = color.a;
}, false);

document.getElementById('applyfontcolor').addEventListener('click', function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[7] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[7] = false;
                }
                if (userModes[7]) {
                    applyFontColor(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                applyFontColor(userTextList[index]);
            }
        }
    }
}, false);

async function applyFontColor(controlP) {
    const pdfLayer = await PDFDocument.create();
    pdfLayer.registerFontkit(fontkit);
    const currentText = controlP.elementToControl;
    currentText.font = await pdfLayer.embedFont(currentText.fontKey);
    let pdfCanvases = document.getElementsByClassName("render_context");
    const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
    currentText.pdfDoc = pdfLayer;
    currentText.color = userFontColor;
    currentText.opacity = userFontOpacity;
    currentText.setTextElem();
    const pdfLayerBytes = await pdfLayer.save();
    currentText.pdfBytes = pdfLayerBytes;
    await updateUserLayer(controlP, pdfLayerBytes);
}


textRotationSelector.addEventListener('change', function() {
    rotateTextSelectorTriggered = true;
    rotateTextInputFieldTriggered = false;
}, false);

textRotationInput.addEventListener('change', function() {
    rotateTextSelectorTriggered = false;
    rotateTextInputFieldTriggered = true;
}, false);

document.getElementById('applytextrotation').addEventListener('click', async function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[8] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = async function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[8] = false;
                }
                if (userModes[8]) {
                    await applyTextRotation(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                await applyTextRotation(userTextList[index]);
            }
        }
    }
}, false);

async function applyTextRotation(controlP) {
    let triggerTextRotation = false;
    let rotationValueToSet;
    if (rotateTextSelectorTriggered) {
        rotationValueToSet = parseInt(textRotationSelector.value); 
        triggerTextRotation = true;
    } else if (rotateTextInputFieldTriggered) {
        rotationValueToSet = textRotationInput.value;
        while (rotationValueToSet.search(" ") > -1) {
            rotationValueToSet = rotationValueToSet.replace(" ", "");
        }
        if (!isNaN(rotationValueToSet)) {
            rotationValueToSet = parseInt(rotationValueToSet);
            if (rotationValueToSet === 360 || rotationValueToSet === -360) {
                rotationValueToSet = 0;
            }
            triggerTextRotation = true;
        } else {
            triggerTextRotation = false;
        }
    } else {
        rotationValueToSet = textRotationInput.value;
        while (rotationValueToSet.search(" ") > -1) {
            rotationValueToSet = rotationValueToSet.replace(" ", "");
        }
        if (!isNaN(rotationValueToSet)) {
            rotationValueToSet = parseInt(rotationValueToSet);
            if (rotationValueToSet === 360 || rotationValueToSet === -360) {
                rotationValueToSet = 0;
            }
            triggerTextRotation = true;
        } else {
            triggerTextRotation = false;
        }
    }
    if (triggerTextRotation && rotationValueToSet >= -359 && rotationValueToSet <= 359) {
        const pdfLayer = await PDFDocument.create();
        pdfLayer.registerFontkit(fontkit);
        const currentText = controlP.elementToControl;
        currentText.font = await pdfLayer.embedFont(currentText.fontKey);
        let pdfCanvases = document.getElementsByClassName("render_context");
        const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
        currentText.pdfDoc = pdfLayer;
        currentText.rotation = degrees(rotationValueToSet);
        currentText.setTextElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentText.pdfBytes = pdfLayerBytes;
        await updateUserLayer(controlP, pdfLayerBytes);
    }
}


lineheightSelector.addEventListener('change', function() {
    lineheightSelectorTriggered = true;
    lineheightInputFieldTriggered = false;
}, false);

lineheightInput.addEventListener('change', function() {
    lineheightSelectorTriggered = false;
    lineheightInputFieldTriggered = true;
}, false);

document.getElementById('applylineheight').addEventListener('click', function() {
    resetAllModes();
    if (boxApplyMode) {
        userModes[9] = true;
        for (let i = 0; i < userTextList.length; i++) {
            userTextList[i].controlBox.onclick = function(e) {
                let disable = checkForLockStatus(userTextList[i].controlBox);
                if (disable) {
                    userModes[9] = false;
                }
                if (userModes[9]) {
                    applyLineHeight(userTextList[i]);
                    markSingleLayerOnEdit(userTextList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "text") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                applyLineHeight(userTextList[index]);
            }
        }
    }
}, false);

async function applyLineHeight(controlP) {
    let triggerLineHeight = false;
    let lineheightValueToSet;
    if (lineheightSelectorTriggered) {
        lineheightValueToSet = parseInt(lineheightSelector.value); 
        triggerLineHeight = true;
    } else if (lineheightInputFieldTriggered) {
        lineheightValueToSet = lineheightInput.value;
        while (lineheightValueToSet.search(" ") > -1) {
            lineheightValueToSet = lineheightValueToSet.replace(" ", "");
        }
        if (!isNaN(lineheightValueToSet)) {
            lineheightValueToSet = Number(lineheightValueToSet);
            if (Number.isInteger(lineheightValueToSet)) {
                triggerLineHeight = true;
            } else {
                triggerLineHeight = false;
            }
        } else {
            triggerLineHeight = false;
        }
    } else {
        lineheightValueToSet = lineheightInput.value;
        while (lineheightValueToSet.search(" ") > -1) {
            lineheightValueToSet = lineheightValueToSet.replace(" ", "");
        }
        if (!isNaN(lineheightValueToSet)) {
            lineheightValueToSet = Number(lineheightValueToSet);
            if (Number.isInteger(lineheightValueToSet)) {
                triggerLineHeight = true;
            } else {
                triggerLineHeight = false;
            }
        } else {
            triggerLineHeight = false;
        }
    }
    if (triggerLineHeight && lineheightValueToSet >= 1 && lineheightValueToSet <= 200) {
        const pdfLayer = await PDFDocument.create();
        pdfLayer.registerFontkit(fontkit);
        const currentText = controlP.elementToControl;
        currentText.font = await pdfLayer.embedFont(currentText.fontKey);
        let pdfCanvases = document.getElementsByClassName("render_context");
        const pageLayer = pdfLayer.addPage([pdfCanvases[controlP.page-1].width, pdfCanvases[controlP.page-1].height]);
        currentText.pdfDoc = pdfLayer;
        currentText.lineHeight = lineheightValueToSet;
        currentText.setTextElem();
        const pdfLayerBytes = await pdfLayer.save();
        currentText.pdfBytes = pdfLayerBytes;
        await updateUserLayer(controlP, pdfLayerBytes);
    }
}


document.getElementById("cleartext").addEventListener('click', function() {
    resetAllModes();
    for (let i = userTextList.length-1; i >= 0; i--) {
        let disable = checkForLockStatus(userTextList[i].controlBox);
        if (!disable) {
            let deleteIndex = parseInt(userTextList[i].controlBox.getAttribute('data-index'));
            let deletePage = parseInt(userTextList[i].controlBox.getAttribute("data-page"));
            deleteText(userTextList[i].controlBox, deletePage, deleteIndex);
            deleteLayerByElement(deletePage, deleteIndex, "text");
        }
    }
}, false);