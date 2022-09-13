"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerChain = void 0;
const pattern_1 = require("@thetaapp/pattern");
const timeout_error_1 = require("./timeout-error");
const router_1 = require("./router");
const noop = () => { };
class HandlerChain {
    constructor(config, patternStr, handler, isErrorHandler) {
        this._config = config;
        this._pattern = new pattern_1.Pattern(this._config, patternStr);
        this._handler = handler;
        this._isErrorHandler = isErrorHandler;
    }
    push(patternStr, handler, isErrorHandler) {
        this.nextLink
            ? this.nextLink.push(patternStr, handler, isErrorHandler)
            : (this.nextLink = new HandlerChain(this._config, patternStr, handler, isErrorHandler));
    }
    is(patternStr, handler, isErrorHandler) {
        return (this._pattern.raw === pattern_1.Pattern.raw(patternStr) &&
            this._handler === handler &&
            this._isErrorHandler === isErrorHandler);
    }
    remove(patternStr, handler, isErrorHandler) {
        if (!this.nextLink) {
            return false;
        }
        if (this.nextLink.is(patternStr, handler, isErrorHandler)) {
            this.nextLink = this.nextLink.nextLink;
            return true;
        }
        return this.nextLink.remove(patternStr, handler, isErrorHandler);
    }
    async route(ctx) {
        var _a, _b;
        const executeNext = async (err) => {
            if (err) {
                ctx.$$error = err;
            }
            if (!this.nextLink) {
                if (ctx.$$error) {
                    throw ctx.$$error;
                }
                return;
            }
            await this.nextLink.route(ctx);
        };
        ctx.next = executeNext;
        if (ctx.$$error && !this._isErrorHandler) {
            return await executeNext();
        }
        if (!ctx.$$tryToApplyPattern(this._pattern)) {
            return await executeNext();
        }
        const executeHandler = async () => this._handler instanceof router_1.Router
            ? await this.route(ctx)
            : await this._handler(ctx);
        const setupTimeout = async () => 
        // eslint-disable-next-line promise/param-names
        await new Promise((_resolve, reject) => {
            let timeoutId;
            const exec = () => {
                if (timeoutId !== undefined) {
                    clearTimeout(timeoutId);
                }
                if (timeout === -1) {
                    return;
                }
                timeoutId = setTimeout(() => {
                    reject(new timeout_error_1.TimeoutError(ctx));
                }, timeout);
            };
            ctx.$$resetTimeout = exec;
            exec();
        });
        const timeout = (_b = ((_a = ctx.$$timeout) !== null && _a !== void 0 ? _a : this._config.timeout)) !== null && _b !== void 0 ? _b : -1;
        try {
            if (timeout === -1) {
                ctx.$$resetTimeout = noop;
                return await executeHandler();
            }
            await Promise.race([setupTimeout(), executeHandler()]);
        }
        catch (err) {
            await executeNext(err);
        }
    }
}
exports.HandlerChain = HandlerChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGFuZGxlci1jaGFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhhbmRsZXItY2hhaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsK0NBQTJDO0FBRzNDLG1EQUE4QztBQUM5QyxxQ0FBaUM7QUFHakMsTUFBTSxJQUFJLEdBQUcsR0FBUyxFQUFFLEdBQUUsQ0FBQyxDQUFBO0FBRTNCLE1BQWEsWUFBWTtJQU92QixZQUNFLE1BQWMsRUFDZCxVQUFrQixFQUNsQixPQUF5QixFQUN6QixjQUF1QjtRQUV2QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQTtRQUNyQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksaUJBQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1FBQ3JELElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO1FBQ3ZCLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFBO0lBQ3ZDLENBQUM7SUFFTSxJQUFJLENBQ1QsVUFBa0IsRUFDbEIsT0FBeUIsRUFDekIsY0FBdUI7UUFFdkIsSUFBSSxDQUFDLFFBQVE7WUFDWCxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLE9BQU8sRUFBRSxjQUFjLENBQUM7WUFDekQsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFlBQVksQ0FDakMsSUFBSSxDQUFDLE9BQU8sRUFDWixVQUFVLEVBQ1YsT0FBTyxFQUNQLGNBQWMsQ0FDZixDQUFDLENBQUE7SUFDTixDQUFDO0lBRU0sRUFBRSxDQUNQLFVBQWtCLEVBQ2xCLE9BQXlCLEVBQ3pCLGNBQXVCO1FBRXZCLE9BQU8sQ0FDTCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsS0FBSyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7WUFDN0MsSUFBSSxDQUFDLFFBQVEsS0FBSyxPQUFPO1lBQ3pCLElBQUksQ0FBQyxlQUFl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