FROM node:16-slim

WORKDIR /usr/src/app

COPY . .

RUN apt-get update \
  && apt-get upgrade -y \
  && apt-get clean \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/* \
  && yarn install --frozen-lockfile


EXPOSE 80

CMD ["npm", "start"]