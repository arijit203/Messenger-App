import bcrypt from "bcrypt";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prismadb";


export const authOptions:AuthOptions = {
    // Configure one or more authentication providers
    adapter:PrismaAdapter(prisma),
    providers: [
      GithubProvider({
        clientId: process.env.GITHUB_ID as string,
        clientSecret: process.env.GITHUB_SECRET as string,
      }),
     GoogleProvider({
        clientId: process.env.GOOGLE_ID as string,
        clientSecret: process.env.GOOGLE_SECRET as string,
      }),
      CredentialsProvider({  //if user wants to use email and password
        name:'credentials',
        credentials:{
            email:{label:'email',type:'text'},
            password:{label:'password',type:'password'},
        },
        async authorize(credentials){
            if(!credentials?.email || !credentials?.password){
                throw new Error('Invalid Credentials');
            }

            const user=await prisma.user.findUnique({
                where:{
                    email: credentials.email
                }
            })

            if(!user || !user?.hashedPassword){
                throw new Error('Invalid Credentials');
            }

            const isCorrectPassword=await bcrypt.compare(
                credentials.password,
                user.hashedPassword
            )

            if (!isCorrectPassword) {
                throw new Error("Invalid credentials");
              }

             
            return user;
        }

      })
      // ...add more providers here
    ],
    debug: process.env.NODE_ENV==="development",
    session:{
        strategy:"jwt"
    },
    secret: process.env.NEXTAUTH_SECRET
  }