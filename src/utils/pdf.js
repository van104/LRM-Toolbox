
import * as pdfjsLib from 'pdfjs-dist';



if (typeof window !== 'undefined' && 'Worker' in window) {
    if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/lib/pdf.worker.min.js';
    } else if (pdfjsLib.default?.GlobalWorkerOptions) {
        pdfjsLib.default.GlobalWorkerOptions.workerSrc = '/lib/pdf.worker.min.js';
    }
}

export default pdfjsLib;
