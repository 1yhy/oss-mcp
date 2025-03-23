import { config } from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { z } from "zod";

config();

// OSS配置验证Schema
export const OssConfigSchema = z.object({
  region: z.string(),
  accessKeyId: z.string(),
  accessKeySecret: z.string(),
  bucket: z.string(),
  endpoint: z.string(),
});

// 导出OSS配置类型
export type OssConfig = z.infer<typeof OssConfigSchema>;

// 服务器配置接口
export interface ServerConfig {
  port: number;
  ossConfig: Record<string, OssConfig>;
  configSources: {
    port: "cli" | "env" | "default";
    ossConfig: "cli" | "env" | "default";
  };
}

// 掩码函数，用于打印敏感信息
function maskSecret(secret: string): string {
  if (secret.length <= 4) return "****";
  return `${secret.substring(0, 4)}****${secret.slice(-4)}`;
}

// 获取服务器配置
export function getServerConfig(isStdioMode: boolean = false): ServerConfig {
  // 解析命令行参数
  const argv = yargs(hideBin(process.argv))
    .options({
      "oss-config": {
        type: "string",
        description: "OSS配置JSON字符串",
      },
      port: {
        type: "number",
        description: "服务器运行端口",
        default: 3000,
      },
    })
    .help()
    .version("1.0.0")
    .parseSync();

  const config: ServerConfig = {
    port: 3000,
    ossConfig: {},
    configSources: {
      port: "default",
      ossConfig: "default",
    },
  };

  // 处理端口配置
  if (argv.port) {
    config.port = argv.port;
    config.configSources.port = "cli";
  } else if (process.env.PORT) {
    config.port = parseInt(process.env.PORT, 10);
    config.configSources.port = "env";
  }

  // 处理OSS配置 - 首先检查命令行参数
  if (argv["oss-config"]) {
    const allOssConfigs = JSON.parse(argv["oss-config"] as string);

     if (allOssConfigs.region && allOssConfigs.accessKeyId) {
       config.ossConfig.default = OssConfigSchema.parse(allOssConfigs);
     } else {
       Object.entries(allOssConfigs).forEach(([name, cfg]) => {
         config.ossConfig[name.toLowerCase()] = OssConfigSchema.parse(cfg);
       });
     }
     config.configSources.ossConfig = "cli";
  } else if (process.env.OSS_CONFIG_DEFAULT) {
    const ossConfig = JSON.parse(process.env.OSS_CONFIG_DEFAULT)
    config.ossConfig.default = OssConfigSchema.parse(ossConfig);
    config.configSources.ossConfig = "env";
  }

  // 检查其他命名的OSS配置
  Object.entries(process.env).forEach(([key, value]) => {
    if (key.startsWith("OSS_CONFIG_") && key !== "OSS_CONFIG_DEFAULT" && value) {
      try {
        const configName = key.replace("OSS_CONFIG_", "").toLowerCase();
        const ossConfig = JSON.parse(value);
        config.ossConfig[configName] = OssConfigSchema.parse(ossConfig);
      } catch (error) {
        console.error(`解析环境变量${key}失败:`, error);
      }
    }
  });

  // 验证配置
  if (Object.keys(config.ossConfig).length === 0) {
    console.warn("未找到有效的OSS配置。服务器将启动，但上传功能将不可用。");
  }

  // 打印配置信息（非stdio模式下）
  if (!isStdioMode) {
    console.log("\n配置信息:");
    console.log(`- 端口: ${config.port} (来源: ${config.configSources.port})`);

    if (Object.keys(config.ossConfig).length > 0) {
      console.log("- OSS配置:");
      Object.entries(config.ossConfig).forEach(([name, cfg]) => {
        console.log(`  - ${name}:`);
        console.log(`    Region: ${cfg.region}`);
        console.log(`    Endpoint: ${cfg.endpoint}`);
        console.log(`    Bucket: ${cfg.bucket}`);
        console.log(`    AccessKeyId: ${maskSecret(cfg.accessKeyId)}`);
        console.log(`    AccessKeySecret: ${maskSecret(cfg.accessKeySecret)}`);
      });
    } else {
      console.log("- OSS配置: 未找到");
    }
    console.log(); // 空行，增加可读性
  }

  return config;
}

// 获取所有OSS配置
export function getAllOssConfigs(): Record<string, OssConfig> {
  const { ossConfig } = getServerConfig(true);
  return ossConfig;
}

// 获取特定名称的OSS配置
export function getOssConfig(name: string = 'default'): OssConfig | null {
  const configs = getAllOssConfigs();
  const normalizedName = name.toLowerCase();
  return configs[normalizedName] || null;
}

// 获取可用的OSS配置名称列表
export function getAvailableOssConfigNames(): string[] {
  return Object.keys(getAllOssConfigs());
}
