import { globalState } from "../apiSlice";
import { EndpointBuilder } from '@reduxjs/toolkit/query';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { UserType } from "../types";

const authEndpoints = (
    builder: EndpointBuilder<
        BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
        '',
        'api'
    >) => ({
        getAuthDiscord: builder.query({
            query: () => ({
                url: "/auth/discord", 
                method: "GET"
            })
        }),
        postDiscordCallback: builder.mutation<{status: number, token: string, data: UserType }, {code: string}>({
            query: (body) => {
                console.log(body)
                return {
                url: "/auth/discord/callback",
                method: "POST",
                body: body
            }}
        }),
        getNonce: builder.query<{nonce: string}, {address?: string}>({
            query: (body) => ({
                url: `/auth/nonce?walletAddress=${body.address}`,
                method: "GET"
            })
        }),
        postVerifyNonce: builder.mutation<{success: boolean, token: string, data: UserType }, {walletAddress: string, signature: string, nonce: string}>({
            query: (body) => {
                console.log(body)
                return {
                url: "/auth/verify-nonce",
                method: "POST",
                body: body
            }}
        }),
})

export default authEndpoints