import { Resource } from "@/core/domain/Resource";

/**
 * Service for fetching resources
 * Phase 1: Static JSON
 * Phase 2+: Can be extended to fetch from API/CMS
 */
export class ResourceService {
  private static instance: ResourceService;

  private constructor() {}

  public static getInstance(): ResourceService {
    if (!ResourceService.instance) {
      ResourceService.instance = new ResourceService();
    }
    return ResourceService.instance;
  }

  async fetchResources(): Promise<Resource[]> {
    try {
      const response = await fetch("/resources.json");
      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }
      const data = await response.json();
      return data.resources;
    } catch (error) {
      console.error("Error fetching resources:", error);
      return [];
    }
  }
}
