import { QueryResult } from "pg";
import { DevConsole } from "std-node";
import { DB } from "..";
import { TableBase } from "../interfaces/tables/TableBase";

export class Query {

    public static create<T>(query: string, params?: any[]): Promise<QueryResult<T>> {
        return new Promise((resolve, reject) => DB.connect((error, client, release) => {
            if (error) {
                DevConsole.error(error);

                release();
                reject(error);
            } else {
                client.query(query, params).then((result) => {
                    release();
                    resolve(result);
                }).catch((error) => {
                    DevConsole.error(error);

                    release();
                    reject(error);
                });
            }
        }));
    }

    public static async update<T extends TableBase>(object: Partial<T>, table: string, uuid: string): Promise<void> {
        const map = new Map<string, string>(Object.entries(object).filter(([ _, value ]) => typeof value != "undefined"));

        return new Promise((resolve, reject) => {
            if (map.size) {
                Query.create<void>(
                    `UPDATE ${table} SET ${[...map.keys()].map((key, index) => `${key} = $${index + 2}`)} WHERE uuid = $1`, [
                        uuid, ...map.values()
                    ]
                ).then(() => resolve()).catch(reject);
            } else {
                reject();
            }
        });
    }
}