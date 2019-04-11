const graphql = require('graphql');
const _ = require('lodash');

const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = graphql;

const users = [
    { id: '23', userName: 'Bill', password: 'Bill20', address: '123 street' },
    {
        id: '47',
        userName: 'Samantha',
        password: 'sam032',
        address: 'sam street',
    },
];

const products = [
    { id: '1', name: 'Books', price: 249, stock: 99 },
    { id: '2', name: 'Pen', price: 49, stock: 299 },
];

const transactions = [
    {
        id: '1',
        quantity: 2,
        user_id: '23',
        date: '06/06/2019',
        address_id: '2233',
        currency: 'USD',
        status: 'Success',
    },
    {
        id: '2',
        quantity: 56,
        user_id: '47',
        date: '06/16/2019',
        address_id: '4433',
        currency: 'INR',
        status: 'Failed',
    },
];

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLString },
        userName: { type: GraphQLString },
        password: { type: GraphQLString },
        address: { type: GraphQLString },
    },
});

const ProductType = new GraphQLObjectType({
    name: 'product',
    fields: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        price: { type: GraphQLInt },
        stock: { type: GraphQLInt },
    },
});

const TransactionType = new GraphQLObjectType({
    name: 'Transaction',
    fields: {
        id: { type: GraphQLString },
        quantity: { type: GraphQLInt },
        user_id: { type: GraphQLString },
        date: { type: GraphQLString },
        address_id: { type: GraphQLString },
        currency: { type: GraphQLString },
        status: { type: GraphQLString },
    },
});

// const RootQuery = new GraphQLObjectType({
//     name: 'RootQuryType',
//     fields: {
//         user: {
//             type: UserType,
//             args: { id: { type: GraphQLString } },
//             resolve(parentValue, args) {
//                 return _.find(users, { id: args.id });
//             },
//         },
//     },
// });

const RootQuery = new GraphQLObjectType({
    name: 'RootQuryType',
    fields: () => ({
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return _.find(users, { id: args.id });
            },
        },
        product: {
            type: ProductType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return _.find(products, { id: args.id });
            },
        },
        transaction: {
            type: TransactionType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return _.find(transactions, { id: args.id });
            },
        },
    }),
});

module.exports = new GraphQLSchema({
    query: RootQuery,
});
