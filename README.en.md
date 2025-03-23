# OSS MCP Server 🚀

English | [中文](README.md)

![oss-mcp](https://yhyblog-2023-2-8.oss-cn-hangzhou.aliyuncs.com/2025/2025-03-23/20250323221657.png)

A Model Context Protocol (MCP) server for uploading files to Alibaba Cloud OSS. This server enables Large Language Models to directly upload files to Alibaba Cloud Object Storage Service.

## 💡 Use Cases

The OSS MCP server seamlessly integrates with other MCP tools to provide powerful workflows:

- **Integration with [Playwright MCP](https://github.com/executeautomation/mcp-playwright)**: Capture screenshots or download web resources using Playwright MCP, then directly upload them to Alibaba Cloud OSS.
- **Integration with [Figma MCP](https://github.com/1yhy/Figma-Context-MCP)**: Download image resources to local storage before uploading to OSS, or directly upload Figma network files to OSS.
- **Integration with [Filesystem MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)**: Browse and select files from your local filesystem, then upload them to cloud storage in one step.
- **Data Backup Workflows**: Automatically backup important data from local sources or other services to OSS.
- **Media Processing Workflows**: Combined with other processing tools, you can process images and videos before directly uploading them and obtaining accessible URLs.
- **Multi-OSS Account Management**: Conveniently switch between multiple OSS accounts for uploading.


## ✨ Features

- 📁 Support for multiple Alibaba Cloud OSS configurations
- 🗂️ Customizable upload directories
- 🔄 Simple and easy-to-use interface

## 🔧 Installation

You can install via npm or from source:

### Using npm

```bash
# Global installation with npm
npm install -g oss-mcp

# Or with pnpm
pnpm add -g oss-mcp
```

### Usage Examples

```bash
# Direct start (stdio mode)
oss-mcp --oss-config='{\"default\":{\"region\":\"oss-cn-shenzhen\",\"accessKeyId\":\"YOUR_KEY\",\"accessKeySecret\":\"YOUR_SECRET\",\"bucket\":\"YOUR_BUCKET\",\"endpoint\":\"oss-cn-shenzhen.aliyuncs.com\"}}'


# Debug with Inspector
oss-mcp --oss-config='{ "region": "oss-cn-shenzhen", "accessKeyId": "YOUR_KEY", "accessKeySecret": "YOUR_SECRET", "bucket": "BUCKET_NAME", "endpoint": "oss-cn-shenzhen.aliyuncs.com" }' --inspect
```

### From Source

```bash
# Clone the repository
git clone https://github.com/1yhy/oss-mcp.git
cd oss-mcp

# Install dependencies
pnpm install

# Build the project
pnpm build
```

## ⚙️ Configuration

You can configure Alibaba Cloud OSS parameters in the following ways:

### Option 1: Using .env file

Create a `.env` file in the project root directory, referencing the `.env.example` template. You can configure multiple Alibaba Cloud OSS services:

```ini
# Default OSS configuration
OSS_CONFIG_DEFAULT={"region":"oss-cn-hangzhou","accessKeyId":"your-access-key-id","accessKeySecret":"your-access-key-secret","bucket":"your-bucket-name","endpoint":"oss-cn-hangzhou.aliyuncs.com"}

# Additional OSS configuration
OSS_CONFIG_TEST={"region":"oss-cn-beijing","accessKeyId":"your-access-key-id-2","accessKeySecret":"your-access-key-secret-2","bucket":"your-bucket-name-2","endpoint":"oss-cn-beijing.aliyuncs.com"}
```

### Option 2: Setting environment variables directly

You can also set environment variables directly in your system or in the startup command:

```bash
# Set environment variables and start
pnpm dev --oss-config='{ "default": { "region": "oss-cn-shenzhen", "accessKeyId": "YOUR_KEY", "accessKeySecret": "YOUR_SECRET", "bucket": "BUCKET_NAME", "endpoint": "oss-cn-shenzhen.aliyuncs.com" }, "test": { "region": "oss-cn-beijing", "accessKeyId": "YOUR_KEY", "accessKeySecret": "YOUR_SECRET", "bucket": "BUCKET_NAME", "endpoint": "oss-cn-beijing.aliyuncs.com" } }'
```

## 🔍 Parameter Descriptions

- `region`: Alibaba Cloud OSS region
- `accessKeyId`: Alibaba Cloud access key ID
- `accessKeySecret`: Alibaba Cloud access key secret
- `bucket`: OSS bucket name
- `endpoint`: OSS endpoint

## 📋 Usage

### Command Line Options

```
Options:
  -s, --stdio    Start server using stdio transport
  -h, --http     Start server using HTTP transport
  -p, --port     HTTP server port (default: 3000)
  -i, --inspect  Start with Inspector tool
  -?, --help     Show help information
```


### Starting from Source

```bash
# Development mode
pnpm dev

# Start service (stdio mode)
pnpm start

# Start HTTP service
pnpm start:http

# Debug with Inspector
pnpm inspect
```

## 🛠️ Claude/Cursor Integration

### Cursor Configuration Method

1. Open Settings in Cursor
2. Go to the MCP Servers section
3. Add a new server configuration:

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

### Configuring Multiple OSS Accounts

Using environment variables makes it easy to configure multiple OSS accounts:

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

## 🧰 Available Tools

The server provides the following tools:

### 1. Upload File to OSS (`upload_to_oss`)

**Parameters**:
- `filePath`: Local file path (required)
- `targetDir`: Target directory path (optional)
- `fileName`: File name (optional, uses original filename by default)
- `configName`: OSS configuration name (optional, uses 'default' by default)

### 2. List Available OSS Configurations (`list_oss_configs`)

No parameters, returns all available OSS configuration names.

## 📦 Publishing

```bash
# Publish to npm
pnpm pub:release

# Test package locally
pnpm publish:local
```

## 📊 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=1yhy/oss-mcp&type=Date)](https://star-history.com/#1yhy/oss-mcp&Date)

## 📄 License

[MIT](LICENSE)
```
