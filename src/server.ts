import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ossService } from "./services/oss.service.js";
import express, { Request, Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { IncomingMessage, ServerResponse } from "http";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import fs from 'fs';
import path from 'path';

export const Logger = {
  log: (...args: any[]) => {
    console.log(...args);
  },
  error: (...args: any[]) => {
    console.error(...args);
  }
};

export class OssMcpServer {
  private readonly server: McpServer;
  private sseTransport: SSEServerTransport | null = null;

  constructor() {
    this.server = new McpServer(
      {
        name: "@yhy2001/oss-mcp",
        version: "1.0.0",
      },
      // 使用正确格式的capabilities配置
      {
        capabilities: {
          tools: { listChanged: true },
          resources: { listChanged: true },
          prompts: { listChanged: true },
          logging: {}
        }
      }
    );

    this.registerTools();
  }

  private registerTools(): void {
    // 获取可用的OSS配置
    const configs = ossService.getConfigs();
    const configNames = configs.map(config => config.id);

    // 工具：上传文件到OSS
    this.server.tool(
      "upload_to_oss",
      "将文件上传到阿里云OSS",
      {
        filePath: z.string().describe("要上传的本地文件路径"),
        targetDir: z.string().optional().describe("OSS中的目标目录路径（可选）"),
        fileName: z.string().optional().describe("上传后的文件名（可选，默认使用原文件名）"),
        configName: z.string().optional().describe(`OSS配置名称（可选，默认为'default'）。可用配置: ${configNames.join(', ') || '无'}`)
      },
      async ({ filePath, targetDir, fileName, configName }) => {
        try {
          Logger.log(`准备上传: ${filePath} 到 ${targetDir || '根目录'}`);

          if (!filePath) {
            throw new Error("文件路径是必需的");
          }

          // 检查文件是否存在
          if (!fs.existsSync(filePath)) {
            throw new Error(`文件不存在: ${filePath}`);
          }

          // 执行上传
          const result = await ossService.uploadFile({
            filePath,
            targetDir,
            fileName,
            configName
          });

          if (result.success) {
            Logger.log(`上传成功: ${result.url}`);
            return {
              content: [{
                type: "text",
                text: `文件上传成功!\n文件名: ${path.basename(filePath)}\n目标位置: ${targetDir || '根目录'}\nURL: ${result.url}\n配置名称: ${result.ossConfigName}`
              }]
            };
          } else {
            Logger.error(`上传失败: ${result.error}`);
            return {
              isError: true,
              content: [{
                type: "text",
                text: `上传失败: ${result.error}`
              }]
            };
          }
        } catch (error) {
          Logger.error(`上传过程中出错:`, error);
          return {
            isError: true,
            content: [{
              type: "text",
              text: `上传出错: ${error}`
            }]
          };
        }
      }
    );

    // 工具：列出可用的OSS配置
    this.server.tool(
      "list_oss_configs",
      "列出可用的阿里云OSS配置",
      {},
      async () => {
        try {
          const configs = ossService.getConfigs();
          const configNames = configs.map(config => config.id);

          if (configNames.length === 0) {
            return {
              content: [{
                type: "text",
                text: "未找到OSS配置。请检查环境变量设置。"
              }]
            };
          }

          return {
            content: [{
              type: "text",
              text: `可用的OSS配置:\n${configNames.map(name => `- ${name}`).join('\n')}`
            }]
          };
        } catch (error) {
          Logger.error(`获取OSS配置列表时出错:`, error);
          return {
            isError: true,
            content: [{
              type: "text",
              text: `获取配置列表失败: ${error}`
            }]
          };
        }
      }
    );
  }

  async connect(transport: Transport): Promise<void> {
    try {
      await this.server.connect(transport);

      Logger.log = (...args: any[]) => {
        try {
          this.server.server.sendLoggingMessage({
            level: "info",
            data: args,
          });
        } catch (error) {
          console.log(...args);
        }
      };

      Logger.error = (...args: any[]) => {
        try {
          this.server.server.sendLoggingMessage({
            level: "error",
            data: args,
          });
        } catch (error) {
          console.error(...args);
        }
      };

      Logger.log("OSS MCP服务器已连接并准备处理请求");
    } catch (error) {
      console.error("连接到传输时出错:", error);
    }
  }

  async startHttpServer(port: number): Promise<void> {
    const app = express();

    // SSE连接端点 - 修复头部发送冲突
    app.get("/sse", (req: Request, res: Response) => {
      // 初始化SSE传输，不再自己设置头部，而是让SDK处理
      this.sseTransport = new SSEServerTransport(
        "/messages",
        res as unknown as ServerResponse<IncomingMessage>
      );

      try {
        // 连接到传输层
        this.server.connect(this.sseTransport)
          .catch((err) => {
            console.error("连接到SSE传输时出错:", err);
          });

        // 处理客户端断开连接
        req.on('close', () => {
          console.log('SSE客户端断开连接');
          this.sseTransport = null;
        });
      } catch (error) {
        console.error("建立SSE连接时出错:", error);
        // 如果连接失败，关闭响应
        if (!res.writableEnded) {
          res.status(500).end();
        }
      }
    });

    // 消息端点
    app.post("/messages", async (req: Request, res: Response) => {
      if (!this.sseTransport) {
        console.log("尝试发送消息，但SSE传输未初始化");
        res.status(400).json({
          error: 'SSE连接未建立',
          message: '请先连接到/sse端点'
        });
        return;
      }

      try {
        await this.sseTransport.handlePostMessage(
          req as unknown as IncomingMessage,
          res as unknown as ServerResponse<IncomingMessage>
        );
      } catch (error) {
        console.error("处理消息时出错:", error);
        if (!res.writableEnded) {
          res.status(500).json({
            error: "内部服务器错误",
            message: String(error)
          });
        }
      }
    });

    // 启动服务器
    app.listen(port, () => {
      Logger.log = console.log;
      Logger.error = console.error;

      Logger.log(`HTTP服务器监听端口: ${port}`);
      Logger.log(`SSE端点: http://localhost:${port}/sse`);
      Logger.log(`消息端点: http://localhost:${port}/messages`);
    });
  }
}
