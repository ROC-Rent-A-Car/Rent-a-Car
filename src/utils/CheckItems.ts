import { DateRangeResponse } from "../interfaces/responses/DateRangeResponse";
import { RentItem } from "../interfaces/tables/RentItem";
import { Query } from "./Query";

export class CheckItems {

    static getCarHiredDateRanges(uuid: string): Promise<DateRangeResponse[]> {
        return new Promise((resolve, reject) => Query.create<RentItem>(`
            SELECT * 
            FROM rent_items 
            WHERE car = $1 AND ((rent_from::DATE - 3)::TIMESTAMP > now() OR (rent_from::DATE + days + 1)::TIMESTAMP > now())
        `, [ uuid ]).then(({ rows }) => {
            resolve(rows.map((row) => {
                const date = new Date(row.rent_from);

                return {
                    from: +date,
                    to: date.setDate(date.getDate() + row.days)
                };
            }));
        }).catch(reject));
    }

    static isCarAvailable(uuid: string, from: number, to: number): Promise<boolean> {
        return new Promise((resolve, reject) => CheckItems.getCarHiredDateRanges(uuid).then((ranges) => resolve(!ranges.some((range) => {
            const fromDate = new Date(range.from);
            const toDate = new Date(range.to);

            fromDate.setDate(fromDate.getDate() - 3);
            toDate.setDate(toDate.getDate() + 1);

            return (
                +fromDate <= from &&
                +toDate >= from
            ) || (
                +fromDate <= to &&
                +toDate >= to
            ) || (
                +fromDate >= from &&
                +toDate <= to
            );
        }))).catch(reject));
    }
}