FROM node:22-alpine AS frontend-builder

WORKDIR /app

COPY package.json package-lock.json* yarn.lock* ./

RUN npm install --frozen-lockfile 2>/dev/null || npm install

COPY . .

RUN npm run build

FROM python:3.11-slim AS backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=5000

WORKDIR /usr/src/app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY server/ ./server/

COPY run.py .

COPY --from=frontend-builder /app/dist ./dist

COPY --from=frontend-builder /app/public ./public/

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "60", "run:app"]
