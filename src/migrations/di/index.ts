import { Mongo } from '../../mongodb';
import logger from '../../logger';
import intakesArray from './daily-intake.json';
import shortid from 'shortid';
import { snakeToCamel } from '@deepvision/tool-kit';

interface DailyIntake {
    id: string;
    gender: string;
    activity: string;
    age: string;
    energy: string;
    protein: string;
    fats: string;
    fatty_acid_unsaturated: string;
    fatty_acid_polyuns: string;
    linoleic_acid: string;
    alpha_linoleic_acid: string;
    phospholipids: string;
    carbohydrates: string;
    fibers: string;
    vit_c: string;
    tiamin: string;
    riboflavin: string;
    vit_b6: string;
    niacin: string;
    vit_b12: string;
    folates: string;
    pantothenic_acid: string;
    biotin: string;
    vit_a: string;
    beta_carotene: string;
    choline: string;
    vit_e: string;
    vit_d: string;
    vit_k: string;
    ca: string;
    p: string;
    mg: string;
    k: string;
    na: string;
    cl: string;
    fe: string;
    zn: string;
    i: string;
    cu: string;
    mn: string;
    se: string;
    cr: string;
    mo: string;
    f: string;
    animal_protein: string;
    protein_percent: string;
    fats_percent: string;
    carbohydrates_percent: string;
    sugar_percent: string;
}

const intakes: Array<DailyIntake> = intakesArray;

const bootstrap = async (): Promise<void> => {
    const client = await Mongo.connect();
    const db = client.db('fitration');

    const DailyIntake = db.collection('DailyIntake');

    for (const intake of intakes) {
        const {
            gender,
            age,
            ...data
        } = intake;

        const modifiedData = {};
        for (const [key, value] of Object.entries(data)) {
            modifiedData[snakeToCamel(key)] = value === null ? null : Number(value);
        }

        await DailyIntake.insertOne({
            _id: shortid.generate(),
            gender,
            age,
            ...modifiedData,
        });
    }
};

bootstrap().then(() => {
    process.exit();
});
