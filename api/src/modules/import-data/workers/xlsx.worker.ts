import { parentPort, workerData } from 'worker_threads';
import * as XLSX from 'xlsx';

try {
  const filePath: string = workerData.filePath;
  const sheetMap: any = workerData.sheetMap;
  const workBook: XLSX.WorkBook = XLSX.readFile(filePath);
  const parsedSheets: Record<string, any[]> = {};

  for (const [key, value] of Object.entries(sheetMap)) {
    parsedSheets[value as string] = XLSX.utils.sheet_to_json(
      workBook.Sheets[key],
    );
  }

  parentPort?.postMessage(parsedSheets);
} catch (error: any) {
  parentPort?.postMessage({ error: error.message });
}
