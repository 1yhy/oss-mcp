#!/usr/bin/env node
/**
 * 实现阿里云OSS文件上传功能。
 * - 上传文件到阿里云OSS
 * - 获取可用的OSS配置
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { OssMcpServer } from "./server.js";
import { getServerConfig } from "./config/oss.config.js";
import { resolve } from "path";
import { config } from "dotenv";

// 加载当前工作目录中的.env文件
config({ path: resolve(process.cwd(), ".env") });

export async function startServer(): Promise<void> {
  // 检查是否在stdio模式下运行
  const isStdioMode = process.env.NODE_ENV === "cli" || process.argv.includes("--stdio");

  // 获取服务器配置
  const serverConfig = getServerConfig(isStdioMode);

  // 创建OSS MCP服务器
  const server = new OssMcpServer();

  if (isStdioMode) {
    // 在stdio模式下运行
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } else {
    // 在HTTP模式下运行
    console.log(`初始化OSS MCP服务器，HTTP模式，端口: ${serverConfig.port}...`);
    await server.startHttpServer(serverConfig.port);
  }
}

// 启动服务器
startServer().catch((error) => {
  console.error("启动服务器失败:", error);
  process.exit(1);
});
