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
    GraphQLInputObjectType,
    GraphQLSchema,
} = require('graphql');

var app = Express();

app.use(cors());

//Mongoose.connect('mongodb://localhost/thepolyglotdeveloper');
Mongoose.connect('mongodb://localhost/node_commerce_db');

const AddressModel = Mongoose.model('address', {
    country: String,
    fullName: String,
    mobileNo: String,
    pinCode: String,
    streetAddress: String,
    state: String,
    default: String,
});

const UserModel = Mongoose.model('user', {
    userName: { type: String, required: true },
    userType: { type: String, required: true },
    password: { type: String, required: true },
    address: [],
    email: { type: String, required: true },
});

const UserLoginModel = Mongoose.model('userlogin', {
    userName: String,
    password: String,
});

const ProductModel = Mongoose.model('product', {
    name: String,
    price: Number,
    stock: Number,
    owner_user_id: String,
});

const TransactionModel = Mongoose.model('transaction', {
    quantity: Number,
    user_id: String,
    product_id: String,
    date: String,
    currency: String,
    status: String,
    owner_user_id: String,
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

const createAddressInputType = new GraphQLInputObjectType({
    name: 'CreateAddressInput',
    fields: () => ({
        country: { type: GraphQLString },
        fullName: { type: GraphQLString },
        mobileNo: { type: GraphQLString },
        pinCode: { type: GraphQLString },
        streetAddress: { type: GraphQLString },
        state: { type: GraphQLString },
        default: { type: GraphQLString },
    }),
});

const AddressType = new GraphQLObjectType({
    name: 'AddressType',
    fields: {
        country: { type: GraphQLString },
        fullName: { type: GraphQLString },
        mobileNo: { type: GraphQLString },
        pinCode: { type: GraphQLString },
        streetAddress: { type: GraphQLString },
        state: { type: GraphQLString },
        default: { type: GraphQLString },
    },
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { type: GraphQLID },
        userName: { type: GraphQLString },
        userType: { type: GraphQLString },
        password: { type: GraphQLString },
        email: { type: GraphQLString },
        address: {
            type: GraphQLList(AddressType),
        },
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
        owner_user_id: { type: GraphQLString },
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
        owner_user_id: { type: GraphQLString },
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
            // products: {
            //     type: GraphQLList(ProductType),
            //     resolve: (root, args, context, info) => {
            //         return ProductModel.find().exec();
            //     },
            // },

            products: {
                type: GraphQLList(ProductType),
                args: {
                    criteria: { type: GraphQLNonNull(GraphQLInt) },
                    searchmode: { type: GraphQLNonNull(GraphQLInt) },
                    searchitem: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    if (args.criteria === 0) {
                        if (args.searchmode === 0)
                            return ProductModel.find().exec();
                        else {
                            return ProductModel.find({
                                name: args.searchitem,
                            }).exec();
                        }
                    } else {
                        if (args.criteria < 0) {
                            if (args.searchmode === 0) {
                                return ProductModel.find()
                                    .sort({ price: -1 })
                                    .exec();
                            } else {
                                return ProductModel.find({
                                    name: args.searchitem,
                                })
                                    .sort({ price: -1 })
                                    .exec();
                            }
                        } else {
                            if (args.searchmode === 0) {
                                return ProductModel.find()
                                    .sort({ price: 1 })
                                    .exec();
                            } else {
                                return ProductModel.find({
                                    name: args.searchitem,
                                })
                                    .sort({ price: 1 })
                                    .exec();
                            }
                        }
                    }
                },
            },

            // products: {
            //     type: GraphQLList(ProductType),
            //     args: {
            //         criteria: { type: GraphQLNonNull(GraphQLInt) },
            //     },
            //     resolve: (root, args, context, info) => {
            //         if (args.criteria === 0) return ProductModel.find().exec();
            //         else {
            //             if (args.criteria < 0) {
            //                 return ProductModel.find()
            //                     .sort({ price: -1 })
            //                     .exec();
            //             } else {
            //                 return ProductModel.find()
            //                     .sort({ price: 1 })
            //                     .exec();
            //             }
            //         }
            //     },
            // },

            products_owned_by_me: {
                type: GraphQLList(ProductType),
                args: {
                    user_id: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    return ProductModel.find({
                        owner_user_id: args.user_id,
                    }).exec();
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
                    id: { type: GraphQLNonNull(GraphQLString) },
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

            incarttransactions: {
                type: GraphQLList(TransactionType),
                args: {
                    user_id: { type: GraphQLNonNull(GraphQLString) },
                    status: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    return TransactionModel.find({
                        user_id: args.user_id,
                        status: args.status,
                    }).exec();
                },
            },

            user_my_products_transactions: {
                type: GraphQLList(TransactionType),
                args: {
                    user_id: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    return TransactionModel.find({
                        owner_user_id: args.user_id,
                    }).exec();
                },
            },
            transactions: {
                type: GraphQLList(TransactionType),

                resolve: (root, args, context, info, req) => {
                    return TransactionModel.find().exec();
                },
            },

            transactions_of_myproducts: {
                type: GraphQLList(TransactionType),
                args: {
                    owner_user_id: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info, req) => {
                    return TransactionModel.find({
                        owner_user_id: args.owner_user_id,
                    }).exec();
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
                    // address: { type: GraphQLNonNull(GraphQLString) },
                    address: {
                        type: GraphQLList(createAddressInputType),
                    },
                },
                resolve: (root, args, context, info) => {
                    var user = new UserModel(args);
                    user.save();

                    return user;
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
                    var usertype;
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
                                    userType: value[0].userType,
                                },
                                'secretkey',
                                {
                                    expiresIn: '2h',
                                },
                            );

                            user.userName = value[0].id;
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
            // product: {
            //     type: ProductType,
            //     args: {
            //         name: { type: GraphQLNonNull(GraphQLString) },
            //         price: { type: GraphQLNonNull(GraphQLInt) },
            //         stock: { type: GraphQLNonNull(GraphQLInt) },
            //         owner_user_id: { type: GraphQLNonNull(GraphQLString) },
            //     },
            //     resolve: (root, args, context, info) => {
            //         var product = new ProductModel(args);
            //         return product.save();
            //     },
            // },

            product: {
                type: ProductType,
                args: {
                    name: { type: GraphQLNonNull(GraphQLString) },
                    price: { type: GraphQLNonNull(GraphQLInt) },
                    stock: { type: GraphQLNonNull(GraphQLInt) },
                    owner_user_id: { type: GraphQLNonNull(GraphQLString) },
                    edit_mode: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    console.log('agsname====>>>>', args.name);
                    console.log('agsprice====>>>>', args.price);
                    console.log('agsstock====>>>>', args.stock);
                    if (args.edit_mode === 'false') {
                        var product = new ProductModel(args);
                        return product.save();
                    } else {
                        if (args.name !== '') {
                            if (args.price !== 0) {
                                if (args.stock !== 0) {
                                    return ProductModel.findByIdAndUpdate(
                                        args.edit_mode,
                                        {
                                            name: args.name,
                                            price: args.price,
                                            stock: args.stock,
                                        },
                                    );
                                } else {
                                    return ProductModel.findByIdAndUpdate(
                                        args.edit_mode,
                                        {
                                            name: args.name,
                                            price: args.price,
                                        },
                                    );
                                }
                            } else {
                                if (args.stock !== 0) {
                                    return ProductModel.findByIdAndUpdate(
                                        args.edit_mode,
                                        {
                                            name: args.name,
                                            stock: args.stock,
                                        },
                                    );
                                } else {
                                    return ProductModel.findByIdAndUpdate(
                                        args.edit_mode,
                                        {
                                            name: args.name,
                                        },
                                    );
                                }
                            }
                        } else {
                            if (args.price !== 0) {
                                if (args.stock !== 0) {
                                    return ProductModel.findByIdAndUpdate(
                                        args.edit_mode,
                                        {
                                            price: args.price,
                                            stock: args.stock,
                                        },
                                    );
                                } else {
                                    return ProductModel.findByIdAndUpdate(
                                        args.edit_mode,
                                        {
                                            price: args.price,
                                        },
                                    );
                                }
                            } else {
                                if (args.stock !== 0) {
                                    return ProductModel.findByIdAndUpdate(
                                        args.edit_mode,
                                        {
                                            stock: args.stock,
                                        },
                                    );
                                }
                            }
                        }
                    }
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
                    owner_user_id: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    var transaction = new TransactionModel(args);
                    return transaction.save();
                },
            },

            checkout_transaction: {
                type: TransactionType,
                args: {
                    user_id: { type: GraphQLNonNull(GraphQLString) },
                    cur_status: { type: GraphQLNonNull(GraphQLString) },
                    new_status: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    return TransactionModel.updateMany(
                        {
                            user_id: args.user_id,
                            status: args.cur_status,
                        },
                        {
                            status: args.new_status,
                        },
                    );
                },
            },
            ship_delivery_transaction: {
                type: TransactionType,
                args: {
                    transaction_id: { type: GraphQLNonNull(GraphQLString) },
                    new_status: { type: GraphQLNonNull(GraphQLString) },
                },
                resolve: (root, args, context, info) => {
                    return TransactionModel.findByIdAndUpdate(
                        args.transaction_id,
                        {
                            status: args.new_status,
                        },
                    );
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
