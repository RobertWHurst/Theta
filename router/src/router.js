"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const handler_chain_1 = require("./handler-chain");
class Router {
    constructor(config) {
        this._config = config;
    }
    async route(ctx) {
        if (!this._handlerChain) {
            return;
        }
        try {
            await this._handlerChain.route(ctx);
        }
        catch (err) {
            const errStr = (err.stack || err.message || err);
            console.warn('Unhandled handler error:\n' +
                '========================\n' +
                `${errStr}\n` +
                '========================\n' +
                'This message was generated  because the router has no error handlers\n' +
                'after the exception  occured. It is recommended to add at least one\n' +
                'error handler at the end of your router.');
        }
    }
    handle(patternStr, handler) {
        if (handler === undefined) {
            handler = patternStr;
            patternStr = '+';
        }
        this._handle(patternStr, handler, false);
    }
    unhandle(patternStr, handler) {
        if (!handler) {
            handler = patternStr;
            patternStr = '+';
        }
        return this._unhandle(patternStr, handler, false);
    }
    handleError(patternStr, handler) {
        if (!handler) {
            handler = patternStr;
            patternStr = '+';
        }
        this._handle(patternStr, handler, true);
    }
    unhandleError(patternStr, handler) {
        if (!handler) {
            handler = patternStr;
            patternStr = '+';
        }
        this._unhandle(patternStr, handler, true);
    }
    $$subHandle(patternStr, handler) {
        // TODO: Instead of injecting into the front of the handler chain add
        //       to special array.
        const h = async (ctx) => {
            this.unhandle(patternStr, h);
            return await handler(ctx);
        };
        const handlerChain = this._handlerChain;
        this._handlerChain = new handler_chain_1.HandlerChain(this._config, patternStr, h, false);
        this._handlerChain.nextLink = handlerChain;
    }
    _handle(patternStr, handler, isErrorHandler) {
        this._handlerChain
            ? this._handlerChain.push(patternStr, handler, isErrorHandler)
            : (this._handlerChain = new handler_chain_1.HandlerChain(this._config, patternStr, handler, isErrorHandler));
    }
    _unhandle(patternStr, handler, isErrorHandler) {
        if (!this._handlerChain) {
            return false;
        }
        if (this._handlerChain.is(patternStr, handler, false)) {
            this._handlerChain = this._handlerChain.nextLink;
            return true;
        }
        return this._handlerChain.remove(patternStr, handler, isErrorHandler);
    }
}
exports.Router = Router;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUVBLG1EQUE4QztBQUc5QyxNQUFhLE1BQU07SUFJakIsWUFBb0IsTUFBYztRQUNoQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQTtJQUN2QixDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQUssQ0FBRSxHQUFZO1FBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3ZCLE9BQU07U0FDUDtRQUNELElBQUk7WUFDRixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1NBQ3BDO1FBQUMsT0FBTyxHQUFRLEVBQUU7WUFDakIsTUFBTSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFXLENBQUE7WUFDMUQsT0FBTyxDQUFDLElBQUksQ0FDViw0QkFBNEI7Z0JBQzVCLDRCQUE0QjtnQkFDNUIsR0FBRyxNQUFNLElBQUk7Z0JBQ2IsNEJBQTRCO2dCQUM1Qix3RUFBd0U7Z0JBQ3hFLHVFQUF1RTtnQkFDdkUsMENBQTBDLENBQzNDLENBQUE7U0FDRjtJQUNILENBQUM7SUFNTSxNQUFNLENBQ1gsVUFBcUMsRUFDckMsT0FBMEI7UUFFMUIsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO1lBQ3pCLE9BQU8sR0FBRyxVQUFxQixDQUFBO1lBQy9CLFVBQVUsR0FBRyxHQUFHLENBQUE7U0FDakI7UUFDRCxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQW9CLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFNTSxRQUFRLENBQ2IsVUFBcUMsRUFDckMsT0FBMEI7UUFFMUIsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLE9BQU8sR0FBRyxVQUFxQixDQUFBO1lBQy9CLFVBQVUsR0FBRyxHQUFHLENBQUE7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