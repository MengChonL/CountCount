# --- 階段一：構建環境 (安裝所有依賴) ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- 階段二：生產環境 (只取最終產物，極大化縮小體積) ---
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./

# 暴露你的 API 端口 (這裡假設是 3000)
EXPOSE 5001

# 啟動命令
CMD ["node", "src/server.js"]
