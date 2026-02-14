import type { paths } from "../../types/api-generated";
import { client } from "./client";

type GetPaths = {
  [K in keyof paths]: paths[K] extends { get: any } ? K : never;
}[keyof paths];

type PostPaths = {
  [K in keyof paths]: paths[K] extends { post: any } ? K : never;
}[keyof paths];

type PutPaths = {
  [K in keyof paths]: paths[K] extends { put: any } ? K : never;
}[keyof paths];

type DeletePaths = {
  [K in keyof paths]: paths[K] extends { delete: any } ? K : never;
}[keyof paths];

type RequestBody<Path extends keyof paths, Method extends keyof paths[Path]> =
  paths[Path][Method] extends {
    requestBody: { content: { "application/json": infer T } };
  }
    ? T
    : never;

type ResponseData<Path extends keyof paths, Method extends keyof paths[Path]> =
  paths[Path][Method] extends {
    responses: { 200: { content: { "application/json": infer T } } };
  }
    ? T
    : any;

type QueryParams<Path extends keyof paths, Method extends keyof paths[Path]> =
  paths[Path][Method] extends { parameters: { query: infer T } } ? T : never;

class TypedAPIClient {
  async get<Path extends GetPaths>(path: Path, params?: QueryParams<Path, "get">): Promise<ResponseData<Path, "get">>;
  async get(path: string, params?: any): Promise<any>;
  async get(path: any, params?: any): Promise<any> {
    const res = await client.get(path as string, { params });
    return res.data as any;
  }

  async post<Path extends PostPaths>(path: Path, data: RequestBody<Path, "post">): Promise<ResponseData<Path, "post">>;
  async post(path: string, data: any): Promise<any>;
  async post(path: any, data: any): Promise<any> {
    const res = await client.post(path as string, data as any);
    return res.data as any;
  }

  async put<Path extends PutPaths>(path: Path, data: RequestBody<Path, "put">): Promise<ResponseData<Path, "put">>;
  async put(path: string, data: any): Promise<any>;
  async put(path: any, data: any): Promise<any> {
    const res = await client.put(path as string, data as any);
    return res.data as any;
  }

  async delete<Path extends DeletePaths>(path: Path): Promise<ResponseData<Path, "delete">>;
  async delete(path: string): Promise<any>;
  async delete(path: any): Promise<any> {
    const res = await client.delete(path as string);
    return res.data as any;
  }
}

export const typedApi = new TypedAPIClient();
