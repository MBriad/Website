---

## [运维/存储] Docker 容器存储位置

### Docker 数据目录

```
/var/lib/docker/
├── containers/    # 容器配置文件和日志
├── image/         # 镜像层数据
├── volumes/      # Docker 卷（持久数据）
├── buildkit/     # 构建缓存
└── ...
```

### 各类型存储位置

| 类型 | 位置 | 内容 |
|------|------|------|
| 容器文件 | /var/lib/docker/containers/ | 运行时的日志、配置 |
| 镜像层 | /var/lib/docker/image/ | 镜像的只读层（构建产物） |
| 卷（数据） | /var/lib/docker/volumes/ | MongoDB 数据等持久化数据 |

### 目录作用说明

- /home/deploy/website/ = 工厂（源代码，用来构建镜像）
- /var/lib/docker/ = 仓库（存放和运行已构建好的镜像，由 Docker 管理）

### 容器网络

```
Docker 网络: website_default
├── mbri-frontend  (172.18.0.2)  → Nginx :80
├── mbri-backend   (172.18.0.3)  → Node.js :3000
└── mbri-mongodb  (172.18.0.4)  → MongoDB :27017
```
