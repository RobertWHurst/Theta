"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutError = void 0;
class TimeoutError extends Error {
    constructor(ctx) {
        super(`TimeoutError: ... ${ctx.path}`);
    }
}
exports.TimeoutError = TimeoutError;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZW91dC1lcnJvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInRpbWVvdXQtZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEsTUFBYSxZQUFhLFNBQVEsS0FBSztJQUNyQyxZQUFhLEdBQVk7UUFDdkIsS0FBSyxDQUFDLHFCQUFxQixHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtJQUN4QyxDQUFDO0NBQ0Y7QUFKRCxvQ0FJQyJ9