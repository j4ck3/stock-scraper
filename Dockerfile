FROM node:slim

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*


RUN which google-chrome-stable || true

# Create a user with name 'app' and group that will be used to run the app
RUN groupadd -r app && useradd -rm -g app -G audio,video app

WORKDIR /app

# Copy and setup your project 

COPY package.json /app/package.json

COPY package-lock.json /app

RUN npm install

COPY . /app

RUN npm build

EXPOSE 5000

# Give app user access to all the project folder
RUN chown -R app:app /app

RUN chmod -R 777 /app

USER app

CMD [ "npm", "run", "start" ]