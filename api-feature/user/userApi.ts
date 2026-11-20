import { globalState } from "../apiSlice";
import { EndpointBuilder } from '@reduxjs/toolkit/query';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { IDailyTasks, IRivalryBadge, IStarterTasks, UserType } from "../types";

const userEndpoints = (
    builder: EndpointBuilder<
        BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
        '',
        'api'
    >) => ({
        getUserData: builder.query({
            query: () => ({
                url: "/user", 
                method: "GET"
            })
        }),
        postOnboardUser: builder.mutation<{message: string, success: boolean, avatar?: string | null}, {username: string, referralcode?: string, avatar?: File}>({
            query: ({username, referralcode, avatar}) => {
                const formData = new FormData()
                formData.append("username", username)
                if (referralcode) formData.append("referralCode", referralcode)
                if (avatar) formData.append("avatar", avatar)
                return {
                    url: "/user/onboard",
                    method: "POST",
                    body: formData
                }
            }
        }),
        patchUserTaskVerify: builder.mutation<{success: boolean, message: string}, {taskType: "daily" | "starter", taskName?:  keyof IDailyTasks | keyof IStarterTasks}>({
            query: (body) => {
                console.log(body)
                return {
                    url: "/user/task-verify",
                    method: "PATCH",
                    body: body
                }
            }
        }),
        getLinkNonce: builder.query<{nonce: string}, {address?: string}>({
            query: (body) => ({
                url: `/user/link/nonce?walletAddress=${body.address}`,
                method: "GET"
            })
        }),
        postLinkVerifyNonce: builder.mutation<{success: boolean, token: string, data: UserType }, {walletAddress: string, signature: string, nonce: string}>({
            query: (body) => {
                console.log(body)
                return {
                url: "/user/link/verify-nonce",
                method: "POST",
                body: body
            }}
        }),
        postConfirmWallet: builder.mutation<undefined, {walletAddress: string}>({
            query: (body) => {
                return {
                    url: "/user/confirm-wallet",
                    method: "POST",
                    body: body
                }
            }            
        }),
        getWagerStats: builder.query<undefined, {gameId: string}>({
            query: (body) => ({
                url: `/user/wager-stats?gameId=${body.gameId}`,
                method: "GET"
            })
        }),
        findUser: builder.query<{ success: boolean; data: { id: string; username: string; address: string; avatar?: string; rivalry: IRivalryBadge | null }[] }, string>({
            query: (username) => ({
                url: `/user/find/${username}`,
                method: "GET"
            })
        }),
        postOnchainAccountInitialized: builder.mutation<undefined, {walletAddress: string}>({
            query: (body) => {
                return {
                    url: "/user/onchain-account-initialized",
                    method: "POST",
                    body: body
                }
            }
        }),
        patchUserAvatar: builder.mutation<{success: boolean, avatar: string}, File>({
            query: (file) => {
                const formData = new FormData()
                formData.append("avatar", file)
                return {
                    url: "/user/avatar",
                    method: "PATCH",
                    body: formData
                }
            }
        }),
        claimFaucet: builder.query<{message: string, txSignature?: string}, void>({
            query: () => ({
                url: "/faucet/claim",
                method: "GET",
            })
        }),

})

export default userEndpoints