FROM denoland/deno:2.0.1

WORKDIR /app

COPY deno.json .

RUN deno install --allow-scripts

COPY . .
RUN deno cache main.ts

ARG PORT=1553
EXPOSE $PORT

CMD ["task", "start"]
