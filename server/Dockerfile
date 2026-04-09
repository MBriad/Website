# 构建阶段
FROM m.daocloud.io/docker.io/library/node:20-alpine AS build

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建 TypeScript
RUN npm run build

# 运行阶段
FROM m.daocloud.io/docker.io/library/node:20-alpine

WORKDIR /app

# 安装 curl 用于健康检查
RUN apk add --no-cache curl

# 复制依赖文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --omit=dev

# 复制构建产物
COPY --from=build /app/dist ./dist

# 创建必要目录
RUN mkdir -p uploads logs

EXPOSE 3000

CMD ["node", "dist/index.js"]
