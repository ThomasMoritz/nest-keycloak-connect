"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseToken = exports.extractRequest = exports.useKeycloak = void 0;
// Confusing and all, but I needed to extract this fn to avoid more repeating code
// TODO: Rework in 2.0
const useKeycloak = (request, jwt, singleTenant, multiTenant, opts) => {
    if (opts.multiTenant && opts.multiTenant.realmResolver) {
        const resolvedRealm = opts.multiTenant.realmResolver(request);
        return multiTenant.get(resolvedRealm);
    }
    else if (!opts.realm) {
        const payload = exports.parseToken(jwt);
        const issuerRealm = payload.iss.split('/').pop();
        return multiTenant.get(issuerRealm);
    }
    return singleTenant;
};
exports.useKeycloak = useKeycloak;
const extractRequest = (context) => {
    let request, response;
    // Check if request is coming from graphql or http
    if (context.getType() === 'http') {
        // http request
        const httpContext = context.switchToHttp();
        request = httpContext.getRequest();
        response = httpContext.getResponse();
    }
    else if (context.getType() === 'graphql') {
        let gql;
        // Check if graphql is installed
        try {
            gql = require('@nestjs/graphql');
        }
        catch (er) {
            throw new Error('@nestjs/graphql is not installed, cannot proceed');
        }
        // graphql request
        const gqlContext = gql.GqlExecutionContext.create(context).getContext();
        request = gqlContext.req;
        response = gqlContext.res;
    }
    return [request, response];
};
exports.extractRequest = extractRequest;
const parseToken = (token) => {
    const parts = token.split('.');
    return JSON.parse(Buffer.from(parts[1], 'base64').toString());
};
exports.parseToken = parseToken;
