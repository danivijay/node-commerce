const Express = require('express');
const ExpressGraphQL = require('express-graphql');
const Mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
var graphqlHTTP = require('express-graphql');

function loggingMiddleware(req, res, next) {
    console.log('loggingmiddleware:', req.headers.authorization);
    if (req.headers.authorization) {
        var verifiedJwt = jwt.verify(req.headers.authorization, 'secretkey');
        console.log('verifiedJwt:', verifiedJwt);
        next();
    } else {
        next();
    }
}

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

//Mongoose.connect('mongodb://localhost/thepolyglotdeveloper');
Mongoose.connect('mongodb://localhost/node_commerce_db');

const UserModel = Mongoose.model('user', {
    userName: String,
    userType: String,
    password: String,
    address: String,
    email: String,
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
    product_id: String,
    date: String,
    currency: String,
    status: String,
});

//jwt verifying function
function jwtverify(token) {
    var verify;
    if (jwt.verify(token, 'secretkey')) {
        verify = 'success';
    } else {
        verify = 'failure';
    }
    return verify;
}

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLID },
        userName: { type: GraphQLString },
        userType: { type: GraphQLString },
        password: { type: GraphQLString },
        email: { type: GraphQLString },
        address: { type: GraphQLString },
    },
});

const loginUserType = new GraphQLObjectType({
    name: 'LoginUser',
    fields: {
        id: { type: GraphQLID },
        userName: { type: GraphQLString },
        password: { type: GraphQLString },
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
        user_id: { type: GraphQLID },
        product_id: { type: GraphQLID },
        date: { type: GraphQLString },
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
                    // id: { type: GraphQLNonNull(GraphQLID) },
                    id: { type: GraphQLNonNull(GraphQLString) },
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
            deleteproduct: {
                type: ProductType,
                args: {
                    id: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    return ProductModel.findByIdAndDelete(args.id).exec();
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
            transactions: {
                type: GraphQLList(TransactionType),
                resolve: (root, args, context, info, req) => {
                    return TransactionModel.find().exec();
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
                    userType: { type: GraphQLNonNull(GraphQLString) },
                    password: { type: GraphQLNonNull(GraphQLString) },
                    email: { type: GraphQLNonNull(GraphQLString) },
                    address: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    var user = new UserModel(args);
                    return user.save();
                },
            },
            login: {
                type: loginUserType,
                args: {
                    userName: { type: GraphQLNonNull(GraphQLString) },
                    password: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    var user = new UserLoginModel(args);

                    var promise1 = Promise.resolve(
                        UserModel.find({ userName: args.userName }).exec(),
                    );
                    return promise1.then(function(value) {
                        if (
                            value[0] &&
                            args.userName === value[0].userName &&
                            args.password === value[0].password
                        ) {
                            console.log('success::', 'true');
                            const JWTToken = jwt.sign(
                                {
                                    userName: args.userName,
                                    password: args.password,
                                },
                                'secretkey',
                                {
                                    expiresIn: '2h',
                                },
                            );

                            user.userName = 'Success:true';
                            user.password = JWTToken;
                            return user;
                        } else {
                            console.log('success::', 'false');
                            user.userName = 'incorrect username or password';
                            user.password = 'incorrect username or password';
                            return user;
                        }
                    });
                    // return user;
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
                    product_id: { type: GraphQLNonNull(GraphQLString) },
                    date: { type: GraphQLNonNull(GraphQLString) },
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
app.use(loggingMiddleware);
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
