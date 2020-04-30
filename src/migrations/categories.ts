import { parseCSV } from '../csv';
import { Mongo } from '../mongodb';
import logger from '../logger';

interface Category {
    uid: string;
    name: string;
    alias: string;
    active: string;
}

const bootstrap = async (): Promise<void> => {
    const client = await Mongo.connect();
    const db = client.db('fitration');

    const ProductCategory = db.collection('ProductCategory');

    const rows = await parseCSV('/mnt/d/EDEN Google Drive/csv/root-sections.csv');

    const categories = <Array<Category>>rows;

    for (const category of categories) {
        try {
            const { uid, name, alias, active } = category;

            await ProductCategory.updateOne({ _id: uid }, {
                $set: {
                    name: {
                        type: 'MLValue',
                        data: {
                            ru: name,
                        },
                    },
                    alias,
                    active: Boolean(Number(active)),
                },
            }, { upsert: true });
        } catch (e) {
            logger.error(`Error: (${category.uid}) ${e}`);
        }
    }
};

bootstrap().then(() => {
    process.exit();
});
