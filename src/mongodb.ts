import { MongoClient } from 'mongodb';

export class Mongo {
    public static client: MongoClient;

    public static async connect(): Promise<MongoClient> {
        return new Promise((resolve, reject) => {
            MongoClient.connect('mongodb://root:root@localhost:27018', {}, (err, client) => {
                if (err) {
                    reject(err);
                }

                Mongo.client = client;
                resolve(client);
            });
        });
    }

    public static disconnect(): void {
        Mongo.client.close();
    }
}
