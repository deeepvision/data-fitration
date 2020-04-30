import { Mongo } from '../../mongodb';
import logger from '../../logger';
import measures from './measures.json';

interface Measure {
    id: string;
    name: string;
    code: string;
}

const bootstrap = async (): Promise<void> => {
    const client = await Mongo.connect();
    const db = client.db('fitration');

    const Measure = db.collection('Measure');

    for (const measure of measures) {
        try {
            const { id, code, name } = <Measure>measure;

            await Measure.updateOne({ _id: code }, {
                $set: {
                    name: {
                        type: 'MLValue',
                        data: {
                            ru: JSON.parse(`"${name}"`),
                        },
                    },
                },
            }, { upsert: true });
        } catch (e) {
            logger.error(`Error: (${measure.code}) ${e}`);
        }
    }
};

bootstrap().then(() => {
    process.exit();
});
