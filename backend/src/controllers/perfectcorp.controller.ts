import { Request, Response } from "express";
import env from "@config/env";
import PerfectCorpService from "@services/perfectcorp.service";
import PerfectCorpMock from "@utils/perfectcorp-mock";
import { SkinAnalysisRequest, VirtualTryOnRequest } from "@app-types/perfectcorp.types";

const isMock = !env.perfectCorp.apiKey || env.perfectCorp.apiKey.toLowerCase() === "mock";

export async function analyzeSkin(req: Request, res: Response) {
  const body = req.body as SkinAnalysisRequest;
  if (isMock) {
    await PerfectCorpMock.delay();
    return res.status(200).json(PerfectCorpMock.mockSkinAnalysis());
  }
  const result = await PerfectCorpService.analyzeSkin(body);
  return res.status(200).json(result);
}

export async function getSkinAnalysis(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  if (isMock) {
    await PerfectCorpMock.delay();
    const mock = PerfectCorpMock.mockSkinAnalysis();
    return res.status(200).json({ ...mock, analysisId: id });
  }
  const result = await PerfectCorpService.getSkinAnalysis(id);
  return res.status(200).json(result);
}

export async function applyVirtualMakeup(req: Request, res: Response) {
  const body = req.body as VirtualTryOnRequest;
  if (isMock) {
    await PerfectCorpMock.delay();
    return res.status(200).json(PerfectCorpMock.mockVirtualTryOn());
  }
  const result = await PerfectCorpService.applyVirtualMakeup(body);
  return res.status(200).json(result);
}

export async function getVirtualTryOn(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  if (isMock) {
    await PerfectCorpMock.delay();
    const mock = PerfectCorpMock.mockVirtualTryOn();
    return res.status(200).json(mock);
  }
  const result = await PerfectCorpService.getVirtualTryOn(id);
  return res.status(200).json(result);
}

export async function getRecommendations(req: Request, res: Response) {
  const { analysisId } = req.params as { analysisId: string };
  const { category, limit, min, max } = req.query as Record<string, string>;
  const options =
    limit || category || min || max
      ? {
          category,
          limit: limit ? parseInt(limit, 10) : undefined,
          priceRange: min && max ? { min: parseFloat(min), max: parseFloat(max) } : undefined
        }
      : undefined;

  if (isMock) {
    await PerfectCorpMock.delay();
    return res.status(200).json(PerfectCorpMock.mockRecommendations());
  }
  const result = await PerfectCorpService.getRecommendations(analysisId, options);
  return res.status(200).json(result);
}

export async function searchProducts(req: Request, res: Response) {
  const { keyword, category, skinType, limit } = req.query as Record<string, string>;
  if (isMock) {
    await PerfectCorpMock.delay();
    return res.status(200).json(PerfectCorpMock.mockRecommendations());
  }
  const result = await PerfectCorpService.searchProducts({
    keyword,
    category,
    skinType,
    limit: limit ? parseInt(limit, 10) : undefined
  });
  return res.status(200).json(result);
}

export async function detectFace(req: Request, res: Response) {
  const { imageUrl } = req.body as { imageUrl: string };
  if (isMock) {
    await PerfectCorpMock.delay();
    return res.status(200).json({ faceDetected: true, confidence: 0.9 });
  }
  const result = await PerfectCorpService.detectFace(imageUrl);
  return res.status(200).json(result);
}

export async function perfectCorpHealth(req: Request, res: Response) {
  void req;
  if (isMock) {
    return res.status(200).json({ ok: true, mode: "mock" });
  }
  const ok = await PerfectCorpService.healthCheck();
  return res.status(ok ? 200 : 503).json({ ok, mode: "live" });
}
