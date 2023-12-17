const { PDFDocument } = PDFLib

let selectedPDFBytes;
let splittedPDFs = [];
let splitMethod = 0;
let triggerSaveSplit = false;
let pdfToSplit;


const splitter = Vue.createApp({
    data() {
        return {
            afterNPages: 2,
            maxPages: 100,
            outputname: '',
            splitPDFfilename: '',
            isEncrypted: false
        }
    },
    methods: {
        selectFile(e) {
            let encryptedErrorWidgets = document.getElementsByClassName("encrypted_error");
            for (let i = 0; i < encryptedErrorWidgets.length; i++) {
                encryptedErrorWidgets[i].style.display = "none";
            }
            let noPDFErrorWidgets = document.getElementsByClassName("no_pdf_error");
            for (let i = 0; i < noPDFErrorWidgets.length; i++) {
                noPDFErrorWidgets[i].style.display = "none";
            }
            const file = e.target.files[0];
            const fileReader = new FileReader();
            fileReader.onload = async function() {
                selectedPDFBytes = new Uint8Array(this.result);
                this.isEncrypted = false;
                if (file.name.endsWith(".pdf")) {
                    let srcPDFDoc;
                    try {
                        srcPDFDoc = await PDFDocument.load(selectedPDFBytes);
                    } catch(encryptedErr) {
                        this.isEncrypted = true;
                        encryptedErrorWidgets = document.getElementsByClassName("encrypted_error");
                        for (let i = 0; i < encryptedErrorWidgets.length; i++) {
                            encryptedErrorWidgets[i].style.display = "flex";
                        }
                    }
                    if (!this.isEncrypted) {
                        if (srcPDFDoc.getPages().length === 1) {
                            triggerSaveSplit = false;
                        } else {
                            triggerSaveSplit = true;
                            pdfToSplit = file.name;
                            if (pdfToSplit.length > 54) {
                                pdfToSplit = pdfToSplit.substring(0, 50).concat(pdfToSplit.substring(pdfToSplit.length-4, pdfToSplit.length));
                            }
                            document.getElementById("fileselected").innerText = pdfToSplit;
                            document.getElementById('split_after').disabled = false;
                        }
                    }
                } else {
                    noPDFErrorWidgets = document.getElementsByClassName("no_pdf_error");
                    for (let i = 0; i < noPDFErrorWidgets.length; i++) {
                        noPDFErrorWidgets[i].style.display = "flex";
                    }
                }
            }
            if (file)
                fileReader.readAsArrayBuffer(file);
        },
        selectRegularSplit(regularSplitOpt) {
            if (triggerSaveSplit) {
                splitMethod = regularSplitOpt;
                switch(regularSplitOpt) {
                    case 0:
                        document.getElementById('n_page_slider').disabled = true;
                        document.getElementById('splitlist').disabled = true;
                        document.getElementById('save_split').disabled = true;
                        break;
                    case 1:
                        document.getElementById('n_page_slider').disabled = true;
                        document.getElementById('splitlist').disabled = true;
                        document.getElementById('save_split').disabled = false;
                        document.getElementById('save_split').classList.add("enable_filename");
                        this.outputName = pdfToSplit.substring(0, pdfToSplit.length - 4);
                        this.splitPDFfilename = this.outputName +  '_split';
                        document.getElementById("split_filename").value = this.splitPDFfilename;
                        break;
                    case 2:
                        document.getElementById('n_page_slider').disabled = true;
                        document.getElementById('splitlist').disabled = true;
                        document.getElementById('save_split').disabled = false;
                        document.getElementById('save_split').classList.add("enable_filename");
                        this.outputName = pdfToSplit.substring(0, pdfToSplit.length - 4);
                        this.splitPDFfilename = this.outputName +  '_split';
                        document.getElementById("split_filename").value = this.splitPDFfilename;
                        break;
                    case 3:
                        document.getElementById('n_page_slider').disabled = true;
                        document.getElementById('splitlist').disabled = true;
                        document.getElementById('save_split').disabled = false;
                        document.getElementById('save_split').classList.add("enable_filename");
                        this.outputName = pdfToSplit.substring(0, pdfToSplit.length - 4);
                        this.splitPDFfilename = this.outputName +  '_split';
                        document.getElementById("split_filename").value = this.splitPDFfilename;
                        break;
                    case 4:
                        document.getElementById('n_page_slider').disabled = false;
                        document.getElementById('splitlist').disabled = true;
                        document.getElementById('save_split').disabled = false;
                        document.getElementById('save_split').classList.add("enable_filename");
                        this.outputName = pdfToSplit.substring(0, pdfToSplit.length - 4);
                        this.splitPDFfilename = this.outputName +  '_split';
                        document.getElementById("split_filename").value = this.splitPDFfilename;
                        break;
                    case 5:
                        document.getElementById('n_page_slider').disabled = true;
                        document.getElementById('splitlist').disabled = false;
                        document.getElementById('save_split').disabled = false;
                        document.getElementById('save_split').classList.add("enable_filename");
                        this.outputName = pdfToSplit.substring(0, pdfToSplit.length - 4);
                        this.splitPDFfilename = this.outputName +  '_split';
                        document.getElementById("split_filename").value = this.splitPDFfilename;
                }
            }
        },
        async updateSlider() {
            let srcPDFDoc = await PDFDocument.load(selectedPDFBytes);
            if (srcPDFDoc.getPages().length <= 100) {
                this.maxPages = 100;
            } else {
                this.maxPages = srcPDFDoc.getPages().length;
            }
            if (srcPDFDoc.getPages().length < 100) {
                let slider = document.getElementById('n_page_slider');
                let sliderVal = slider.value;
                let pageIntervalLenght = 100/srcPDFDoc.getPages().length;
                let pageInterval = sliderVal / pageIntervalLenght;
                let intervalRest = sliderVal % pageIntervalLenght;
                if (intervalRest != 0 && Math.floor(pageInterval) < srcPDFDoc.getPages().length) {
                    this.afterNPages = Math.floor(pageInterval) + 1;
                } else {
                    this.afterNPages = pageInterval;
                }
            } else {
                this.afterNPages = slider.value;
            }
            if (this.afterNPages > 1) {
                this.afterNPages -= 1;
            }
        },
        setFilename() {
            let inputFilename = document.getElementById("split_filename").value;
            if (inputFilename.length > 50) {
                inputFilename = inputFilename.substring(0, 50);
                document.getElementById("split_filename").value = inputFilename;
            }
            this.splitPDFfilename = inputFilename;
        },
        async saveSplittedPDFs() {
            if (triggerSaveSplit) {
                await computeSplitOptions(this.afterNPages);
                for(let i = 0; i < splittedPDFs.length; i++) {
                    const pdfBytes = await splittedPDFs[i].save();
                    download(pdfBytes, this.splitPDFfilename + "_" + i + ".pdf", "application/pdf");
                } 
                splittedPDFs = [];
            }
        }
    }
});

splitter.mount('#split_app');


async function computeSplitOptions(n) {
    switch(splitMethod) {
        case 0:
            break;
        case 1:
            await applySplitAfterEvery();
            break;
        case 2:
            await splitAfter(1);
            break;
        case 3:
            await splitAfter(0);
            break;
        case 4:
            await splitAfterN(n);
            break;
        case 5:
            await splitList();
            break;
    }
}


async function applySplitAfterEvery() {
    let srcPDFDoc = await PDFDocument.load(selectedPDFBytes);
    for(let i = 0; i < srcPDFDoc.getPages().length; i++) {
        let newPDFDoc = await PDFDocument.create();
        let newPage = await newPDFDoc.copyPages(srcPDFDoc, [i]);
        const [currentPage] = newPage;
        newPDFDoc.addPage(currentPage);
        splittedPDFs.push(newPDFDoc);
    }
    triggerSaveSplit = true;
}

async function splitAfter(nRest) {
    const srcPDFDoc = await PDFDocument.load(selectedPDFBytes);
    if (nRest == 0 && srcPDFDoc.getPages().length >= 3) {
        for (let i = 0; i < srcPDFDoc.getPages().length - 1; i+=2) {  
            const newPDFDoc = await PDFDocument.create();   
            const [currentPage] = await newPDFDoc.copyPages(srcPDFDoc, [i]);
            const [secondPage] = await newPDFDoc.copyPages(srcPDFDoc, [i+1]);
            newPDFDoc.addPage(currentPage);
            newPDFDoc.addPage(secondPage);
            splittedPDFs.push(newPDFDoc);
        }
        if (srcPDFDoc.getPages().length % 2 == 1) {
            const newPDFDoc = await PDFDocument.create(); 
            const [lastPage] = await newPDFDoc.copyPages(srcPDFDoc, [srcPDFDoc.getPages().length-1]);
            newPDFDoc.addPage(lastPage);
            splittedPDFs.push(newPDFDoc);
        }
        triggerSaveSplit = true;
    } else {
        document.getElementById('save_split').disabled = true;
        triggerSaveSplit = false;
    } 
    if (nRest == 1 && srcPDFDoc.getPages().length >= 2) {
        let newPDFDoc = await PDFDocument.create();
        const [firstPage] = await newPDFDoc.copyPages(srcPDFDoc, [0]);
        newPDFDoc.addPage(firstPage);
        splittedPDFs.push(newPDFDoc);
        if (srcPDFDoc.getPages().length === 2) {
            let newPDFDoc = await PDFDocument.create();
            const [lastPage] = await newPDFDoc.copyPages(srcPDFDoc, [1]);
            newPDFDoc.addPage(lastPage);
            splittedPDFs.push(newPDFDoc);
        }
        for (let i = 1; i < srcPDFDoc.getPages().length - 1; i+=2) {
            let newPDFDoc = await PDFDocument.create();
            const [currentPage] = await newPDFDoc.copyPages(srcPDFDoc, [i]);
            const [secondPage] = await newPDFDoc.copyPages(srcPDFDoc, [i+1]);
            newPDFDoc.addPage(currentPage);
            newPDFDoc.addPage(secondPage);
            splittedPDFs.push(newPDFDoc);
        }
        triggerSaveSplit = true;
    } else {
        document.getElementById('save_split').disabled = true;
        triggerSaveSplit = false;
    } 
}

async function splitAfterN(n) {
    let srcPDFDoc = await PDFDocument.load(selectedPDFBytes);
    const firstPDFDoc = await PDFDocument.create(); 
    for (let i = 0; i < n; i++) {  
        const [currentPage] = await firstPDFDoc.copyPages(srcPDFDoc, [i]);
        firstPDFDoc.addPage(currentPage);
    }
    splittedPDFs.push(firstPDFDoc);
    const secondPDFDoc = await PDFDocument.create(); 
    for (let i = n; i < srcPDFDoc.getPages().length; i++) {  
        const [currentPage] = await secondPDFDoc.copyPages(srcPDFDoc, [i]);
        secondPDFDoc.addPage(currentPage);
    }
    splittedPDFs.push(secondPDFDoc);
    triggerSaveSplit = true;
}

async function splitList() {
    let srcPDFDoc = await PDFDocument.load(selectedPDFBytes);
    let splitListInput = document.getElementById('splitlist').value;
    let splitListDoc;
    let trimmedPages = [];
    if (splitListInput.indexOf(',') > -1) {
        const pages = splitListInput.split(",");
        for (let i = 0; i < pages.length; i++) {
            let singlePage = pages[i];
            while (singlePage.search(" ") > -1) {
                singlePage = singlePage.replace(" ", "");
            } 
            if (!isNaN(singlePage)) {
                singlePage = Number(singlePage);
                if (Number.isInteger(singlePage) && singlePage >= 1 && singlePage < srcPDFDoc.getPages().length) {
                    triggerSaveSplit = true;
                    trimmedPages.push(singlePage);
                } else {
                    triggerSaveSplit = false;
                }
            } else {
                triggerSaveSplit = false;
            }
        }
    } else {
        while (splitListInput.search(" ") > -1) {
            splitListInput = splitListInput.replace(" ", "");
        }
        if (!isNaN(splitListInput)) {
            splitListInput = Number(splitListInput);
            if (Number.isInteger(splitListInput) && splitListInput >= 1 && splitListInput < srcPDFDoc.getPages().length) {
                triggerSaveSplit = true;
                let singlePage = splitListInput;
                if (singlePage > 0 && singlePage < srcPDFDoc.getPages().length) {
                    triggerSaveSplit = true;
                    trimmedPages.push(singlePage);
                } else {
                    triggerSaveSplit = false;
                }
            } else {
                triggerSaveSplit = false;
            }
        } else {
            triggerSaveSplit = false;
        }
    }
    if (triggerSaveSplit && trimmedPages.length >= 1 && trimmedPages.length < srcPDFDoc.getPages().length) {
        trimmedPages.sort((a,b)=>a-b);
        let start = 1;
        let end = trimmedPages[0];
        for (let i = 0; i < trimmedPages.length; i++) {
            splitListDoc = await PDFDocument.create();
            for (let j = start; j <= end; j++) {
                const [currentPage] = await splitListDoc.copyPages(srcPDFDoc, [j-1]);
                splitListDoc.addPage(currentPage);
            } 
            start = trimmedPages[i] + 1;
            end = trimmedPages[i+1];
            splittedPDFs.push(splitListDoc);
        } 
        splitListDoc = await PDFDocument.create();
        for (let i = trimmedPages[trimmedPages.length-1] + 1; i <= srcPDFDoc.getPages().length; i++) {
            const [currentPage] = await splitListDoc.copyPages(srcPDFDoc, [i-1]);
            splitListDoc.addPage(currentPage);
        } 
        splittedPDFs.push(splitListDoc); 
    }
}