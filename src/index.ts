import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { prismaClient } from './lib/db'; 

async function init() {
    const app = express();
    const PORT = Number(process.env.PORT) || 8000;

    app.use(express.json());

    const gqlServer = new ApolloServer({
        typeDefs: `
            type Query {
                hello: String
                say(name: String): String
                id: Int
            }
            type Mutation {
                createUser(firstName: String!, lastName: String!, email: String!, password: String!): Boolean
            }
        `,
        resolvers: {
            Query: {
                hello: () => 'Hello, I\'m using GraphQL!',
                say: (_, { name }) => `Hey ${name}, how are you?`,
            },
            Mutation: {
                createUser: async (_, { firstName, lastName, email, password }) => {
                    await prismaClient.user.create({
                        data: {
                            email,
                            firstName,
                            lastName,
                            password,
                            salt: "random_salt"
                        },
                    });
                    return true;
                }
            }
        }
    });

    await gqlServer.start();

    app.get('/', (req, res) => {
        res.json('Server is running');
    });

    app.use('/graphql', expressMiddleware(gqlServer));

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

init().catch((err) => {
    console.error('Error starting the server:', err);
});
