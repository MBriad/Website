# 构建阶段
FROM registry.cn-shanghai.aliyuncs.com/library/node:20-alpine AS build

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 设置构建时环境变量
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# 构建
RUN npm run build

# 运行阶段
FROM registry.cn-shanghai.aliyuncs.com/library/nginx:alpine

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制构建产物
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
