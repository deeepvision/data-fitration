/* eslint-disable */
import CyrillicToTranslit from 'cyrillic-to-translit-js';
import { parseCSV } from '../../csv';
import minimist from 'minimist';
import logger from '../../logger';
import categories from './categories.json';
import nutrients from './nutrients.json';
import { Mongo } from '../../mongodb';
import shortid from 'shortid';
import { snakeToCamel } from '@deepvision/tool-kit';

const argv = minimist(process.argv.slice(2));
const { category } = argv;

if (!category) {
    logger.error('Category must be specified (npm run products -- --category 1)');
    process.exit();
}

interface Product {
    id_product: string;
    uid: string;
    name: string;
    alias: string;
    detail_divider_number: string;
    articul: string;
    image_author: string;
    image_license: string;
    image_source: string;
    full_name: string;
    type_of_product: string;
    heat_treatment: string;
}

const bootstrap = async (): Promise<void> => {
    const categoryInfo = categories.find((c) => c.id === String(category));

    if (!categoryInfo) {
        logger.error(`Category ${category} not found`);
        process.exit();
    }

    const client = await Mongo.connect();
    const db = client.db('fitration');

    const Product = db.collection('Product');
    const rows = await parseCSV(`/mnt/d/EDEN Google Drive/csv/${categoryInfo.csvFileName}`);

    const products = <Array<Product>>rows;

    for (const product of products) {
        if (!product || !product.uid) {
            logger.warn('uid must be specified');
            return;
        }

        if (!product.name) {
            product.name = '2';
        }    

        if (!product.detail_divider_number) {
            product.detail_divider_number = product.name;
        }

        const detailPageNameDivider = parseInt(product.detail_divider_number) || 0;
        const { articul } = product;

        const imageId = shortid.generate();
        const image = {
            "ext": "jpg",
            "id": `${imageId}-C`,
            "mimeType": "image/jpeg",
            "url": `https://img.fitration.com/images/products/${product.id_product}/cropped_mw.jpg`,
            "name": "PLZqWwu8n.cropped.jpg",
            "props": {
                "parentId": imageId,
                "parentUrl": `https://img.fitration.com/images/products/${product.id_product}/original_mw.jpg`,
                author: product.image_author,
                license: product.image_license,
                source: product.image_source,
            }
        }

        const fullName = product.full_name;
        const formattedName = fullName.replace(/[^a-zA-Z0-9а-яА-Я- ]/gu, '').replace(/[-]{2,}/gu, '-');
    
        let alias = new CyrillicToTranslit().transform(formattedName.toLowerCase(), '-');
    
        alias = alias.replace(/[^a-zA-Z0-9а-яА-Я- ]/gu, '');

        const input = {
            alias,
            image,
            name: {
                type: 'MLValue',
                data: {
                    ru: product.full_name,
                }
            },
            nameDivider: parseInt(product.name, 10),
            articul,
            categoryId: categoryInfo.uid,
            detailDividerNumber: detailPageNameDivider,
    
            type: parseInt(product.type_of_product),
            heatTreatment: parseInt(product.heat_treatment),
            kOnePriece: 0,
        };

        const koefsNames = [
            'k_for_ml',
            'k_for_l',
            'k_for_tablespoon',
            'k_for_teaspoon',
            'k_for_cup',
            'k_for_glass',
            'k_for_1_piece',
        ];
    
        const koefCamelNames = {
            'k_for_ml': 'kMl',
            'k_for_l': 'kL',
            'k_for_tablespoon': 'kTablespoon',
            'k_for_teaspoon': 'kTeaspoon',
            'k_for_cup': 'kCup',
            'k_for_glass': 'kGlass',
            'k_for_1_piece': 'kOnePriece',
        }

        koefsNames.forEach((koefName) => {
            const koef = String(product[koefName]);
            if (koef && koef !== '--' && koef.length) {
                if (koefName === 'k_for_1_piece') {
                    const val = parseFloat(koef.replace(',', '.'));
                    if (val >= 0) {
                        input.kOnePriece = val;
                    }
                } else {
                    const val = parseFloat(koef.replace(',', '.'));
                    if (val >= 0) {
                        input[koefCamelNames[koefName]] = val;
                    }
                }
            }
        });

        for (const key of nutrients) {
            let value = product[key];
            if (value) {
                if (value === '--') {
                    input[snakeToCamel(key)] = null;
                } else {
                    value = value.toString().replace(',', '.');
                    value = parseFloat(value);
                    if (value >= 0) {
                        input[snakeToCamel(key)] = value;
                    } else {
                        logger.error(`(${product.uid}) Nutrient error: ${key}`);
                    }
                }
            }
        }

        console.log(`Insert: ${product.uid}`);
        await Product.updateOne({ _id: product.uid },{
            $set: input,
        }, { upsert: true });
    }
};

bootstrap().then(() => process.exit());
