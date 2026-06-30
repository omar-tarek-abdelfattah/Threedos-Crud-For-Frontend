"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepository = void 0;
class DatabaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async insertMany({ data }) {
        return await this.model.insertMany(data);
    }
    async create({ data, options }) {
        return await this.model.create(data, options);
    }
    async deleteOne({ filter }) {
        return await this.model.deleteOne(filter);
    }
    async deleteMany({ filter }) {
        return await this.model.deleteMany(filter);
    }
    async updateOne({ filter, update, options }) {
        if (Array.isArray(update)) {
            update.push({
                $set: { __v: { $add: ['$__v', 1] } }
            });
            return await this.model.updateOne(filter || {}, update, options);
        }
        const finalUpdate = { ...update };
        finalUpdate.$inc = { ...(finalUpdate.$inc || {}), __v: 1 };
        return await this.model.updateOne(filter || {}, finalUpdate, options);
    }
    async findByIdAndUpdate({ id, update, options = { new: true } }) {
        const finalUpdate = { ...update };
        finalUpdate.$inc = { ...(finalUpdate.$inc || {}), __v: 1 };
        return await this.model.findByIdAndUpdate(id, finalUpdate, options);
    }
    async findOneAndUpdate({ filter, update, options = { new: true } }) {
        const finalUpdate = { ...update };
        finalUpdate.$inc = { ...(finalUpdate.$inc || {}), __v: 1 };
        return await this.model.findOneAndUpdate(filter, finalUpdate, options);
    }
    async findById({ id, select, options }) {
        const doc = this.model.findById(id, undefined, options).select(select || '');
        if (options?.lean) {
            doc.lean(options.lean);
        }
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async findByIdAndDelete({ id, options }) {
        return await this.model.findByIdAndDelete(id, options);
    }
    async findOneAndDelete({ filter, options }) {
        return await this.model.findOneAndDelete(filter, options);
    }
    async findOne({ filter, select, options }) {
        const doc = this.model.findOne(filter, undefined, options).select(select || '');
        if (options?.lean) {
            doc.lean(options.lean);
        }
        if (options?.populate) {
            doc.populate(options.populate);
        }
        return await doc.exec();
    }
    async find({ filter, select, options }) {
        const doc = this.model.find(filter, undefined, options).select(select || '');
        if (options?.populate) {
            doc.populate(options.populate);
        }
        if (options?.lean) {
            doc.lean(options.lean);
        }
        if (options?.limit) {
            doc.limit(options.limit);
        }
        if (options?.skip) {
            doc.skip(options.skip);
        }
        return await doc.exec();
    }
    async paginate({ filter = {}, select, options = {}, page = 'all', size = 5 }) {
        let docsCount = undefined;
        let pages = undefined;
        if (page !== 'all') {
            page = Math.floor(page < 1 ? 1 : page);
            options.limit = Math.floor(size < 1 || !size ? 5 : size);
            options.skip = (page - 1) * size;
            docsCount = await this.model.countDocuments(filter);
            pages = Math.ceil(docsCount / options.limit);
        }
        const result = await this.find({ filter, options, select });
        return { docsCount, pages, limit: options.limit, currentPage: page !== 'all' ? page : undefined, result };
    }
}
exports.DatabaseRepository = DatabaseRepository;
