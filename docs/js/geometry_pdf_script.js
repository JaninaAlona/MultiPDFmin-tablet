let shape = {
    context: null,
    type: "",
    x: 0,
    y: 0,
    xp2: 50,
    yp2: 50,
    width: 100,
    height: 100,
    stroke: 'rgba(0,0,0,1.0)',
    strokeWidth: 3,
    fill: '',
    useFill: false,
    useStroke: false,
    rotation: 0,
    page: 1,
    drawShape() {
        if(this.type === "rectangle") {
            let rectCenterX = this.x + this.width / 2;
            let rectCenterY = this.y + this.height / 2;
            this.context.save();
            this.context.beginPath();
            this.context.translate(rectCenterX, rectCenterY);
            this.context.rotate(this.rotation * Math.PI / 180);
            this.context.translate(-rectCenterX, -rectCenterY);
            if (this.useFill) 
                this.context.fillStyle = this.fill;
            if (this.useStroke) {
                this.context.strokeStyle = this.stroke;
                this.context.lineWidth   = this.strokeWidth;
            }
            if (this.useFill) {
                this.context.fillRect(this.x, this.y, this.width, this.height);
            }
            if (this.useStroke) {
                this.context.strokeRect(this.x, this.y, this.width, this.height);
            }
            this.context.restore();
        } else if (this.type === "triangle") {
            let triCenterX = this.x + this.width / 2;
            let triCenterY = this.y + this.height / 2;
            this.context.save();
            this.context.beginPath();
            this.context.translate(triCenterX, triCenterY);
            this.context.rotate(this.rotation * Math.PI / 180);
            this.context.translate(-triCenterX, -triCenterY);
            this.context.moveTo(this.x, this.y);
            this.context.lineTo(this.x, this.y + this.height);
            this.context.lineTo(this.x + this.xp2 + this.width, this.y + this.yp2);
            this.context.closePath();

            if (this.useFill) 
                this.context.fillStyle = this.fill;

            if (this.useStroke) {
                this.context.strokeStyle = this.stroke;
                this.context.lineWidth   = this.strokeWidth;
            }
            
            if (this.useFill) 
                this.context.fill();
            
            if (this.useStroke)    
                this.context.stroke();
            
            this.context.restore();
        } else if (this.type === "circle") {
            this.context.beginPath();
            this.context.ellipse(this.x, this.y, this.width / 2, this.height / 2, this.rotation * Math.PI / 180, 0, 2 * Math.PI);
            
            if (this.useFill) {
                this.context.fillStyle = this.fill;
            }
            if (this.useStroke) {
                this.context.strokeStyle = this.stroke;
                this.context.lineWidth   = this.strokeWidth;
            }   
            this.context.closePath();
            if (this.useFill) {
                this.context.fill();
            }
            if (this.useStroke)    
                this.context.stroke();
        }
    }
}

let shapeControllerPoint = {
    controlBox: null,
    editImg: null,
    elementToControl: null,
    layer: null,
    page: 1, 
    x: 0,
    y: 0,
    index: 0, 
    rotation: 0,
    originX: 0,
    originY: 0,
    setControlPoint() {
        let div = document.createElement("div");
        div.style.position = "absolute";
        div.style.left = this.x + "px";
        div.style.top = this.y + "px";
        div.setAttribute('data-page', this.layer.getAttribute("data-write"));
        div.setAttribute('data-index', this.index);
        div.classList.add("shape");
        div.classList.add("box");
        this.controlBox = div;
    },
    rotateControlPoint() {
        this.controlBox.style.marginLeft = this.originX + "px";
        this.controlBox.style.marginTop = this.originY + "px";
        this.controlBox.style.transform = "rotate(" + this.rotation + "deg)";
    }
}

const colorPickerStroke = new Alwan('#colorpicker_stroke', {
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

const colorPickerFill = new Alwan('#colorpicker_fill', {
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

let shapeControllerPointCounter = 0;
let userStrokeColor = 'rgba(0,0,0,1.0)';
let userFillColor = 'rgba(0,0,0,1.0)';
let rotateShapeSelectorTriggered = false;
let rotateShapeInputFieldTriggered = false;
const scaleInputFieldWidth = document.getElementById("scale_width");
const scaleInputFieldHeight = document.getElementById("scale_height");
const strokeCheckbox = document.getElementById("stroke");
const sliderStokeWidth = document.querySelector("#strokewidth");
const outputStrokeWidth = document.querySelector("#strokewidth_output");
const fillCheckbox = document.getElementById("fill");
const shapeRotationSelector = document.querySelector('#rotateshapesel');
const shapeRotationInput = document.querySelector('#shaperotation_input');
const scaleGeoSlider = document.getElementById("scale_func_geo");
const scaleGeoOutput = document.getElementById("scale_func_output_geo");


document.getElementById('addRect').addEventListener("click", function(e) {
    resetAllModes();
    userModesGeometry[0] = true;
    addShape(e, "rectangle");      
}, false);

function addShape(event, shapeType) {
    for(let i = 0; i < writeLayerStack.length; i++) {
        writeLayerStack[i].onclick = function(e) {
            addingShape(e, writeLayerStack[i], shapeType);
        }
    }
}

function createShapeLayer(writeLayer) {
    let shapeCanvas;
    let needNewLayer = true;
    let canvases = writeLayer.getElementsByTagName('canvas');
    for (let i = 0; i < canvases.length; i++) {
        if (canvases[i].hasAttribute("data-shape")) {
            needNewLayer = false;
            shapeCanvas = canvases[i];
        }
    }
    if (needNewLayer) {
        shapeCanvas = initShapeLayer(writeLayer, null);
    }
    return shapeCanvas;
}

function addingShape(event, writeLayer, shapeType) {
    if (userModesGeometry[0] || userModesGeometry[1] || userModesGeometry[2]) {
        const currentShape = Object.create(shape);
        const shapeControllerP = Object.create(shapeControllerPoint);
        let page = parseInt(writeLayer.getAttribute("data-write"));
        currentShape.type = shapeType;
        if (shapeType === "triangle") {
            currentShape.xp2 = 50;
            currentShape.yp2 = 50;
        }
        currentShape.width = 100;
        currentShape.height = 100;
        currentShape.strokeWidth = 3;
        currentShape.stroke = 'rgba(0,0,0,1.0)';
        currentShape.fill = '';
        currentShape.useFill = false;
        currentShape.useStroke = true;
        currentShape.rotation = 0;
        currentShape.page = page;
    
        shapeControllerP.elementToControl = currentShape;
        shapeControllerP.layer = writeLayer;
        shapeControllerP.page = page;
        shapeControllerP.index = shapeControllerPointCounter;
        shapeControllerP.rotation = 0;
        geometryPointsList.push(shapeControllerP);
        shapeControllerPointCounter++;
        createUserShapeLayer(event, "shape", page, shapeControllerP, writeLayer);
        zoomGeometry(shapeControllerP);
    }
}

function createUserShapeLayer(event, editImgClass, thisPage, controlP, writeLayer) {
    let controlGroupDiv;
    if (writeLayer.querySelectorAll("div.control_group").length == 0) {
        controlGroupDiv = document.createElement("div");
        controlGroupDiv.style.position = "absolute";
        controlGroupDiv.style.top = 0;
        controlGroupDiv.setAttribute('data-page', thisPage);
        controlGroupDiv.classList.add("control_group");
        writeLayer.appendChild(controlGroupDiv);
    }
    let pdfCanvases = document.getElementsByClassName("render_context");
    const canvasContainer = document.createElement("canvas");
    canvasContainer.style.display = "flex";
    canvasContainer.style.position = "absolute";
    canvasContainer.style.top = 0;
    canvasContainer.width = pdfCanvases[thisPage-1].width;
    canvasContainer.height = pdfCanvases[thisPage-1].height;
    canvasContainer.setAttribute('data-page', thisPage);
    canvasContainer.setAttribute('data-index', controlP.index);
    canvasContainer.classList.add("editimg");
    canvasContainer.classList.add(editImgClass);
    controlP.editImg = canvasContainer;

    let editimgGroupDiv;
    if (writeLayer.querySelectorAll("div.editimg_group").length == 0) {
        editimgGroupDiv = document.createElement("div");
        editimgGroupDiv.style.position = "absolute";
        editimgGroupDiv.style.top = 0;
        editimgGroupDiv.setAttribute('data-page', thisPage);
        editimgGroupDiv.classList.add("editimg_group");
        writeLayer.insertBefore(editimgGroupDiv, writeLayer.children[1]);
    }
    writeLayer.querySelectorAll("div.editimg_group")[0].appendChild(canvasContainer);
    let rect = canvasContainer.getBoundingClientRect();
    let mousePos = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    
    const ctx = canvasContainer.getContext("2d");
    const currentShape = controlP.elementToControl;
    currentShape.context = ctx;
    if (currentShape.type === "rectangle" || currentShape.type === "triangle") {
        currentShape.x = (mousePos.x - (currentShape.width * pdfState.zoom)/2 + 20) / pdfState.zoom;
        currentShape.y = (mousePos.y - (currentShape.height * pdfState.zoom)/2 + 20) / pdfState.zoom;
    } else if (currentShape.type === "circle") {
        currentShape.x = (mousePos.x + 20)/pdfState.zoom;
        currentShape.y = (mousePos.y + 20)/pdfState.zoom;
    }
    controlP.x = mousePos.x;
    controlP.y = mousePos.y;
    controlP.setControlPoint();
    controlP.x = mousePos.x/pdfState.zoom;
    controlP.y = mousePos.y/pdfState.zoom;
    writeLayer.querySelectorAll("div.control_group")[0].appendChild(controlP.controlBox);
    createStackLayer(thisPage, editImgClass, controlP.index);
}

document.getElementById('addTriangle').addEventListener("click", function(e) {
    resetAllModes();
    userModesGeometry[1] = true;
    addShape(e, "triangle");    
}, false);


document.getElementById('addCircle').addEventListener("click", function(e) {
    resetAllModes();
    userModesGeometry[2] = true;
    addShape(e, "circle");    
}, false);


document.getElementById('deleteshape').addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[3] = true;
        let shapeBoxes = document.querySelectorAll("div.shape");
        for(let i = 0; i < shapeBoxes.length; i++) {
            shapeBoxes[i].onclick = function(e) {
                const deleteBox = e.currentTarget;
                let disable = checkForLockStatus(deleteBox);
                if (disable) {
                    userModesGeometry[3] = false;
                }
                if (userModesGeometry[3]) {
                    let deleteIndex = parseInt(deleteBox.getAttribute('data-index'));
                    let deletePage = parseInt(deleteBox.getAttribute("data-page"));
                    deleteShape(deleteBox, deletePage, deleteIndex);
                    deleteLayerByElement(deletePage, deleteIndex, "shape");
                }
            }
        }
    }
    if (layerApplyMode) {
        deleteLayer();
    }
}, false);

function deleteShape(controlP, page, boxIndex) {
    const shapeToDelete = geometryPointsList[boxIndex];
    geometryPointsList.splice(boxIndex, 1);
    const writeLayer = document.getElementsByClassName("write_layer")[page-1];
    const groupImages = writeLayer.getElementsByClassName("editimg_group")[0];
    shapeToDelete.editImg.parentNode.removeChild(shapeToDelete.editImg);
    controlP.parentNode.removeChild(controlP);
    shapeControllerPointCounter--;
    for (let i = boxIndex; i < geometryPointsList.length; i++) {
        geometryPointsList[i].index = i;
        geometryPointsList[i].controlBox.dataset.index = i.toString();
        geometryPointsList[i].editImg.dataset.index = i.toString();
    }

    if (groupImages.children.length === 0) {
        groupImages.parentNode.removeChild(groupImages);
        const groupControlP = writeLayer.getElementsByClassName("control_group")[0];
        groupControlP.parentNode.removeChild(groupControlP);
        layerNameCounterShape = 1;
    }
}


document.getElementById('moveshape').addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[4] = true;
        for(let i = 0; i < geometryPointsList.length; i++) {
            moveShape(geometryPointsList[i]);
        }
    }
    if (layerApplyMode) {
        const boxes = document.getElementsByClassName("box");
        for(let i = 0; i < boxes.length; i++) {
            relocateLayers(boxes[i]);
        }  
    } 
}, false);

function moveShape(shapeBox) {
    let rotateOnce = true;
    if (userModesGeometry[4]) {
        clicked = false;
        short = false;
        shapeBox.controlBox.onclick = detectClick;
        shapeBox.controlBox.onmousedown = startMovingShape;
    }

    function detectClick() {
        if (userModesGeometry[4]) {
            clicked = true;
            short = true;
        }
    }

    function startMovingShape(e) {
        let disable = checkForLockStatus(e.currentTarget);
        if (disable) {
            userModesGeometry[4] = false;
        }
        if (userModesGeometry[4] && !clicked) {
            mouseIsDown = true;
            markSingleLayerOnEdit(shapeBox);
            x = shapeBox.controlBox.offsetLeft - e.clientX;
            y = shapeBox.controlBox.offsetTop - e.clientY;
            shapeBox.controlBox.onmouseup = stopMovingShape;
            shapeBox.controlBox.onmousemove = movingShape;
        }
    }

    function movingShape(e) {
        if (userModesGeometry[4] && mouseIsDown && !clicked) {
            if (rotateOnce) {
                rotateOnce = false;
                shapeBox.originX = 0;
                shapeBox.originY = 0;
                shapeBox.rotateControlPoint();
            }       
            shapeBox.controlBox.style.left = (e.clientX + x) + "px";
            shapeBox.controlBox.style.top = (e.clientY + y) + "px"; 
            shapeBox.x = e.clientX + x;
            shapeBox.y = e.clientY + y;
        }
    }

    function stopMovingShape(e){
        if (userModesGeometry[4] && !clicked && !short) {
            mouseIsDown = false;
            const currentShape = shapeBox.elementToControl;
            if (currentShape.type === "rectangle" || currentShape.type === "triangle") {
                currentShape.x = (shapeBox.x - (currentShape.width * pdfState.zoom)/2 + 20) / pdfState.zoom;
                currentShape.y = (shapeBox.y - (currentShape.height * pdfState.zoom)/2 + 20) / pdfState.zoom;
            } else if (currentShape.type === "circle") {
                currentShape.x = (shapeBox.x + 20)/pdfState.zoom;
                currentShape.y = (shapeBox.y + 20)/pdfState.zoom;
            }
            updateUserShapeLayer(shapeBox);
            shapeBox.controlBox.onmouseup = null;
            shapeBox.controlBox.onmousemove = null;
            shapeBox.controlBox.onclick = null;
        }
    }
}

function updateUserShapeLayer(controlP) {
    const ctx = controlP.editImg.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const currentShape = controlP.elementToControl;
    currentShape.context = ctx;
    currentShape.drawShape();
}


document.getElementById("scaleShape").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[5] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[5] = false;
                }
                if (userModesGeometry[5]) {
                    let triggerWidth = false;
                    let triggerHeight = false;
                    let widthValueToSet;
                    let heightValueToSet;
                    widthValueToSet = scaleInputFieldWidth.value;
                    while (widthValueToSet.search(" ") > -1) {
                        widthValueToSet = widthValueToSet.replace(" ", "");
                    }
                    if (!isNaN(widthValueToSet)) {
                        widthValueToSet = parseInt(widthValueToSet);
                        triggerWidth = true;
                    } else {
                        triggerWidth = false;
                    }
                    heightValueToSet = scaleInputFieldHeight.value;
                    while (heightValueToSet.search(" ") > -1) {
                        heightValueToSet = heightValueToSet.replace(" ", "");
                    }
                    if (!isNaN(heightValueToSet)) {
                        heightValueToSet = parseInt(heightValueToSet);
                        triggerHeight = true;
                    } else {
                        triggerHeight = false;
                    }
                    if (triggerWidth && widthValueToSet >= 1 && widthValueToSet <= 3000 && triggerHeight && heightValueToSet >= 1 && heightValueToSet <= 3000) {
                        scalingShape(geometryPointsList[i], widthValueToSet, heightValueToSet);
                        markSingleLayerOnEdit(geometryPointsList[i]);
                    }
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                let triggerWidth = false;
                let triggerHeight = false;
                let widthValueToSet;
                let heightValueToSet;
                widthValueToSet = scaleInputFieldWidth.value;
                while (widthValueToSet.search(" ") > -1) {
                    widthValueToSet = widthValueToSet.replace(" ", "");
                }
                if (!isNaN(widthValueToSet)) {
                    widthValueToSet = parseInt(widthValueToSet);
                    triggerWidth = true;
                } else {
                    triggerWidth = false;
                }
                heightValueToSet = scaleInputFieldHeight.value;
                while (heightValueToSet.search(" ") > -1) {
                    heightValueToSet = heightValueToSet.replace(" ", "");
                }
                if (!isNaN(heightValueToSet)) {
                    heightValueToSet = parseInt(heightValueToSet);
                    triggerHeight = true;
                } else {
                    triggerHeight = false;
                }
                if (triggerWidth && widthValueToSet >= 1 && widthValueToSet <= 3000 && triggerHeight && heightValueToSet >= 1 && heightValueToSet <= 3000) {
                    scalingShape(geometryPointsList[index], widthValueToSet, heightValueToSet);
                }
            }
        }
    }
}, false);

function scalingShape(controlP, scaleW, scaleH) { 
    const currentShape = controlP.elementToControl;
    let previousWidth = currentShape.width;
    let previousHeight = currentShape.height;
    const widthChangeFactor = (scaleW * pdfState.zoom) / previousWidth;
    const heightChangeFactor = (scaleH * pdfState.zoom) / previousHeight;
    currentShape.width = scaleW * pdfState.zoom;
    currentShape.height = scaleH * pdfState.zoom;
    if (currentShape.type === "triangle") {
        currentShape.xp2 = currentShape.xp2 * widthChangeFactor;
        currentShape.yp2 = currentShape.yp2 * heightChangeFactor;
    }
    if (currentShape.type === "rectangle" || currentShape.type === "triangle") {
        currentShape.x = (controlP.x - currentShape.width/2 + 20/pdfState.zoom);
        currentShape.y = (controlP.y - currentShape.height/2 + 20/pdfState.zoom);
    } else if (currentShape.type === "circle") {
        currentShape.x = (controlP.x + 20/pdfState.zoom);
        currentShape.y = (controlP.y + 20/pdfState.zoom);
    }
    updateUserShapeLayer(controlP);
}


colorPickerStroke.on('change', function(color) {
    let red = color.r;
    let green = color.g;
    let blue = color.b;
    let alpha = color.a;
    userStrokeColor = 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
}, false);

strokeCheckbox.addEventListener("input", function() {
    if (!strokeCheckbox.checked) {
        fillCheckbox.checked = true;
    }
}, false);

document.getElementById("applystrokecolor").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[6] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[6] = false;
                }
                if (userModesGeometry[6]) {
                    setStrokeColor(geometryPointsList[i]);
                    markSingleLayerOnEdit(geometryPointsList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                setStrokeColor(geometryPointsList[index]);
            }
        }
    }
}, false);

function setStrokeColor(controlP) {
    if(strokeCheckbox.checked) {
        const currentShape = controlP.elementToControl;
        currentShape.stroke = userStrokeColor;
        currentShape.useStroke = true;
        updateUserShapeLayer(controlP);      
    }
}


sliderStokeWidth.addEventListener("input", function () {
    outputStrokeWidth.value = this.value;
}, false);

document.getElementById("applystrokewidth").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[7] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[7] = false;
                }
                if (userModesGeometry[7]) {
                    setStrokeWidth(geometryPointsList[i]);
                    markSingleLayerOnEdit(geometryPointsList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                setStrokeWidth(geometryPointsList[index]);
            }
        }
    }
}, false);

function setStrokeWidth(controlP) {
    const currentShape = controlP.elementToControl;
    currentShape.strokeWidth = sliderStokeWidth.valueAsNumber;
    currentShape.useStroke = true;
    if (!fillCheckbox.checked) {
        currentShape.useFill = false;
    }
    updateUserShapeLayer(controlP);      
}


colorPickerFill.on('change', function(color) {
    let red = color.r;
    let green = color.g;
    let blue = color.b;
    let alpha = color.a;
    userFillColor = 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
}, false);

fillCheckbox.addEventListener("input", function() {
    if (!fillCheckbox.checked) {
        strokeCheckbox.checked = true;
    }
}, false);

document.getElementById("applyfillcolor").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[8] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[8] = false;
                }
                if (userModesGeometry[8]) {
                    setFillColor(geometryPointsList[i]);
                    markSingleLayerOnEdit(geometryPointsList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                setFillColor(geometryPointsList[index]);
            }
        }
    }
}, false);

function setFillColor(controlP) {
    if(fillCheckbox.checked) {
        const currentShape = controlP.elementToControl;
        currentShape.fill = userFillColor;
        currentShape.useFill = true;
        if (!strokeCheckbox.checked) {
            currentShape.useStroke = false;
        }
        updateUserShapeLayer(controlP);              
    }
}


shapeRotationSelector.addEventListener('change', function() {
    rotateShapeSelectorTriggered = true;
    rotateShapeInputFieldTriggered = false;
}, false);

shapeRotationInput.addEventListener('input', function() {
    rotateShapeSelectorTriggered = false;
    rotateShapeInputFieldTriggered = true;
}, false);

document.getElementById("applyshaperotation").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[9] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[9] = false;
                }
                if (userModesGeometry[9]) {
                    let triggerRotation = false;
                    let rotationValueToSet;
                    if (rotateShapeSelectorTriggered) {
                        rotationValueToSet = parseInt(shapeRotationSelector.value); 
                        triggerRotation = true;
                    } else if (rotateShapeInputFieldTriggered) {
                        rotationValueToSet = shapeRotationInput.value;
                        while (rotationValueToSet.search(" ") > -1) {
                            rotationValueToSet = rotationValueToSet.replace(" ", "");
                        }
                        if (!isNaN(rotationValueToSet)) {
                            rotationValueToSet = parseInt(rotationValueToSet);
                            if (rotationValueToSet === 360 || rotationValueToSet === -360) {
                                rotationValueToSet = 0;
                            }
                            triggerRotation = true;
                        } else {
                            triggerRotation = false;
                        }
                    } else {
                        rotationValueToSet = shapeRotationInput.value;
                        while (rotationValueToSet.search(" ") > -1) {
                            rotationValueToSet = rotationValueToSet.replace(" ", "");
                        }
                        if (!isNaN(rotationValueToSet)) {
                            rotationValueToSet = parseInt(rotationValueToSet);
                            if (rotationValueToSet === 360 || rotationValueToSet === -360) {
                                rotationValueToSet = 0;
                            }
                            triggerRotation = true;
                        } else {
                            triggerRotation = false;
                        }
                    }
                    if (triggerRotation && rotationValueToSet >= -359 && rotationValueToSet <= 359) {
                        setRotation(geometryPointsList[i], rotationValueToSet);
                        markSingleLayerOnEdit(geometryPointsList[i]);
                    }
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                let triggerRotation = false;
                let rotationValueToSet;
                if (rotateShapeSelectorTriggered) {
                    rotationValueToSet = parseInt(shapeRotationSelector.value); 
                    triggerRotation = true;
                } else if (rotateShapeInputFieldTriggered) {
                    rotationValueToSet = shapeRotationInput.value;
                    while (rotationValueToSet.search(" ") > -1) {
                        rotationValueToSet = rotationValueToSet.replace(" ", "");
                    }
                    if (!isNaN(rotationValueToSet)) {
                        rotationValueToSet = parseInt(rotationValueToSet);
                        if (rotationValueToSet === 360 || rotationValueToSet === -360) {
                            rotationValueToSet = 0;
                        }
                        triggerRotation = true;
                    } else {
                        triggerRotation = false;
                    }
                } else {
                    rotationValueToSet = shapeRotationInput.value;
                    while (rotationValueToSet.search(" ") > -1) {
                        rotationValueToSet = rotationValueToSet.replace(" ", "");
                    }
                    if (!isNaN(rotationValueToSet)) {
                        rotationValueToSet = parseInt(rotationValueToSet);
                        if (rotationValueToSet === 360 || rotationValueToSet === -360) {
                            rotationValueToSet = 0;
                        }
                        triggerRotation = true;
                    } else {
                        triggerRotation = false;
                    }
                }
                if (triggerRotation && rotationValueToSet >= -359 && rotationValueToSet <= 359) {
                    setRotation(geometryPointsList[index], rotationValueToSet);
                }
            }
        }
    }
}, false);

function setRotation(controlP, rotationAngle) {
    const currentShape = controlP.elementToControl;
    currentShape.rotation = rotationAngle;
    controlP.rotation = rotationAngle;
    controlP.originX = 0;
    controlP.originY = 0;
    controlP.rotateControlPoint();
    updateUserShapeLayer(controlP);              
}


scaleGeoSlider.addEventListener("input", function() {
    scaleGeoOutput.value = this.value;
}, false);

document.getElementById('applyscalegeo').addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[10] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[10] = false;
                }
                if (userModesGeometry[10]) {
                    const currentShape = geometryPointsList[i].elementToControl;
                    const scaleW = currentShape.width * scaleGeoSlider.valueAsNumber;
                    const scaleH = currentShape.height * scaleGeoSlider.valueAsNumber;
                    scalingShape(geometryPointsList[i], scaleW, scaleH);
                    markSingleLayerOnEdit(geometryPointsList[i]);
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                const currentShape = geometryPointsList[index].elementToControl;
                const scaleW = currentShape.width * scaleGeoSlider.valueAsNumber;
                const scaleH = currentShape.height * scaleGeoSlider.valueAsNumber;
                scalingShape(geometryPointsList[index], scaleW, scaleH);
            }
        }
    }
}, false);


const triPointX = document.getElementById("xp2");
const triPointY = document.getElementById("yp2");
document.getElementById("tripoint").addEventListener("click", function() {
    resetAllModes();
    if (boxApplyMode) {
        userModesGeometry[11] = true;
        for (let i = 0; i < geometryPointsList.length; i++) {
            geometryPointsList[i].controlBox.onclick = function() {
                let disable = checkForLockStatus(geometryPointsList[i].controlBox);
                if (disable) {
                    userModesGeometry[11] = false;
                }
                if (userModesGeometry[11]) {
                    let triggerPX = false;
                    let triggerPY = false;
                    let pXValueToSet;
                    let pYValueToSet;
                    pXValueToSet = triPointX.value;
                    while (pXValueToSet.search(" ") > -1) {
                        pXValueToSet = pXValueToSet.replace(" ", "");
                    }
                    if (!isNaN(pXValueToSet)) {
                        pXValueToSet = parseInt(pXValueToSet);
                        triggerPX = true;
                    } else {
                        triggerPX = false;
                    }
                    pYValueToSet = triPointY.value;
                    while (pYValueToSet.search(" ") > -1) {
                        pYValueToSet = pYValueToSet.replace(" ", "");
                    }
                    if (!isNaN(pYValueToSet)) {
                        pYValueToSet = parseInt(pYValueToSet);
                        triggerPY = true;
                    } else {
                        triggerPY = false;
                    }
                    if (triggerPX && pXValueToSet >= 1 && pXValueToSet <= 3000 && triggerPY && pYValueToSet >= 1 && pYValueToSet <= 3000) {
                        setTrianglePoint(geometryPointsList[i], pXValueToSet, pYValueToSet);
                        markSingleLayerOnEdit(geometryPointsList[i]);
                    }
                }
            }
        }
    } 
    if (layerApplyMode) {
        const layercontainers = document.getElementsByClassName("layercontainer");
        for (let i = 0; i < layercontainers.length; i++) {
            let layercontainer = layercontainers[i];
            if (layercontainer.classList.contains("unlocked") && layercontainer.classList.contains("layer_selected") && layercontainer.getAttribute("data-type") === "shape") {
                let index = parseInt(layercontainer.getAttribute("data-index"));
                let triggerPX = false;
                let triggerPY = false;
                let pXValueToSet;
                let pYValueToSet;
                pXValueToSet = triPointX.value;
                while (pXValueToSet.search(" ") > -1) {
                    pXValueToSet = pXValueToSet.replace(" ", "");
                }
                if (!isNaN(pXValueToSet)) {
                    pXValueToSet = parseInt(pXValueToSet);
                    triggerPX = true;
                } else {
                    triggerPX = false;
                }
                pYValueToSet = triPointY.value;
                while (pYValueToSet.search(" ") > -1) {
                    pYValueToSet = pYValueToSet.replace(" ", "");
                }
                if (!isNaN(pYValueToSet)) {
                    pYValueToSet = parseInt(pYValueToSet);
                    triggerPY = true;
                } else {
                    triggerPY = false;
                }
                if (triggerPX && pXValueToSet >= 1 && pXValueToSet <= 3000 && triggerPY && pYValueToSet >= 1 && pYValueToSet <= 3000) {
                    setTrianglePoint(geometryPointsList[index], pXValueToSet, pYValueToSet);
                }
            }
        }
    }
}, false);

function setTrianglePoint(controlP, pointX, pointY) {
    const currentShape = controlP.elementToControl;
    if (currentShape.type === "triangle") {
        currentShape.xp2 = pointX * pdfState.zoom;
        currentShape.yp2 = pointY * pdfState.zoom;
        updateUserShapeLayer(controlP);
    }
}


document.getElementById('cleargeometry').addEventListener("click", function() {
    resetAllModes();
    for (let i = geometryPointsList.length-1; i >= 0; i--) {
        let disable = checkForLockStatus(geometryPointsList[i].controlBox);
        if (!disable) {
            let deleteIndex = parseInt(geometryPointsList[i].controlBox.getAttribute('data-index'));
            let deletePage = parseInt(geometryPointsList[i].controlBox.getAttribute("data-page"));
            deleteShape(geometryPointsList[i].controlBox, deletePage, deleteIndex);
            deleteLayerByElement(deletePage, deleteIndex, "shape");
        }
    }
}, false);