import OSS from 'ali-oss';
import fs from 'fs';
import path from 'path';
import { OssConfig, getOssConfig, getAllOssConfigs } from '../config/oss.config.js';
import { z } from 'zod';

// 上传文件参数验证Schema
export const UploadFileParamsSchema = z.object({
  filePath: z.string(),
  targetDir: z.string().optional(),
  fileName: z.string().optional(),
  configName: z.string().optional(),
});

// 导出上传文件参数类型
export type UploadFileParams = z.infer<typeof UploadFileParamsSchema>;

// 上传结果验证Schema
export const UploadResultSchema = z.object({
  success: z.boolean(),
  url: z.string().optional(),
  error: z.string().optional(),
  ossConfigName: z.string().optional(),
});

// 导出上传结果类型
export type UploadResult = z.infer<typeof UploadResultSchema>;

/**
 * OSS配置接口（包含ID和名称）
 */
export interface OssConfigWithMeta extends OssConfig {
  id: string;
  name: string;
}

/**
 * 阿里云OSS服务类
 */
export class OssService {
  private clients: Map<string, OSS> = new Map();

  /**
   * 获取所有OSS配置
   * @returns OSS配置列表
   */
  getConfigs(): OssConfigWithMeta[] {
    const configs: OssConfigWithMeta[] = [];
    const allConfigs = getAllOssConfigs();

    for (const [id, config] of Object.entries(allConfigs)) {
      configs.push({
        id,
        name: `${id.charAt(0).toUpperCase()}${id.slice(1)} 配置`,
        ...config
      });
    }

    return configs;
  }

  /**
   * 获取OSS客户端
   * @param configName 配置名称
   * @returns OSS客户端实例
   */
  private getClient(configName: string = 'default'): OSS | null {
    // 检查缓存中是否已有客户端
    if (this.clients.has(configName)) {
      return this.clients.get(configName) as OSS;
    }

    // 获取配置并创建客户端
    const config = getOssConfig(configName);
    if (!config) {
      return null;
    }

    try {
      const client = new OSS({
        region: config.region,
        accessKeyId: config.accessKeyId,
        accessKeySecret: config.accessKeySecret,
        bucket: config.bucket,
        endpoint: config.endpoint
      });

      // 缓存客户端实例
      this.clients.set(configName, client);
      return client;
    } catch (error) {
      console.error(`Failed to create OSS client for ${configName}:`, error);
      return null;
    }
  }

  /**
   * 上传文件到OSS
   * @param params 上传参数
   * @returns 上传结果
   */
  async uploadFile(params: UploadFileParams): Promise<UploadResult> {
    // 验证并解析参数
    const validParams = UploadFileParamsSchema.parse(params);
    const { filePath, targetDir = '', fileName, configName = 'default' } = validParams;

    try {
      // 检查文件是否存在
      if (!fs.existsSync(filePath)) {
        return UploadResultSchema.parse({
          success: false,
          error: `File not found: ${filePath}`,
          ossConfigName: configName
        });
      }

      // 获取OSS客户端
      const client = this.getClient(configName);
      if (!client) {
        return UploadResultSchema.parse({
          success: false,
          error: `OSS config not found for: ${configName}`,
          ossConfigName: configName
        });
      }

      // 确定文件名
      const actualFileName = fileName || path.basename(filePath);

      // 构建OSS路径，确保正斜杠格式
      let ossPath = actualFileName;
      if (targetDir) {
        // 规范化目标目录：移除头尾斜杠，然后加上结尾斜杠
        const normalizedDir = targetDir.replace(/^\/+|\/+$/g, '');
        ossPath = normalizedDir ? `${normalizedDir}/${actualFileName}` : actualFileName;
      }

      // 上传文件
      const result = await client.put(ossPath, filePath);

      return UploadResultSchema.parse({
        success: true,
        url: result.url,
        ossConfigName: configName
      });
    } catch (error) {
      return UploadResultSchema.parse({
        success: false,
        error: `Upload failed: ${(error as Error).message}`,
        ossConfigName: configName
      });
    }
  }
}

// 导出单例实例
export const ossService = new OssService();
