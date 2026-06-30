import {
    CreateOptions,
    DeleteResult,
    FlattenMaps,
    HydratedDocument,
    Model,
    MongooseUpdateQueryOptions,
    PopulateOptions,
    ProjectionType,
    QueryOptions,
    RootFilterQuery,
    Types,
    UpdateQuery,
    UpdateWriteOpResult
} from "mongoose";

export type Lean<T> = HydratedDocument<FlattenMaps<T>>

export abstract class DatabaseRepository<Tdocument> {
    constructor(protected readonly model: Model<Tdocument>) {

    }

    /**
     * Inserts multiple documents into the database using a bulk insert operation.
     * 
     * @param NamedParam Object containing the data to insert.
     * @param NamedParam.data Array of partial document objects to insert.
     * @returns A promise that resolves to an array of hydrated documents, or undefined if the operation fails.
     */
    async insertMany({ data }: {
        data: Partial<Tdocument>[]
    }): Promise<HydratedDocument<Tdocument>[] | undefined> {
        return await this.model.insertMany(data) as HydratedDocument<Tdocument>[]
    }

    /**
     * Creates one or more documents in the database. Unlike insertMany, this triggers pre-save and post-save hooks.
     * 
     * @param NamedParam Object containing the creation data and options.
     * @param NamedParam.data Array of partial document objects to create.
     * @param NamedParam.options Mongoose options to apply to the creation operation.
     * @returns A promise that resolves to an array of hydrated documents, or undefined if the creation fails.
     */
    async create({ data, options }: {
        data: Partial<Tdocument>[],
        options?: CreateOptions
    }): Promise<HydratedDocument<Tdocument>[] | undefined> {
        return await this.model.create(data, options)
    }

    /**
     * Deletes a single document matching the specified filter criteria.
     * 
     * @param NamedParam Object containing the filter criteria.
     * @param NamedParam.filter Root filter query to identify the document to delete.
     * @returns A promise that resolves to the result of the delete operation.
     */
    async deleteOne({ filter }:
        {
            filter: RootFilterQuery<Tdocument>,
        })
        : Promise<DeleteResult> {
        return await this.model.deleteOne(filter)
    }

    /**
     * Deletes multiple documents matching the specified filter criteria.
     * 
     * @param NamedParam Object containing the filter criteria.
     * @param NamedParam.filter Root filter query to identify the documents to delete.
     * @returns A promise that resolves to the result of the delete operation.
     */
    async deleteMany({ filter }:
        {
            filter: RootFilterQuery<Tdocument>,
        })
        : Promise<DeleteResult> {
        return await this.model.deleteMany(filter)
    }

    /**
     * Updates a single document matching the specified filter criteria and increments the document version (__v).
     * 
     * @param NamedParam Object containing the filter, update payload, and query options.
     * @param NamedParam.filter Root filter query to find the target document.
     * @param NamedParam.update The update query payload.
     * @param NamedParam.options Optional settings for the update operation.
     * @returns A promise that resolves to the update write operation result.
     */
    async updateOne({ filter, update, options }:
        {
            filter: RootFilterQuery<Tdocument>,
            update: UpdateQuery<Tdocument>,
            options?: MongooseUpdateQueryOptions<Tdocument>
        })
        : Promise<UpdateWriteOpResult> {

        if (Array.isArray(update)) {
            update.push({
                $set: { __v: { $add: ['$__v', 1] } }
            }
            )
            return await this.model.updateOne(filter || {}, update, options)
        }

        const finalUpdate: any = { ...update };
        finalUpdate.$inc = { ...(finalUpdate.$inc || {}), __v: 1 };
        return await this.model.updateOne(filter || {}, finalUpdate, options)
    }

    /**
     * Finds a single document by its ObjectId, updates it, and increments the document version (__v).
     * 
     * @param NamedParam Object containing the target document ID, update payload, and query options.
     * @param NamedParam.id The unique ObjectId of the document.
     * @param NamedParam.update The update query payload.
     * @param NamedParam.options Optional settings for the query (defaults to `{ new: true }` to return the updated document).
     * @returns A promise that resolves to the hydrated or lean document, or null if not found.
     */
    async findByIdAndUpdate({ id, update, options = { new: true } }:
        {
            id: Types.ObjectId
            update: UpdateQuery<Tdocument>,
            options?: QueryOptions<Tdocument>
        })
        : Promise<HydratedDocument<Tdocument> | Lean<Tdocument> | null> {

        const finalUpdate: any = { ...update };
        finalUpdate.$inc = { ...(finalUpdate.$inc || {}), __v: 1 };
        return await this.model.findByIdAndUpdate(id, finalUpdate, options)
    }

    /**
     * Finds a single document matching the filter query, updates it, and increments the document version (__v).
     * 
     * @param NamedParam Object containing the filter, update payload, and query options.
     * @param NamedParam.filter Root filter query to find the target document.
     * @param NamedParam.update The update query payload.
     * @param NamedParam.options Optional settings for the query (defaults to `{ new: true }` to return the updated document).
     * @returns A promise that resolves to the hydrated or lean document, or null if not found.
     */
    async findOneAndUpdate({ filter, update, options = { new: true } }:
        {
            filter: RootFilterQuery<Tdocument>
            update: UpdateQuery<Tdocument>,
            options?: QueryOptions<Tdocument>
        })
        : Promise<HydratedDocument<Tdocument> | Lean<Tdocument> | null> {

        const finalUpdate: any = { ...update };
        finalUpdate.$inc = { ...(finalUpdate.$inc || {}), __v: 1 };
        return await this.model.findOneAndUpdate(filter, finalUpdate, options)
    }

    /**
     * Retrieves a single document by its unique ObjectId with optional projection and population.
     * 
     * @param NamedParam Object containing the document ID, projection selection, and query options.
     * @param NamedParam.id The unique ObjectId of the document.
     * @param NamedParam.select Projection fields to include or exclude from the result.
     * @param NamedParam.options Optional mongoose query options (such as lean, populate, etc.).
     * @returns A promise that resolves to the plain lean map, hydrated document, or null if not found.
     */
    async findById({ id, select, options }:
        {
            id: Types.ObjectId,
            select?: ProjectionType<Tdocument>,
            options?: QueryOptions
        })
        : Promise<FlattenMaps<Tdocument> | HydratedDocument<Tdocument> | null> {

        const doc = this.model.findById(id, undefined, options).select(select || '')
        if (options?.lean) {
            doc.lean(options.lean)
        }
        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[])
        }
        return await doc.exec()
    }

    /**
     * Finds a document by its unique ObjectId and deletes it.
     * 
     * @param NamedParam Object containing the document ID and options.
     * @param NamedParam.id The unique ObjectId of the document to delete.
     * @param NamedParam.options Optional settings for the deletion operation.
     * @returns A promise that resolves to the deleted document (hydrated or lean), or null if not found.
     */
    async findByIdAndDelete({ id, options }:
        {
            id: Types.ObjectId,
            options?: QueryOptions
        })
        : Promise<FlattenMaps<Tdocument> | HydratedDocument<Tdocument> | null> {

        return await this.model.findByIdAndDelete(id, options)
    }

    /**
     * Finds a single document matching the filter criteria and deletes it.
     * 
     * @param NamedParam Object containing the filter query and options.
     * @param NamedParam.filter Root filter query to locate the target document.
     * @param NamedParam.options Optional settings for the deletion operation.
     * @returns A promise that resolves to the deleted document (hydrated or lean), or null if not found.
     */
    async findOneAndDelete({ filter, options }:
        {
            filter: RootFilterQuery<Tdocument>,
            options?: QueryOptions
        })
        : Promise<FlattenMaps<Tdocument> | HydratedDocument<Tdocument> | null> {

        return await this.model.findOneAndDelete(filter, options)
    }

    /**
     * Finds a single document matching the specified filter criteria with optional projection, population, and query options.
     * 
     * @param NamedParam Object containing the filter, projection, and query options.
     * @param NamedParam.filter Root filter query to find the document.
     * @param NamedParam.select Projection fields to include or exclude from the result.
     * @param NamedParam.options Optional mongoose query options (such as lean, populate, etc.).
     * @returns A promise that resolves to the hydrated document, lean object, or null if not found.
     */
    async findOne({ filter, select, options }:
        {
            filter: RootFilterQuery<Tdocument>,
            select?: ProjectionType<Tdocument>,
            options?: QueryOptions
        })
        : Promise<FlattenMaps<Tdocument> | HydratedDocument<Tdocument> | null> {

        const doc = this.model.findOne(filter, undefined, options).select(select || '')
        if (options?.lean) {
            doc.lean(options.lean)
        }
        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[])
        }
        return await doc.exec()
    }

    /**
     * Retrieves multiple documents matching the filter criteria with optional projection, sorting, limiting, skipping, and population.
     * 
     * @param NamedParam Object containing the filter, selection, and query options.
     * @param NamedParam.filter Root filter query to find matching documents.
     * @param NamedParam.select Projection fields to include or exclude.
     * @param NamedParam.options Optional mongoose query options (such as populate, lean, limit, skip, sort, etc.).
     * @returns A promise that resolves to an array of hydrated documents or lean objects, or null.
     */
    async find({ filter, select, options }:
        {
            filter: RootFilterQuery<Tdocument>,
            select?: ProjectionType<Tdocument> | undefined,
            options?: QueryOptions<Tdocument> | undefined
        })
        : Promise<FlattenMaps<Tdocument>[] | HydratedDocument<Tdocument>[] | null> {

        const doc = this.model.find(filter, undefined, options).select(select || '')
        if (options?.populate) {
            doc.populate(options.populate as PopulateOptions[])
        }
        if (options?.lean) {
            doc.lean(options.lean)
        }
        if (options?.limit) {
            doc.limit(options.limit)
        }
        if (options?.skip) {
            doc.skip(options.skip)
        }
        return await doc.exec()
    }

    /**
     * Performs a paginated search for multiple documents, returning both results and pagination metadata (currentPage, total pages, etc.).
     * 
     * @param NamedParam Object containing the filter, projection selection, options, and page/size values.
     * @param NamedParam.filter Root filter query to match documents.
     * @param NamedParam.select Projection fields to include or exclude.
     * @param NamedParam.options Optional query options (e.g. sort, populate).
     * @param NamedParam.page Current page number or 'all' to disable pagination (defaults to 'all').
     * @param NamedParam.size Number of documents per page (defaults to 5).
     * @returns A promise that resolves to an object containing pagination metadata (docsCount, pages, limit, currentPage) and the results array.
     */
    async paginate({ filter = {}, select, options = {}, page = 'all', size = 5 }:
        {
            filter: RootFilterQuery<Tdocument>,
            select?: ProjectionType<Tdocument> | undefined,
            options?: QueryOptions<Tdocument> | undefined,
            page?: number | 'all',
            size?: number
        })
        : Promise<FlattenMaps<Tdocument>[] | HydratedDocument<Tdocument>[] | any> {
        let docsCount: number | undefined = undefined
        let pages: number | undefined = undefined

        if (page !== 'all') {
            page = Math.floor(page < 1 ? 1 : page)
            options.limit = Math.floor(size < 1 || !size ? 5 : size)
            options.skip = (page - 1) * size

            docsCount = await this.model.countDocuments(filter)
            pages = Math.ceil(docsCount / options.limit)
        }
        const result = await this.find({ filter, options, select })
        return { docsCount, pages, limit: options.limit, currentPage: page !== 'all' ? page : undefined, result }
    }
}