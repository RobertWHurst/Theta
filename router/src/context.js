"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const pattern_1 = require("@thetaapp/pattern");
class Context {
    constructor(_config, message, socket) {
        this.message = message;
        this.socket = socket;
    }
    get rawPath() {
        var _a, _b;
        return (_b = (_a = this.message) === null || _a === void 0 ? void 0 : _a.rawPath) !== null && _b !== void 0 ? _b : '';
    }
    get channel() {
        var _a, _b;
        return (_b = (_a = this.message) === null || _a === void 0 ? void 0 : _a.channel) !== null && _b !== void 0 ? _b : (0, pattern_1.createChannelId)();
    }
    get path() {
        var _a, _b;
        return (_b = (_a = this.message) === null || _a === void 0 ? void 0 : _a.path) !== null && _b !== void 0 ? _b : '';
    }
    get params() {
        var _a, _b;
        return (_b = (_a = this.message) === null || _a === void 0 ? void 0 : _a.params) !== null && _b !== void 0 ? _b : {};
    }
    get data() {
        var _a;
        return (_a = this.message) === null || _a === void 0 ? void 0 : _a.data;
    }
    get currentStatus() {
        var _a;
        return (_a = this.$$status) !== null && _a !== void 0 ? _a : 'ok';
    }
    get error() {
        return this.$$error;
    }
    status(status) {
        this.$$status = status;
        return this;
    }
    async send(path, data) {
        await this.socket.$$send(this.currentStatus, path, data);
    }
    async request(data) {
        return await new Promise((resolve, reject) => {
            this.socket.$$subHandle(this.rawPath, resolve);
            // TODO: handle timeout by generating a timed out context and routing it to
            //       the channelAndPath
            this.send(this.rawPath, data).catch(reject);
        });
    }
    async reply(data) {
        await this.send(this.rawPath, data);
        this.end();
    }
    end() {
        this.$$handled = true;
    }
    timeout(ms) {
        if (typeof ms === 'number') {
            this.$$timeout = ms;
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.$$resetTimeout();
        return this;
    }
    clearError() {
        delete this.$$error;
        return this;
    }
    $$tryToApplyPattern(pattern) {
        return this.message ? this.message.$$tryToApplyPattern(pattern) : false;
    }
}
exports.Context = Context;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbnRleHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsK0NBQW9FO0FBSXBFLE1BQWEsT0FBTztJQVlsQixZQUFhLE9BQWUsRUFBRSxPQUF1QixFQUFFLE1BQWM7UUFDbkUsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7UUFDdEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7SUFDdEIsQ0FBQztJQUVELElBQVcsT0FBTzs7UUFDaEIsT0FBTyxNQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsT0FBTyxtQ0FBSSxFQUFFLENBQUE7SUFDcEMsQ0FBQztJQUVELElBQVcsT0FBTzs7UUFDaEIsT0FBTyxNQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsT0FBTyxtQ0FBSSxJQUFBLHlCQUFlLEdBQUUsQ0FBQTtJQUNuRCxDQUFDO0lBRUQsSUFBVyxJQUFJOztRQUNiLE9BQU8sTUFBQSxNQUFBLElBQUksQ0FBQyxPQUFPLDBDQUFFLElBQUksbUNBQUksRUFBRSxDQUFBO0lBQ2pDLENBQUM7SUFFRCxJQUFXLE1BQU07O1FBQ2YsT0FBTyxNQUFBLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsTUFBTSxtQ0FBSSxFQUFFLENBQUE7SUFDbkMsQ0FBQztJQUVELElBQVcsSUFBSTs7UUFDYixPQUFPLE1BQUEsSUFBSSxDQUFDLE9BQU8sMENBQUUsSUFBSSxDQUFBO0lBQzNCLENBQUM7SUFFRCxJQUFXLGFBQWE7O1FBQ3RCLE9BQU8sTUFBQSxJQUFJLENBQUMsUUFBUSxtQ0FBSSxJQUFJLENBQUE7SUFDOUIsQ0FBQztJQUVELElBQVcsS0FBSztRQUNkLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtJQUNyQixDQUFDO0lBRU0sTUFBTSxDQUFFLE1BQWM7UUFDM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUE7UUFDdEIsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRU0sS0FBSyxDQUFDLElBQUksQ0FBRSxJQUFZLEVBQUUsSUFBVTtRQUN6QyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQzFELENBQUM7SUFFTSxLQUFLLENBQUMsT0FBTyxDQUFFLElBQVU7UUFDOUIsT0FBTyxNQUFNLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzNDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUE7WUFDOUMsMkVBQTJFO1lBQzNFLDJCQUEyQjtZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQzdDLENBQUMsQ0FBQyxDQUFBO0lBQ0osQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFLLENBQUUsSUFBVTtRQUM1QixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUNuQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUE7SUFDWixDQUFDO0lBRU0sR0FBRztRQUNSLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFBO0lBQ3ZCLENBQUM7SUFFTSxPQUFPLENBQUUsRUFBVztRQUN6QixJQUFJLE9BQU8sRUFBRSxLQUFLLFFBQVEsRUFBRTtZQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQTtTQUNwQjtRQUNELG9FQUFvRTtRQUNwRSxJQUFJLENBQUMsY0FBZSxFQUFFLENBQUE7UUFDdEIsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRU0sVUFBVTtRQUNmLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtRQUNuQixPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFFTSxtQkFBbUIsQ0FBRSxPQUFnQjtRQUMxQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQTtJQUN6RSxDQUFDO0NBQ0Y7QUF6RkQsMEJBeUZDIn0=