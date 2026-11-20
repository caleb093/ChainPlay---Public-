import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import {authEndpoints, gameEndpoints, userEndpoints, wagerEndpoints} from "./index"

// export const BASE_URL = "http://localhost:5000"
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export const globalState = {
    userId: "",
    authorizationToken: "",
};

export const apiSlice = createApi({
    reducerPath: "api",
    tagTypes: [""],
    baseQuery: fetchBaseQuery({
        baseUrl: `${BASE_URL}/api`,
        prepareHeaders: (headers) => {
            const token = globalState.authorizationToken;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        }
    }),
    endpoints: builder => ({
        ...authEndpoints(builder),
        ...userEndpoints(builder),
        ...gameEndpoints(builder),
        ...wagerEndpoints(builder),
    })
})

export const {
    useGetAuthDiscordQuery,
    usePostDiscordCallbackMutation,
    useGetUserDataQuery,
    usePostOnboardUserMutation,
    useGetLinkNonceQuery,
    useLazyGetLinkNonceQuery,
    usePostLinkVerifyNonceMutation,
    usePatchUserTaskVerifyMutation,
    useGetGamesQuery,
    useGetUserProgressQuery,
    usePostConfirmWalletMutation,
    usePostGameCompletedMutation,
    useGetLeaderboardQuery,
    useGetNonceQuery,
    useLazyGetNonceQuery,
    usePostVerifyNonceMutation,

    useGetWagerLeaderboardQuery,
    useGetWagerStatsQuery,
    useLazyFindUserQuery,
    useLazyGetGameStartQuery,
    usePostOnchainAccountInitializedMutation,
    usePatchUserAvatarMutation,

    usePostWagerDisputeMutation,
    usePostWagerReportMutation,
    useGetWagerIncidentsQuery,
    useLazyGetWagerIncidentsQuery,
    useGetWagerArcadeLeaderboardQuery,
    useGetWagerRivalriesQuery,
    useLazyClaimFaucetQuery,
} = apiSlice