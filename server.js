const Express = require('express');
const ExpressGraphQL = require('express-graphql');
const Mongoose = require('mongoose');
const cors = require('cors');
//const schema = require('./schema/schema');

const {
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLSchema,
} = require('graphql');

var app = Express();

app.use(cors());

Mongoose.connect('mongodb://localhost/thepolyglotdeveloper');

const UserModel = Mongoose.model('user', {
    userName: String,
    password: String,
    // address: String,
});

const UserLoginModel = Mongoose.model('userlogin', {
    userName: String,
    password: String,
});

const ProductModel = Mongoose.model('product', {
    name: String,
    price: Number,
    stock: Number,
});

const TransactionModel = Mongoose.model('transaction', {
    quantity: Number,
    user_id: String,
    date: String,
    address_id: String,
    currency: String,
    status: String,
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLID },
        userName: { type: GraphQLString },
        password: { type: GraphQLString },
        // address: { type: GraphQLString },
    },
});

const ProductType = new GraphQLObjectType({
    name: 'Product',
    fields: {
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        price: { type: GraphQLInt },
        stock: { type: GraphQLInt },
    },
});

const TransactionType = new GraphQLObjectType({
    name: 'Transaction',
    fields: {
        id: { type: GraphQLID },
        quantity: { type: GraphQLInt },
        user_id: { type: GraphQLString },
        date: { type: GraphQLString },
        address_id: { type: GraphQLString },
        currency: { type: GraphQLString },
        status: { type: GraphQLString },
    },
});

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'Query',
        fields: {
            users: {
                type: GraphQLList(UserType),
                resolve: (root, args, context, info) => {
                    return UserModel.find().exec();
                },
            },
            products: {
                type: GraphQLList(ProductType),
                resolve: (root, args, context, info) => {
                    return ProductModel.find().exec();
                },
            },
            user: {
                type: UserType,
                args: {
                    id: { type: GraphQLNonNull(GraphQLID) },
                },
                resolve: (root, args, context, info) => {
                    return UserModel.findById(args.id).exec();
                },
            },
            product: {
                type: ProductType,
                args: {
                    id: { type: GraphQLNonNull(GraphQLID) },
                },
                resolve: (root, args, context, info) => {
                    return ProductModel.findById(args.id).exec();
                },
            },
            transaction: {
                type: TransactionType,
                args: {
                    id: { type: GraphQLNonNull(GraphQLID) },
                },
                resolve: (root, args, context, info) => {
                    return TransactionModel.findById(args.id).exec();
                },
            },
        },
    }),
    mutation: new GraphQLObjectType({
        name: 'Mutation',
        fields: {
            user: {
                type: UserType,
                args: {
                    userName: { type: GraphQLNonNull(GraphQLString) },
                    password: { type: GraphQLNonNull(GraphQLString) },
                    // address: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    var user = new UserModel(args);
                    return user.save();
                },
            },
            login: {
                type: UserType,
                args: {
                    userName: { type: GraphQLNonNull(GraphQLString) },
                    password: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    var user = new UserLoginModel(args);
                    // return user.save();

                    console.log('args:', user);
                    if (
                        user.userName === 'admin' &&
                        user.password === 'ecart'
                    ) {
                        console.log('success::', 'true');
                        console.log('user:', user);
                        return user;
                    } else {
                        console.log('success::', 'false');
                        return { success: 'false' };
                    }
                },
            },
            product: {
                type: ProductType,
                args: {
                    name: { type: GraphQLNonNull(GraphQLString) },
                    price: { type: GraphQLNonNull(GraphQLInt) },
                    stock: { type: GraphQLNonNull(GraphQLInt) },
                },
                resolve: (root, args, context, info) => {
                    var product = new ProductModel(args);
                    return product.save();
                },
            },
            transaction: {
                type: TransactionType,
                args: {
                    quantity: { type: GraphQLNonNull(GraphQLInt) },
                    user_id: { type: GraphQLNonNull(GraphQLString) },
                    date: { type: GraphQLNonNull(GraphQLString) },
                    address_id: { type: GraphQLNonNull(GraphQLString) },
                    currency: { type: GraphQLNonNull(GraphQLString) },
                    status: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    var transaction = new TransactionModel(args);
                    return transaction.save();
                },
            },
        },
    }),
});

// app.use(
//     '/graphql',
//     expressGraphQL({
//         schema,
//         graphiql: true,
//     }),
// );

app.use(
    '/graphql',
    ExpressGraphQL({
        schema: schema,
        graphiql: true,
    }),
);

app.listen(4000, () => {
    console.log('Listening at :4000...');
});
