export interface FilterAbstractModel {
    getFilters: () => {
        [key: string]: any;
    };
    getFieldsToSelect: () => string;
    getValuesToSelect: (nameIs: string) => any;

}

export default class FilterModel implements FilterAbstractModel {
    constructor(private readonly filters: {}) {
        if (Object.keys(this.filters).length === 0) {
            throw new Error('No se puede crear un filtro vacío');
        }
    }

    getFieldsToSelect = () => {
        return Object.keys(this.filters).join(', ');
    };


    getValuesToSelect = (nameIs: string): any[] => {
        return Object.entries(this.filters)
            .filter(([key]) => key === nameIs)
            .map(([, value]) => value);
    };


    getFilters = () => {
        return this.filters;
    };
}
