import { ApolloServer, gql } from 'apollo-server';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from './models/user';
import Product from './models/product';

const SECRET = 'mysecret';

function generateToken(id, email) {
  const token = jwt.sign({ id, email }, SECRET);
  return token;
}

function verifyToken(token) {
  try {
    const { id } = jwt.verify(token, SECRET);
    return id;
  } catch (err) {
    return null;
  }
}
const typeDefs = gql`
type UserLogged {
  token : String!
  email: String!
  firstName: String
  lastName: String
  createdAt: String

}
type Product{
  id: ID
  productName: String! 
  productPrice: String! 
  brand: String
  description: String
  createdAt: String
  image: String
  quantity: String
  
}
input ProductInput{
  id: ID
  productName: String! 
  productPrice: String! 
  brand: String
  description: String
  createdAt: String
  image: String
  quantity: String
}
type User {
  firstName: String 
  lastName: String
  email: String!
  password: String
  createdAt: String
}
input UserInput {
  id: ID
  firstName: String
  lastName: String 
  email: String!
  password: String
  createdAt: String
}
type Query {
  users : [User]
  user(id: ID!) : User 
  products : [Product]
  product(id: ID!) : Product
}
type Mutation {
  login(input: UserInput): UserLogged
  addUser(input: UserInput): User
  updateUser(input: UserInput): User
  removeUser(id: ID!): Boolean
  addProduct(input: ProductInput): Product
  updateProduct(input: ProductInput): Product
  removeProduct(id: ID!): Boolean
  
}
`;

const resolvers = {
  Query: {
    users: async (_, $, { models }) => {
      const user = await models.User.find();
      return user;
    },
    products: async (_, $, { models }) => {
      const product = await
      models.Product.find();
      // console.log('product', product);
      return product;
    },
    user: (_, { id }, { models }) => models.User.findOne({ _id: id }),
    product: (_, { id }, { models }) => models.Product.findOne({ _id: id }),
  },
  Mutation: {
    login: async (_, { input }, { models }) => {
      const currentUser = await models.User.findOne({ email: input.email });
      if (!currentUser) {
        throw new Error('User Not found');
      }
      const correctPassword = await bcrypt.compare(input.password, currentUser.password);
      if (!correctPassword) {
        throw new Error('Wrong password !');
      }
      const token = generateToken(currentUser.id, currentUser.email);
      return { token, email: currentUser.email };
    },
    addUser: async (_, { input }, { models }) => {
      const hashPassword = await bcrypt.hash(input.password, 3);
      const user = new models.User({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        password: hashPassword,
        createdAt: input.createdAt,
      });
      await user.save();
      const token = generateToken(user.id, user.email);
      return { token, firstName: user.firstName, lastName: user.lastName, email: user.email, createdAt: user.createdAt, password: user.password };
    },
    updateUser: async (_, {input: {
      id, firstName, lastName, email, createdAt, password } }) => {
      const utilisateur = await User.findByIdAndUpdate({ _id: id }, {
        $set: {firstName, lastName, email, createdAt, password }
      });
      return utilisateur; 
    },
    removeUser: async (_, { id }) => {
      await User.findByIdAndRemove(id);
      return true;
    },
    addProduct: async (_, { input }, { models }) => {
      // console.log('input', input);
      const product = new models.Product({
        productName: input.productName,
        productPrice: input.productPrice,
        description: input.description,
        createdAt: input.createdAt,
        image: input.image,
        brand: input.brand,
        quantity: input.quantity,
      });
      await product.save();
      return {
        productName: product.productName,
        productPrice: product.productPrice,
        description: product.description,
        createdAt: product.createdAt,
        image: product.image,
        brand: input.brand,
        quantity: input.quantity,
        
      };
    },
    updateProduct: async (_, {input: {
      id, productName, productPrice, image, createdAt, brand, description, quantity } }) => {
      const produit = await Product.findByIdAndUpdate({ _id: id }, {
        $set: { productName, productPrice, image, createdAt, brand, description, quantity }
      });
      return produit;
    },
    removeProduct: async (_, { id }) => {
      await Product.findByIdAndRemove(id);
      return true;
    },
  },
};


const server = new ApolloServer({ 
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const userId = verifyToken(req.headers.authorization);
    return {
      userId,
      models: {
        User,
        Product,
      },
    };
  },
});
mongoose.connect('mongodb://localhost:27017/Ecommerce', { useNewUrlParser: true })
  .then(() => {
    console.log('connected to mongodb');
    server.listen().then(({ url }) => {
      console.log(`🚀  Server ready at ${url}`);
    });
  });
