"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeycloakMultiTenantService = void 0;
const common_1 = require("@nestjs/common");
const keycloak_connect_1 = __importDefault(require("keycloak-connect"));
const constants_1 = require("../constants");
/**
 * Stores all keycloak instances when multi tenant option is defined.
 */
let KeycloakMultiTenantService = class KeycloakMultiTenantService {
    constructor(keycloakOpts) {
        this.keycloakOpts = keycloakOpts;
        this.instances = new Map();
    }
    /**
     * Clears the cached Keycloak instances.
     */
    clear() {
        this.instances.clear();
    }
    /**
     * Retrieves a keycloak instance based on the realm provided.
     * @param realm the realm to retrieve from
     * @returns the multi tenant keycloak instance
     */
    get(realm) {
        var _a;
        if (this.instances.has(realm)) {
            return this.instances.get(realm);
        }
        else {
            if (typeof this.keycloakOpts === 'string') {
                throw new Error('Keycloak configuration is a configuration path. This should not happen after module load.');
            }
            // Resolve realm secret
            const realmSecret = (_a = this.keycloakOpts.multiTenant) === null || _a === void 0 ? void 0 : _a.realmSecretResolver(realm);
            // Override secret
            // Order of priority: resolved realm secret > default global secret
            const secret = realmSecret || this.keycloakOpts.secret;
            // TODO: Repeating code from  provider, will need to rework this in 2.0
            // Override realm and secret
            const keycloakOpts = Object.assign(this.keycloakOpts, {
                realm,
                secret,
            });
            const keycloak = new keycloak_connect_1.default({}, keycloakOpts);
            // The most important part
            keycloak.accessDenied = (req, res, next) => {
                req.resourceDenied = true;
                next();
            };
            this.instances.set(realm, keycloak);
            return keycloak;
        }
    }
};
KeycloakMultiTenantService = __decorate([
    common_1.Injectable(),
    __param(0, common_1.Inject(constants_1.KEYCLOAK_CONNECT_OPTIONS)),
    __metadata("design:paramtypes", [Object])
], KeycloakMultiTenantService);
exports.KeycloakMultiTenantService = KeycloakMultiTenantService;
