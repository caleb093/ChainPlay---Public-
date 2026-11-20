import { EndpointBuilder } from '@reduxjs/toolkit/query';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import {
    IDisputeRequest,
    IDisputeResponse,
    IReportRequest,
    IReportResponse,
    IIncidentsResponse,
    IWagerLeaderboardResponse,
    IRivalriesResponse,
} from '../types';

const wagerEndpoints = (
    builder: EndpointBuilder<
        BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
        '',
        'api'
    >) => ({
        postWagerDispute: builder.mutation<IDisputeResponse, IDisputeRequest>({
            query: (body) => ({
                url: "/wager/dispute",
                method: "POST",
                body,
            }),
        }),
        postWagerReport: builder.mutation<IReportResponse, IReportRequest>({
            query: (body) => ({
                url: "/wager/report",
                method: "POST",
                body,
            }),
        }),
        getWagerIncidents: builder.query<IIncidentsResponse, { status?: string; page?: number; limit?: number }>({
            query: ({ status, page = 1, limit = 20 } = {}) => {
                const params = new URLSearchParams()
                if (status) params.set("status", status)
                params.set("page", String(page))
                params.set("limit", String(limit))
                return {
                    url: `/wager/incidents?${params.toString()}`,
                    method: "GET",
                }
            },
            keepUnusedDataFor: 0,
        }),
        getWagerArcadeLeaderboard: builder.query<IWagerLeaderboardResponse, void>({
            query: () => ({
                url: "/wager/leaderboard",
                method: "GET",
            }),
            keepUnusedDataFor: 0,
        }),
        getWagerRivalries: builder.query<IRivalriesResponse, { status?: "active" | "dormant" | "all" } | void>({
            query: (params) => {
                const status = params && "status" in params ? params.status : undefined
                return {
                    url: status ? `/wager/rivalries?status=${status}` : "/wager/rivalries",
                    method: "GET",
                }
            },
            keepUnusedDataFor: 0,
        }),
    })

export default wagerEndpoints
