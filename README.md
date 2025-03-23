# OSS MCP 服务器 🚀

中文版 | [English](README.en.md)

![oss-mcp](https://yhyblog-2023-2-8.oss-cn-hangzhou.aliyuncs.com/2025/2025-03-23/20250323221657.png)

一个基于Model Context Protocol (MCP)的服务器，用于将文件上传到阿里云OSS。此服务器使大型语言模型能够直接将文件上传到阿里云对象存储服务。

## 💡 使用场景

OSS MCP服务器能够与其他MCP工具无缝集成，为您提供强大的工作流程：

- **与[Playwright MCP](https://github.com/executeautomation/mcp-playwright)集成**：可以先使用Playwright MCP抓取网页截图或下载网页资源，然后直接上传到阿里云OSS存储。
- **与[Figma MCP](https://github.com/1yhy/Figma-Context-MCP)集成**：下载图片资源到本地后直接上传OSS、或者Figma网络文件直接上传OSS。
- **与[Filesystem MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)集成**：可以浏览和选择本地文件系统中的文件，然后一步上传到云存储。
- **数据备份流程**：将重要数据从本地或其他服务自动备份到OSS。
- **媒体处理流程**：结合其他处理工具，可以对图片、视频进行处理后直接上传并获取可访问的URL。
- **多OSS账号管理**：便捷地在多个OSS账号间切换上传目标。

## ✨ 功能特点

- 📁 支持多个阿里云OSS配置
- 🗂️ 可指定上传目录
- 🔄 简单易用的接口

## 🔧 安装

您可以通过npm或从源码安装：

### 使用npm安装

```bash
# 使用npm全局安装
npm install -g oss-mcp

# 或使用pnpm全局安装
pnpm add -g oss-mcp
```

### 使用示例

```bash
# 直接启动 (stdio模式)
oss-mcp --oss-config='{\"default\":{\"region\":\"oss-cn-shenzhen\",\"accessKeyId\":\"YOUR_KEY\",\"accessKeySecret\":\"YOUR_SECRET\",\"bucket\":\"YOUR_BUCKET\",\"endpoint\":\"oss-cn-shenzhen.aliyuncs.com\"}}'


# 使用Inspector调试
oss-mcp --oss-config='{ "region": "oss-cn-shenzhen", "accessKeyId": "YOUR_KEY", "accessKeySecret": "YOUR_SECRET", "bucket": "BUCKET_NAME", "endpoint": "oss-cn-shenzhen.aliyuncs.com" }' --inspect
```

### 从源码安装

```bash
# 克隆仓库
git clone https://github.com/1yhy/oss-mcp.git
cd oss-mcp

# 安装依赖
pnpm install

# 构建项目
pnpm build
```

## ⚙️ 配置

您可以通过以下方式配置阿里云OSS参数：

### 方式一：使用.env文件

在项目根目录创建`.env`文件，参考`.env.example`模板。您可以配置多个阿里云OSS服务：

```ini
# 默认OSS配置
OSS_CONFIG_DEFAULT={"region":"oss-cn-hangzhou","accessKeyId":"your-access-key-id","accessKeySecret":"your-access-key-secret","bucket":"your-bucket-name","endpoint":"oss-cn-hangzhou.aliyuncs.com"}

# 其他OSS配置
OSS_CONFIG_TEST={"region":"oss-cn-beijing","accessKeyId":"your-access-key-id-2","accessKeySecret":"your-access-key-secret-2","bucket":"your-bucket-name-2","endpoint":"oss-cn-beijing.aliyuncs.com"}
```

### 方式二：直接设置环境变量

您也可以直接在系统中或启动命令中设置环境变量：

```bash
# 设置环境变量并启动
pnpm dev --oss-config='{ "default": { "region": "oss-cn-shenzhen", "accessKeyId": "YOUR_KEY", "accessKeySecret": "YOUR_SECRET", "bucket": "BUCKET_NAME", "endpoint": "oss-cn-shenzhen.aliyuncs.com" }, "test": { "region": "oss-cn-beijing", "accessKeyId": "YOUR_KEY", "accessKeySecret": "YOUR_SECRET", "bucket": "BUCKET_NAME", "endpoint": "oss-cn-beijing.aliyuncs.com" } }'
```

## 🔍 参数说明

- `region`: 阿里云OSS区域
- `accessKeyId`: 阿里云访问密钥ID
- `accessKeySecret`: 阿里云访问密钥Secret
- `bucket`: OSS存储桶名称
- `endpoint`: OSS终端节点

## 📋 使用方法

### 命令行选项

```
选项:
  -s, --stdio    使用stdio传输启动服务器
  -h, --http     使用HTTP传输启动服务器
  -p, --port     HTTP服务器端口 (默认: 3000)
  -i, --inspect  使用Inspector工具启动
  -?, --help     显示帮助信息
```


### 从源码启动

```bash
# 开发模式
pnpm dev

# 启动服务 (stdio模式)
pnpm start

# 启动HTTP服务
pnpm start:http

# 使用Inspector调试
pnpm inspect
```

## 🛠️ 与Claude/Cursor配置集成

### Cursor配置方法

1. 在Cursor中打开设置（Settings）
2. 转到MCP服务器（MCP Servers）部分
3. 添加新服务器配置：

```json
{
  "mcpServers": {
    "oss-mcp": {
      "command": "npx",
      "args": [
        "oss-mcp",
        "--oss-config='{\"default\":{\"region\":\"oss-cn-shenzhen\",\"accessKeyId\":\"YOUR_KEY\",\"accessKeySecret\":\"YOUR_SECRET\",\"bucket\":\"YOUR_BUCKET\",\"endpoint\":\"oss-cn-shenzhen.aliyuncs.com\"}}'",
        "--stdio"
      ]
    }
  }
}
```

### 配置多个OSS账号

使用环境变量方式可以轻松配置多个OSS账号：

```json
{
  "mcpServers": {
    "oss-mcp": {
      "command": "npx",
      "args": [
        "oss-mcp",
        "--oss-config='{\"default\":{\"region\":\"oss-cn-shenzhen\",\"accessKeyId\":\"YOUR_KEY\",\"accessKeySecret\":\"YOUR_SECRET\",\"bucket\":\"YOUR_BUCKET\",\"endpoint\":\"oss-cn-shenzhen.aliyuncs.com\"}, \"test\":{\"region\":\"oss-cn-shenzhen\",\"accessKeyId\":\"YOUR_KEY\",\"accessKeySecret\":\"YOUR_SECRET\",\"bucket\":\"YOUR_BUCKET\",\"endpoint\":\"oss-cn-shenzhen.aliyuncs.com\"}}'",
        "--stdio"
      ]
    }
  }
}
```

## 🧰 可用工具

服务器提供以下工具：

### 1. 上传文件到OSS (`upload_to_oss`)

**参数**:
- `filePath`: 本地文件路径（必需）
- `targetDir`: 目标目录路径（可选）
- `fileName`: 文件名（可选，默认使用原文件名）
- `configName`: OSS配置名称（可选，默认使用'default'）

### 2. 列出可用的OSS配置 (`list_oss_configs`)

无参数，返回所有可用的OSS配置名称。

## 📦 发布

```bash
# 发布到npm
pnpm pub:release

# 本地打包测试
pnpm publish:local
```

## 📊 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=1yhy/oss-mcp&type=Date)](https://star-history.com/#1yhy/oss-mcp&Date)

## 📄 许可证

[MIT](LICENSE)
