FROM node:14-alpine

COPY . .

RUN npm install
RUN npm run build

CMD ["npm", "run", "start"]
