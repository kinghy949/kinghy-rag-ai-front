import service from "@/http";
import {RagApi} from "@/api/common.ts";

export const streamRagApi = async (): Promise<any> => {
    return await service.get(RagApi.StreamRag);
};