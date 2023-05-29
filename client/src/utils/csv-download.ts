import { Parser } from '@json2csv/plainjs';

const CSV_FILE_TYPE = 'text/csv;charset=utf-8;';

interface CsvDownloadProps {
  data: unknown[];
  filename?: string;
  delimiter?: string;
  headers?: string[];
}

const getFilename = (providedFilename: string): string => {
  return /csv$/i.test(providedFilename) ? providedFilename : `${providedFilename}.csv`;
};

export const csvDownload = ({
  data,
  filename = 'export.csv',
  delimiter = ';',
  headers,
}: CsvDownloadProps): void => {
  const formattedFilename = getFilename(filename);

  if (data.length === 0) {
    triggerCsvDownload(headers ? headers.join(delimiter) : '', formattedFilename);
    return;
  }

  try {
    const opts = {};
    const parser = new Parser(opts);
    const csv = parser.parse(data);
    triggerCsvDownload(csv, formattedFilename);
  } catch (err) {
    console.error(err);
  }
};

export const triggerCsvDownload = (csvAsString: string, fileName: string) => {
  // BOM support for special characters in Excel
  const byteOrderMark = '\ufeff';

  const blob = new Blob([byteOrderMark, csvAsString], {
    type: CSV_FILE_TYPE,
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
