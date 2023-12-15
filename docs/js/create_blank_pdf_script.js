const { PDFDocument } = PDFLib


let blankNumOfPagesCount = 1;
let blankPageWidth = 210;
let blankPageHeight = 297;
let triggerSaveBlank = false;

const canceler = Vue.createApp({
    data() {
        return {
            blankPDFfilename: "blank_pdf"
        }
    },
    mounted() {
        initialiseBlankEvents();
    },
    methods: {
        async savePDF() {
            blankSaveInput();
            if (triggerSaveBlank) {
                let pdfDoc = await PDFDocument.create()
                let page;
                const pageWFactor = (blankPageWidth * 1000) / 352.8;
                const pageHFactor = (blankPageHeight * 1000) / 352.8;
    
                for (let i = 0; i < blankNumOfPagesCount; i++) {
                    page = pdfDoc.addPage()
                    page.setMediaBox(0, 0, pageWFactor, pageHFactor)
                }
                const pdfBytes = await pdfDoc.save();
                download(pdfBytes, this.blankPDFfilename, "application/pdf");
            }
        },
        setFilename() {
            let inputFilename = document.getElementById("blank_filename").value;
            if (inputFilename.length > 50) {
                inputFilename = inputFilename.substring(0, 50);
                document.getElementById("blank_filename").value = inputFilename;
            }
            this.blankPDFfilename = inputFilename;
        }
    }
});

canceler.mount('#create_blank_app');


function blankSaveInput() {
    let triggerSaveA = false;
    let triggerSaveB = false;
    let triggerSaveC = false;
    blankNumOfPagesCount = document.getElementById('blank_pages').value;
    while (blankNumOfPagesCount.search(" ") > -1) {
        blankNumOfPagesCount = blankNumOfPagesCount.replace(" ", "");
    }
    if (!isNaN(blankNumOfPagesCount)) {
        blankNumOfPagesCount = Number(blankNumOfPagesCount);
        if (Number.isInteger(blankNumOfPagesCount)) {
            document.getElementById('blank_pages').value = blankNumOfPagesCount;
            triggerSaveA = true;
        } else {
            triggerSaveA = false;
        }
    } else {
        triggerSaveA = false;
    }
    blankPageWidth = document.getElementById('blank_width').value;
    while (blankPageWidth.search(" ") > -1) {
        blankPageWidth = blankPageWidth.replace(" ", "");
    }
    if (!isNaN(blankPageWidth)) {
        document.getElementById('blank_width').value = parseInt(blankPageWidth);
        triggerSaveB = true;
    } else {
        triggerSaveB = false;
    }
    blankPageHeight = document.getElementById('blank_height').value;
    while (blankPageHeight.search(" ") > -1) {
        blankPageHeight = blankPageHeight.replace(" ", "");
    }
    if (!isNaN(blankPageHeight)) {
        document.getElementById('blank_height').value = parseInt(blankPageHeight);
        triggerSaveC = true;
    } else {
        triggerSaveC = false;
    }
    if (triggerSaveA && triggerSaveB && triggerSaveC) {
        triggerSaveBlank = true;
    } else {
        triggerSaveBlank = false;
    }
}


function restrictInputValues(inputId, valToRestrict, min, max) {
    valToRestrict = document.getElementById(inputId).value;
    while (valToRestrict.search(" ") > -1) {
        valToRestrict = valToRestrict.replace(" ", "");
    }
    if (!isNaN(valToRestrict)) {
        valToRestrict = Number(valToRestrict);
        if (inputId === 'blank_pages') {
            if (Number.isInteger(valToRestrict)) {
                if (valToRestrict >= min && valToRestrict <= max) {
                    document.getElementById(inputId).value = valToRestrict;
                } else {
                    if (valToRestrict < min) {
                        document.getElementById(inputId).value = min;
                    } else if (valToRestrict > max) {
                        document.getElementById(inputId).value = max;
                    }
                }
            }
        } else if (inputId === 'blank_width' || inputId === 'blank_height') {
            valToRestrict = parseInt(valToRestrict);
            if (valToRestrict >= min && valToRestrict <= max) {
                document.getElementById(inputId).value = valToRestrict;
            } else {
                if (valToRestrict < min) {
                    document.getElementById(inputId).value = min;
                } else if (valToRestrict > max) {
                    document.getElementById(inputId).value = max;
                }
            }
        }
    }
}

function initRestrictInputEvents(inputId, valToRestrict, min, max) {
    const inputElem = document.getElementById(inputId);
    inputElem.addEventListener('change', () => restrictInputValues(inputId, valToRestrict, min, max), false);
}

function initialiseBlankEvents() {
    initRestrictInputEvents('blank_pages', blankNumOfPagesCount, 1, 3000);
    initRestrictInputEvents('blank_width', blankPageWidth, 10, 5000);
    initRestrictInputEvents('blank_height', blankPageHeight, 10, 5000);
    const dinaSelector = document.querySelector('#dinasize');
    dinaSelector.addEventListener('click', function() {
        const dinaSizes = setDINAFormats(dinaSelector.selectedIndex);
        blankPageWidth = dinaSizes[1];
        blankPageHeight = dinaSizes[0];
        document.getElementById('blank_width').value = dinaSizes[1];
        document.getElementById('blank_height').value = dinaSizes[0];
        if (document.getElementById('portrait').checked) {
            blankPageWidth = dinaSizes[0];
            blankPageHeight = dinaSizes[1];
            document.getElementById('blank_width').value = dinaSizes[0];
            document.getElementById('blank_height').value = dinaSizes[1];
        }
    }, false);
    document.getElementById('portrait').addEventListener('click', function() {
        let triggerPortraitW = false;
        let triggerPortraitH = false;
        let width = document.getElementById('blank_width').value;
        while (width.search(" ") > -1) {
            width = width.replace(" ", "");
        }
        if (!isNaN(width)) {
            width = parseInt(width);
            triggerPortraitW = true;
        } else {
            triggerPortraitW = false;
        }
        let height = document.getElementById('blank_height').value;
        while (height.search(" ") > -1) {
            height = height.replace(" ", "");
        }
        if (!isNaN(width)) {
            width = parseInt(width);
            triggerPortraitH = true;
        } else {
            triggerPortraitH = false;
        }
        if (triggerPortraitW && triggerPortraitH && width > height) {
            blankPageWidth = height;
            blankPageHeight = width;
            document.getElementById('blank_width').value = height;
            document.getElementById('blank_height').value = width;
        }
    }, false);
    document.getElementById('landscape').addEventListener('click', function() {
        let triggerLandscapeW = false;
        let triggerLandscapeH = false;
        let width = document.getElementById('blank_width').value;
        while (width.search(" ") > -1) {
            width = width.replace(" ", "");
        }
        if (!isNaN(width)) {
            width = parseInt(width);
            triggerLandscapeW = true;
        } else {
            triggerLandscapeW = false;
        }
        let height = document.getElementById('blank_height').value;
        while (height.search(" ") > -1) {
            height = height.replace(" ", "");
        }
        if (!isNaN(width)) {
            width = parseInt(width);
            triggerLandscapeH = true;
        } else {
            triggerLandscapeH = false;
        }
        if (triggerLandscapeW && triggerLandscapeH && width < height) {
            blankPageWidth = height;
            blankPageHeight = width;
            document.getElementById('blank_width').value = height;
            document.getElementById('blank_height').value = width;
        }

    }, false);
    document.getElementById('quadratic').addEventListener('click', function() {
        let triggerQuadraticW = false;
        let width = document.getElementById('blank_width').value;
        while (width.search(" ") > -1) {
            width = width.replace(" ", "");
        }
        if (!isNaN(width)) {
            width = parseInt(width);
            triggerQuadraticW = true;
        } else {
            triggerQuadraticW = false;
        }
        if (triggerQuadraticW) {
            blankPageWidth = width;
            blankPageHeight = width;
            document.getElementById('blank_width').value = width;
            document.getElementById('blank_height').value = width;
        }
    }, false);
}


function setDINAFormats(dinaID) {
    let dinaSizes = [];
    let w = 0;
    let h = 0;
    switch(dinaID) {
        case 0:
            w = 594;
            h = 841;
            break;
        case 1:
            w = 420;
            h = 594;
            break;
        case 2:
            w = 297;
            h = 420;
            break;
        case 3:
            w = 210;
            h = 297;
            break;
        case 4:
            w = 148;
            h = 210;
            break;
        case 5:
            w = 105;
            h = 148;
            break;
        case 6:
            w = 74;
            h = 105;
            break;
        default:
            w = 210;
            h = 297;
    }
    dinaSizes[0] = w;
    dinaSizes[1] = h;
    return dinaSizes;
}
