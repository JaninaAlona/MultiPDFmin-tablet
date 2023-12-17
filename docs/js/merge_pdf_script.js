const { PDFDocument } = PDFLib


let selectedPDFBytes = [];
let outputPdf = null;
let pdfBytes;
let file;


const merger = Vue.createApp({
    data() {
        return {
            mergeFilename: '',
            filename: '',
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
                let selectedPDFByte = new Uint8Array(this.result);
                this.isEncrypted = false;
                if (file.name.endsWith(".pdf")) {
                    let srcPDFDoc;
                    try {
                        srcPDFDoc = await PDFDocument.load(selectedPDFByte);
                    } catch(encryptedErr) {
                        this.isEncrypted = true;
                        encryptedErrorWidgets = document.getElementsByClassName("encrypted_error");
                        for (let i = 0; i < encryptedErrorWidgets.length; i++) {
                            encryptedErrorWidgets[i].style.display = "flex";
                        }
                    }
                    if (!this.isEncrypted) {
                        selectedPDFBytes.push(selectedPDFByte);
                        let list = document.getElementById("sortlist");
                        let node = document.createElement("li");
                        node.style.backgroundColor = "rgba(255, 255, 255, 1.0)";
                        node.classList.add("fileselector");
                        node.classList.add("file_unselected");
                        node.innerText = file.name;
                        node.addEventListener("click", function() {
                            markFile(node);
                        }, false);
                        list.appendChild(node);
                        slist(list);
                        if ((selectedPDFBytes.length >= 1) && (selectedPDFBytes.length <= 100)) {
                            document.getElementById('save_merge').disabled = false;
                            document.getElementById('remove').disabled = false;
                            document.getElementById("save_merge").classList.add("enable_filename");
                            this.mergeFilename = "merged_pdf";
                            document.getElementById("merge_filename").value = this.mergeFilename;
                        }
                    }
                } else {
                    selectedPDFByte = null;
                    noPDFErrorWidgets = document.getElementsByClassName("no_pdf_error");
                    for (let i = 0; i < noPDFErrorWidgets.length; i++) {
                        noPDFErrorWidgets[i].style.display = "flex";
                    }
                }
            }
            if (file) 
                fileReader.readAsArrayBuffer(file);
        },

        removeFile() {
            let fileSelectors = document.getElementsByClassName("fileselector");
            let deleteIndex;
            for (let i = 0; i < fileSelectors.length; i++) {
                if (fileSelectors[i].classList.contains("file_selected")) {
                    deleteIndex = i;
                    let fileToRemove = fileSelectors[deleteIndex];
                    selectedPDFBytes.splice(deleteIndex, 1);
                    fileToRemove.parentNode.removeChild(fileToRemove);
                }
            }
            if (selectedPDFBytes.length <= 1) {
                document.getElementById('save_merge').disabled = true;
            } 
            if (selectedPDFBytes.length == 0) {
                document.getElementById('remove').disabled = true;
            }
        },

        setFilename() {
            let inputFilename = document.getElementById("merge_filename").value;
            if (inputFilename.length > 50) {
                inputFilename = inputFilename.substring(0, 50);
                document.getElementById("merge_filename").value = inputFilename;
            }
            this.mergeFilename = inputFilename;
        },

        async saveMergedPDF() {
            await mergePDFs();
            download(pdfBytes, this.mergeFilename + ".pdf", "application/pdf");
        }
    }
});

merger.mount('#merge_app');

function markFile(node) {
    let fileSelectors = document.getElementsByClassName("fileselector");
    for (let i = 0; i < fileSelectors.length; i++) {
        if (fileSelectors[i].classList.contains("file_selected")) {
            fileSelectors[i].style.backgroundColor = "rgba(255, 255, 255, 1.0)";
            fileSelectors[i].style.color = "rgba(0, 0, 0, 1.0)";
            fileSelectors[i].classList.add("file_unselected");
            fileSelectors[i].classList.remove("file_selected");
        }
    }
    if (node.classList.contains("file_unselected")) {
        node.classList.remove("file_unselected");
        node.classList.add("file_selected");
        node.style.backgroundColor = "rgba(0, 0, 0, 1.0)";
        node.style.color = "rgba(255, 255, 255, 1.0)";
    }
}

function slist(target) {
    target.classList.add("slist");
    let items = target.getElementsByTagName("li"), current = null;
    for (const i of items) {
        i.draggable = true;
        i.ondragstart = e => {
            current = i;
        };
        i.ondragover = e => e.preventDefault();
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
                if (currentpos < droppedpos) {
                    i.parentNode.insertBefore(current, i.nextSibling);
                } else {
                    i.parentNode.insertBefore(current, i);
                }
                let insertElem = selectedPDFBytes[currentpos];
                selectedPDFBytes.splice(currentpos, 1);
                selectedPDFBytes.splice(droppedpos, 0, insertElem);
            }
        };
    }
}

async function mergePDFs() {
    outputPdf = await PDFDocument.create(); 
    for (let i = 0; i < selectedPDFBytes.length; i++) {
        let srcPDFDoc = await PDFDocument.load(selectedPDFBytes[i]); 
        for (let j = 0; j < srcPDFDoc.getPages().length; j++) {
            const [currentPage] = await outputPdf.copyPages(srcPDFDoc, [j]);
            outputPdf.addPage(currentPage);
        }
    } 
    pdfBytes = await outputPdf.save();  
}