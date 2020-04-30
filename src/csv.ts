import fs from 'fs-extra';
import parse from 'csv-parse/lib/sync';
import iconvlite from 'iconv-lite';
import logger from './logger';
import { EventEmitter } from 'events';

export const parseCSV = async (csvPath: string): Promise<Array<object>> => {
    const csvData = await fs.readFile(csvPath, 'binary');

    logger.info(`Data size...${csvData.length}`, csvData.length);
    const encodedData = iconvlite.decode(csvData, 'win1251');
    logger.info('Data encoded...');

    const csvParams = {
        auto_parse: true, // Ensuresolve that numeric values remain numeric
        columns: true,
        delimiter: ';',
        quote: '"',
        relax: true,
        rowDelimiter: '\r\n',
        skip_empty_lines: true,
    };

    return parse(encodedData, csvParams);
};
