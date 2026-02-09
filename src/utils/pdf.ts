
import * as pdfjsLib from 'pdfjs-dist';

// Define a type for the pdfjsLib object to handle the default property and GlobalWorkerOptions
// Using any here as pdfjs-dist types might be tricky to set up perfectly without installing @types/pdfjs-dist
// which might not be strictly necessary for this simple configuration file.
 
const _pdfjsLib: any = pdfjsLib;

if (typeof window !== 'undefined' && 'Worker' in window) {
    if (_pdfjsLib.GlobalWorkerOptions) {
        _pdfjsLib.GlobalWorkerOptions.workerSrc = '/lib/pdf.worker.min.js';
    } else if (_pdfjsLib.default?.GlobalWorkerOptions) {
        _pdfjsLib.default.GlobalWorkerOptions.workerSrc = '/lib/pdf.worker.min.js';
    }
}

export default pdfjsLib;
