"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultEncoder = void 0;
exports.defaultEncoder = {
    encode: async (bundledData) => JSON.stringify(bundledData),
    decode: async (encodedData) => JSON.parse(encodedData),
    expand: async (decodedData) => {
        let path = '';
        let status = '';
        let data = '';
        if (decodedData && typeof decodedData === 'object') {
            path = decodedData.path;
            status = decodedData.status;
            data = decodedData.data;
        }
        return { path, status, data };
    },
    bundle: async (status, path, data) => ({
        status,
        path,
        data
    })
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jb2Rlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImVuY29kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBYWEsUUFBQSxjQUFjLEdBQVk7SUFDckMsTUFBTSxFQUFFLEtBQUssRUFBRSxXQUFnQixFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQztJQUMvRCxNQUFNLEVBQUUsS0FBSyxFQUFFLFdBQWdCLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO0lBQzNELE1BQU0sRUFBRSxLQUFLLEVBQUUsV0FBZ0IsRUFBRSxFQUFFO1FBQ2pDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUNiLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQTtRQUNmLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUNiLElBQUksV0FBVyxJQUFJLE9BQU8sV0FBVyxLQUFLLFFBQVEsRUFBRTtZQUNsRCxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQTtZQUN2QixNQUFNLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQTtZQUMzQixJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQTtTQUN4QjtRQUNELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFBO0lBQy9CLENBQUM7SUFDRCxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQWMsRUFBRSxJQUFZLEVBQUUsSUFBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzFELE1BQU07UUFDTixJQUFJO1FBQ0osSUFBSTtLQUNMLENBQUM7Q0FDSCxDQUFBIn0=