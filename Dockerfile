FROM node:20.11.1

# Install the latest Chrome dev package and necessary fonts and libraries
RUN apt-get update \\
    && apt-get install -y wget gnupg \\
    && wget -q -O - <https://dl-ssl.google.com/linux/linux_signing_key.pub> | gpg --dearmor -o /usr/share/keyrings/googlechrome-linux-keyring.gpg \\
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/googlechrome-linux-keyring.gpg] <https://dl-ssl.google.com/linux/chrome/deb/> stable main" > /etc/apt/sources.list.d/google.list \\
    && apt-get update \\
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-khmeros fonts-kacst fonts-freefont-ttf libxss1 dbus dbus-x11 \\
      --no-install-recommends \\
    && rm -rf /var/lib/apt/lists/* \\


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