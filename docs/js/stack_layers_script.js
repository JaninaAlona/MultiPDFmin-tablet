let firstStackLayer = true;
let layerNameCounterText = 1;
let layerNameCounterShape = 1;
let layerNameCounterDrawing = 1;
let layerNameCounterImage = 1;


function createStackLayer(thisPage, editImgClass, editImgIndex) {
    if (firstStackLayer) {
        firstStackLayer = false;
        selAll.disabled = false;
        unselAll.disabled = false;
        document.getElementsByClassName("selall_hover_disabled")[0].classList.add("selall_hover");
        document.getElementsByClassName("deselall_hover_disabled")[0].classList.add("deselall_hover");
    }
    const layerStack = document.getElementById("layer_stack_con");
    const pageLabels = layerStack.getElementsByClassName("layerlabel");
    let newPage = true;
    if (pageLabels.length > 0) {
        for (let i = 0; i < pageLabels.length; i++) {
            let label = pageLabels[i];
            let labelPage = parseInt(label.getAttribute("data-page"));
            if (labelPage != thisPage) {
                newPage = true;
            } else {
                newPage = false;
                break;
            }
        }
    }
    let pageLabel;
    if (newPage) {
        pageLabel = document.createElement("div");
        pageLabel.innerHTML = "Page " + thisPage;
        pageLabel.setAttribute('data-page', thisPage);
        pageLabel.classList.add("layerlabel");
    } else {
        for (let i = 0; i < pageLabels.length; i++) {
            if (parseInt(pageLabels[i].getAttribute("data-page")) === thisPage) {
                pageLabel = pageLabels[i];
            }
        }
    }
    const layerCon = document.createElement("div");
    layerCon.classList.add("layercontainer");
    layerCon.classList.add("layer_unselected");
    layerCon.classList.add("unlocked");
    layerCon.setAttribute('data-page', thisPage);
    layerCon.setAttribute('data-index', editImgIndex);
    layerCon.setAttribute('data-type', editImgClass);

    const eyeLabel = document.createElement("label");
    eyeLabel.style.width = "25px";
    eyeLabel.style.height = "25px";
    eyeLabel.setAttribute('data-index', editImgIndex);
    eyeLabel.setAttribute('data-page', thisPage);
    eyeLabel.setAttribute('data-type', editImgClass);
    const layerEye = document.createElement("input");
    layerEye.type = "checkbox";
    layerEye.className = "layercheckbox";
    layerEye.name = "layercheckbox";
    layerEye.value = "isVisible";
    layerEye.checked = true;
    layerEye.setAttribute('data-index', editImgIndex);
    layerEye.setAttribute('data-page', thisPage);
    layerEye.setAttribute('data-type', editImgClass);
    layerEye.addEventListener("input", function() {
        hideLayer(layerEye);
    }, false);

    const layerName = document.createElement("input");
    layerName.type = "text";
    layerName.className = "layername";
    layerName.name = "layername";
    if (editImgClass === "text") {
        layerName.value = editImgClass + layerNameCounterText;
        layerNameCounterText++;
    } else if (editImgClass === "shape") {
        layerName.value = editImgClass + layerNameCounterShape;
        layerNameCounterShape++;
    } else if (editImgClass === "drawing") {
        layerName.value = editImgClass + layerNameCounterDrawing;
        layerNameCounterDrawing++;
    } else if (editImgClass === "image") {
        layerName.value = editImgClass + layerNameCounterImage;
        layerNameCounterImage++;
    }
    layerName.setAttribute('data-page', thisPage);
    layerName.setAttribute('data-index', editImgIndex);
    layerName.setAttribute('data-type', editImgClass);
    layerName.addEventListener("click", function() {
        markLayer(layerName); 
    }, false);

    eyeLabel.appendChild(layerEye);
    layerCon.appendChild(eyeLabel);
    layerCon.appendChild(layerName);
    pageLabel.appendChild(layerCon);
    layerStack.insertBefore(pageLabel, layerStack.children[thisPage-1]);
    markSingleLayer(layerName);
    moveLayer(layerStack);
}


function hideLayer(layerEye) {
    resetAllModes();
    const checkedIndex = parseInt(layerEye.getAttribute("data-index"));
    const checkedType = layerEye.getAttribute("data-type");
    let layerElem;
    if (checkedType === "shape") {
        layerElem = geometryPointsList[checkedIndex]; 
    } else if (checkedType === "text") {
        layerElem = userTextList[checkedIndex];
    } else if (checkedType === "image") {
        layerElem = userImageList[checkedIndex];
    } else if (checkedType === "drawing") {
        layerElem = drawLayerStack[checkedIndex];
    }
    if (!layerEye.checked) {
        layerElem.controlBox.style.display = "none";
        layerElem.editImg.style.display = "none";
    } else {
        layerElem.controlBox.style.display = "flex";
        layerElem.editImg.style.display = "flex";
    }
}


function markLayer(layer) {
    const layerCon = layer.parentNode;
    if (layerCon.classList.contains("layer_selected")) {
        layerCon.classList.remove("layer_selected");
        layerCon.classList.add("layer_unselected");
        layerCon.style.borderStyle = "none";
        if (layerCon.classList.contains("unlocked")) {
            layerCon.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        } else if (layerCon.classList.contains("locked")) {
            layerCon.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
        }
    } else if (layerCon.classList.contains("layer_unselected")) {
        layerCon.style.backgroundColor = "rgba(218, 189, 182, 0.8)";
        layerCon.style.borderStyle = "none";
        layerCon.classList.add("layer_selected");
        layerCon.classList.remove("layer_unselected");
        if (layerCon.classList.contains("locked")) {
            layerCon.style.borderStyle = "solid";
            layerCon.style.borderWidth = "5px";
            layerCon.style.borderColor = "rgba(255, 255, 255, 0.8)";
        }
    }
}

function markSingleLayer(layer) {
    const layercontainers = document.getElementsByClassName("layercontainer");
    for (let i = 0; i < layercontainers.length; i++) {
        if (layercontainers[i].classList.contains("layer_selected")) {
            layercontainers[i].style.borderStyle = "none";
            layercontainers[i].classList.remove("layer_selected");
            layercontainers[i].classList.add("layer_unselected");
            if (layercontainers[i].classList.contains("unlocked")) {
                layercontainers[i].style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            } else if (layercontainers[i].classList.contains("locked")) {
                layercontainers[i].style.backgroundColor = "rgba(255, 255, 255, 0.8)";
            }
        }
    }
    const layerCon = layer.parentNode;
    layerCon.style.backgroundColor = "rgba(218, 189, 182, 0.8)";
    layerCon.style.borderStyle = "none";
    layerCon.classList.add("layer_selected");
    layerCon.classList.remove("layer_unselected");
    if (layerCon.classList.contains("locked")) {
        layerCon.style.borderStyle = "solid";
        layerCon.style.borderWidth = "5px";
        layerCon.style.borderColor = "rgba(255, 255, 255, 0.8)";
    }
}

function markSingleLayerOnEdit(controlP) {
    let index = controlP.index;
    const layernames = document.getElementsByClassName("layername");
    for (let i = 0; i < layernames.length; i++) {
        let layerIndex = parseInt(layernames[i].getAttribute("data-index"));
        let layerType = layernames[i].getAttribute("data-type");
        if (layerIndex === index && controlP.editImg.classList.contains(layerType)) {
            markSingleLayer(layernames[i]);
        }
    }
}


function moveLayer(target) {
    let items = target.getElementsByClassName("layercontainer");
    let current;
    let layername;
    for (const i of items) {
        i.draggable = true;
        i.ondragstart = e => {
            resetAllModes();
            current = i;
            layername = current.children[1];
            markSingleLayer(layername);
        };
        i.ondragover = e => {
            e.preventDefault();
        };
        i.ondrop = e => {
            e.preventDefault();
            if (i != current) {
                let currentpos = 0, droppedpos = 0;
                for (let it=0; it<items.length; it++) {
                    if (current == items[it]) { 
                        currentpos = it; 
                    }
                    if (i == items[it]) { 
                        droppedpos = it; 
                    }
                }
                let canvasToMove;
                let controlPToMove;
                let elementToMove;
                const canvasIndex = parseInt(current.getAttribute('data-index'));
                const canvasType = current.getAttribute('data-type');
                if (canvasType === "shape") {
                    canvasToMove = geometryPointsList[canvasIndex].editImg;
                    controlPToMove = geometryPointsList[canvasIndex].controlBox;
                    elementToMove = geometryPointsList[canvasIndex].elementToControl;
                } else if (canvasType === "text") {
                    canvasToMove = userTextList[canvasIndex].editImg;
                    controlPToMove = userTextList[canvasIndex].controlBox;
                    elementToMove = userTextList[canvasIndex].elementToControl;
                } else if (canvasType === "drawing") {
                    canvasToMove = drawLayerStack[canvasIndex].editImg;
                    controlPToMove = drawLayerStack[canvasIndex].controlBox;
                    elementToMove = drawLayerStack[canvasIndex].elementToControl;
                } else if (canvasType === "image") {
                    canvasToMove = userImageList[canvasIndex].editImg;
                    controlPToMove = userImageList[canvasIndex].controlBox;
                    elementToMove = userImageList[canvasIndex].elementToControl;
                }
                const writeLayers = document.getElementsByClassName("edit_viewer")[0].getElementsByClassName("write_layer");
                const srcPage = parseInt(current.getAttribute("data-page"));
                let destPage;
                if (currentpos < droppedpos) {   
                    destPage = parseInt(i.getAttribute("data-page"));
                    const destIndex = parseInt(i.getAttribute("data-index"));
                    let destWriteLayer;
                    for (let j = 0; j < writeLayers.length; j++) {
                        if (parseInt(writeLayers[j].getAttribute('data-write')) === destPage) {
                            destWriteLayer = writeLayers[j];
                        }
                    }
                    let controlGroup;
                    if (destWriteLayer.getElementsByClassName("control_group").length === 0) {
                        controlGroup = document.createElement("div");
                        controlGroup.style.position = "absolute";
                        controlGroup.style.top = 0;
                        controlGroup.setAttribute('data-page', destWriteLayer.getAttribute("data-write"));
                        controlGroup.classList.add("control_group");
                        destWriteLayer.appendChild(controlGroup);
                    } else {
                        controlGroup = destWriteLayer.getElementsByClassName("control_group")[0];
                    }
                    const editImgGroup = destWriteLayer.getElementsByClassName("editimg_group")[0];
                    let destCanvas;
                    const destCanvases = editImgGroup.getElementsByClassName("editimg");
                    for (let j = 0; j < destCanvases.length; j++) {
                        if (parseInt(destCanvases[j].getAttribute('data-index')) === destIndex) {
                            destCanvas = destCanvases[j];
                        }
                    }
                    let destControlP;
                    const destControlPs = controlGroup.getElementsByClassName("box");
                    for (let j = 0; j < destControlPs.length; j++) {
                        if (parseInt(destControlPs[j].getAttribute('data-index')) === destIndex) {
                            destControlP = destControlPs[j];
                        }
                    }
                    i.parentNode.insertBefore(current, i.nextSibling);
                    if ((controlGroup.getElementsByClassName("box").length > 1) || (controlGroup.getElementsByClassName("box").length === 1 && srcPage !== destPage)) {
                        destCanvas.parentNode.insertBefore(canvasToMove, destCanvas.nextSibling);
                        destControlP.parentNode.insertBefore(controlPToMove, destControlP.nextSibling);
                    } else if (controlGroup.getElementsByClassName("box").length === 1 && srcPage === destPage) {
                        destCanvas.parentNode.insertBefore(canvasToMove, destCanvas.nextSibling);
                    } else if (controlGroup.getElementsByClassName("box").length === 0) {
                        destCanvas.parentNode.insertBefore(canvasToMove, destCanvas.nextSibling);
                        controlGroup.appendChild(controlPToMove);
                    }
                } else {
                    destPage = parseInt(i.getAttribute("data-page"));
                    const destIndex = parseInt(i.getAttribute("data-index"));
                    let destWriteLayer;
                    for (let j = 0; j < writeLayers.length; j++) {
                        if (parseInt(writeLayers[j].getAttribute('data-write')) === destPage) {
                            destWriteLayer = writeLayers[j];
                        }
                    }
                    let controlGroup;
                    if (destWriteLayer.getElementsByClassName("control_group").length === 0) {
                        controlGroup = document.createElement("div");
                        controlGroup.style.position = "absolute";
                        controlGroup.style.top = 0;
                        controlGroup.setAttribute('data-page', destWriteLayer.getAttribute("data-write"));
                        controlGroup.classList.add("control_group");
                        destWriteLayer.appendChild(controlGroup);
                    } else {
                        controlGroup = destWriteLayer.getElementsByClassName("control_group")[0];
                    }
                    const editImgGroup = destWriteLayer.getElementsByClassName("editimg_group")[0];
                    let destCanvas;
                    const destCanvases = editImgGroup.getElementsByClassName("editimg");
                    for (let j = 0; j < destCanvases.length; j++) {
                        if (parseInt(destCanvases[j].getAttribute('data-index')) === destIndex) {
                            destCanvas = destCanvases[j];
                        }
                    }
                    let destControlP;
                    const destControlPs = controlGroup.getElementsByClassName("box");
                    for (let j = 0; j < destControlPs.length; j++) {
                        if (parseInt(destControlPs[j].getAttribute('data-index')) === destIndex) {
                            destControlP = destControlPs[j];
                        }
                    }
                    i.parentNode.insertBefore(current, i);
                    if ((controlGroup.getElementsByClassName("box").length > 1) || (controlGroup.getElementsByClassName("box").length === 1 && srcPage !== destPage)) {
                        destCanvas.parentNode.insertBefore(canvasToMove, destCanvas);
                        destControlP.parentNode.insertBefore(controlPToMove, destControlP);
                    } else if (controlGroup.getElementsByClassName("box").length === 1 && srcPage === destPage) {
                        destCanvas.parentNode.insertBefore(canvasToMove, destCanvas);
                    } else if (controlGroup.getElementsByClassName("box").length === 0) {
                        destCanvas.parentNode.insertBefore(canvasToMove, destCanvas);
                        controlGroup.appendChild(controlPToMove);
                    }
                }
                controlPToMove.elementToControl = elementToMove;
                if (srcPage !== destPage) {
                    canvasToMove.setAttribute("data-page", destPage);
                    controlPToMove.setAttribute("data-page", destPage);
                    controlPToMove.page = destPage;
                    controlPToMove.elementToControl.page = destPage;
                    current.setAttribute("data-page", destPage);
                    let eyeLabel = current.children[0];
                    eyeLabel.setAttribute("data-page", destPage);
                    let layerEye = current.children[0].children[0];
                    layerEye.setAttribute("data-page", destPage);
                    layername = current.children[1];
                    layername.setAttribute("data-page", destPage);
                }
                layername = current.children[1];
                markSingleLayer(layername);
            }
            const pageLayerGroups = document.getElementsByClassName("layerlabel");
            for (let j = 0; j < pageLayerGroups.length; j++) {
                if (pageLayerGroups[j].children.length === 0) {
                    pageLayerGroups[j].parentNode.removeChild(pageLayerGroups[j]);
                }
            }
        };
    }
}