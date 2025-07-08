FROM public.ecr.aws/lambda/nodejs:18

COPY package*.json ./

RUN npm install

COPY . .

CMD ["resize.handler"]

CMD ["cp /tmp/function.zip /var/task/function.zip"]
