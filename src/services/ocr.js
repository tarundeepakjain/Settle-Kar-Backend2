import {createWorker} from "tesseract.js";

export const scanBill = async(imageBuffer) => {
    const worker = await createWorker('eng');
    const ret = await worker.recognize(imageBuffer  );
    const dt = ret.data.text;
    await worker.terminate();
    return dt;
};