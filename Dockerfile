FROM node:slim

# Install dependencies and Chromium browser
RUN apt-get update && \
    apt-get install -y chromium-browser gnupg unzip && \
    rm -rf /var/lib/apt/lists/*

# Verify PATH
RUN which chromium || which chromium-browser


# Create a user with name 'app' and group that will be used to run the app
RUN groupadd -r app && useradd -rm -g app -G audio,video app

WORKDIR /app

# Copy and setup your project 

COPY package.json /app/package.json

COPY package-lock.json /app

RUN npm install

COPY . /app

EXPOSE 5000

# Give app user access to all the project folder
RUN chown -R app:app /app

RUN chmod -R 777 /app

USER app

CMD [ "npm", "run", "start" ]