import {createWorker} from "tesseract.js";

export const scanBill = async() => {
    const worker = await createWorker('eng');
    const ret = await worker.recognize('https://tesseract.projectnaptha.com/img/eng_bw.png');
    const dt = ret.data.text;
    await worker.terminate();
    return dt;
};