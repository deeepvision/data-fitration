import { Mongo } from '../../mongodb';
import logger from '../../logger';
import measures from '../measures/measures.json';
import groups from './nutrients-groups.json';
import nutrients from './nutrients.json';

interface Measure {
    id: string;
    name: string;
    code: string;
}

interface Group {
    id: string;
    name: string;
    code: string;
}

interface Nutrient {
    id: string;
    code: string;
    name: string;
    simple_name: string;
    group_id: string;
    group_code: string;
    measure_id: string;
    active: string;
    description: string;
}

const bootstrap = async (): Promise<void> => {
    const client = await Mongo.connect();
    const db = client.db('fitration');

    const Nutrient = db.collection('Nutrient');
    const NutrientGroup = db.collection('NutrientGroup');

    for (const group of groups) {
        const { code, name } = <Group>group;

        await NutrientGroup.updateOne({ _id: code }, {
            $set: {
                name: {
                    type: 'MLValue',
                    data: {
                        ru: JSON.parse(`"${name}"`),
                    },
                },
            },
        }, { upsert: true });
    }

    for (const n of nutrients) {
        const nutrient = <Nutrient>n;

        const group = groups.find((g) => g.id === nutrient.group_id);
        const measure = measures.find((m) => m.id === nutrient.measure_id);

        await Nutrient.updateOne({ _id: nutrient.code }, {
            $set: {
                simpleName: nutrient.simple_name,
                name: {
                    type: 'MLValue',
                    data: {
                        ru: JSON.parse(`"${nutrient.name}"`),
                    },
                },
                description: {
                    type: 'MLValue',
                    data: {
                        ru: JSON.parse(`"${nutrient.description}"`),
                    },
                },
                groupId: group.code,
                measureId: measure.code,
                active: Boolean(Number(nutrient.active)),
            },
        }, { upsert: true });
    }
};

bootstrap().then(() => {
    process.exit();
});
